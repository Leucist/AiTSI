import { expect, test } from '@playwright/test';

const SAVE_KEY = 'super-coin-quest-save';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test.describe('Overlays', () => {
    test('start overlay contains new adventure button', async ({ page }) => {
        await expect(page.getByTestId('overlay-start')).toBeVisible();
        await expect(page.getByTestId('btn-new-adventure')).toBeVisible();
    });

    test('start overlay hides after starting game', async ({ page }) => {
        await page.getByTestId('btn-new-adventure').click();
        await expect(page.getByTestId('overlay-start')).toHaveCount(0);
    });

    test('pause overlay contains buttons', async ({ page }) => {
        await page.getByTestId('btn-new-adventure').click();
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('overlay-paused')).toBeVisible();
        await expect(page.getByTestId('btn-resume')).toBeVisible();
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        await expect(page.getByTestId('btn-quit-to-menu')).toBeVisible();
    });

    test('paused overlay disappears on resume', async ({ page }) => {
        await page.getByTestId('btn-new-adventure').click();
        await page.keyboard.press('Escape');
        await page.getByTestId('btn-resume').click();
        await expect(page.getByTestId('overlay-paused')).toHaveCount(0);
    });

    test('level complete overlay not visible on fresh start', async ({ page }) => {
        await expect(page.getByTestId('overlay-level-complete')).toHaveCount(0);
    });

    test('game over overlay not visible on fresh start', async ({ page }) => {
        await expect(page.getByTestId('overlay-game-over')).toHaveCount(0);
    });

    test('win overlay not visible on fresh start', async ({ page }) => {
        await expect(page.getByTestId('overlay-win')).toHaveCount(0);
    });
});
