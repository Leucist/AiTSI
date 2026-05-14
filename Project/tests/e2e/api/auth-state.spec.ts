import { expect, test } from '@playwright/test';

// Ustawiamy globalny storageState dla całego pliku (izolacja sesji/uwierzytelniania)
// Dzięki temu nie musimy w każdym teście przechodzić przez poziomy i logować się.
test.use({
    storageState: {
        cookies: [],
        origins: [
            {
                origin: 'http://localhost:3005',
                localStorage: [
                    {
                        name: 'super-coin-quest-save',
                        value: JSON.stringify({ levelIndex: 2, score: 777, coinsCollected: [] })
                    }
                ]
            }
        ]
    }
});

test.describe('Zarządzanie Stanem (Uwierzytelnianie/Sesja - storageState)', () => {

    test('1. Aplikacja automatycznie wykrywa zapisaną sesję po wejściu', async ({ page }) => {
        // Wchodząc na główną stronę, system odczytuje wstrzyknięty z storageState token/save
        await page.goto('/');

        // Zamiast tylko "New Adventure", musi pojawić się "Continue Journey"
        const continueBtn = page.getByTestId('btn-continue-journey');
        await expect(continueBtn).toBeVisible();
    });

    test('2. Wczytany stan autoryzacji ładuje odpowiedni wynik punktowy gracza', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('btn-continue-journey').click();

        // Ponieważ pominęliśmy proces zdobywania punktów logując się z sesji, 
        // oczekujemy od razu wyniku z wstrzykniętego stanu: 777
        await expect(page.getByTestId('hud-score')).toHaveText('777');
    });

    test('3. Wczytany stan omija początkowe etapy i od razu ładuje chroniony poziom zaawansowany', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('btn-continue-journey').click();

        // LevelIndex wynosił 2, co oznacza STAGE 3. Oszczędzamy czas na testowaniu 
        // funkcjonalności dostępnych dopiero w późniejszych fazach gry.
        await expect(page.getByTestId('hud-level')).toHaveText('STAGE 3 / 3');
    });

});
