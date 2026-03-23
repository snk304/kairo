# テスト進捗チェックリスト

> 最終更新: 2026-03-20 | 凡例: ✅ PASS / ❌ FAIL（要修正）/ 🔧 修正済 / ⏳ 未テスト

---

## 画面表示テスト（全ページ）

### 公開ページ

- ✅ `GET /` トップページ — HTTP 200 正常
- ✅ `GET /jobs` 求人一覧 — HTTP 200 正常（7件）
- ✅ `GET /jobs/[id]` 求人詳細 — HTTP 200 正常
- ✅ `GET /jobseekers` 求職者一覧 — HTTP 200 正常
- ✅ `GET /jobseekers/[id]` 求職者詳細 — HTTP 200 正常 🔧（APIキャメルケース修正後）
- ✅ `GET /companies/[id]` 企業詳細 — HTTP 200 正常

### 認証ページ

- ✅ `GET /auth/login` ログイン — HTTP 200 正常
- ✅ `GET /auth/register/jobseeker` 求職者登録 — HTTP 200 正常
- ✅ `GET /auth/register/company` 企業登録 — HTTP 200 正常
- ✅ `GET /auth/forgot-password` パスワード忘れ — HTTP 200 正常

### 求職者ダッシュボード（要ログイン: jobseeker1@example.com）

- ✅ `GET /dashboard` マイページ — HTTP 200（未認証時はクライアントリダイレクト）
- ✅ `GET /dashboard/profile` プロフィール編集 — HTTP 200 正常
- ✅ `GET /dashboard/applications` 応募一覧 — HTTP 200
- ✅ `GET /dashboard/scouts` スカウト一覧 — HTTP 200
- ✅ `GET /dashboard/messages` メッセージ一覧 — HTTP 200
- ✅ `GET /dashboard/notifications` 通知一覧 — HTTP 200

### 企業管理（要ログイン: company1@example.com）

- ✅ `GET /company` 企業ダッシュボード — HTTP 200（未認証時はクライアントリダイレクト）
- ✅ `GET /company/profile` 企業プロフィール編集 — HTTP 200 正常
- ✅ `GET /company/jobs` 求人管理 — HTTP 200
- ✅ `GET /company/jobs/new` 求人作成 — HTTP 200 正常
- ✅ `GET /company/scouts` スカウト管理 — HTTP 200 正常
- ✅ `GET /company/messages` メッセージ一覧 — HTTP 200 正常
- ✅ `GET /company/notifications` 通知一覧 — HTTP 200 正常

### 管理者（要ログイン: admin@example.com）

- ✅ `GET /admin` 管理ダッシュボード — HTTP 200（未認証時はクライアントリダイレクト）
- ✅ `GET /admin/users` ユーザー管理 — HTTP 200 正常
- ✅ `GET /admin/jobs` 求人管理 — HTTP 200 正常
- ✅ `GET /admin/contacts` お問い合わせ管理 — HTTP 200 正常
- ✅ `GET /admin/stats` 統計 — HTTP 200 正常

---

## 機能テスト

### 認証

- ✅ ログイン（正常） — 全ロールでトークン取得成功
- ✅ ログイン（失敗: 誤パスワード） — 422/401 正常
- ✅ 求職者新規登録 — 201 正常
- ✅ 企業新規登録 — 201 正常
- ✅ ログアウト — `{"message":"logged out"}` 正常
- ✅ ログイン後のリダイレクト（roleフィールドでフロントが判定: jobseeker→/dashboard、company→/company、admin→/admin）

### 求人（公開）

- ✅ 求人一覧表示・フィルター（職種・都道府県・雇用形態・勤務形態）— 正常動作
- ✅ 求人詳細表示 — 正常動作

### 求職者（公開）

- ✅ 求職者一覧表示・フィルター — 正常動作
- ✅ 求職者詳細表示 — 正常動作

### 求職者機能 (API)

- ✅ プロフィール取得 `GET /api/jobseekers/me` — 200 正常 🔧（ルート修正済）
- ✅ プロフィール作成・編集 — POST/PUT 200/201 正常
- ✅ 求人に応募 `POST /api/jobs/{id}/apply` — 201 正常
- ✅ 応募一覧確認 `GET /api/applications/me` — 200 正常
- ✅ スカウト一覧確認 `GET /api/scouts/received` — 200 正常
- ✅ スカウト既読 `PUT /api/scouts/{id}/read` — 200 正常
- ✅ メッセージ一覧 `GET /api/threads` — 200 正常
- ✅ メッセージ送信 `POST /api/threads/{id}/messages` — 201 正常 🔧（`->refresh()` でcreatedAt/isRead null修正済）
- ✅ 通知一覧 `GET /api/notifications` — 200 正常
- ✅ 通知既読 `PUT /api/notifications/{id}/read` — 200 正常
- ✅ 全通知既読 `PUT /api/notifications/read-all` — 200 正常

