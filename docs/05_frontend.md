# 05_frontend.md — Next.jsフロントエンド実装仕様

## ディレクトリ構成

```
frontend/src/
├── app/
│   ├── layout.tsx                    # ルートレイアウト
│   ├── page.tsx                      # トップ / LP
│   ├── jobs/
│   │   ├── page.tsx                  # 求人一覧
│   │   └── [id]/
│   │       └── page.tsx              # 求人詳細
│   ├── jobseekers/
│   │   ├── page.tsx                  # 求職者一覧
│   │   └── [id]/
│   │       └── page.tsx              # 求職者プロフィール詳細
│   ├── companies/
│   │   └── [id]/
│   │       └── page.tsx              # 企業プロフィール詳細
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx              # ログイン（jobseeker/company共通）
│   │   ├── register/
│   │   │   ├── jobseeker/
│   │   │   │   └── page.tsx          # 求職者新規登録
│   │   │   └── company/
│   │   │       └── page.tsx          # 企業新規登録
│   │   └── forgot-password/
│   │       └── page.tsx              # パスワードリセット
│   ├── dashboard/                    # 求職者ダッシュボード
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx              # プロフィール編集
│   │   ├── applications/
│   │   │   └── page.tsx              # 応募履歴
│   │   ├── scouts/
│   │   │   └── page.tsx              # スカウト受信一覧
│   │   ├── messages/
│   │   │   ├── page.tsx              # スレッド一覧
│   │   │   └── [id]/
│   │   │       └── page.tsx          # スレッド詳細
│   │   └── notifications/
│   │       └── page.tsx              # 通知一覧
│   ├── company/                      # 企業ダッシュボード
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx              # 企業プロフィール編集
│   │   ├── jobs/
│   │   │   ├── page.tsx              # 求人管理一覧
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # 求人作成
│   │   │   └── [id]/
│   │   │       ├── edit/
│   │   │       │   └── page.tsx      # 求人編集
│   │   │       └── applications/
│   │   │           └── page.tsx      # 応募者管理
│   │   ├── scouts/
│   │   │   └── page.tsx              # スカウト送信済み一覧
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── notifications/
│   │       └── page.tsx
│   └── admin/                        # 管理者
│       ├── layout.tsx
│       ├── page.tsx
│       ├── users/
│       │   └── page.tsx
│       ├── jobs/
│       │   └── page.tsx
│       ├── contacts/
│       │   └── page.tsx
│       └── stats/
│           └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── ui/                           # 汎用UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   └── LoadingSpinner.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   └── JobFilter.tsx
│   ├── jobseekers/
│   │   ├── JobseekerCard.tsx
│   │   └── JobseekerFilter.tsx
│   └── messages/
│       ├── ThreadList.tsx
│       └── MessageBubble.tsx
├── lib/
│   ├── api/                          # APIクライアント
│   │   ├── client.ts                 # axiosインスタンス
│   │   ├── auth.ts
│   │   ├── jobseekers.ts
│   │   ├── companies.ts
│   │   ├── jobs.ts
│   │   ├── applications.ts
│   │   ├── scouts.ts
│   │   ├── threads.ts
│   │   ├── notifications.ts
│   │   └── master.ts
│   └── utils/
│       ├── format.ts                 # 日付・金額フォーマット
│       └── cn.ts                    # classname結合ユーティリティ
├── hooks/
│   ├── useAuth.ts
│   ├── useJobs.ts
│   ├── useJobseekers.ts
│   └── useNotifications.ts
├── store/
│   └── authStore.ts                  # Zustandストア
└── types/
    └── index.ts                      # 型定義
```

---

## 型定義（`src/types/index.ts`）

```typescript
export type Role = 'jobseeker' | 'company' | 'admin'

export interface User {
  id: string
  email: string
  role: Role
}

export interface JobseekerProfile {
  id: string
  firstName: string
  lastName: string
  disabilityType?: { id: string; name: string }
  disabilityGrade?: string
  desiredJobCategory?: { id: string; name: string }
  prefecture?: { id: string; name: string }
  desiredWorkStyle?: string
  desiredEmploymentType?: string
  desiredSalary?: number
  selfPr?: string
  isPublic: boolean
  // 企業ログイン時のみ
  email?: string
  resumeUrl?: string
}

export interface CompanyProfile {
  id: string
  name: string
  industry?: string
  employeeCount?: number
  prefecture?: { id: string; name: string }
  address?: string
  description?: string
  disabledHireCount: number
  considerations?: Considerations
}

export interface Considerations {
  facility?: string[]
  workStyle?: string[]
  communication?: string[]
  equipment?: string[]
}

export interface Job {
  id: string
  title: string
  company: Pick<CompanyProfile, 'id' | 'name'>
  jobCategory?: { id: string; name: string }
  description?: string
  employmentType?: string
  workStyle?: string
  salaryMin?: number
  salaryMax?: number
  prefecture?: { id: string; name: string }
  considerations?: Considerations
  status: 'draft' | 'published' | 'closed'
  createdAt: string
}

export interface Application {
  id: string
  job: Pick<Job, 'id' | 'title'>
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected'
  createdAt: string
}

export interface Scout {
  id: string
  company?: Pick<CompanyProfile, 'id' | 'name'>
  jobseeker?: Pick<JobseekerProfile, 'id' | 'firstName' | 'lastName'>
  job?: Pick<Job, 'id' | 'title'>
  message: string
  status: 'unread' | 'read' | 'replied'
  createdAt: string
}

export interface Thread {
  id: string
  opponent: { id: string; name: string }
  lastMessage?: { body: string; createdAt: string }
  unreadCount: number
}

export interface Message {
  id: string
  senderId: string
  body: string
  isRead: boolean
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  data: Record<string, string>
  readAt: string | null
  createdAt: string
}

export interface PaginationMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
```

