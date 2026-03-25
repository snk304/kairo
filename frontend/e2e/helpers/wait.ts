import { Page } from '@playwright/test'

/**
 * Render (本番バックエンド) が cold start で遅い場合に備えて、
 * ページコンテンツが実際に読み込まれるまで待機するヘルパー
 */
export async function waitForPageContent(page: Page): Promise<void> {
  // ローディングスピナーが消えるまで待機（存在する場合）
  const spinner = page.locator('[data-testid="loading-spinner"], .animate-spin').first()
  const spinnerVisible = await spinner.isVisible().catch(() => false)
  if (spinnerVisible) {
    await spinner.waitFor({ state: 'hidden', timeout: 30_000 })
  }
}

/**
 * localStorage に Sanctum トークンと auth-storage を注入してログイン状態を作る
 * ネットワーク経由のログインフローを省略し、テストを高速化する
 */
export async function injectAuthToken(
  page: Page,
  token: string,
  user: { id: string; email: string; role: string }
): Promise<void> {
  await page.addInitScript(
    ({ token, user }) => {
      const authStorage = {
        state: { user, token, _hydrated: true },
        version: 0,
      }
      localStorage.setItem('token', token)
      localStorage.setItem('auth-storage', JSON.stringify(authStorage))
    },
    { token, user }
  )
}
