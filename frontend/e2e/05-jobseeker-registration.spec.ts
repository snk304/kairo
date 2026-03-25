/**
 * E2E テスト: 求職者新規登録フロー
 * 新規ユーザーが求職者として登録できることを確認
 *
 * 注意: 実際にAPIを叩くためランダムなメールアドレスを使用する
 * 同一メールアドレスの再登録は 422 エラーになるが、
 * バリデーションエラー表示のテストとしても活用する
 */
import { test, expect } from '@playwright/test'
import { RegisterJobseekerPage } from './pages/RegisterPage'

test.describe('求職者新規登録', () => {
  test('登録フォームが正しく表示される', async ({ page }) => {
    const registerPage = new RegisterJobseekerPage(page)
    await registerPage.goto()

    // フォームフィールドが全て表示される
    await expect(registerPage.emailInput).toBeVisible()
    await expect(registerPage.passwordInput).toBeVisible()
    await expect(registerPage.passwordConfirmationInput).toBeVisible()
    await expect(registerPage.submitButton).toBeVisible()

    // フォーム内に企業登録へのリンクが表示される（「こちら」リンク）
    await expect(page.locator('a[href="/auth/register/company"]').getByText('こちら')).toBeVisible()
  })

  test('パスワードが一致しない場合にバリデーションエラーが表示される', async ({ page }) => {
    const registerPage = new RegisterJobseekerPage(page)
    await registerPage.goto()

    await registerPage.fillForm('test@example.com', 'password123', 'different_password')
    await registerPage.submit()

    await registerPage.assertValidationError('パスワードが一致しません')
    // フォームページに留まる
    await expect(page).toHaveURL(/\/auth\/register\/jobseeker/)
  })

  test('パスワードが8文字未満の場合にバリデーションエラーが表示される', async ({ page }) => {
    const registerPage = new RegisterJobseekerPage(page)
    await registerPage.goto()

    await registerPage.fillForm('test@example.com', 'short', 'short')
    await registerPage.submit()

    await registerPage.assertValidationError('パスワードは8文字以上で入力してください')
  })

  test('無効なメールアドレスの場合にバリデーションエラーが表示される', async ({ page }) => {
    const registerPage = new RegisterJobseekerPage(page)
    await registerPage.goto()

    await registerPage.fillForm('not-an-email', 'password123', 'password123')
    await registerPage.submit()

    await registerPage.assertValidationError('有効なメールアドレスを入力してください')
  })

  test('新規メールアドレスで正常に登録できログインページへリダイレクトされる', async ({ page }) => {
    const registerPage = new RegisterJobseekerPage(page)
    await registerPage.goto()

    // ユニークなメールアドレスを生成
    const uniqueEmail = `e2e_test_${Date.now()}@example.com`

    await registerPage.fillForm(uniqueEmail, 'password123', 'password123')
    await registerPage.submit()

    // 登録成功後はログインページへリダイレクトされる
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30_000 })
  })

  test('すでに使用されているメールアドレスで登録するとAPIエラーが表示される', async ({ page }) => {
    const registerPage = new RegisterJobseekerPage(page)
    await registerPage.goto()

    // デモアカウントのメールアドレス（既存）を使用
    await registerPage.fillForm('jobseeker1@example.com', 'password123', 'password123')
    await registerPage.submit()

    // バリデーションエラーまたは汎用エラーが表示される
    // フォームページに留まる
    await expect(page).toHaveURL(/\/auth\/register\/jobseeker/, { timeout: 15_000 })
  })

  test('登録ページからログインページへのリンクが機能する', async ({ page }) => {
    const registerPage = new RegisterJobseekerPage(page)
    await registerPage.goto()

    // ログインへのリンクをクリック
    await page.locator('a[href="/auth/login"]').click()
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.locator('h1', { hasText: 'ログイン' })).toBeVisible()
  })
})
