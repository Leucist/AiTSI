import { expect, test } from '@playwright/test';
import Database from 'better-sqlite3';

const SAVE_KEY = 'super-coin-quest-save';
const BACKEND_URL = 'http://localhost:3001';

test.describe('Player Movement Mechanics', () => {
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

    test('Player begins at expected start position', async ({ page }) => {
        await startNewGameSpecific(page);
        const state = await getGameState(page);
        expect(state.player.x).toBeCloseTo(50, -1);
        expect(state.player.y).toBeGreaterThanOrEqual(300);
    });

    test('Player moves right when ArrowRight is held', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowRight');
        await tick(page, 10);
        await page.keyboard.up('ArrowRight');
        const state = await getGameState(page);
        expect(state.player.x).toBeGreaterThan(50);
    });

    test('Player moves left when ArrowLeft is held', async ({ page }) => {
        await startNewGameSpecific(page);
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

    test('Player executes jump with ArrowUp when grounded', async ({ page }) => {
        await startNewGameSpecific(page);
        await tick(page, 40);
        await page.keyboard.down('ArrowUp');
        await tick(page, 2);
        await page.keyboard.up('ArrowUp');
        const state = await getGameState(page);
        expect(state.player.vy).toBeLessThan(0);
    });

    test('Player gets affected by gravity pulling down', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 50, 100);
        const startState = await getGameState(page);
        await tick(page, 5);
        const endState = await getGameState(page);
        expect(endState.player.vy).toBeGreaterThan(startState.player.vy);
        expect(endState.player.y).toBeGreaterThan(startState.player.y);
    });

    test('Player facing direction updates right', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowRight');
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.player.facing).toBe('right');
    });

    test('Player facing direction updates left', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowLeft');
        await tick(page, 5);
        const state = await getGameState(page);
        expect(state.player.facing).toBe('left');
    });

    test('Player cannot jump when in air', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 50, 100);
        await page.keyboard.down('ArrowUp');
        await tick(page, 3);
        const state = await getGameState(page);
        expect(state.player.vy).toBeGreaterThanOrEqual(0);
    });

    test('Player is grounded when standing on a platform', async ({ page }) => {
        await startNewGameSpecific(page);
        await tick(page, 60);
        const state = await getGameState(page);
        expect(state.player.grounded).toBe(true);
    });

    test('Player stops completely if no movement keys are pressed', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.down('ArrowRight');
        await tick(page, 5);
        await page.keyboard.up('ArrowRight');
        await tick(page, 40);
        const state = await getGameState(page);
        expect(state.player.vx).toBeCloseTo(0, 0);
    });
});
