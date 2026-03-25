import { Page, Locator, expect } from '@playwright/test'

export class RegisterJobseekerPage {
  readonly page: Page
  readonly heading: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly passwordConfirmationInput: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1', { hasText: '求職者として登録' })
    this.emailInput = page.locator('input[type="email"]')
    // パスワード入力は順番で特定
    this.passwordInput = page.locator('input[type="password"]').nth(0)
    this.passwordConfirmationInput = page.locator('input[type="password"]').nth(1)
    this.submitButton = page.locator('button[type="submit"]')
    this.errorAlert = page.locator('[role="alert"]')
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/register/jobseeker')
    await expect(this.heading).toBeVisible()
  }

  async fillForm(email: string, password: string, passwordConfirmation: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.passwordConfirmationInput.fill(passwordConfirmation)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async assertValidationError(message: string): Promise<void> {
    await expect(this.page.locator(`text=${message}`)).toBeVisible()
  }
}
