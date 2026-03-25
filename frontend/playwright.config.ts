import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E テスト設定
 * 本番環境 (https://kairo-red.vercel.app) を対象とする
 * ローカル開発時は BASE_URL 環境変数で上書き可能
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // CI では再試行2回、ローカルでは0回
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://kairo-red.vercel.app',
    // 本番APIが Render で動いており cold start が遅いため長めに設定
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
