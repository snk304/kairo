# 01_environment.md — 開発環境構築仕様

## 概要

Docker Composeを使ってローカル開発環境を構築する。
以下の全サービスをコンテナで起動する。

| サービス | コンテナ名 | ポート |
|----------|-----------|--------|
| Next.js | frontend | 3000 |
| Laravel（Nginx + PHP-FPM） | backend | 8000 |
| PostgreSQL | db | 5432 |
| Redis | redis | 6379 |
| Meilisearch | meilisearch | 7700 |

---

## ディレクトリ構成

```
/ (プロジェクトルート)
├── docker-compose.yml
├── docker/
│   ├── backend/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── frontend/
│       └── Dockerfile
├── backend/               # Laravelプロジェクト
└── frontend/              # Next.jsプロジェクト
```

---

## docker-compose.yml

以下の内容で作成する。

```yaml
services:
  frontend:
    build:
      context: ./docker/frontend
      dockerfile: Dockerfile
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    command: npm run dev

  backend:
    build:
      context: ./docker/backend
      dockerfile: Dockerfile
    volumes:
      - ./backend:/var/www/html
    ports:
      - "8000:80"
    environment:
      - APP_ENV=local
      - APP_DEBUG=true
      - DB_HOST=db
      - DB_PORT=5432
      - DB_DATABASE=matching_db
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - MEILISEARCH_HOST=http://meilisearch:7700
      - FILESYSTEM_DISK=local
    depends_on:
      - db
      - redis
      - meilisearch

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: matching_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.6
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=masterkey
      - MEILI_ENV=development
    volumes:
      - meilisearch_data:/meili_data

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

---

## docker/backend/Dockerfile

```dockerfile
FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    nginx \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY nginx.conf /etc/nginx/sites-available/default

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
```

---

## docker/backend/nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/html/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

---

## docker/backend/entrypoint.sh

```bash
#!/bin/bash
set -e

cd /var/www/html

if [ ! -f "composer.json" ]; then
    composer create-project laravel/laravel . --prefer-dist
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
fi

composer install --no-interaction

php artisan migrate --force
php artisan db:seed --force

php-fpm -D
nginx -g "daemon off;"
```

---

## docker/frontend/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## Laravelプロジェクト初期セットアップ

### 1. Laravelプロジェクト作成

```bash
cd backend
composer create-project laravel/laravel . --prefer-dist
```

### 2. 必要なパッケージのインストール

```bash
composer require \
    laravel/sanctum \
    meilisearch/meilisearch-php \
    http-interop/http-factory-guzzle \
    laravel/scout
```

### 3. backend/.env.example の作成

```env
APP_NAME="障害者求職マッチングシステム"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=matching_db
DB_USERNAME=postgres
DB_PASSWORD=password

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=null

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_KEY=masterkey

FILESYSTEM_DISK=local

# 本番環境ではS3に切り替える
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=ap-northeast-1
# AWS_BUCKET=
# FILESYSTEM_DISK=s3

MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### 4. config/cors.php の設定

`paths` に `api/*` を追加し、`allowed_origins` に `http://localhost:3000` を追加する。

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 5. Sanctumのインストール

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

---

## Next.jsプロジェクト初期セットアップ

### 1. Next.jsプロジェクト作成

```bash
cd frontend
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 2. 必要なパッケージのインストール

```bash
npm install \
  axios \
  @tanstack/react-query \
  zustand \
  react-hook-form \
  zod \
  @hookform/resolvers \
  next-auth@beta
```

### 3. frontend/.env.local.example の作成

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

---

## 起動方法

```bash
# 初回起動
docker compose up -d --build

# 2回目以降
docker compose up -d

# ログ確認
docker compose logs -f

# 停止
docker compose down

# 全削除（DBデータも消える）
docker compose down -v
```

---

## 動作確認

起動後に以下のURLでアクセスできることを確認する。

| URL | 確認内容 |
|-----|---------|
| http://localhost:3000 | Next.jsトップページ |
| http://localhost:8000/api/health | Laravelヘルスチェック（`{"status":"ok"}` が返ること） |
| http://localhost:7700 | Meilisearchダッシュボード |

---

## ヘルスチェックエンドポイント

`backend/routes/api.php` に以下を追加する。

```php
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
```
