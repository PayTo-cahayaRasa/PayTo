# PayTo - Sistem POS Homestay & Kos

[![CI](https://github.com/ORGANIZATION/PayTo/actions/workflows/ci.yml/badge.svg)](https://github.com/ORGANIZATION/PayTo/actions/workflows/ci.yml)
[![Laravel](https://img.shields.io/badge/Laravel-11-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue.svg)](https://www.php.net)

Sistem Point of Sale (POS) untuk manajemen homestay dan kos dengan fitur payment, refund, approval, dan inventory management.

## 🚀 Features

- **Payment Management** - Proses pembayaran dengan berbagai metode
- **Refund System** - Sistem refund dengan approval workflow
- **Booking Management** - Kelola booking kamar homestay/kos
- **Inventory Management** - Track stok dan supplies
- **User Management** - Role-based access control
- **Transaction History** - Riwayat transaksi lengkap

## 🛠️ Tech Stack

- **Backend**: Laravel 11.36.1 (PHP 8.2+)
- **Frontend**: Inertia.js + React 19
- **Database**: MySQL
- **Styling**: Tailwind CSS 4
- **Testing**: PHPUnit

## 📋 Requirements

- PHP 8.2 atau lebih tinggi
- Composer
- Node.js 20+
- MySQL 8.0+

## 🏁 Quick Start

```bash
# Clone repository
git clone https://github.com/ORGANIZATION/PayTo.git
cd PayTo

# Setup (first time)
make setup

# Or manual:
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run build

# Start development server
make dev
# atau: php artisan serve & npm run dev
```

## 🧪 Testing

```bash
# Run all tests
make test
# atau: php artisan test

# Run specific test
php artisan test --filter=PaymentTest

# With coverage
php artisan test --coverage
```

## 📝 Development

```bash
# Install dependencies
make install

# Run dev server
make dev

# Fix code style
make pint

# Run CI checks locally
make ci
```

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan commit messages dan workflow.

## 📖 Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines

## 👥 Team

Tim IT Mitra Homestay (2 orang fullstack)

## 📄 License

Private project - All rights reserved.
