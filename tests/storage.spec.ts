import { expect, test } from '@playwright/test';

const SAVE_KEY = 'super-coin-quest-save';

test.describe('LocalStorage save handling', () => {
    test('continue journey visible when save exists before first load', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ levelIndex: 0, score: 0, coinsCollected: [] })), SAVE_KEY);
        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();
    });

    test('continue journey hidden again after removing save and reload', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ levelIndex: 0, score: 0, coinsCollected: [] })), SAVE_KEY);
        await page.reload();
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible();

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

    test('load keeps start overlay hidden after click', async ({ page }) => {
        await page.goto('/');
        await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ levelIndex: 0, score: 7, coinsCollected: [] })), SAVE_KEY);
        await page.reload();
        await page.getByTestId('btn-continue-journey').click();

        await expect(page.getByTestId('overlay-start')).toHaveCount(0);
        await expect(page.getByTestId('hud')).toBeVisible();
    });

    test('save writes JSON that contains expected keys', async ({ page }) => {
        await page.goto('/');
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

        const obj = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), SAVE_KEY);
        expect(obj).toHaveProperty('levelIndex');
        expect(obj).toHaveProperty('score');
        expect(obj).toHaveProperty('coinsCollected');
    });
});
