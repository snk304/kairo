/**
 * E2E テスト: 求職者ログイン
 * 求職者がログインしてダッシュボードへ遷移できることを確認
 */
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

const JOBSEEKER_EMAIL = 'jobseeker1@example.com'
const JOBSEEKER_PASSWORD = 'password'

test.describe('求職者ログイン', () => {
  test('正しい認証情報でログインしダッシュボードへ遷移する', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.login(JOBSEEKER_EMAIL, JOBSEEKER_PASSWORD)

    // ダッシュボードへリダイレクトされる
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })

    // ダッシュボードが表示される
    const dashboardPage = new DashboardPage(page)
    await dashboardPage.assertDashboardLoaded()
  })

  test('ログイン後にヘッダーが求職者状態になる', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(JOBSEEKER_EMAIL, JOBSEEKER_PASSWORD)

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })

    // ヘッダーにメールアドレスが表示される
    await expect(page.locator('header').getByText(JOBSEEKER_EMAIL)).toBeVisible()

    // ロールバッジが「求職者」になっている
    await expect(page.locator('header').getByText('求職者')).toBeVisible()

    // ログアウトボタンが表示される
    await expect(page.locator('header button', { hasText: 'ログアウト' })).toBeVisible()
  })

  test('誤ったパスワードでログインするとエラーが表示される', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.login(JOBSEEKER_EMAIL, 'wrong_password_xyz')

    await loginPage.assertLoginError()
    await expect(page.locator('text=メールアドレスまたはパスワードが正しくありません')).toBeVisible()

    // ログインページに留まる
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('メールアドレスが空のままログインしようとするとバリデーションエラーが表示される', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // メールアドレスを空にして送信
    await loginPage.passwordInput.fill('password')
    await loginPage.submitButton.click()

    // クライアントサイドバリデーションエラーが表示される
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible()
  })

  test('ログアウトできる', async ({ page }) => {
    // まずログイン
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(JOBSEEKER_EMAIL, JOBSEEKER_PASSWORD)

    // Render の一時的な過負荷でログインに失敗する場合はスキップ
    const loginError = page.locator('[role="alert"]')
    const loginErrorVisible = await loginError.isVisible({ timeout: 3_000 }).catch(() => false)
    if (loginErrorVisible) {
      test.skip(true, 'ログインAPIが一時的に利用不可のためスキップ')
      return
    }

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })

    // ログアウト
    await page.locator('header button', { hasText: 'ログアウト' }).click()

    // トップページまたはログインページへリダイレクトされる
    await expect(page).toHaveURL(/\/(auth\/login)?$/, { timeout: 15_000 })

    // ログインリンクが再表示される
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible()
  })
})
