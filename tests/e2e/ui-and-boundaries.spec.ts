import { expect, test } from '@playwright/test';
import Database from 'better-sqlite3';

const SAVE_KEY = 'super-coin-quest-save';
const BACKEND_URL = 'http://localhost:3001';

test.describe('UI Interactions and Boundaries', () => {
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

    test('Player falling out of bounds triggers Game Over', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 50, 900);
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.gameState).toBe('game-over');
    });

    test('Player respects left boundary', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 5, 300);
        await tick(page, 10);
        await page.keyboard.down('ArrowLeft');
        await tick(page, 30);
        await page.keyboard.up('ArrowLeft');
        const state = await getGameState(page);
        expect(state.player.x).toBeGreaterThanOrEqual(0);
    });

    test('Player can move left and jump simultaneously', async ({ page }) => {
        await startNewGameSpecific(page);
        await tick(page, 40);
        await page.keyboard.down('ArrowLeft');
        await page.keyboard.down('ArrowUp');
        await tick(page, 5);
        await page.keyboard.up('ArrowLeft');
        await page.keyboard.up('ArrowUp');
        const state = await getGameState(page);
        expect(state.player.vy).toBeLessThan(0);
        expect(state.player.vx).toBeLessThan(0);
    });

    test('Player can move right and jump simultaneously', async ({ page }) => {
        await startNewGameSpecific(page);
        await tick(page, 40);
        await page.keyboard.down('ArrowRight');
        await page.keyboard.down('ArrowUp');
        await tick(page, 5);
        await page.keyboard.up('ArrowRight');
        await page.keyboard.up('ArrowUp');
        const state = await getGameState(page);
        expect(state.player.vy).toBeLessThan(0);
        expect(state.player.vx).toBeGreaterThan(0);
    });

    test('HUD shows correct level initially as STAGE 1 / 3', async ({ page }) => {
        await startNewGameSpecific(page);
        await expect(page.getByTestId('hud-level')).toHaveText('STAGE 1 / 3');
    });

    test('Pause menu appears when Escape is pressed while playing', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.press('Escape');
        await expect(page.getByText('PAUSED')).toBeVisible();
        const state = await getGameState(page);
        expect(state.gameState).toBe('paused');
    });

    test('Pause menu resumes game when Resume is clicked', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.press('Escape');
        await expect(page.getByText('PAUSED')).toBeVisible();
        await page.getByTestId('btn-resume').click();
        const state = await getGameState(page);
        expect(state.gameState).toBe('playing');
        await expect(page.getByText('PAUSED')).not.toBeVisible();
    });

    test('HUD shows 0 score after game over and restart', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        await setGamePlayerPos(page, 50, 900);
        await tick(page, 5);
        await page.getByTestId('btn-try-again').click();
        await expect(page.getByTestId('hud-score')).toHaveText('0');
    });

    test('Game Over state correctly resets game mechanics when starting new game', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 50, 900);
        await tick(page, 5);
        await expect(page.getByText('GAME OVER')).toBeVisible();
        await page.getByTestId('btn-try-again').click();
        const state = await getGameState(page);
        expect(state.gameState).toBe('playing');
        expect(state.levelIndex).toBe(0);
        expect(state.score).toBe(0);
    });

    test('Restarting the game from Game Over leaves no residual coins', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 5);
        await setGamePlayerPos(page, 50, 900);
        await tick(page, 5);
        await expect(page.getByText('GAME OVER')).toBeVisible();
        await page.getByTestId('btn-try-again').click();
        const state = await getGameState(page);
        expect(state.score).toBe(0);
        expect(state.coinsCollectedArr.length).toBe(0);
    });
});
