# FluxBill backend — Laravel 12 / PHP 8.2
FROM php:8.2-cli

# System deps + PHP extensions (PostgreSQL driver, bcmath/pcntl for queue worker).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev libzip-dev unzip git \
    && docker-php-ext-install pdo pdo_pgsql bcmath pcntl zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer (from the official image).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first (better layer caching).
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# App source.
COPY . .
RUN composer dump-autoload --optimize

EXPOSE 8000

# Default command is overridden per-service in docker-compose.yml.
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
