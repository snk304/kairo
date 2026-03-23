# CLAUDE.md — プロジェクト総合指示書

## このファイルについて

ClaudeCodeがこのプロジェクトを実装するための総合指示書です。
実装を始める前に必ずこのファイルを読み、各仕様書を参照してください。

---

## プロジェクト概要

**サービス名**：障害者求職マッチングシステム

身体障害のある求職者と障害者雇用を希望する企業をつなぐマッチングプラットフォーム。
Wantedlyを参考にしたオープン設計で、「配慮のマッチング」を中心に置く。

---

## 仕様書一覧

実装前に以下の順番で全て読むこと。

| ファイル | 内容 |
|----------|------|
| `docs/01_environment.md` | 開発環境構築（Docker Compose） |
| `docs/02_database.md` | DB設計・マイグレーション・シーダー |
| `docs/03_backend.md` | Laravelバックエンド実装仕様 |
| `docs/04_api.md` | APIエンドポイント実装仕様 |
| `docs/05_frontend.md` | Next.jsフロントエンド実装仕様 |
| `docs/06_testing.md` | テスト仕様 |

---

## 技術スタック

### フロントエンド
- Next.js 15（App Router）
- TypeScript
- Tailwind CSS

### バックエンド
- Laravel 11 / PHP 8.3
- REST API

### データベース
- PostgreSQL 16

### キャッシュ・キュー
- Redis 7

### 検索
- Meilisearch

### 開発環境
- Docker Compose

---

## ディレクトリ構成

```
/ (プロジェクトルート)
├── CLAUDE.md
├── docs/
│   ├── CLAUDE.md
│   ├── 01_environment.md
│   ├── 02_database.md
│   ├── 03_backend.md
│   ├── 04_api.md
│   ├── 05_frontend.md
│   └── 06_testing.md
├── docker-compose.yml
├── backend/               # Laravel
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
└── frontend/              # Next.js
    ├── app/
    ├── components/
    └── ...
```

---

## 開発ルール

### 共通
- コミットメッセージは日本語でよい
- 環境変数は `.env.example` に必ずサンプルを書く
- シークレット情報は絶対に `.env` に書いてコミットしない

### バックエンド（Laravel）
- コントローラーは薄く書く。ロジックはServiceクラスに切り出す
- バリデーションは必ずFormRequestクラスに書く
- レスポンスは必ずAPI Resourceクラスを通す
- 認可はPolicyクラスに書く
- Eloquentのクエリはなるべくscopeを使う

### フロントエンド（Next.js）
- `any` 型は使わない
- APIリクエストは `lib/api/` 以下に切り出す
- コンポーネントは `components/` 以下に置く
- ページは `app/` 以下のApp Routerに従う

### アクセシビリティ
- 全てのインタラクティブ要素にキーボード操作を実装する
- 画像には必ず `alt` テキストを付ける
- フォームのラベルは必ず `<label>` で関連付ける
- カラーコントラストはWCAG 2.1 AA基準を満たす

---

## ユーザーロール

| ロール | 説明 |
|--------|------|
| `jobseeker` | 求職者 |
| `company` | 企業担当者 |
| `admin` | 管理者 |

---

## 実装の優先順位

以下の順番で実装すること。

1. 開発環境構築（Docker Compose）
2. DBマイグレーション・シーダー
3. Laravel認証API（登録・ログイン・ログアウト）
4. マスタAPI（障害種別・職種・都道府県）
5. 求職者プロフィールAPI
6. 企業プロフィールAPI
7. 求人API
8. 応募API
9. スカウトAPI
10. メッセージAPI
11. 通知API
12. 管理者API
13. Next.js共通レイアウト・認証
14. 求人一覧・詳細画面
15. 求職者プロフィール画面
16. 企業プロフィール画面
17. 求職者ダッシュボード
18. 企業ダッシュボード
19. メッセージ画面
20. 管理者画面

---

## 注意事項

- 求職者の連絡先・履歴書URLは企業ログイン時のみAPIレスポンスに含める
- 未認証ユーザーでも求人・求職者プロフィールは閲覧できる
- 二重応募防止のためapplicationsテーブルに `job_id + jobseeker_id` のユニーク制約を付ける
- ファイルアップロードはローカル開発時はDockerのストレージに保存し、本番はS3に切り替える
