import { Page, Locator, expect } from '@playwright/test'

export class JobsPage {
  readonly page: Page
  readonly heading: Locator
  readonly jobCards: Locator
  readonly emptyMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1', { hasText: '求人一覧' })
    // 求人カードはリンクを含むカード要素
    this.jobCards = page.locator('article, [class*="card"], a[href^="/jobs/"]').filter({ hasText: '' })
    // 実際のカードリンク
    this.jobCards = page.locator('a[href^="/jobs/"]')
    this.emptyMessage = page.locator('text=条件に合う求人が見つかりませんでした')
  }

  async goto(): Promise<void> {
    await this.page.goto('/jobs')
    await expect(this.heading).toBeVisible()
  }

  async assertHasJobs(): Promise<void> {
    // 少なくとも1件の求人カードが表示されることを確認
    await expect(this.jobCards.first()).toBeVisible({ timeout: 15_000 })
  }

  async clickFirstJob(): Promise<void> {
    await this.jobCards.first().click()
  }
}
