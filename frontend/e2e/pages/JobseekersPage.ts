import { Page, Locator, expect } from '@playwright/test'

export class JobseekersPage {
  readonly page: Page
  readonly heading: Locator
  readonly profileCards: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1', { hasText: '求職者一覧' })
    // 求職者カードのリンク
    this.profileCards = page.locator('a[href^="/jobseekers/"]')
    this.emptyMessage = page.locator('text=条件に合う求職者が見つかりませんでした')
  }

  async goto(): Promise<void> {
    await this.page.goto('/jobseekers')
    await expect(this.heading).toBeVisible()
  }

  async assertHasProfiles(): Promise<void> {
    await expect(this.profileCards.first()).toBeVisible({ timeout: 15_000 })
  }
}
