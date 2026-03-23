# Kairo（カイロ）

身体障害のある求職者と企業をつなぐ「配慮のマッチング」プラットフォーム。

求職者は自分の障害・配慮事項を登録し、企業の配慮体制とマッチングできる。
企業は求職者へスカウトを送り、応募管理・メッセージのやり取りができる。

## デモ

| ロール | メール | パスワード |
|--------|--------|-----------|
| 求職者 | jobseeker1@example.com | password |
| 企業 | company1@example.com | password |
| 管理者 | admin@example.com | password |

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 / TypeScript / Tailwind CSS |
| バックエンド | Laravel 11 / PHP 8.4 / REST API |
| DB | PostgreSQL 16（本番: Supabase） |
| キャッシュ | Redis 7（本番: database ドライバー） |
| ストレージ | ローカル（本番: Supabase Storage） |
| ホスティング | Vercel（フロント）+ Render（バック）+ Supabase（DB） |

## ローカル開発

```bash
# 起動
docker compose up -d

# マイグレーション＋シード
docker compose exec backend php artisan migrate --seed

# フロントエンド
cd frontend && npm install && npm run dev
```

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000/api
- API ドキュメント: http://localhost:8000/api/documentation

## 本番デプロイ

Vercel + Render（Free）+ Supabase（Free）の完全無料構成。

手順は [docs/deploy.md](docs/deploy.md) を参照。

## API ドキュメント

OpenAPI（Swagger UI）: https://snk304.github.io/kairo/

## ディレクトリ構成

```
/
├── backend/          # Laravel 11
├── frontend/         # Next.js 15
├── docs/             # 仕様書・デプロイガイド・API仕様
├── render.yaml       # Render Blueprint
└── docker-compose.yml
```
