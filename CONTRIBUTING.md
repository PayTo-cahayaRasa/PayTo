# Contributing Guide

Panduan singkat untuk tim PayTo.

## Git Commit Messages

Gunakan format conventional commits agar riwayat perubahan jelas dan mudah di-track.

### Format:

```
<type>(<scope>): <subject>

<body> (opsional)
```

### Types:

- **feat**: Fitur baru
- **fix**: Bug fix
- **docs**: Perubahan dokumentasi
- **style**: Formatting, semicolons, dll (tidak mengubah kode)
- **refactor**: Refactoring kode
- **perf**: Performance improvements
- **test**: Menambah/memperbaiki tests
- **chore**: Maintenance, dependencies, config
- **ci**: CI/CD changes

### Contoh:

```bash
# Fitur baru
git commit -m "feat(checkout): add multi-payment support"

# Bug fix
git commit -m "fix(stock): resolve stock deduction error"

# Refactor
git commit -m "refactor(checkout): simplify checkout logic"

# Chore
git commit -m "chore(deps): update Laravel to 12.51"
```

### Scope (Opsional):

Scope menjelaskan area mana yang berubah:

- `checkout` - Checkout/payment
- `pos` - POS interface
- `admin` - Admin dashboard
- `product` - Product management
- `inventory` - Inventory management
- `auth` - Authentication
- `api` - API endpoints
- `ui` - User interface

### Subject Guidelines:

- Gunakan imperative mood: "add" bukan "added" atau "adds"
- Tidak pakai titik di akhir
- Maksimal 72 karakter

## Development Workflow

### 1. Buat Branch

```bash
# Format: <type>/<description>
git checkout -b feat/multi-payment
git checkout -b fix/stock-calculation
git checkout -b refactor/checkout-flow
```

### 2. Develop & Commit

```bash
# Pastikan tests pass
php artisan test

# Fix code style
./vendor/bin/pint

# Stage & commit
git add .
git commit -m "feat(checkout): add multi-payment support"
```

### 3. Push & Pull Request

```bash
git push origin feat/multi-payment

# Buat PR di GitHub
# Review bersama tim
# Merge setelah approved
```

## Code Standards

### PHP/Laravel

- Follow PSR-12
- Gunakan Laravel Pint: `./vendor/bin/pint`
- Type hints untuk semua method parameters & return types
- Gunakan Eloquent relationships, hindari raw queries
- Enum keys menggunakan TitleCase (contoh: `SaleStatus::Paid`)
- Constructor property promotion (PHP 8+)

### JavaScript/React

- Follow existing project style
- Use functional components dengan hooks
- Descriptive variable names

### Testing

- Test happy path & edge cases
- Run tests sebelum commit: `php artisan test`

## Tech Stack

- PHP 8.2+
- Laravel 12.51
- React 19 + Inertia v2
- Tailwind CSS v4
- MySQL 8.0+

## Commands

```bash
# Setup
make setup              # First time setup
make install            # Install dependencies

# Development  
make dev                # Start dev server
make test               # Run tests
make pint               # Fix code style

# CI Checks (run locally before push)
make ci                 # Run all CI checks
```

## Dokumentasi

Update dokumentasi jika mengubah fitur atau menambahkan endpoint baru. Dokumentasi ada di `docs/`:
- `docs/reference/api.md` - API reference
- `docs/reference/database-schema.md` - Database schema
- `docs/explanation/architecture.md` - Architecture overview

## Questions?

Tanya ke tim! Komunikasi langsung lebih cepat.
