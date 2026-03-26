import { expect, test } from '@playwright/test';
import Database from 'better-sqlite3';

const SAVE_KEY = 'super-coin-quest-save';
const BACKEND_URL = 'http://localhost:3001';

test.describe('Backend Saves and API', () => {
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

    test('Saving from Pause menu hits backend API successfully', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        const [response] = await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save') && res.status() === 200),
            page.getByTestId('btn-save-progress').click()
        ]);
        expect(response.ok()).toBeTruthy();
    });

    test('Saved game updates the SQLite DB correctly', async ({ page }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 2);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save')),
            page.getByTestId('btn-save-progress').click()
        ]);

        const row = db.prepare('SELECT * FROM save_games WHERE user_id = 1').get();
        expect(row).toBeDefined();
        expect(row.score).toBe(10);
        expect(row.level_index).toBe(0);
    });

    test('Missing auth token results in 401 error', async ({ request }) => {
        const res = await request.post(`${BACKEND_URL}/api/save`, {
            data: { levelIndex: 0, score: 0, coinsCollected: [] }
        });
        expect(res.status()).toBe(401);
    });

    test('Incorrect auth token results in 401 error', async ({ request }) => {
        const res = await request.post(`${BACKEND_URL}/api/save`, {
            data: { levelIndex: 0, score: 0, coinsCollected: [] },
            headers: { 'Authorization': 'Bearer bad-token' }
        });
        expect(res.status()).toBe(401);
    });

    test('Backend correctly responds with hasSave = false when empty', async ({ request }) => {
        await request.post(`${BACKEND_URL}/api/test/reset`, { headers: { 'Authorization': 'Bearer mock-token-123' } });

        const res = await request.get(`${BACKEND_URL}/api/load`, {
            headers: { 'Authorization': 'Bearer mock-token-123' }
        });
        const body = await res.json();
        expect(body.hasSave).toBe(false);
    });

    test('Backend correctly serves the latest save data', async ({ page, request }) => {
        await startNewGameSpecific(page);
        await setGamePlayerPos(page, 245, 245);
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

    test('Reloading page correctly fetches save data from Backend via API', async ({ page }) => {
        db.prepare('INSERT OR REPLACE INTO save_games (user_id, level_index, score, coins_collected) VALUES (1, 1, 50, \'[]\')').run();

        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();
    });

    test('Continuing game fetches level index and score properly from Backend', async ({ page }) => {
        db.prepare('INSERT OR REPLACE INTO save_games (user_id, level_index, score, coins_collected) VALUES (1, 1, 80, \'[]\')').run();

        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();
        await page.getByTestId('btn-continue-journey').click();

        await expect(page.getByTestId('hud-level')).toHaveText('STAGE 2 / 3');
        await expect(page.getByTestId('hud-score')).toHaveText('80');

        const state = await getGameState(page);
        expect(state.levelIndex).toBe(1);
        expect(state.score).toBe(80);
    });

    test('Backend properly overrides duplicate saves for same user', async ({ page }) => {
        await startNewGameSpecific(page);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save')),
            page.getByTestId('btn-save-progress').click()
        ]);

        await page.keyboard.press('Escape');
        await setGamePlayerPos(page, 245, 245);
        await tick(page, 2);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('/api/save')),
            page.getByTestId('btn-save-progress').click()
        ]);

        const rows = db.prepare('SELECT * FROM save_games WHERE user_id = 1').all();
        expect(rows.length).toBe(1);
        expect(rows[0].score).toBe(10);
    });

    test('Starting a new adventure from Home Screen ignores existing save', async ({ page }) => {
        db.prepare('INSERT OR REPLACE INTO save_games (user_id, level_index, score, coins_collected) VALUES (1, 1, 80, \'[]\')').run();
        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();
        
        await page.getByTestId('btn-new-adventure').click();
        
        const state = await getGameState(page);
        expect(state.levelIndex).toBe(0);
        expect(state.score).toBe(0);
    });
});
