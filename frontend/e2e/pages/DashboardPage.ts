import { Page, Locator, expect } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly heading: Locator
  readonly applicationsLink: Locator
  readonly scoutsLink: Locator
  readonly messagesLink: Locator
  readonly profilePrompt: Locator

  constructor(page: Page) {
    this.page = page
    // ダッシュボードのメイン見出し（プロフィールがあれば名前、なければ「ダッシュボード」）
    this.heading = page.locator('h1')
    // main コンテンツエリア内のリンクに限定（サイドバーとヘッダーを除外）
    this.applicationsLink = page.locator('a[href="/dashboard/applications"]').first()
    this.scoutsLink = page.locator('a[href="/dashboard/scouts"]').first()
    this.messagesLink = page.locator('a[href="/dashboard/messages"]').first()
    this.profilePrompt = page.locator('text=プロフィールを作成しましょう')
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard')
    await expect(this.heading).toBeVisible({ timeout: 15_000 })
  }

  async assertDashboardLoaded(): Promise<void> {
    // ダッシュボードの見出しが表示されることを確認
    await expect(this.heading).toBeVisible({ timeout: 15_000 })
    // 少なくとも1つの応募履歴リンクが存在することを確認
    await expect(this.applicationsLink).toBeVisible({ timeout: 10_000 })
  }
}

export class CompanyDashboardPage {
  readonly page: Page
  readonly heading: Locator
  readonly jobsLink: Locator
  readonly scoutsLink: Locator
  readonly messagesLink: Locator
  readonly createJobLink: Locator
  readonly profilePrompt: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1')
    // .first() でサイドバーとヘッダーの重複を回避
    this.jobsLink = page.locator('a[href="/company/jobs"]').first()
    this.scoutsLink = page.locator('a[href="/company/scouts"]').first()
    this.messagesLink = page.locator('a[href="/company/messages"]').first()
    this.createJobLink = page.locator('a[href="/company/jobs/new"]').first()
    this.profilePrompt = page.locator('text=企業プロフィールを作成しましょう')
  }

  async goto(): Promise<void> {
    await this.page.goto('/company')
    await expect(this.heading).toBeVisible({ timeout: 15_000 })
  }

  async assertDashboardLoaded(): Promise<void> {
    await expect(this.jobsLink).toBeVisible()
    await expect(this.scoutsLink).toBeVisible()
    await expect(this.messagesLink).toBeVisible()
  }
}
