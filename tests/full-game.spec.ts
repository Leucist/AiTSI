import { expect, test } from '@playwright/test';
import Database from 'better-sqlite3';

const SAVE_KEY = 'super-coin-quest-save';
const BACKEND_URL = 'http://localhost:3001';

test.describe('30 Comprehensive Full Game Tests', () => {
    
    // Connect locally to sqlite to verify backend database directly in tests!
    let db;
    test.beforeAll(async ({ request }) => {
        // Reset the backend DB before tests run to ensure a clean state
        await request.post(`${BACKEND_URL}/api/test/reset`, {
            headers: { 'Authorization': 'Bearer mock-token-123' }
        });
        db = new Database('./game.db');
    });

    test.afterAll(() => {
        if(db) db.close();
    });

    test.beforeEach(async ({ page }) => {
        // Clear local storage for a fresh environment
        await page.addInitScript((key) => {
            localStorage.removeItem(key);
        }, SAVE_KEY);
        await page.goto('/');
        await expect(page.getByTestId('btn-new-adventure')).toBeVisible();
    });

    const startGameViaMenu = async (page) => {
        await page.reload(); // To guarantee clean localStorage apply
        const continueBtn = page.getByTestId('btn-continue-journey');
        if (await continueBtn.isVisible()) {
            await expect(continueBtn).toBeVisible(); // Just to log it
        } else {
            await page.getByTestId('btn-new-adventure').click();
        }
        await expect(page.getByTestId('hud')).toBeVisible(); // Engine is ready
    };

    const startNewGameSpecific = async (page) => {
        await page.getByTestId('btn-new-adventure').click();
        await expect(page.getByTestId('hud')).toBeVisible();
    };

    // Helper functions
    const getGameState = async (page) => {
        return page.evaluate(() => {
            const state = (window as any).__GAME_STATE__;
            return {
                ...state,
                coinsCollectedArr: Array.from(state.coinsCollected || [])
            };
        });
    };
    const setGamePlayerPos = async (page, x, y) => {
        await page.evaluate(({x, y}) => {
            (window as any).__GAME_STATE__.player.x = x;
            (window as any).__GAME_STATE__.player.y = y;
            (window as any).__GAME_STATE__.player.vy = 0;
            (window as any).__GAME_STATE__.player.vx = 0;
        }, {x, y});
    };
    const tick = async (page, frames = 10) => {
        // Allow the game loop to run for a few frames
        await page.waitForTimeout(16 * frames);
    };

    // --- Core Mechanics: Player movement, jumping, and gravity (Tests 1-10) ---
    test('1. Player begins at expected start position', async ({ page }) => {
        await startNewGameSpecific(page);
        const state = await getGameState(page);
        expect(state.player.x).toBeCloseTo(50, -1); // 50
        expect(state.player.y).toBeGreaterThanOrEqual(300);
    });

    test('2. Player moves right when ArrowRight is held', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowRight');
        await tick(page, 10);
        await page.keyboard.up('ArrowRight');
        const state = await getGameState(page);
        expect(state.player.x).toBeGreaterThan(50);
    });

    test('3. Player moves left when ArrowLeft is held', async ({ page }) => {
        await startNewGameSpecific(page);
        // Move right first
        await page.keyboard.down('ArrowRight');
        await tick(page, 5);
        await page.keyboard.up('ArrowRight');
        const stateRight = await getGameState(page);
        
        await page.keyboard.down('ArrowLeft');
        await tick(page, 5);
        await page.keyboard.up('ArrowLeft');
        const stateLeft = await getGameState(page);
        
        expect(stateLeft.player.x).toBeLessThan(stateRight.player.x);
    });

    test('4. Player executes jump with ArrowUp when grounded', async ({ page }) => {
        await startNewGameSpecific(page);
        // Wait till gravity resolves and grounded is true
        await tick(page, 40); 
        await page.keyboard.down('ArrowUp');
        await tick(page, 2);
        await page.keyboard.up('ArrowUp');
        const state = await getGameState(page);
        expect(state.player.vy).toBeLessThan(0); // Going up
    });

    test('5. Player gets affected by gravity pulling down', async ({ page }) => {
        await startNewGameSpecific(page);
        // move player in air
        await setGamePlayerPos(page, 50, 100);
        const startState = await getGameState(page);
        await tick(page, 5);
        const endState = await getGameState(page);
        // Vy should be positive (fall down)
        expect(endState.player.vy).toBeGreaterThan(startState.player.vy);
        expect(endState.player.y).toBeGreaterThan(startState.player.y);
    });

    test('6. Player facing direction updates right', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowRight');
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.player.facing).toBe('right');
    });

    test('7. Player facing direction updates left', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowLeft');
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.player.facing).toBe('left');
    });

    test('8. Player cannot jump when in air', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 50, 100); // airborne
        await page.keyboard.down('ArrowUp');
        await tick(page, 3);
        const state = await getGameState(page);
        // Since velocity is reset to 0 and player is airborne, pressing up shouldn't give jump velocity
        expect(state.player.vy).toBeGreaterThanOrEqual(0); // Gravity should pull, no negative Vy jumps
    });

    test('9. Player is grounded when standing on a platform', async ({ page }) => {
        await startNewGameSpecific(page);
        // By default level 0 start pos drops onto platform quickly
        await tick(page, 60); // 60 frames is 1 second, plenty to hit ground
        const state = await getGameState(page);
        expect(state.player.grounded).toBe(true);
    });

    test('10. Player stops completely if no movement keys are pressed', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowRight');
        await tick(page, 5);
        await page.keyboard.up('ArrowRight');
        await tick(page, 40); // Let velocity decay if friction exists
        const state = await getGameState(page);
        expect(state.player.vx).toBeCloseTo(0, 0); // Decays to very close to 0
    });


    // --- Game Logic: Coin collection, score increments, and level transitions (Tests 11-20) ---
    test('11. Initial score begins at 0', async ({ page }) => {
        await startNewGameSpecific(page);
        const state = await getGameState(page);
        expect(state.score).toBe(0);
    });

    test('12. Initial coins collected begins empty', async ({ page }) => {
        await startNewGameSpecific(page);
        const state = await getGameState(page);
        expect(state.coinsCollectedArr.length).toBe(0);
    });

    test('13. Player touching a coin adds it to collected Set', async ({ page }) => {
        await startNewGameSpecific(page);
        // Coin 1 is at x: 250, y: 250
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5); // Wait for collision
        const state = await getGameState(page);
        // Set objects in console get serialized uniquely, or we check size
        expect(state.coinsCollectedArr.length).toBe(1);
    });

    test('14. Player touching a coin increments the score by +10', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.score).toBe(10);
    });

    test('15. HUD score updates immediately after coin collect', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        await expect(page.getByTestId('hud-score')).toHaveText('10');
    });

    test('16. Collecting same coin space twice does not double count', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        // Move away
        await setGamePlayerPos(page, 50, 300);
        await tick(page, 5);
        // Move back
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.score).toBe(10); // Remains 10
    });

    test('17. Multiple coins correctly stack scores', async ({ page }) => {
        await startNewGameSpecific(page);
        // Coin 1 (250, 250)
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 4);
        // Coin 2 (450, 170)
        await setGamePlayerPos(page, 445, 165);
        await tick(page, 4);
        const state = await getGameState(page);
        expect(state.score).toBe(20);
    });

    test('18. Reaching the end door triggers Level Complete overlay', async ({ page }) => {
        await startNewGameSpecific(page);
        // Exit is at x: 750, y: 330
        await setGamePlayerPos(page, 755, 335);
        await tick(page, 5);
        await expect(page.getByText('STAGE CLEAR!')).toBeVisible();
        const state = await getGameState(page);
        expect(state.gameState).toBe('level-complete');
    });

    test('19. Level transition to Level 2 sets correct levelIndex', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 755, 335);
        await tick(page, 5);
        await page.getByTestId('btn-next-stage').click();
        const state = await getGameState(page);
        expect(state.levelIndex).toBe(1);
    });

    test('20. Navigating to the end of the final level triggers Win Overlay', async ({ page }) => {
        await startNewGameSpecific(page);
        // We can short circuit levelIndex via exposed setter
        await page.evaluate(() => (window as any).__SET_LEVEL(2)); // Level 3 is index 2
        await page.waitForTimeout(100); // Wait for React to remount game loop
        // Move to exit of level 3: x: 20, y: 80
        await setGamePlayerPos(page, 25, 85);
        await tick(page, 5);
        await expect(page.getByText('STAGE CLEAR!')).toBeVisible();
        await page.getByTestId('btn-next-stage').click(); // Clicking next stage on final stage triggers win
        const state = await getGameState(page);
        expect(state.gameState).toBe('win');
        await expect(page.getByText('LEGENDARY!')).toBeVisible();
    });

    // --- Boundaries & Death (Test 21) ---
    test('21. Player falling out of bounds triggers Game Over', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 50, 900); // 900 is below CANVAS_HEIGHT (600)
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.gameState).toBe('game-over');
    });


    // --- Backend/Database: Fake authorization, saving progress, updating API (Tests 22-30) ---
    test('22. Saving from Pause menu hits backend API successfully', async ({ page }) => {
        await startNewGameSpecific(page);
        // pause
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        const [response] = await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save') && res.status() === 200),
            page.getByTestId('btn-save-progress').click()
        ]);
        expect(response.ok()).toBeTruthy();
    });

    test('23. Saved game updates the SQLite DB correctly', async ({ page }) => {
        await startNewGameSpecific(page);
        // Collect a coin to have score 10
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 2);
        // pause & save
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save')),
            page.getByTestId('btn-save-progress').click()
        ]);
        
        // Use better-sqlite3 to check if saved in DB exactly!
        const row = db.prepare('SELECT * FROM save_games WHERE user_id = 1').get();
        expect(row).toBeDefined();
        expect(row.score).toBe(10);
        expect(row.level_index).toBe(0);
    });

    test('24. Missing auth token results in 401 error', async ({ request }) => {
        // Call backend via Playwright Request directly
        const res = await request.post(`${BACKEND_URL}/api/save`, {
            data: { levelIndex: 0, score: 0, coinsCollected: [] }
            // No auth header
        });
        expect(res.status()).toBe(401);
    });

    test('25. Incorrect auth token results in 401 error', async ({ request }) => {
        const res = await request.post(`${BACKEND_URL}/api/save`, {
            data: { levelIndex: 0, score: 0, coinsCollected: [] },
            headers: { 'Authorization': 'Bearer bad-token' }
        });
        expect(res.status()).toBe(401);
    });

    test('26. Backend correctly responds with hasSave = false when empty', async ({ request }) => {
        await request.post(`${BACKEND_URL}/api/test/reset`, { headers: { 'Authorization': 'Bearer mock-token-123' }});
        
        const res = await request.get(`${BACKEND_URL}/api/load`, {
            headers: { 'Authorization': 'Bearer mock-token-123' }
        });
        const body = await res.json();
        expect(body.hasSave).toBe(false);
    });

    test('27. Backend correctly serves the latest save data', async ({ page, request }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245); // Score 10
        await tick(page, 2);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save')),
            page.getByTestId('btn-save-progress').click()
        ]);

        const res = await request.get(`${BACKEND_URL}/api/load`, {
            headers: { 'Authorization': 'Bearer mock-token-123' }
        });
        const body = await res.json();
        expect(body.hasSave).toBe(true);
        expect(body.data.score).toBe(10);
    });

    test('28. Reloading page correctly fetches save data from Backend via API', async ({ page }) => {
        // Set state in DB directly
        db.prepare('INSERT OR REPLACE INTO save_games (user_id, level_index, score, coins_collected) VALUES (1, 1, 50, \'[]\')').run();
        
        await page.reload();
        // The game should detect the save and show 'Continue Journey'
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();
    });

    test('29. Continuing game fetches level index and score properly from Backend', async ({ page }) => {
        db.prepare('INSERT OR REPLACE INTO save_games (user_id, level_index, score, coins_collected) VALUES (1, 1, 80, \'[]\')').run();
        
        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();
        await page.getByTestId('btn-continue-journey').click();
        
        await expect(page.getByTestId('hud-level')).toHaveText('STAGE 2 / 3'); // levelIndex 1 is level 2
        await expect(page.getByTestId('hud-score')).toHaveText('80');
        
        const state = await getGameState(page);
        expect(state.levelIndex).toBe(1);
        expect(state.score).toBe(80);
    });

    test('30. Backend properly overrides duplicate saves for same user', async ({ page }) => {
        await startNewGameSpecific(page);
        // Save once
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save')),
            page.getByTestId('btn-save-progress').click()
        ]);
        
        // Get 1 coin, save again
        await page.keyboard.press('Escape'); // resume
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 2);
        await page.keyboard.press('Escape'); // pause
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save')),
            page.getByTestId('btn-save-progress').click()
        ]);

        const rows = db.prepare('SELECT * FROM save_games WHERE user_id = 1').all();
        expect(rows.length).toBe(1); // Still 1 row, overwritten
        expect(rows[0].score).toBe(10);
    });

    test('31. Game Over state correctly resets game when starting new game', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 50, 900); // Trigger game over
        await tick(page, 5);
        await expect(page.getByText('GAME OVER')).toBeVisible();
        await page.getByTestId('btn-try-again').click(); // Click new game
        const state = await getGameState(page);
        expect(state.gameState).toBe('playing');
        expect(state.levelIndex).toBe(0);
        expect(state.score).toBe(0);
    });

});
