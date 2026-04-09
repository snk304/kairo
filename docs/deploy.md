# デプロイガイド（完全無料構成）

## 構成概要

| サービス | 用途 | プラン |
|---------|------|--------|
| [Vercel](https://vercel.com) | Next.js フロントエンド | Hobby（無料） |
| [Render](https://render.com) | Laravel バックエンド（Docker） | Free（無料・スリープあり） |
| [Supabase](https://supabase.com) | PostgreSQL + ファイルストレージ | Free（無料） |

> **注意**: Render Free プランはリクエストのない状態が15分続くとスリープします。
> ポートフォリオ・デモ用途では許容範囲ですが、常時稼働が必要な場合は Render Starter（$7/月）を検討してください。

---

## 1. Supabase セットアップ

### 1-1. プロジェクト作成

1. [supabase.com](https://supabase.com) にサインアップ
2. 「New project」→ 任意の名前（例: `kairo`）、パスワードを設定
3. リージョン: **Northeast Asia (Tokyo)** を選択

### 1-2. データベース接続情報の取得

「Project Settings」→「Database」→「Connection string」

- **Transaction mode** の URL をコピー（Render の DATABASE_URL に使用）
  ```
  postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
  ```

### 1-3. RLS（Row-Level Security）の適用

Supabase の PostgREST API 経由の直接アクセスをブロックするため、RLS を有効化します。
**マイグレーション実行後に必ず適用してください。**

1. Supabase ダッシュボード「SQL Editor」を開く
2. `supabase/migrations/20260402000000_enable_rls_all_tables.sql` の内容をペーストして実行

> Laravel バックエンドは直接 DB 接続（postgres ロール）を使うため、RLS の影響を受けません。

### 1-4. Supabase Storage のセットアップ

1. 「Storage」→「New bucket」→ 名前: `kairo-uploads`、Public: **ON**
2. 「Project Settings」→「API」→ Service role key をコピー
3. 「Project Settings」→「Storage」→ S3 Access Keys を発行

取得した値:
- `Access Key ID` → `AWS_ACCESS_KEY_ID`
- `Secret Access Key` → `AWS_SECRET_ACCESS_KEY`
- Storage URL: `https://<project-ref>.supabase.co/storage/v1/object/public`
- S3 Endpoint: `https://<project-ref>.supabase.co/storage/v1/s3`

---

## 2. Render セットアップ

### 2-1. デプロイ

1. [render.com](https://render.com) にサインアップ（GitHub アカウント連携推奨）
2. 「New」→「Web Service」→ リポジトリを選択
3. 以下の設定を確認:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile.prod`
   - **Plan**: Free

または `render.yaml`（プロジェクトルートにある Blueprint）を使って「New」→「Blueprint」からデプロイ。

### 2-2. 環境変数の設定

Render ダッシュボード「Environment」タブで以下を設定:

| 環境変数 | 値 |
|---------|-----|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | （自動生成、または `php artisan key:generate --show` で取得） |
| `APP_URL` | Render が発行した URL（例: `https://kairo-backend.onrender.com`） |
| `DB_URL` | Supabase の Transaction mode URL（`postgresql://postgres.[ref]:...`） |
| `CACHE_STORE` | `database` |
| `SESSION_DRIVER` | `database` |
| `QUEUE_CONNECTION` | `database` |
| `SCOUT_DRIVER` | `database` |
| `FILESYSTEM_DISK` | `s3` |
| `AWS_ACCESS_KEY_ID` | Supabase S3 Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | Supabase S3 Secret Access Key |
| `AWS_DEFAULT_REGION` | `ap-southeast-1` |
| `AWS_BUCKET` | `kairo-uploads` |
| `AWS_URL` | `https://<ref>.supabase.co/storage/v1/object/public` |
| `AWS_ENDPOINT` | `https://<ref>.supabase.co/storage/v1/s3` |
| `CORS_ALLOWED_ORIGINS` | Vercel URL（次のステップで取得、後から設定可） |
| `SANCTUM_STATEFUL_DOMAINS` | Vercel ドメイン（例: `kairo.vercel.app`） |

### 2-3. 初回デプロイ確認

デプロイ完了後、以下を確認:
```
https://kairo-backend.onrender.com/api/health
```
`{"status":"ok"}` が返れば成功。

---

## 3. Vercel セットアップ

### 3-1. デプロイ

1. [vercel.com](https://vercel.com) にサインアップ
2. 「New Project」→ リポジトリを選択
3. **Root Directory**: `frontend` を指定
4. Framework: **Next.js** が自動検出される

### 3-2. 環境変数の設定

| 環境変数 | 値 |
|---------|-----|
| `NEXT_PUBLIC_API_URL` | Render の URL（例: `https://kairo-backend.onrender.com`） |

### 3-3. デプロイ確認

Vercel が発行した URL にアクセスしてフロントが表示されることを確認。

---

## 4. CORS・Sanctum の最終設定

Vercel のデプロイ URL が確定したら、Render の環境変数を更新:

| 環境変数 | 値の例 |
|---------|--------|
| `CORS_ALLOWED_ORIGINS` | `https://kairo.vercel.app` |
| `SANCTUM_STATEFUL_DOMAINS` | `kairo.vercel.app` |

更新後、Render が自動で再デプロイされる。

---

## 5. デモアカウント

シードデータが投入済みなので以下のアカウントでログイン可能:

| ロール | メール | パスワード |
|--------|--------|-----------|
| 求職者 | jobseeker@example.com | password |
| 企業 | company@example.com | password |
| 管理者 | admin@example.com | password |

---

## トラブルシューティング

### Render がスリープから復帰しない

- 初回リクエストは最大30秒かかる場合がある（コールドスタート）
- 画面をリロードして待つ

### CORS エラーが出る

- Render の `CORS_ALLOWED_ORIGINS` に Vercel の URL が正確に設定されているか確認
- `https://` プレフィックスを含めること（末尾スラッシュなし）

### Supabase の DB が停止している

- Supabase Free プランはアクティビティがない状態が **7日間** 続くと一時停止される
- Supabase ダッシュボードから「Restore」ボタンで再起動

### マイグレーションが失敗する

Render のシェルから手動実行:
```bash
# Render ダッシュボード → Shell タブ
php artisan migrate --force
```
