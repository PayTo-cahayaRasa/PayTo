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
git commit -m "feat(payment): add QR code payment method"

# Bug fix
git commit -m "fix(booking): resolve date validation error"

# Refactor
git commit -m "refactor(auth): simplify login logic"

# Chore
git commit -m "chore(deps): update Laravel to 11.36.2"

# Multiple line
git commit -m "feat(inventory): add stock alert notification

- Send email when stock below threshold
- Add admin dashboard alert
- Update stock model with alert_threshold field"
```

### Scope (Opsional):

Scope menjelaskan area mana yang berubah:

- `payment` - Payment related
- `booking` - Booking system
- `inventory` - Inventory management  
- `auth` - Authentication
- `api` - API endpoints
- `ui` - User interface
- `db` - Database changes

### Subject Guidelines:

- Gunakan imperative mood: "add" bukan "added" atau "adds"
- Tidak pakai titik di akhir
- Maksimal 72 karakter
- Huruf kecil setelah type

### Breaking Changes:

Jika ada perubahan yang breaking (tidak backward compatible), tambahkan `!` atau `BREAKING CHANGE:`:

```bash
git commit -m "feat(api)!: change payment response structure

BREAKING CHANGE: Payment API now returns nested object instead of flat structure"
```

## Development Workflow

### 1. Buat Branch

```bash
# Format: <type>/<description>
git checkout -b feat/qr-payment
git checkout -b fix/booking-validation
git checkout -b refactor/auth-logic
```

### 2. Develop & Commit

```bash
# Pastikan tests pass
php artisan test

# Fix code style
./vendor/bin/pint

# Stage & commit
git add .
git commit -m "feat(payment): add QR code scanner"
```

### 3. Push & Pull Request

```bash
git push origin feat/qr-payment

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

### JavaScript/Vue

- Follow project's existing style
- Use ESLint if configured
- Descriptive variable names

### Testing

- Minimal 80% code coverage
- Test happy path & edge cases
- Run tests sebelum commit: `php artisan test`

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

## Questions?

Tanya ke tim! Kita hanya 2 orang, jadi komunikasi langsung lebih cepat.
