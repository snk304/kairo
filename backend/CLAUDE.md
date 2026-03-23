# backend/CLAUDE.md

## 仕様書

- 構成・クラス定義 → `docs/03_backend.md`
- APIエンドポイント → `docs/04_api.md`
- DB・モデル → `docs/02_database.md`

## コマンド

```bash
# コンテナに入る
docker compose exec backend bash

# よく使うartisan
php artisan migrate
php artisan migrate --seed
php artisan db:seed
php artisan config:clear && php artisan cache:clear && php artisan route:clear
php artisan route:list --path=api
php artisan scout:import "App\Models\Job"

# テスト
./vendor/bin/pest
./vendor/bin/pest tests/Feature/Auth/AuthTest.php
./vendor/bin/pest --coverage
```

## ディレクトリ構成

```
app/
├── Http/
│   ├── Controllers/   # 薄く書く
│   ├── Requests/      # バリデーション
│   ├── Resources/     # レスポンス整形
│   └── Middleware/
├── Models/
├── Policies/          # 認可
└── Services/          # ビジネスロジック
```

## 重要ルール

- コーディングスタイル → `.claude/rules/coding-style.md`
- 認可・セキュリティ → `.claude/rules/security.md` ← 必ず読む
- API追加手順 → `.claude/skills/add-api-endpoint.md`
- マイグレーション追加手順 → `.claude/skills/add-migration.md`
