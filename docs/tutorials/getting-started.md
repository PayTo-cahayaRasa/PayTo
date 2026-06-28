# Memulai dengan PayTo

Selamat datang di PayTo! Tutorial ini akan membantu Anda setup development environment dan mulai bekerja dengan project.

## Prerequisites

Sebelum memulai, pastikan Anda menginstall hal-hal berikut di sistem Anda:

- **PHP 8.2+** - Diperlukan untuk Laravel framework
- **Composer** - PHP dependency manager
- **Node.js 18+** - JavaScript runtime untuk frontend
- **npm** - Node package manager (sudah termasuk dengan Node.js)
- **MySQL 5.7+ atau SQLite** - Database (SQLite digunakan secara default)
- **Git** - Version control

### Verifikasi instalasi

```bash
php -v           # Harus menampilkan PHP 8.2 atau lebih tinggi
composer -V      # Harus menampilkan Composer version
node -v          # Harus menampilkan Node.js version
npm -v           # Harus menampilkan npm version
```

## Setup Project

### 1. Clone repository

```bash
git clone <repository-url>
cd PayTo
```

### 2. Copy environment file

Copy file environment example untuk membuat file `.env` Anda sendiri:

```bash
copy .env.example .env
```

### 3. Install PHP dependencies

Jalankan Composer untuk install semua PHP packages:

```bash
composer install
```

Expected output:
```
Installing dependencies from lock file
Package operations: 123 installs, 0 updates, 0 removals
...
Generating optimized autoload files
```

### 4. Install Node dependencies

Install frontend dependencies:

```bash
npm install
```

Expected output:
```
added 145 packages, and audited 146 packages in 2m
```

### 5. Generate application key

Generate unique application key untuk encryption:

```bash
php artisan key:generate
```

Expected output:
```
Application key set successfully.
```

### 6. Configure database

Konfigurasi default menggunakan SQLite, yang tidak memerlukan setup. Database file terletak di `database/database.sqlite`.

Jika Anda ingin menggunakan MySQL:

1. Create database baru di MySQL:
```sql
CREATE DATABASE payto;
```

2. Update file `.env` Anda:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=payto
DB_USERNAME=root
DB_PASSWORD=
```

### 7. Jalankan migrations

Create database tables:

```bash
php artisan migrate
```

Expected output:
```
Migrating: 2024_01_01_000001_create_users_table
Migrated:  2024_01_01_000001_create_users_table
Migrating: 2024_01_01_000002_create_products_table
...
Migrated:  2024_01_01_000002_create_products_table
```

### 8. Jalankan seeders

Populate database dengan data awal termasuk sample users:

```bash
php artisan db:seed
```

Ini membuat dua default users:

| Username | Role | PIN |
|----------|------|-----|
| testuser | CASHIER | 123456 |
| supervisor | SUPERVISOR | 654321 |

### 9. Build frontend assets

Compile frontend assets dengan Vite:

```bash
npm run build
```

Untuk development mode (dengan hot-reload), gunakan:
```bash
npm run dev
```

## Development Environment

### Menjalankan development server

Gunakan composer script yang convenient untuk menjalankan semua services secara bersamaan:

```bash
composer run dev
```

Command ini menjalankan:
- **PHP development server** - Berjalan di port 8000
- **Vite development server** - Handle frontend hot-reloading
- **Queue worker** - Process background jobs
- **Logs** - Pail log viewer

Expected output:
```
[server] Starting php artisan serve...
[queue] Starting php artisan queue:listen...
[logs] Starting php artisan pail...
[vite] Starting vite...
```

### Akses aplikasi

Buka browser Anda dan kunjungi:

```
http://localhost:8000
```

## Langkah Pertama

### 1. Login ke aplikasi

Navigate ke `/login` dan gunakan default credentials:

- **Username**: `testuser`
- **PIN**: `123456`

Atau untuk supervisor access:
- **Username**: `supervisor`
- **PIN**: `654321`

### 2. Jelajahi interface POS

Setelah login sebagai kasir, Anda akan diarahkan ke `/kasir` (POS interface). Anda bisa:

- Scan products
- Proses pembayaran
- View receipts
- Handle refunds

### 3. Akses admin panel

Navigate ke `/admin` untuk akses administrative features:

- Product management
- User management
- Sales reports
- System settings

## Overview Struktur Project

```
PayTo/
├── app/
│   ├── Models/          # Eloquent database models
│   ├── Http/
│   │   ├── Controllers/ # Application controllers
│   │   └── Middleware/  # Custom middleware
│   └── Providers/       # Service providers
├── database/
│   ├── factories/       # Model factories untuk testing
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── resources/
│   ├── js/              # React frontend components
│   │   ├── Pages/       # Inertia pages
│   │   └── Layouts/     # Layout components
│   └── views/           # Blade views (jika ada)
├── routes/
│   ├── web.php          # Web routes
│   ├── api.php          # API routes
│   └── console.php      # Console commands
├── tests/
│   ├── Feature/         # Feature tests
│   └── Unit/            # Unit tests
├── docs/                # Dokumentasi
├── public/              # Files yang dapat diakses publik
├── storage/             # Generated files (logs, cache, uploads)
├── .env                 # Environment configuration
├── composer.json        # PHP dependencies
└── package.json         # Node dependencies
```

### Model-key

- **User** - Staff users dengan role berbeda
- **Product** - Products dalam inventory
- **Sale** - Sales transactions
- **SaleItem** - Individual items dalam sale
- **Payment** - Payment records
- **StockMovement** - Inventory tracking
- **ReceiptTemplate** - Receipt formatting
- **AppSetting** - System configuration

## Tugas Umum

### Menambah product baru

```bash
php artisan make:product "Produk Baru"
```

### Menjalankan tests

```bash
php artisan test
```

### Running linting

```bash
composer run lint
```

## Troubleshooting

### Database connection errors

Pastikan database server berjalan dan credentials di `.env` benar.

### Permission denied errors

Di Linux/Mac, pastikan directory `storage/` dan `bootstrap/cache/` dapat ditulis:

```bash
chmod -R 775 storage bootstrap/cache
```

### Composer install gagal

Pastikan PHP version Anda 8.2+. Cek dengan `php -v`.

### Frontend errors

1. Install Node dependencies: `npm install`
2. Rebuild assets: `npm run build`
3. Check browser console untuk errors

### General issues

1. Clear cache: `php artisan config:clear` dan `php artisan cache:clear`
2. Check logs di `storage/logs/laravel.log`
3. Run `php artisan pail` untuk view logs aplikasi secara real-time

## Mendapatkan Bantuan

Jika Anda mengalami issues:

1. Cek troubleshooting section di atas
2. Review dokumentasi [How-to Guides](#how-to-guides)
3. Cek Laravel logs di `storage/logs/laravel.log`
4. Jalankan `php artisan pail` untuk view aplikasi logs secara real-time

Happy coding!