### 企業機能 (API)

- ✅ 企業プロフィール取得 `GET /api/companies/me` — 200 正常 🔧（ルート修正済）
- ✅ 企業プロフィール更新 `PUT /api/companies/me` — 200 正常
- ✅ 求人一覧 `GET /api/jobs/me` — 200 正常 🔧（ルート修正済）
- ✅ 求人作成 `POST /api/jobs` — 201 正常
- ✅ 求人編集 `PUT /api/jobs/{id}` — 200 正常
- ✅ 求人削除 `DELETE /api/jobs/{id}` — 204 正常
- ✅ 求人ステータス変更 `PUT /api/jobs/{id}/status` — 200 正常
- ✅ 応募者一覧確認 `GET /api/jobs/{id}/applications` — 200 正常
- ✅ スカウト一覧 `GET /api/scouts/sent` — 200 正常（空）
- ✅ スカウト送信 `POST /api/scouts` — 201 正常 🔧（jobseeker_id=userId使用、JobseekerProfileResourceにuserIdフィールド追加）
- ✅ メッセージ一覧 `GET /api/threads` — 200 正常
- ✅ 通知一覧・既読 — 200 正常

### 管理者機能 (API)

- ✅ ユーザー一覧 `GET /api/admin/users` — 200 正常（9件）
- ✅ ユーザー停止 `PUT /api/admin/users/{id}/suspend` — 200 正常
- ✅ 求人強制非公開 `PUT /api/admin/jobs/{id}/unpublish` — 200 正常 🔧（JobResourceを通すよう修正）
- ✅ お問い合わせ一覧 `GET /api/admin/contacts` — 200 正常（空）
- ✅ 統計 `GET /api/admin/stats` — 200 正常（求職者5・企業3・求人7）

### ロール制限

- ✅ 求職者が管理者APIにアクセス → 403 正常
- ✅ 企業が管理者APIにアクセス → 403 正常

---

## APIテスト（バックエンド）

- ✅ ヘルスチェック `GET /api/health` — `{"status":"ok"}`
- ✅ 求人一覧 `GET /api/jobs` — 7件正常返却
- ✅ マスタデータ `GET /api/master/job-categories` — 配列で正常返却 🔧（Redis FLUSHALL後）
- ✅ ログイン `POST /api/auth/login` — 全ロールで成功
- ✅ バックエンドPestテスト 22/22 全通過

---

## 検出されたバグと修正状況

| # | バグ | 場所 | 状態 |
|---|------|------|------|
| 1 | `categories.map is not a function` — キャッシュ破損 | MasterController / 各フィルターコンポーネント | 🔧 修正済（`->toArray()` + `Array.isArray`） |
| 2 | `fetch failed` — DockerネットワークURL問題 | Server Components | 🔧 修正済（`API_URL=http://backend`） |
| 3 | `Hydration Error` — Zustand SSR不一致 | Header / authStore | 🔧 修正済（`skipHydration` + `rehydrate`） |
| 4 | `authorize()` undefined — Laravel 11互換 | Controller基底クラス | 🔧 修正済（`AuthorizesRequests` trait追加） |
| 5 | `TransientToken::delete()` — テスト時logout失敗 | AuthController | 🔧 修正済（`method_exists` チェック） |
| 6 | `/api/jobseekers/me` 404 — ルート順序問題 | routes/api.php | 🔧 修正済（ULID正規表現制約） |
| 7 | `/api/companies/me` 404 — 同上 | routes/api.php | 🔧 修正済 |
| 8 | `/api/jobs/me` 404 — 同上 | routes/api.php | 🔧 修正済 |
| 9 | APIレスポンスがスネークケース / フロントがキャメルケース不一致 | 全Resourceクラス | 🔧 修正済（全8リソースをcamelCaseに統一） |
| 10 | メッセージ作成後 `isRead`・`createdAt` が null | ThreadController | 🔧 修正済（`Message::create()->refresh()`） |
| 11 | スカウト送信時 `jobseeker_id` バリデーションエラー | ScoutRequest / JobseekerProfileResource | 🔧 修正済（ResourceにuserIdフィールド追加） |
| 12 | 管理者求人API・非公開APIがsnake_caseレスポンス | AdminController | 🔧 修正済（JobResource使用に変更） |

---

## テスト済みアカウント

| ロール | メール | パスワード |
|--------|--------|-----------|
| 求職者 | jobseeker1@example.com | password |
| 企業 | company1@example.com | password |
| 管理者 | admin@example.com | password |
