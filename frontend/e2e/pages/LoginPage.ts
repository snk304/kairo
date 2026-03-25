import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly heading: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator
  readonly registerLink: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1', { hasText: 'ログイン' })
    // label テキストで input を特定
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorAlert = page.locator('[role="alert"]')
    this.registerLink = page.locator('a[href="/auth/register/jobseeker"]')
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/login')
    await expect(this.heading).toBeVisible()
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async assertLoginError(): Promise<void> {
    await expect(this.errorAlert).toBeVisible()
  }
}
