import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: '**/*.spec.ts',
    testIgnore: ['**/physics.spec.ts', '**/data.spec.ts', '**/game-logic.spec.ts'],
    fullyParallel: false,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['list']],
    expect: {
        timeout: 10_000,
    },
    use: {
        baseURL: 'http://localhost:3005',
        trace: 'on-first-retry',
    },
    webServer: [
        {
            command: 'npx tsx server_NH.ts',
            url: 'http://localhost:3001/api/load',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
            ignoreHTTPSErrors: true,
        },
        {
            command: 'npm run dev -- --port 3005 --strictPort',
            url: 'http://localhost:3005',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        }
    ],
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
