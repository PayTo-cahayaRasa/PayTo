# Memulai dengan PayTo

Selamat datang di PayTo! Tutorial ini akan membantu Anda setup development environment dan mulai bekerja dengan project POS PayTo.

## Daftar Isi

1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Setup Project](#setup-project)
3. [Menjalankan Development Server](#menjalankan-development-server)
4. [Login & Akses](#login--akses)
5. [Struktur Project](#struktur-project)
6. [Tugas Umum](#tugas-umum)
7. [Troubleshooting](#troubleshooting)

---

## Persyaratan Sistem

### Software yang Diperlukan

| Software | Versi Minimal | Description |
|----------|---------------|-------------|
| PHP | 8.2+ | Runtime untuk Laravel |
| Composer | 2.0+ | PHP dependency manager |
| Node.js | 20+ | JavaScript runtime |
| npm | 10+ | Node package manager |
| MySQL | 8.0+ | Database server |
| Git | 2.0+ | Version control |

### Verifikasi Instalasi

Buka terminal/command prompt dan jalankan:

```bash
php -v
# Expected: PHP 8.2.x atau lebih tinggi

composer -V
# Expected: Composer version 2.x

node -v
# Expected: v20.x.x atau lebih tinggi

npm -v
# Expected: 10.x.x atau lebih tinggi

mysql --version
# Expected: mysql  Ver 8.0.x
```

---

## Setup Project

### Langkah 1: Clone Repository

```bash
git clone https://github.com/PayTo-cahayaRasa/PayTo.git
cd PayTo
```

### Langkah 2: Install Dependencies

```bash
# Install PHP & Node dependencies sekaligus
make install

# Atau手动:
composer install
npm install
```

### Langkah 3: Setup Environment File

```bash
# Copy .env.example ke .env
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/Mac

# Generate application key
php artisan key:generate
```

### Langkah 4: Konfigurasi Database

Pastikan MySQL server berjalan (XAMPP/WAMP).

1. Buat database baru di MySQL:

```sql
CREATE DATABASE paytocahaya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paytocahaya
DB_USERNAME=root
DB_PASSWORD=root
```

### Langkah 5: Jalankan Migration & Seeder

```bash
# Create semua tabel
php artisan migrate

# Populate data awal (users, sample products)
php artisan db:seed
```

Ini akan membuat users default:

| Username | Role | Password |
|----------|------|----------|
| testuser | CASHIER | password |
| supervisor | SUPERVISOR | password |

### Langkah 6: Build Frontend

```bash
# Build assets untuk production
npm run build

# Atau untuk development dengan hot-reload
npm run dev
```

---

## Menjalankan Development Server

### Menggunakan Make Commands (Recommended)

```bash
# Jalankan semua services sekaligus
make dev
```

Ini menjalankan:
- PHP dev server di port 8000
- Vite hot-reload server
- Queue worker (background jobs)
- Log viewer

### Atau Manual

Buka 2 terminal:

**Terminal 1 - Backend:**
```bash
php artisan serve
# Berjalan di http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Berjalan di http://localhost:5173
```

### Akses Aplikasi

Buka browser:
```
http://localhost:8000
```

---

## Login & Akses

### Login Page

Navigasi ke `/login` dan gunakan credentials:

**Sebagai Kasir:**
- Username: `testuser`
- Password: `password`

**Sebagai Supervisor/Admin:**
- Username: `supervisor`
- Password: `password`

### Setelah Login

**Kasir** diarahkan ke `/kasir` dengan akses:
- Dashboard kasir
- Input produk/barcode
- Proses checkout
- Riwayat transaksi
- Profile & settings

**Supervisor** diarahkan ke `/admin` dengan akses penuh:
- Dashboard analytics
- Manajemen produk
- Manajemen staff
- Smart inventory
- Approval requests
- Pengaturan struk
- Reports

---

## Struktur Project

```
PayTo/
├── app/
│   ├── Enums/                 # Enum definitions (TitleCase keys)
│   │   ├── SaleStatus.php
│   │   ├── SaleSource.php
│   │   ├── ApprovalAction.php
│   │   └── ...
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/          # REST API controllers
│   │   │   │   ├── Admin/    # Admin API (products, staff, settings)
│   │   │   │   └── Pos/     # POS API (checkout, refund)
│   │   │   ├── Auth/         # Login, logout controllers
│   │   │   └── Pos/         # Page controllers
│   │   ├── Middleware/
│   │   │   ├── EnsureUserHasRole.php
│   │   │   └── SecurityHeaders.php
│   │   └── Requests/         # Form Request validation
│   ├── Models/               # Eloquent models
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Sale.php
│   │   ├── SaleItem.php
│   │   ├── Payment.php
│   │   ├── Refund.php
│   │   ├── Approval.php
│   │   └── ...
│   └── Services/             # Business logic
│       ├── CheckoutProcessor.php
│       ├── AppSettingsService.php
│       └── WhatsAppLinkBuilder.php
├── bootstrap/
│   └── app.php               # Laravel 12 app configuration
├── config/
│   └── ...                   # Laravel config files
├── database/
│   ├── factories/            # Model factories untuk testing
│   ├── migrations/           # Database migrations
│   └── seeders/              # Database seeders
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── kasir.tsx     # Kasir/POS page
│       │   ├── admin.tsx     # Admin layout
│       │   └── admin/        # Admin sub-pages
│       │       ├── AdminPage.tsx
│       │       └── components/
│       └── Components/       # Shared React components
├── routes/
│   ├── api.php               # API routes (82 routes)
│   ├── web.php               # Web routes
│   └── auth.php              # Auth routes
├── storage/
│   ├── app/                  # App storage (receipts, etc.)
│   └── logs/                 # Application logs
├── tests/
│   ├── Feature/              # Feature tests
│   └── Unit/                # Unit tests
├── docs/
│   ├── gallery/              # Screenshot aplikasi
│   ├── reference/            # API & schema docs
│   ├── explanation/         # Architecture docs
│   └── tutorials/            # Tutorials
├── .env                      # Environment config
├── .env.example              # Example env
├── composer.json             # PHP dependencies
├── package.json              # Node dependencies
├── Makefile                  # Development commands
└── README.md
```

---

## Model-Key

### Core Models

| Model | Description |
|-------|-------------|
| **User** | Staff users dengan role (CASHIER/SUPERVISOR) |
| **Product** | Produk dengan harga, SKU, barcode |
| **Sale** | Transaksi penjualan |
| **SaleItem** | Item dalam satu transaksi |
| **Payment** | Record pembayaran |
| **Refund** | Request refund |
| **RefundItem** | Item yang di-refund |
| **Approval** | Workflow approval |
| **StockItem** | Stok per produk |
| **StockMovement** | History perubahan stok |
| **AppSetting** | Konfigurasi aplikasi |
| **AuditLog** | Log aktivitas |

### Enums

| Enum | Values |
|------|--------|
| `SaleStatus` | `Draft`, `PendingPayment`, `Paid`, `Void`, `SyncFailed` |
| `SaleSource` | `Online`, `Offline` |
| `ApprovalAction` | `DiscountOverride`, `PriceOverride`, `Void`, `Refund` |
| `ApprovalStatus` | `Pending`, `Approved`, `Rejected` |
| `RefundStatus` | `Requested`, `Approved`, `Completed` |

---

## Tugas Umum

### Menambah Produk Baru

```bash
# Via API (di Admin > Manajemen Barang)
# POST /api/admin/products
```

### Membuat Transaksi Checkout

```bash
# Via POS Interface
# POST /api/pos/checkout
```

### Proses Refund

1. Kasir request refund di `/kasir`
2. Supervisor approve di `/admin` > Approvals
3. Refund di proses

### Reset Password Staff

```bash
php artisan tinker
# >>> App\Models\User::where('username', 'kasir1')->first()->update(['password' => Hash::make('password')]);
```

### Backup Database

```bash
mysqldump -u root -p paytocahaya > backup_payto.sql
```

### Restore Database

```bash
mysql -u root -p paytocahaya < backup_payto.sql
```

---

## Commands Reference

```bash
# Development
make dev              # Start dev server
make test             # Run tests
make pint             # Fix code style
make lint             # Lint check
make ci               # All CI checks

# Database
php artisan migrate               # Run migrations
php artisan migrate:fresh         # Fresh migrate + seed
php artisan db:seed              # Seed data
php artisan db:seed --class=ClassName  # Specific seeder

# Cache & Config
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Code Style
./vendor/bin/pint                  # Auto-fix style
./vendor/bin/pint --test          # Check only
```

---

## Troubleshooting

### ❌ "Database connection refused"

1. Pastikan MySQL server berjalan (cek XAMPP/WAMP)
2. Verify credentials di `.env`
3. Pastikan database `paytocahaya` ada

```bash
mysql -u root -p
SHOW DATABASES;
```

### ❌ "Permission denied" saat install

```bash
# Linux/Mac
chmod -R 775 storage bootstrap/cache
```

### ❌ "Class not found" setelah update

```bash
composer dump-autoload
php artisan optimize
```

### ❌ Frontend tidak loading

```bash
npm install
npm run build
```

### ❌ Vite error

```bash
rm -rf node_modules/.vite
npm run dev
```

### Cek Logs

```bash
# View recent logs
tail -f storage/logs/laravel.log

# Atau gunakan Laravel Pail
php artisan pail
```

### Reset Everything

```bash
# Fresh install
php artisan migrate:fresh --seed
npm run build
```

---

## Dokumentasi Lanjutan

- [API Reference](reference/api.md) - Detail endpoint API
- [Database Schema](reference/database-schema.md) - Struktur database
- [Architecture](explanation/architecture.md) - Arsitektur sistem
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Panduan berkontribusi

---

## Mendapatkan Bantuan

1. Cek troubleshooting di atas
2. Review dokumentasi lengkap di `docs/`
3. Cek Laravel logs: `storage/logs/laravel.log`
4. Run `php artisan pail` untuk real-time log viewer

Happy coding! 🚀
