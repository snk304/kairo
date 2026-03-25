import { Page, Locator, expect } from '@playwright/test'

export class JobDetailPage {
  readonly page: Page
  readonly jobTitle: Locator
  readonly applyButton: Locator
  readonly loginPromptLink: Locator
  readonly appliedBadge: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    // 求人タイトルは h1
    this.jobTitle = page.locator('h1')
    // 応募ボタン（求職者ログイン済み）
    this.applyButton = page.locator('button', { hasText: 'この求人に応募する' })
    // 未ログイン時のログインへのリンク
    this.loginPromptLink = page.locator('a', { hasText: 'この求人に応募する' })
    // 応募済みバッジ
    this.appliedBadge = page.locator('text=応募済み')
    // エラーメッセージ
    this.errorMessage = page.locator('text=応募に失敗しました')
  }

  async goto(jobId: string): Promise<void> {
    await this.page.goto(`/jobs/${jobId}`)
    await expect(this.jobTitle).toBeVisible({ timeout: 15_000 })
  }

  async assertLoginPromptVisible(): Promise<void> {
    await expect(this.loginPromptLink).toBeVisible()
    // ログインが必要ですのテキストも確認
    await expect(this.page.locator('text=応募にはログインが必要です')).toBeVisible()
  }

  async applyToJob(): Promise<void> {
    await this.applyButton.click()
  }

  async assertApplied(): Promise<void> {
    await expect(this.appliedBadge).toBeVisible({ timeout: 15_000 })
  }
}
