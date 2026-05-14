import { expect, test } from '@playwright/test';

const BACKEND_URL = 'http://localhost:3001';
const SAVE_KEY = 'super-coin-quest-save';

test.describe('Mockowanie danych API (Route Mocking)', () => {

    test.beforeEach(async ({ page }) => {
        // Zabezpieczamy czysty stan na starcie każdego testu
        await page.addInitScript((key) => {
            localStorage.removeItem(key);
        }, SAVE_KEY);
    });

    test('[Mocking] Przechwycenie /api/load wstrzykuje sztuczny stan gracza', async ({ page }) => {
        // Mockowanie zapytania GET /api/load
        await page.route(`${BACKEND_URL}/api/load`, async (route) => {
            const json = {
                hasSave: true,
                data: {
                    levelIndex: 2,
                    score: 999,
                    coinsCollected: [1, 2, 3]
                }
            };
            await route.fulfill({ status: 200, json });
        });

        // Wchodzimy na stronę - system użyje mocka do sprawdzenia hasSave
        await page.goto('/');

        // Ponieważ hasSave: true, przycisk Continue Journey musi być widoczny
        const continueBtn = page.getByTestId('btn-continue-journey');
        await expect(continueBtn).toBeVisible();

        // Klikamy go, by załadować grę z naszego zmockowanego stanu
        await continueBtn.click();

        // Sprawdzamy czy wynik na HUD wynosi 999 punktów
        await expect(page.getByTestId('hud-score')).toHaveText('999');
        await expect(page.getByTestId('hud-level')).toHaveText('STAGE 3 / 3'); // index 2 to STAGE 3
    });

    test('[Mocking] Symulacja błędu 500 serwera podczas odczytu /api/load', async ({ page }) => {
        // Odcięcie backendu przez symulację błędu po stronie serwera
        await page.route(`${BACKEND_URL}/api/load`, async (route) => {
            await route.fulfill({ status: 500, body: 'Internal Server Error' });
        });

        // Otwieramy stronę
        await page.goto('/');

        // Gdy brak działającego backendu i puste localStorage, ukaże się tylko New Adventure
        await expect(page.getByTestId('btn-new-adventure')).toBeVisible();
        await expect(page.getByTestId('btn-continue-journey')).not.toBeVisible();
    });

    test('[Mocking] Przechwycenie /api/save aby zweryfikować fallback do LocalStorage', async ({ page }) => {
        // Mockowanie błędu przy próbie zapisu
        await page.route(`${BACKEND_URL}/api/save`, async (route) => {
            await route.fulfill({ status: 503, body: 'Service Unavailable' });
        });

        await page.goto('/');
        await page.getByTestId('btn-new-adventure').click();
        
        await page.evaluate(({ x, y }) => {
            (window as any).__GAME_STATE__.player.x = x;
            (window as any).__GAME_STATE__.player.y = y;
            (window as any).__GAME_STATE__.player.vy = 0;
            (window as any).__GAME_STATE__.player.vx = 0;
        }, { x: 245, y: 245 });
        await page.waitForTimeout(32);

        // Wciskamy Escape by odpalić Pauzę, skąd możemy zrobić zapis
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('btn-save-progress')).toBeVisible();
        
        // Klikamy przycisk Zapisu, który wywoła zmockowane zapytanie, które zwróci 503
        await page.getByTestId('btn-save-progress').click();

        // Mimo błędu serwera, frontend powinien wyłapać błąd (try/catch w save.ts)
        // i umieścić dane w localStorage (fallback)
        const savedLocal = await page.evaluate((key) => {
            return localStorage.getItem(key);
        }, SAVE_KEY);

        expect(savedLocal).toBeTruthy();
        const parsed = JSON.parse(savedLocal!);
        expect(parsed.score).toBe(10);
        expect(parsed.levelIndex).toBe(0);
    });
    test('[Mocking] /api/load zafałszowany powrót granicznej liczby punktów (np. 99999)', async ({ page }) => {
        await page.route(`${BACKEND_URL}/api/load`, async (route) => {
            await route.fulfill({
                status: 200,
                json: { hasSave: true, data: { levelIndex: 0, score: 99999, coinsCollected: [] } }
            });
        });
        await page.goto('/');
        await page.getByTestId('btn-continue-journey').click();
        await expect(page.getByTestId('hud-score')).toHaveText('99999');
    });

    test('[Mocking] /api/save symulacja błędu 400 Bad Request', async ({ page }) => {
        await page.route(`${BACKEND_URL}/api/save`, async (route) => {
            await route.fulfill({ status: 400, body: 'Bad Request' });
        });
        await page.goto('/');
        await page.getByTestId('btn-new-adventure').click();
        await page.keyboard.press('Escape');
        await page.getByTestId('btn-save-progress').click();
        const savedLocal = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
        expect(savedLocal).toBeTruthy();
    });

    test('[Mocking] /api/load z uszkodzoną strukturą JSON (data: null)', async ({ page }) => {
        await page.route(`${BACKEND_URL}/api/load`, async (route) => {
            await route.fulfill({ status: 200, json: { broken: true, data: null } });
        });
        await page.goto('/');
        await expect(page.getByTestId('btn-continue-journey')).not.toBeVisible();
    });

    test('[Mocking] Przechwycenie /api/load z opóźnieniem sieciowym (latency)', async ({ page }) => {
        await page.route(`${BACKEND_URL}/api/load`, async (route) => {
            await new Promise(r => setTimeout(r, 1000));
            await route.fulfill({ status: 200, json: { hasSave: true, data: { levelIndex: 1, score: 100, coinsCollected: [] } } });
        });
        await page.goto('/');
        await expect(page.getByTestId('btn-continue-journey')).toBeVisible({ timeout: 5000 });
        await page.getByTestId('btn-continue-journey').click();
        await expect(page.getByTestId('hud-level')).toHaveText('STAGE 2 / 3');
    });

    test('[Mocking] /api/load zwrot statusu 401 Unauthorized', async ({ page }) => {
        await page.route(`${BACKEND_URL}/api/load`, async (route) => {
            await route.fulfill({ status: 401, body: 'Unauthorized' });
        });
        await page.goto('/');
        await expect(page.getByTestId('btn-continue-journey')).not.toBeVisible();
    });

    test('[Mocking] /api/save odpowiedź serwera w formacie HTML zamiast JSON', async ({ page }) => {
        await page.route(`${BACKEND_URL}/api/save`, async (route) => {
            await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Success</h1>' });
        });
        await page.goto('/');
        await page.getByTestId('btn-new-adventure').click();
        await page.keyboard.press('Escape');
        await page.getByTestId('btn-save-progress').click();
        const savedLocal = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
        expect(savedLocal).toBeTruthy();
    });

});
