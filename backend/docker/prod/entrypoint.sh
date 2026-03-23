#!/bin/bash
set -e

cd /var/www/html

echo "=== Starting Fitto Backend ==="

# マイグレーション実行
echo "Running migrations..."
php artisan migrate --force

# デモデータ投入（初回のみ）
echo "Seeding database..."
php artisan db:seed --force

# キャッシュ最適化
echo "Caching config/routes/views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ストレージリンク作成
php artisan storage:link --force 2>/dev/null || true

echo "Starting PHP-FPM and Nginx..."
php-fpm -D
nginx -g "daemon off;"
