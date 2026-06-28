# Referensi Konfigurasi

Dokumen ini menyediakan referensi komprehensif untuk konfigurasi aplikasi PayTo.

## Daftar Isi

- [Environment Variables (.env)](#environment-variables-env)
- [Overview File Konfigurasi](#overview-file-konfigurasi)
- [Pilihan Konfigurasi Utama](#pilihan-konfigurasi-utama)
- [Best Practices Konfigurasi](#best-practices-konfigurasi)

---

## Environment Variables (.env)

### Application Settings

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `APP_NAME` | `PayTo` | Nama aplikasi yang ditampilkan di UI dan notifications |
| `APP_ENV` | `local` | Environment identifier (local, staging, production) |
| `APP_KEY` | *(required)* | 32-character base64-encoded application encryption key |
| `APP_DEBUG` | `true` | Enable detailed error messages (disable in production) |
| `APP_URL` | `http://localhost` | Base URL untuk aplikasi |
| `APP_TIMEZONE` | `UTC` | Timezone aplikasi |
| `APP_LOCALE` | `en` | Primary application language |
| `APP_FALLBACK_LOCALE` | `en` | Fallback language jika translation missing |

### Application Locale

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `APP_LOCALE` | `en` | Primary application language |
| `APP_FALLBACK_LOCALE` | `en` | Fallback language jika translation missing |
| `APP_FAKER_LOCALE` | `en_US` | Faker locale untuk database seeding |

### Maintenance Mode

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `APP_MAINTENANCE_DRIVER` | `file` | Driver untuk maintenance mode (file, cache) |
| `APP_MAINTENANCE_STORE` | `database` | Store yang digunakan ketika driver adalah cache |

### Password Hashing

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `BCRYPT_ROUNDS` | `12` | Cost factor untuk bcrypt hashing algorithm |

### Logging

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `LOG_CHANNEL` | `stack` | Default log channel |
| `LOG_STACK` | `single` | Log stack configuration |
| `LOG_DEPRECATIONS_CHANNEL` | `null` | Channel untuk deprecation logs |
| `LOG_LEVEL` | `debug` | Minimum log level (debug, info, notice, warning, error, critical, alert, emergency) |

### Database Connection

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `DB_CONNECTION` | `sqlite` | Database driver (sqlite, mysql, pgsql, sqlsrv) |
| `DB_HOST` | `127.0.0.1` | Database host (mysql/pgsql) |
| `DB_PORT` | `3306` | Database port (mysql/pgsql) |
| `DB_DATABASE` | `laravel` | Database name |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |

### Session Configuration

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `SESSION_DRIVER` | `database` | Session storage driver (file, cookie, database, redis, memcached, array) |
| `SESSION_LIFETIME` | `120` | Session lifetime dalam menit |
| `SESSION_ENCRYPT` | `false` | Apakah encrypt session data |
| `SESSION_PATH` | `/` | Session path |
| `SESSION_DOMAIN` | `null` | Session domain untuk subdomain sharing |
| `SESSION_SAME_SITE` | `lax` | SameSite cookie attribute (lax, strict, none) |
| `SESSION_PARTITIONED_COOKIE` | `false` | Apakah menggunakan partitioned cookies |

### Cache Configuration

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `CACHE_STORE` | `database` | Cache driver (file, database, redis, memcached, array, dynamodb) |
| `CACHE_PREFIX` | *(app name)* | Key prefix untuk menghindari konflik |

### Queue Configuration

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `QUEUE_CONNECTION` | `database` | Queue driver (sync, database, redis, rabbitmq, amazon) |
| `QUEUE_FAILED_DRIVER` | `database-uuids` | Failed job driver (database-uuids, dynamodb, file, null) |
| `QUEUE_FAILED_DATABASE` | *(db connection)* | Database connection untuk failed jobs table |
| `QUEUE_FAILED_TABLE` | `failed_jobs` | Failed jobs table name |

### Broadcasting

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `BROADCAST_CONNECTION` | `log` | Broadcast driver connection |

### File Storage

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `FILESYSTEM_DISK` | `local` | Default filesystem disk |

### Mail Configuration

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `MAIL_MAILER` | `log` | Mail transport driver (smtp, sendmail, mailgun, postmark, ses, log, array) |
| `MAIL_SCHEME` | `null` | Mail scheme (http, https) |
| `MAIL_HOST` | `127.0.0.1` | SMTP host |
| `MAIL_PORT` | `2525` | SMTP port |
| `MAIL_USERNAME` | `null` | SMTP username |
| `MAIL_PASSWORD` | `null` | SMTP password |
| `MAIL_FROM_ADDRESS` | `hello@example.com` | Default from email address |
| `MAIL_FROM_NAME` | `${APP_NAME}` | Default from name |

### AWS Configuration

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | *(empty)* | AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | *(empty)* | AWS secret access key |
| `AWS_DEFAULT_REGION` | `us-east-1` | AWS default region |
| `AWS_BUCKET` | *(empty)* | AWS S3 bucket name |
| `AWS_USE_PATH_STYLE_ENDPOINT` | `false` | Use path-style endpoint untuk S3 |

### Web Push (VAPID) Configuration

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `WEBPUSH_VAPID_SUBJECT` | `mailto:admin@example.com` | VAPID subject (biasanya mailto:) |
| `WEBPUSH_VAPID_PUBLIC_KEY` | *(empty)* | VAPID public key (base64url-encoded) |
| `WEBPUSH_VAPID_PRIVATE_KEY` | *(empty)* | VAPID private key (base64url-encoded) |

### Vite Configuration

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `VITE_APP_NAME` | `${APP_NAME}` | Vite build variable untuk app name |

---

## Overview File Konfigurasi

### `config/app.php`

Application-wide settings termasuk:
- Application name, environment, dan debug mode
- Maintenance mode configuration
- Service provider configuration
- Alias configuration

### `config/database.php`

Database connections termasuk:
- Default connection
- SQLite, MySQL, PostgreSQL, SQLSRV configurations
- Redis connections untuk cache, session, dan broadcasting
- Connection pooling dan retry settings

### `config/queue.php`

Queue configuration termasuk:
- Default queue connection
- Database, Redis, dan other driver settings
- Failed job configuration
- Job batch configuration

### `config/session.php`

Session configuration termasuk:
- Driver dan lifetime
- Cookie settings (secure, http-only, same-site)
- Partitioned cookie support

### `config/cache.php`

Cache configuration termasuk:
- Default store
- File, database, Redis, DynamoDB drivers
- Cache prefix dan tagging

### `config/filesystems.php`

Filesystem disks termasuk:
- Local, public, s3, dan other disk configurations
- Upload paths dan visibility settings

### `config/auth.php`

Authentication configuration termasuk:
- Guard definitions
- Provider definitions
- Password reset configuration

### `config/services.php`

Third-party service configuration termasuk:
- Mailgun, Postmark, SES, Stripe, dan other service settings

### `config/logging.php`

Logging configuration termasuk:
- Stack configuration
- Channel definitions
- Log level settings

---

## Pilihan Konfigurasi Utama

### Database Configuration

**SQLite (Development):**
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

**MySQL (Production):**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=payto
DB_USERNAME=payto_user
DB_PASSWORD=secure_password
```

**PostgreSQL (Production):**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=payto
DB_USERNAME=payto_user
DB_PASSWORD=secure_password
```

### Session Configuration

**Database Session (Recommended untuk Production):**
```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SAME_SITE=lax
```

**Redis Session (High-Performance):**
```env
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_SAME_SITE=lax
```

### Cache Configuration

**Database Cache (Simple):**
```env
CACHE_STORE=database
```

**Redis Cache (High-Performance):**
```env
CACHE_STORE=redis
```

### Queue Configuration

**Database Queue (Simple):**
```env
QUEUE_CONNECTION=database
QUEUE_FAILED_DRIVER=database-uuids
```

**Redis Queue (High-Performance):**
```env
QUEUE_CONNECTION=redis
QUEUE_FAILED_DRIVER=database-uuids
```

### Web Push Configuration

Generate VAPID keys menggunakan:
```bash
php artisan make:notification TestNotification --vapid
```

Atau gunakan online generator dan configure:
```env
WEBPUSH_VAPID_SUBJECT=mailto:admin@payto.local
WEBPUSH_VAPID_PUBLIC_KEY=BMtQdF7B2...
WEBPUSH_VAPID_PRIVATE_KEY=4LHPkG5Vz...
```

### Application Settings

**Development:**
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

**Production:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://payto.example.com
LOG_LEVEL=error
```

---

## Best Practices Konfigurasi

### 1. Environment Variables

- **Jangan pernah commit `.env` ke version control**
- Gunakan `.env.example` sebagai template
- Simpan sensitive values (keys, passwords) di environment variables
- Gunakan file `.env` berbeda per environment

### 2. Configuration Cache

Di production, cache configuration untuk performance:
```bash
php artisan config:cache
php artisan config:clear
```

### 3. Mengakses Konfigurasi

Selalu gunakan helper `config()`:
```php
$value = config('app.timezone');
```

Gunakan dot notation untuk nested values:
```php
$dbName = config('database.connections.mysql.database');
```

### 4. Validation

Validate environment variables ada:
```php
// Di bootstrap/app.php atau service providers
if (!env('APP_KEY')) {
    throw new \RuntimeException('APP_KEY not set');
}
```

### 5. Security

- Set `APP_DEBUG=false` di production

### 6. Database

- Gunakan environment-specific credentials
- Enable query logging hanya di development
- Configure connection pooling untuk production
- Gunakan database backups di production

### 7. Queue

- Gunakan Redis untuk production queues
- Configure queue workers dengan supervisor:
  ```bash
  php artisan queue:work redis --queue=default --timeout=60
  ```
- Monitor failed jobs
- Set appropriate retry times

### 8. Caching

- Gunakan Redis untuk production caching
- Cache configuration di production
- Gunakan cache tags untuk related data
- Set appropriate TTL values

### 9. Logging

- Gunakan stack driver di production
- Configure log channels untuk different levels
- Set `LOG_LEVEL=error` di production
- Gunakan log storage rotation

### 10. File Storage

- Gunakan S3 atau cloud storage untuk production
- Configure `FILESYSTEM_DISK=s3`
- Set proper file permissions
- Gunakan public disk untuk user-uploaded files

---

## Environment-Specific Configuration

### Development

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
LOG_CHANNEL=stack
LOG_LEVEL=debug
DB_CONNECTION=sqlite
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
MAIL_MAILER=log
```

### Staging

```env
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://staging.payto.example.com
LOG_CHANNEL=daily
LOG_LEVEL=debug
DB_CONNECTION=mysql
DB_HOST=staging-db.example.com
SESSION_DRIVER=database
CACHE_STORE=redis
QUEUE_CONNECTION=redis
MAIL_MAILER=smtp
```

### Production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://payto.example.com
LOG_CHANNEL=daily
LOG_LEVEL=error
DB_CONNECTION=mysql
DB_HOST=prod-db.example.com
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
CACHE_STORE=redis
QUEUE_CONNECTION=redis
QUEUE_FAILED_DRIVER=dynamodb
MAIL_MAILER=smtp
```

---

## Summary

Referensi konfigurasi ini mencakup semua pilihan konfigurasi utama untuk aplikasi PayTo. Selalu:

- Gunakan environment variables untuk sensitive data
- Cache configuration di production
- Gunakan drivers yang appropriate per environment
- Ikuti security best practices
- Test configuration changes di non-production dulu
