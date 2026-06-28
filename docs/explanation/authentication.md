# Autentikasi dan Otorisasi: Keamanan Dual-Layer untuk POS

## Mengapa Dua Metode Login?

Sebagian besar aplikasi web menggunakan autentikasi username/password secara eksklusif. PayTo menambahkan metode autentikasi kedua—login berbasis PIN—untuk alasan bisnis yang kritis.

### Masalah Kasir

Di lingkungan ritel, beberapa kasir berbagi register yang sama sepanjang hari:

- Ganti shift: Kasir A menyelesaikan shift mereka, Kasir B mengambil alih
- Istirahat: Kasir pergi sementara tapi tidak logout
- Register tidak terawasi: Kasir meninggalkan station mereka sebentar

Dengan hanya autentikasi username/password:

- **Risiko keamanan**: Password harus dibagi antar kasir, melanggar praktik keamanan terbaik
- **Accountability**: Sulit melacak siapa yang membuat penjualan jika banyak orang menggunakan kredensial yang sama
- **Kenyamanan**: Mengetik password kompleks berulang kali lambat selama periode sibuk

### Solusi Dual Authentication

PayTo menggabungkan dua metode autentikasi:

1. **Session-based Authentication**: Login dengan username dan password untuk mengakses sistem
2. **PIN-based POS Authentication**: Login dengan 6-digit PIN untuk session aktif di POS terminal

### Alur Login Dual-Layer

#### Langkah 1: Username & Password Login

```bash
POST /pos/login
Content-Type: application/json

{
  "username": "kasir1",
  "password": "secret_password"
}
```

Response:
```json
{
  "success": true,
  "role": "CASHIER",
  "redirect": "/pos"
}
```

#### Langkah 2: PIN Login untuk POS Session

```bash
POST /pos/pin-login
Content-Type: application/json
Authorization: Bearer {token}

{
  "pin": "123456"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "username": "kasir1",
    "role": "CASHIER",
    "status": "ACTIVE"
  }
}
```

---

## Database Schema untuk Autentikasi

### Tabel `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | string | Nama lengkap user |
| `username` | string | Username unik |
| `password` | string | Hashed password (bcrypt) |
| `pin` | string | Hashed PIN (bcrypt) |
| `role` | enum | CASHIER atau SUPERVISOR |
| `status` | enum | ACTIVE atau INACTIVE |
| `last_login_at` | timestamp | Waktu login terakhir |
| `remember_token` | string | Laravel remember token |
| `created_at` | timestamp | Waktu pembuatan |
| `updated_at` | timestamp | Waktu update |

### Tabel `work_time_logs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key ke users |
| `work_date` | date | Tanggal kerja |
| `start_time` | timestamp | Waktu mulai shift |
| `end_time` | timestamp | Waktu selesai shift |
| `pause_duration` | integer | Total pause time (seconds) |
| `action` | enum | START, PAUSE, RESUME, END |
| `created_at` | timestamp | Waktu log |

---

## Keamanan dan Best Practices

### Password Hashing

```php
// Password di-hash dengan bcrypt
Hash::make($password);

// PIN di-hash terpisah
Hash::make($pin);
```

### Session Configuration

`.env` configuration:

```
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
```

### Rate Limiting

Rate limiting diterapkan untuk mencegah brute force attacks:

```php
// config/rate-limit.php
return [
    'login' => [
        'max_attempts' => 5,
        'decay_minutes' => 1,
    ],
    'pin' => [
        'max_attempts' => 3,
        'decay_minutes' => 15,
    ],
];
```

### Audit Logging

Semua event autentikasi dicatat di `audit_logs` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | User yang melakukan action |
| `action` | string | login, logout, pin_reset, failed_login |
| `metadata` | json | Additional data (IP, user_agent, etc) |
| `created_at` | timestamp | Waktu action |

```json
{
  "event" => "login",
  "user_id" => 1,
  "metadata" => {
    "ip_address" => "192.168.1.100",
    "user_agent" => "Mozilla/5.0...",
    "location" => "Store A"
  },
  "created_at" => "2026-06-28 21:00:00"
}
```

---

## Authorization dengan Policies

### Admin Policy

```php
class AdminPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'SUPERVISOR';
    }
    
    public function manageProducts(User $user): bool
    {
        return $user->role === 'SUPERVISOR';
    }
    
    public function manageUsers(User $user): bool
    {
        return $user->role === 'SUPERVISOR';
    }
}
```

### POS Policy

```php
class PosPolicy
{
    public function checkout(User $user): bool
    {
        return $user->role === 'CASHIER' || $user->role === 'SUPERVISOR';
    }
    
    public function viewSales(User $user): bool
    {
        return $user->role === 'CASHIER' || $user->role === 'SUPERVISOR';
    }
    
    public function approveRefund(User $user): bool
    {
        return $user->role === 'SUPERVISOR';
    }
}
```

---

## API Protection

### Session-Based Authentication

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
    Route::apiResources([
        'products' => ProductController::class,
        'sales' => SaleController::class,
    ]);
});
```

### CSRF Protection

Inertia requests otomatically include CSRF token:

```javascript
<Form
  method="post"
  action="/api/pos/checkout"
  :data="{ items, payment_method }"
/>
```

---

## Authentication Flow Diagram

```
┌─────────────┐
│  User       │
│  Browser    │
└──────┬──────┘
       │
       │ 1. POST /pos/login (username + password)
       ▼
┌─────────────────┐
│  Laravel Auth   │
│  Middleware     │
└──────┬──────────┘
       │
       │ 2. Session created
       │ 3. Redirect to /pos
       ▼
┌─────────────┐
│  POS Page   │
│  React      │
└──────┬──────┘
       │
       │ 4. POST /pos/pin-login (6-digit PIN)
       ▼
┌─────────────────┐
│  POS Session    │
│  Active         │
└──────┬──────────┘
       │
       │ 5. Checkout, view sales, etc.
       ▼
┌─────────────────┐
│  Work Time Log  │
│  (START/END)    │
└─────────────────┘
```

---

## Summary: Security Design Philosophy

Sistem autentikasi mengikuti beberapa prinsip utama:

**Defense in Depth**: Two-factor authentication (password + PIN) melindungi dari credential theft.

**Separation of Concerns**: Login credentials terpisah dari operational PINs.

**Accountability**: Setiap action terhubung ke user spesifik.

**Immediate Revocation**: Sessions di-invalidate immediately pada logout atau deaktivasi.

**Comprehensive Logging**: Semua event autentikasi direkam untuk auditing.

**Role-Based Access Control**: User hanya bisa mengakses apa yang diizinkan role mereka.

Arsitektur ini memastikan bahwa bahkan jika satu layer di-compromise, sistem tetap aman. Ini dirancang bukan hanya untuk kebutuhan hari ini, tapi untuk scaling ke multiple locations, multiple cashiers per location, dan future compliance requirements.
