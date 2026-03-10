import { expect, test } from '@playwright/test';

const SAVE_KEY = 'super-coin-quest-save';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test.describe('Smoke / Start screen', () => {
    test('shows start overlay', async ({ page }) => {
        await expect(page.getByTestId('overlay-start')).toBeVisible();
    });

    test('canvas exists', async ({ page }) => {
        await expect(page.locator('canvas')).toHaveCount(1);
    });

    test('continue button hidden when no save', async ({ page }) => {
        await page.evaluate((k) => {
            localStorage.removeItem(k);
            return fetch('http://localhost:3001/api/test/reset', { 
                method: 'POST', 
                headers: { 'Authorization': 'Bearer mock-token-123' }
            });
        }, SAVE_KEY);
        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toHaveCount(0);
    });

    test('new adventure starts game (hud visible)', async ({ page }) => {
        await page.getByTestId('btn-new-adventure').click();
        await expect(page.getByTestId('hud')).toBeVisible();
        await expect(page.getByTestId('overlay-start')).toHaveCount(0);
    });
});

test.describe('HUD & Pause', () => {
    test.beforeEach(async ({ page }) => {
        await page.getByTestId('btn-new-adventure').click();
    });

    test('hud shows initial score', async ({ page }) => {
        await expect(page.getByTestId('hud-score')).toHaveText('0');
    });

    test('hud shows coins counter', async ({ page }) => {
        await expect(page.getByTestId('hud-coins')).toBeVisible();
    });

    test('pause button opens pause overlay', async ({ page }) => {
        await page.getByTestId('btn-pause').click();
        await expect(page.getByTestId('overlay-paused')).toBeVisible();
    });

    test('escape toggles pause on/off', async ({ page }) => {
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('overlay-paused')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('overlay-paused')).toHaveCount(0);
    });

    test('resume closes pause overlay', async ({ page }) => {
        await page.keyboard.press('Escape');
        await page.getByTestId('btn-resume').click();
        await expect(page.getByTestId('overlay-paused')).toHaveCount(0);
    });

    test('quit to menu returns to start overlay', async ({ page }) => {
        await page.keyboard.press('Escape');
        await page.getByTestId('btn-quit-to-menu').click();
        await expect(page.getByTestId('overlay-start')).toBeVisible();
    });
});

test.describe('Save / Load', () => {
    test('save button writes localStorage key', async ({ page }) => {
        await page.evaluate((k) => {
            localStorage.removeItem(k);
            return fetch('http://localhost:3001/api/test/reset', { 
                method: 'POST', 
                headers: { 'Authorization': 'Bearer mock-token-123' }
            });
        }, SAVE_KEY);
        await page.reload();

        await page.getByTestId('btn-new-adventure').click();
        await page.getByTestId('btn-save').click();

        const saved = await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY);
        expect(saved).toBeTruthy();
    });

    test('save from pause writes localStorage key', async ({ page }) => {
        await page.evaluate((k) => {
            localStorage.removeItem(k);
            return fetch('http://localhost:3001/api/test/reset', { 
                method: 'POST', 
                headers: { 'Authorization': 'Bearer mock-token-123' }
            });
        }, SAVE_KEY);
        await page.reload();

        await page.getByTestId('btn-new-adventure').click();
        await page.keyboard.press('Escape');
        await page.getByTestId('btn-save-progress').click();

        const saved = await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY);
        expect(saved).toBeTruthy();
    });

    test('continue journey appears after save and reload', async ({ page }) => {
        await page.evaluate((k) => {
            localStorage.removeItem(k);
            return fetch('http://localhost:3001/api/test/reset', { 
                method: 'POST', 
                headers: { 'Authorization': 'Bearer mock-token-123' }
            });
        }, SAVE_KEY);
        await page.reload();

        await page.getByTestId('btn-new-adventure').click();
        await page.getByTestId('btn-save').click();

        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();
    });

    test('continue journey loads into playing (hud visible)', async ({ page }) => {
        await page.evaluate((k) => {
            localStorage.removeItem(k);
            return fetch('http://localhost:3001/api/test/reset', { 
                method: 'POST', 
                headers: { 'Authorization': 'Bearer mock-token-123' }
            });
        }, SAVE_KEY);
        await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ levelIndex: 0, score: 20, coinsCollected: [] })), SAVE_KEY);
        await page.reload();

        await page.getByTestId('btn-continue-journey').click();
        await expect(page.getByTestId('hud')).toBeVisible();
    });

    test('continue journey loads saved score into hud', async ({ page }) => {
        await page.evaluate((k) => {
            localStorage.removeItem(k);
            return fetch('http://localhost:3001/api/test/reset', { 
                method: 'POST', 
                headers: { 'Authorization': 'Bearer mock-token-123' }
            });
        }, SAVE_KEY);
        await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ levelIndex: 0, score: 20, coinsCollected: [] })), SAVE_KEY);
        await page.reload();

        await page.getByTestId('btn-continue-journey').click();
        await expect(page.getByTestId('hud-score')).toHaveText('20');
    });
});
