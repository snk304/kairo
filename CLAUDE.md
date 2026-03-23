# CLAUDE.md

## プロジェクト概要

**Fitto** — 身体障害のある求職者と企業をつなぐ配慮マッチングプラットフォーム。

- 求職者・企業・管理者の3ロール
- 未認証でも求人・求職者プロフィールを閲覧できるオープン設計
- 求職者からの応募 + 企業からのスカウト、両方に対応

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 15（App Router）/ TypeScript / Tailwind CSS |
| バックエンド | Laravel 11 / PHP 8.3 / REST API |
| DB | PostgreSQL 16 |
| キャッシュ・キュー | Redis 7 |
| 検索 | Meilisearch |
| 開発環境 | Docker Compose |

---

## 仕様書（実装前に必ず読む）

| ファイル | 内容 |
|----------|------|
| `docs/01_environment.md` | Docker環境構築 |
| `docs/02_database.md` | DB設計・マイグレーション・モデル |
| `docs/03_backend.md` | Laravel構成・ルーティング・クラス定義 |
| `docs/04_api.md` | 全APIエンドポイント仕様 |
| `docs/05_frontend.md` | Next.js構成・画面仕様 |
| `docs/06_testing.md` | テスト仕様・CI設定 |

---

## ルール（必要なときだけ読む）

| ファイル | 内容 |
|----------|------|
| `.claude/rules/coding-style.md` | PHP・TypeScriptの書き方 |
| `.claude/rules/security.md` | 認可・セキュリティルール ← 重要 |
| `.claude/rules/git.md` | コミット・ブランチルール |

---

## スキル（繰り返すタスクの手順書）

| ファイル | 使うタイミング |
|----------|--------------|
| `.claude/skills/add-api-endpoint.md` | APIを1本追加するとき |
| `.claude/skills/add-migration.md` | テーブル・カラムを追加するとき |

---

## ディレクトリ構成

```
/
├── CLAUDE.md
├── docs/
├── docker-compose.yml
├── docker/
├── backend/        # → backend/CLAUDE.md を読む
└── frontend/       # → frontend/CLAUDE.md を読む
```

---

## 絶対に守ること

- `.env` をコミットしない
- `any` 型を使わない
- レスポンスは必ずAPI Resourceを通す
- 認可ルールは `.claude/rules/security.md` を必ず確認する
