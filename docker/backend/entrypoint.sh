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
