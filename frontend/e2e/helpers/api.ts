import { APIRequestContext } from '@playwright/test'

const API_BASE = process.env.API_BASE_URL ?? 'https://kairo-iphu.onrender.com'

export interface LoginResult {
  token: string
  user: {
    id: string
    email: string
    role: string
  }
}

/**
 * APIを直接呼び出してログインしトークンを取得する
 * Render の cold start を考慮してリトライロジックを内包
 */
export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
  maxRetries = 3
): Promise<LoginResult> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email, password },
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 60_000,
      })

      if (response.ok()) {
        const body = await response.json()
        return {
          token: body.token,
          user: body.user,
        }
      }

      const text = await response.text()
      throw new Error(`Login failed (${response.status()}): ${text}`)
    } catch (err) {
      lastError = err as Error
      if (attempt < maxRetries) {
        // cold start の場合は少し待ってリトライ
        await new Promise((r) => setTimeout(r, 3000 * attempt))
      }
    }
  }

  throw lastError ?? new Error('apiLogin failed after retries')
}

/**
 * バックエンドの疎通確認 (ヘルスチェック)
 * cold start を待つために最大60秒リトライする
 */
export async function waitForBackend(request: APIRequestContext): Promise<void> {
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    try {
      const res = await request.get(`${API_BASE}/api/jobs?per_page=1`, {
        headers: { Accept: 'application/json' },
        timeout: 15_000,
      })
      if (res.ok()) return
    } catch {
      // まだ起動していない
    }
    await new Promise((r) => setTimeout(r, 5000))
  }
  throw new Error('Backend did not become ready within 90 seconds')
}
