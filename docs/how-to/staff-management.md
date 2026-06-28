# Manajemen Staf

Pelajari cara membuat, mengelola, dan menonaktifkan akun kasir dan supervisor di sistem POS.

## Overview

Manajemen staf memungkinkan administrator untuk mengontrol akses ke sistem POS, mengelola role staf, dan memonitor aktivitas.

---

## Masalah: Perlu membuat kasir baru

Menambahkan karyawan baru sebagai kasir dengan akses ke POS terminal.

### Solusi

Buat akun kasir baru:

```bash
POST /api/admin/staff
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "name": "Dewi Lestari",
  "username": "dewi.l",
  "password": "SecurePass123!",
  "pin": "123456",
  "role": "CASHIER",
  "is_active": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Dewi Lestari",
    "username": "dewi.l",
    "role": "CASHIER",
    "status": "ACTIVE",
    "is_active": true,
    "created_at": "2026-03-15 09:30:00",
    "last_login_at": null
  },
  "message": "Staff berhasil dibuat."
}
```

---

## Masalah: Perlu menonaktifkan kasir

Kasir sudah tidak bekerja lagi dan akses harus di-revoke.

### Solusi

Deactivate user:

```bash
PATCH /api/admin/staff/123
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "is_active": false
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "INACTIVE",
    "is_active": false
  },
  "message": "User berhasil dinonaktifkan."
}
```

---

## Masalah: Perlu reset PIN kasir

Kasir lupa PIN mereka.

### Solusi

Reset PIN:

```bash
POST /api/admin/staff/123/reset-pin
Authorization: Bearer {admin_token}
```

Response:
```json
{
  "success": true,
  "data": {
    "pin_reset_at": "2026-06-28 21:00:00",
    "new_pin": "654321"
  },
  "message": "PIN berhasil direset."
}
```

**Note**: PIN baru harus diubah kasir pada login pertama.

---

## Masalah: Perlu melihat aktivitas staf

Lihat statistik aktivitas dan transaksi staf.

### Solusi

View staff list dengan metrics:

```bash
GET /api/admin/staff?status=active&role=cashier&page=1
Authorization: Bearer {admin_token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "username": "budi.s",
      "role": "CASHIER",
      "status": "ACTIVE",
      "is_active": true,
      "total_transactions": 1250,
      "total_sales": 157500000,
      "created_at": "2026-01-15 08:00:00",
      "last_login_at": "2026-06-28 20:45:00",
      "current_session": {
        "work_date": "2026-06-28",
        "start_time": "08:00:00",
        "is_paused": false
      }
    },
    {
      "id": 2,
      "name": "Ani Wijaya",
      "username": "ani.w",
      "role": "SUPERVISOR",
      "status": "ACTIVE",
      "is_active": true,
      "total_transactions": 0,
      "total_sales": 0,
      "created_at": "2026-02-01 09:00:00",
      "last_login_at": "2026-06-28 20:30:00"
    }
  ],
  "meta": {
    "total": 2,
    "active": 2,
    "inactive": 0
  }
}
```

**Staff activity metrics:**
- Total transactions processed
- Total sales amount
- Last login timestamp
- Account creation date
- Current login status

**Role-based permissions:**
- **CASHIER**: Create sales, view products, view history
- **SUPERVISOR**: All cashier permissions + approve refunds, view reports, manage stock adjustments

---

## Masalah: Perlu login sebagai supervisor

Login dengan role supervisor untuk akses admin dan POS.

### Solusi

Supervisor login dengan password:

```bash
POST /pos/login
Content-Type: application/json

{
  "username": "supervisor1",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "success": true,
  "role": "SUPERVISOR",
  "redirect": "/admin/dashboard"
}
```

Supervisor kemudian login ke POS dengan PIN:

```bash
POST /pos/pin-login
Content-Type: application/json
Authorization: Bearer {token}

{
  "pin": "123456"
}
```

---

## Masalah: Perlu melihat work time logs

View work time logs untuk analisis shift.

### Solusi

```bash
GET /api/admin/staff/123/work-time?from=2026-06-01&to=2026-06-30
Authorization: Bearer {admin_token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "user_name": "Budi Santoso",
      "work_date": "2026-06-28",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "pause_duration": 3600,
      "total_duration": 32400,
      "action": "END",
      "created_at": "2026-06-28 17:00:00"
    }
  ],
  "meta": {
    "total_records": 1,
    "total_work_seconds": 32400
  }
}
```

---

## Masalah: Perlu melihat audit logs

View audit logs untuk security audit.

### Solusi

```bash
GET /api/admin/audit-logs?event=login&from=2026-06-28&to=2026-06-28
Authorization: Bearer {admin_token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "user_id": 123,
      "user_name": "Budi Santoso",
      "action": "login",
      "metadata": {
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "location": "Store A - POS 1"
      },
      "created_at": "2026-06-28 08:00:00"
    },
    {
      "id": 457,
      "user_id": 123,
      "user_name": "Budi Santoso",
      "action": "login",
      "metadata": {
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "location": "Store A - POS 1",
        "from_session": "budi.s",
        "via": "pin"
      },
      "created_at": "2026-06-28 08:02:00"
    }
  ],
  "meta": {
    "total": 2
  }
}
```

---

## Masalah: Perlu bulk actions

Activate/deactivate multiple users sekaligus.

### Solusi

```bash
PATCH /api/admin/staff/bulk
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "user_ids": [123, 124, 125],
  "action": "activate"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "users": [123, 124, 125]
  },
  "message": "3 staff berhasil di-activate."
}
```

---

## Best Practices

### Password & PIN Security

1. Password minimal 8 karakter, include uppercase, lowercase, number, symbol
2. PIN 6-digit, tidak boleh sama dengan tanggal lahir atau urutan
3. Rotate password setiap 90 hari
4. Reset PIN setiap kali staff baru join atau staff keluar

### Audit & Monitoring

1. Review login audit logs harian
2. Monitor failed login attempts
3. Deactivate accounts segera setelah staff keluar
4. Track work time untuk payroll

### Role Management

1. Limit supervisor accounts
2. Gunakan CASHIER untuk kasir operasional
3. Supervisor bisa akses semua features
4. Review role assignments secara berkala

---

## Summary

Manajemen staf di PayTo mencakup:

- Create, update, deactivate staff accounts
- Two-tier authentication (password + PIN)
- Work time tracking untuk shift management
- Audit logging untuk security
- Role-based access control (CASHIER vs SUPERVISOR)
- API endpoints untuk automation

Dengan sistem ini, business bisa maintain security, accountability, dan operational efficiency.
