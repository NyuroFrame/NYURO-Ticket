import { defineConfig, devices } from '@playwright/test';

/**
 * E2E contra Next dev (puerto 3001) con el API (puerto 3000) mockeado
 * vía `page.route`. No requiere backend real: el flujo feliz usa mocks
 * coherentes con `apps/web/lib/mocks.ts`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: '/home/badman/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    port: 3001,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
