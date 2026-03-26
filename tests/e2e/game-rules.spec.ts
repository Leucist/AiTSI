import { expect, test } from '@playwright/test';
import Database from 'better-sqlite3';

const SAVE_KEY = 'super-coin-quest-save';
const BACKEND_URL = 'http://localhost:3001';

test.describe('Game Logic and Progression', () => {
    let db;
    test.beforeAll(async ({ request }) => {
        await request.post(`${BACKEND_URL}/api/test/reset`, {
            headers: { 'Authorization': 'Bearer mock-token-123' }
        });
        db = new Database('./game.db');
    });

    test.afterAll(() => {
        if (db) db.close();
    });

    test.beforeEach(async ({ page }) => {
        await page.addInitScript((key) => {
            localStorage.removeItem(key);
        }, SAVE_KEY);
        await page.goto('/');
        await expect(page.getByTestId('btn-new-adventure')).toBeVisible();
    });

    const startNewGameSpecific = async (page) => {
        await page.getByTestId('btn-new-adventure').click();
        await expect(page.getByTestId('hud')).toBeVisible();
    };

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
        await page.evaluate(({ x, y }) => {
            (window as any).__GAME_STATE__.player.x = x;
            (window as any).__GAME_STATE__.player.y = y;
            (window as any).__GAME_STATE__.player.vy = 0;
            (window as any).__GAME_STATE__.player.vx = 0;
        }, { x, y });
    };

    const tick = async (page, frames = 10) => {
        await page.waitForTimeout(16 * frames);
    };

    test('Initial score begins at 0', async ({ page }) => {
        await startNewGameSpecific(page);
        const state = await getGameState(page);
        expect(state.score).toBe(0);
    });

    test('Initial coins collected begins empty', async ({ page }) => {
        await startNewGameSpecific(page);
        const state = await getGameState(page);
        expect(state.coinsCollectedArr.length).toBe(0);
    });

    test('Player touching a coin adds it to collected Set', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.coinsCollectedArr.length).toBe(1);
    });

    test('Player touching a coin increments the score by +10', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.score).toBe(10);
    });

    test('HUD score updates immediately after coin collect', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        await expect(page.getByTestId('hud-score')).toHaveText('10');
    });

    test('Collecting same coin space twice does not double count', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        await setGamePlayerPos(page, 50, 300);
        await tick(page, 5);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.score).toBe(10);
    });

    test('Multiple coins correctly stack scores', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 4);
        await setGamePlayerPos(page, 445, 165);
        await tick(page, 4);
        const state = await getGameState(page);
        expect(state.score).toBe(20);
    });

    test('Reaching the end door triggers Level Complete overlay', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 755, 335);
        await tick(page, 5);
        await expect(page.getByText('STAGE CLEAR!')).toBeVisible();
        const state = await getGameState(page);
        expect(state.gameState).toBe('level-complete');
    });

    test('Level transition to Level 2 sets correct levelIndex', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 755, 335);
        await tick(page, 5);
        await page.getByTestId('btn-next-stage').click();
        const state = await getGameState(page);
        expect(state.levelIndex).toBe(1);
    });

    test('Navigating to the end of the final level triggers Win Overlay', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.evaluate(() => (window as any).__SET_LEVEL(2));
        await page.waitForTimeout(100);
        await setGamePlayerPos(page, 25, 85);
        await tick(page, 5);
        await expect(page.getByText('STAGE CLEAR!')).toBeVisible();
        await page.getByTestId('btn-next-stage').click();
        const state = await getGameState(page);
        expect(state.gameState).toBe('win');
        await expect(page.getByText('LEGENDARY!')).toBeVisible();
    });
});