---

## APIクライアント

### `src/lib/api/client.ts`

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

// リクエストインターセプター：トークンを自動付与
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// レスポンスインターセプター：401時にログインページへ
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### `src/lib/api/jobs.ts`（例）

```typescript
import apiClient from './client'
import type { Job, PaginatedResponse } from '@/types'

export const jobsApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Job>>('/jobs', { params }),

  show: (id: string) =>
    apiClient.get<{ data: Job }>(`/jobs/${id}`),

  create: (data: Partial<Job>) =>
    apiClient.post<{ data: Job }>('/jobs', data),

  update: (id: string, data: Partial<Job>) =>
    apiClient.put<{ data: Job }>(`/jobs/${id}`, data),

  destroy: (id: string) =>
    apiClient.delete(`/jobs/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.put<{ data: Job }>(`/jobs/${id}/status`, { status }),

  myJobs: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Job>>('/jobs/me', { params }),

  apply: (id: string) =>
    apiClient.post(`/jobs/${id}/apply`),
}
```

---

## Zustandストア（`src/store/authStore.ts`）

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token })
        localStorage.setItem('token', token)
      },
      clearAuth: () => {
        set({ user: null, token: null })
        localStorage.removeItem('token')
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: 'auth-storage' }
  )
)
```

---

## レイアウト・画面仕様

### ルートレイアウト（`src/app/layout.tsx`）

- TanStack QueryのProviderを設置
- フォントはNoto Sans JP（日本語対応）
- ヘッダーをグローバルに配置

### ヘッダー（`src/components/layout/Header.tsx`）

- 未認証：ロゴ・求人を探す・求職者を探す・企業登録・ログイン
- 求職者ログイン後：ロゴ・求人を探す・スカウト（未読バッジ）・メッセージ（未読バッジ）・通知（未読バッジ）・マイページドロップダウン
- 企業ログイン後：ロゴ・求職者を探す・メッセージ（未読バッジ）・通知（未読バッジ）・企業管理ドロップダウン
- スマートフォンではハンバーガーメニュー

### 求職者ダッシュボードレイアウト（`src/app/dashboard/layout.tsx`）

- ログイン必須（未認証はログインページへリダイレクト）
- role=jobseekerのみアクセス可（companyは/companyへ、adminは/adminへ）
- サイドメニュー：プロフィール・求人を探す・応募履歴・スカウト・メッセージ・通知

### 企業ダッシュボードレイアウト（`src/app/company/layout.tsx`）

- ログイン必須（role=company）
- サイドメニュー：プロフィール・求人管理・求職者を探す・スカウト管理・メッセージ・通知

---

## 各画面の実装仕様

### トップ / LP（`src/app/page.tsx`）

- SSG（静的生成）
- セクション：ヒーロー・注目求人（6件）・特徴・掲載企業
- 注目求人はLaravel側から最新のpublished求人を取得

### 求人一覧（`src/app/jobs/page.tsx`）

- SSR（サーバーサイドレンダリング）でSEO対応
- URLクエリパラメータでフィルター状態を管理
  - 例：`/jobs?job_category_id=xxx&prefecture_id=yyy`
- フィルター変更時はURLを更新してページをリロード

### 求人詳細（`src/app/jobs/[id]/page.tsx`）

- SSR
- OGP設定（title・description・image）
- サイドバーに応募ボタン固定表示
- 未認証の場合は「話を聞いてみる」クリックでログインページへ

### 求職者ダッシュボード > プロフィール編集（`src/app/dashboard/profile/page.tsx`）

- タブ形式：基本情報・障害・配慮情報・希望条件・履歴書
- React Hook Form + Zodでバリデーション
- 保存時はAPIにPUT、成功後にトースト表示

### メッセージ画面（`src/app/dashboard/messages/[id]/page.tsx`）

- 左：スレッド一覧、右：メッセージ詳細（PC）
- スマートフォンはスレッド一覧 → メッセージ詳細の遷移
- メッセージ送信後にスクロールが最下部に移動する
- ポーリング（5秒間隔）で新着メッセージを取得
  - v2でWebSocketに移行する予定

---

## アクセシビリティ実装ルール

- 全てのインタラクティブ要素（ボタン・リンク・フォーム）にフォーカスリングを表示する
- キーボードのみで全操作ができること
- `<img>` には全て `alt` 属性を付ける
- フォームの `<input>` には `<label>` を関連付ける
- エラーメッセージは `role="alert"` で実装する
- モーダルは `aria-modal="true"` と `role="dialog"` を付ける
- ローディング状態は `aria-busy="true"` で表現する
- カラーコントラスト比は4.5:1以上（WCAG 2.1 AA）

---

## 環境変数（`src/app/frontend/.env.local.example`）

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```
