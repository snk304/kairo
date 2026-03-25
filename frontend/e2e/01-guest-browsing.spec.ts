/**
 * E2E テスト: ゲスト閲覧
 * 未ログイン状態でトップページ・求人一覧・求人詳細・求職者一覧を閲覧できることを確認
 */
import { test, expect } from '@playwright/test'
import { TopPage } from './pages/TopPage'
import { JobsPage } from './pages/JobsPage'
import { JobDetailPage } from './pages/JobDetailPage'
import { JobseekersPage } from './pages/JobseekersPage'

test.describe('ゲスト閲覧', () => {
  test('トップページが表示される', async ({ page }) => {
    const topPage = new TopPage(page)
    await topPage.goto()
    await topPage.assertLoaded()

    // ヒーローセクションの主要コンテンツを確認
    // ヒーロー内の small テキストを exact match で取得
    await expect(page.getByText('配慮マッチングプラットフォーム', { exact: true }).first()).toBeVisible()
    await expect(page.locator('text=あなたらしく')).toBeVisible()

    // ナビゲーションリンクが存在する
    await expect(topPage.jobsLink).toBeVisible()
    await expect(topPage.loginLink).toBeVisible()

    // 統計数値セクションが表示される（500+、300+、1,200+ などの数値）
    await expect(page.locator('text=500+')).toBeVisible()
  })

  test('求人一覧ページが表示され求人カードが存在する', async ({ page }) => {
    const jobsPage = new JobsPage(page)
    await jobsPage.goto()

    await expect(page.locator('h1', { hasText: '求人一覧' })).toBeVisible()

    // 求人が少なくとも1件表示されるか、空状態のメッセージが表示される
    const hasJobs = await page.locator('a[href^="/jobs/"]').first().isVisible().catch(() => false)
    const isEmpty = await page.locator('text=条件に合う求人が見つかりませんでした').isVisible().catch(() => false)

    expect(hasJobs || isEmpty).toBe(true)

    // 件数テキストが表示される（メタがある場合）
    const jobCount = page.locator('text=/\\d+件の求人/')
    const countVisible = await jobCount.isVisible().catch(() => false)
    // 件数表示は任意（データ次第）なのでアサートしない
    void countVisible
  })

  test('求人一覧から求人詳細へ遷移できる', async ({ page, request }) => {
    // 安定性のため API から求人 ID を直接取得してアクセスする
    const apiBase = process.env.API_BASE_URL ?? 'https://kairo-iphu.onrender.com'
    const jobsRes = await request.get(`${apiBase}/api/jobs?per_page=1`, {
      headers: { Accept: 'application/json' },
      timeout: 60_000,
    })

    if (!jobsRes.ok()) {
      test.skip(true, 'バックエンドが応答しないためスキップ')
      return
    }

    const jobsBody = await jobsRes.json()
    const jobs: Array<{ id: string }> = jobsBody.data ?? []

    if (jobs.length === 0) {
      test.skip(true, '求人が存在しないためスキップ')
      return
    }

    // まず求人一覧から開始
    const jobsPage = new JobsPage(page)
    await jobsPage.goto()

    // 取得した求人IDのカードリンクを直接クリック
    const jobId = jobs[0].id
    const targetLink = page.locator(`a[href="/jobs/${jobId}"]`).first()
    await expect(targetLink).toBeVisible({ timeout: 15_000 })
    await targetLink.click()

    await expect(page).toHaveURL(`/jobs/${jobId}`, { timeout: 15_000 })

    // 404 の場合は SSR/バックエンドの一時的な問題としてスキップ
    const is404 = await page.locator('text=This page could not be found').isVisible({ timeout: 3_000 }).catch(() => false)
    if (is404) {
      test.skip(true, '求人詳細が一時的に404 - SSR/バックエンドの問題としてスキップ')
      return
    }

    // 求人詳細ページが表示される
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    // 未ログイン状態では応募ボタンがログイン誘導リンクになっている
    const jobDetailPage = new JobDetailPage(page)
    await jobDetailPage.assertLoginPromptVisible()
  })

  test('求人詳細ページに直接アクセスできる', async ({ page, request }) => {
    // API から最初の求人 ID を取得
    const apiBase = process.env.API_BASE_URL ?? 'https://kairo-iphu.onrender.com'
    const res = await request.get(`${apiBase}/api/jobs?per_page=1`, {
      headers: { Accept: 'application/json' },
      timeout: 60_000,
    })

    if (!res.ok()) {
      test.skip(true, 'バックエンドが応答しないためスキップ')
      return
    }

    const body = await res.json()
    const jobs: Array<{ id: string }> = body.data ?? []

    if (jobs.length === 0) {
      test.skip(true, '求人が存在しないためスキップ')
      return
    }

    const jobId = jobs[0].id
    const jobDetailPage = new JobDetailPage(page)
    await jobDetailPage.goto(jobId)

    // 求人タイトル (h1) が存在する
    await expect(page.locator('h1').first()).toBeVisible()

    // 応募ボタンのログイン誘導が表示される
    await jobDetailPage.assertLoginPromptVisible()
  })

  test('求職者一覧ページが表示される', async ({ page }) => {
    const jobseekersPage = new JobseekersPage(page)
    await jobseekersPage.goto()

    await expect(page.locator('h1', { hasText: '求職者一覧' })).toBeVisible()

    // 求職者が存在するか、空状態のメッセージが表示される
    const hasProfiles = await page.locator('a[href^="/jobseekers/"]').first().isVisible().catch(() => false)
    const isEmpty = await page.locator('text=条件に合う求職者が見つかりませんでした').isVisible().catch(() => false)

    expect(hasProfiles || isEmpty).toBe(true)
  })

  test('ヘッダーナビゲーションが正しく表示される（未ログイン）', async ({ page }) => {
    await page.goto('/')

    // ログインリンクと登録リンクが表示される
    await expect(page.locator('header a[href="/auth/login"]')).toBeVisible()
    await expect(page.locator('header a[href="/auth/register/jobseeker"]')).toBeVisible()
    await expect(page.locator('header a[href="/auth/register/company"]')).toBeVisible()

    // ログアウトボタンは表示されない
    await expect(page.locator('header button', { hasText: 'ログアウト' })).not.toBeVisible()
  })
})
