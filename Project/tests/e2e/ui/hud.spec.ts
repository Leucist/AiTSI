import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-new-adventure').click();
});

test.describe('HUD', () => {
    test('hud is visible in playing', async ({ page }) => {
        await expect(page.getByTestId('hud')).toBeVisible();
    });

    test('hud score is numeric', async ({ page }) => {
        const txt = await page.getByTestId('hud-score').innerText();
        expect(Number.isFinite(Number(txt))).toBeTruthy();
    });

    test('hud level contains STAGE', async ({ page }) => {
        await expect(page.getByTestId('hud-level')).toContainText('STAGE');
    });

    test('save button exists and is enabled', async ({ page }) => {
        await expect(page.getByTestId('btn-save')).toBeEnabled();
    });

    test('pause button exists and is enabled', async ({ page }) => {
        await expect(page.getByTestId('btn-pause')).toBeEnabled();
    });
});
