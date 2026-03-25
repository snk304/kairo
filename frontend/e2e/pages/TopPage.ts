import { Page, Locator, expect } from '@playwright/test'

export class TopPage {
  readonly page: Page
  readonly heroHeading: Locator
  readonly jobsLink: Locator
  readonly registerLink: Locator
  readonly companyRegisterLink: Locator
  readonly loginLink: Locator

  constructor(page: Page) {
    this.page = page
    // ヒーローセクションの見出し
    this.heroHeading = page.locator('h1').filter({ hasText: 'あなたらしく' })
    // 「求人を探す」ボタン（ヒーロー内）
    this.jobsLink = page.locator('a[href="/jobs"]').first()
    // 「無料で登録する」ボタン
    this.registerLink = page.locator('a[href="/auth/register/jobseeker"]').first()
    // 「企業登録（無料）」ボタン
    this.companyRegisterLink = page.locator('a[href="/auth/register/company"]').first()
    // ヘッダーのログインリンク
    this.loginLink = page.locator('header a[href="/auth/login"]')
  }

  async goto(): Promise<void> {
    await this.page.goto('/')
  }

  async assertLoaded(): Promise<void> {
    await expect(this.heroHeading).toBeVisible()
  }
}
