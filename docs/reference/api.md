# Referensi API

## Overview

### Base URL

```
http://localhost/api
```

### Authentication

Semua API endpoints (kecuali `/pos/login`) memerlukan authentication menggunakan Laravel's session-based authentication. Gunakan header `X-CSRF-TOKEN` dengan valid CSRF token.

**POS Login Flow:**
- Gunakan endpoint `/pos/login` untuk authentication
- Endpoint mengembalikan redirect URL berdasarkan user role
- Request selanjutnya akan menggunakan authenticated session

### Response Format

Semua responses berformat JSON dengan struktur yang konsisten:

```json
{
  "data": { ... },
  "message": "Pesan sukses opsional",
  "errors": { ... }
}
```

### Status Codes

| Kode | Deskripsi |
|------|-------------|
| 200 | Sukses |
| 201 | Dibuat |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## Admin Dashboard

### Get Dashboard Statistics

**GET** `/admin/dashboard`

#### Deskripsi
Mengembalikan data dashboard komprehensif termasuk ringkasan penjualan hari ini, jumlah transaksi, alert stok rendah, tren mingguan, dan aktivitas terbaru.

#### Authentication
Diperlukan (role SUPERVISOR)

#### Response
```json
{
  "data": {
    "today_sales_total": 1500000.00,
    "today_transactions": 25,
    "low_stock": {
      "total": 3,
      "items": [
        {
          "id": 1,
          "name": "Kopi Bubuk",
          "stock": 0.5,
          "reorder_point": 5.0
        }
      ]
    },
    "weekly_sales_trend": [
      { "date": "2026-06-23", "total": 1250000 },
      { "date": "2026-06-24", "total": 1380000 }
    ],
    "recent_activities": [
      {
        "type": "SALE",
        "amount": 150000,
        "user": "John Doe"
      }
    ]
  }
}
```

---

## Admin Profile

### Get Admin Profile

**GET** `/admin/profile`

#### Deskripsi
Mengembalikan informasi profile admin user saat ini termasuk nama, role, email, dan tanggal join.

#### Authentication
Diperlukan (role SUPERVISOR)

#### Response
```json
{
  "data": {
    "name": "Nama Admin",
    "role": "SUPERVISOR",
    "id": "SPV-001",
    "email": "admin@example.com",
    "phone": "—",
    "joinDate": "01 Januari 2026",
    "lastLogin": "2 jam yang lalu"
  }
}
```

---

## Products

### List All Products

**GET** `/admin/products`

#### Deskripsi
Mengembalikan list produk yang dipaginasi dengan informasi stock.

#### Authentication
Diperlukan (role SUPERVISOR)

#### Query Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-------------|
| page | integer | Nomor halaman (default: 1) |
| per_page | integer | Items per halaman (default: 10) |
| category | integer | Filter by category ID |
| status | string | Filter by status (ACTIVE/INACTIVE) |
| search | string | Search by name or SKU |

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "name": "Kopi Bubuk",
      "sku": "KPB-001",
      "barcode": "1234567890123",
      "price": 50000.00,
      "discount": 10.00,
      "price_after_discount": 45000.00,
      "cost": 35000.00,
      "uom": "pcs",
      "stock": 50.0,
      "is_active": true,
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 100,
    "last_page": 10
  }
}
```

### Create Product

**POST** `/admin/products`

#### Authentication
Diperlukan (role SUPERVISOR)

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | max:255 |
| sku | string | No | max:255, unique |
| barcode | string | No | max:255, unique |
| price | number | Yes | min:0 |
| discount | number | No | min:0 |
| cost | number | No | min:0 |
| uom | string | No | max:50 |
| is_active | boolean | No | default: true |
| stock | number | Yes | min:0 |

#### Example Request
```bash
curl -X POST http://localhost/api/admin/products \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -d '{
    "name": "Kopi Bubuk Arabica",
    "sku": "KPB-001",
    "barcode": "1234567890123",
    "price": 50000,
    "discount": 10,
    "cost": 35000,
    "uom": "pcs",
    "stock": 100,
    "is_active": true
  }'
```

#### Success Response
```json
{
  "data": {
    "id": 1,
    "name": "Kopi Bubuk Arabica",
    "sku": "KPB-001",
    "price": 50000.00,
    "stock": 100.0
  },
  "message": "Produk berhasil ditambahkan."
}
```

#### Error Response (422)
```json
{
  "message": "Nama produk wajib diisi.",
  "errors": {
    "name": ["Nama produk wajib diisi."]
  }
}
```

### Get Product Details

**GET** `/admin/products/{product}`

#### Deskripsi
Mengembalikan informasi detail tentang produk spesifik.

#### Authentication
Diperlukan (role SUPERVISOR)

#### Path Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-------------|
| product | integer | Product ID |

#### Response
```json
{
  "data": {
    "id": 1,
    "name": "Kopi Bubuk Arabica",
    "sku": "KPB-001",
    "barcode": "1234567890123",
    "price": 50000.00,
    "discount": 10.00,
    "price_after_discount": 45000.00,
    "cost": 35000.00,
    "uom": "pcs",
    "stock": 50.0,
    "is_active": true,
    "status": "ACTIVE"
  }
}
```

### Update Product

**PUT** `/admin/products/{product}`

#### Authentication
Diperlukan (role SUPERVISOR)

#### Path Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-------------|
| product | integer | Product ID |

#### Request Body

Semua fields opsional. Hanya fields yang diisi yang akan diupdate.

| Field | Type | Validation |
|-------|------|------------|
| name | string | max:255 |
| sku | string | max:255, unique |
| barcode | string | max:255, unique |
| price | number | min:0 |
| discount | number | min:0 |
| cost | number | min:0 |
| uom | string | max:50 |
| is_active | boolean | |
| stock | number | min:0 |

#### Example Request
```bash
curl -X PUT http://localhost/api/admin/products/1 \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -d '{
    "price": 55000,
    "stock": 75
  }'
```

#### Success Response
```json
{
  "data": {
    "id": 1,
    "name": "Kopi Bubuk Arabica",
    "price": 55000.00,
    "stock": 75.0
  },
  "message": "Produk berhasil diperbarui."
}
```

### Delete Product

**DELETE** `/admin/products/{product}`

#### Authentication
Diperlukan (role SUPERVISOR)

#### Path Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-------------|
| product | integer | Product ID |

#### Response
```json
{
  "message": "Produk berhasil dihapus."
}
```

---

## Inventory Recommendations

### Get Inventory Recommendations

**GET** `/admin/inventory/recommendations`

#### Deskripsi
Menganalisis data penjualan dari 7 hari terakhir untuk memberikan rekomendasi restocking inventory. Mengembalikan produk dengan level stok di bawah reorder points.

#### Authentication
Diperlukan (role SUPERVISOR)

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "name": "Kopi Bubuk",
      "sku": "KPB-001",
      "category_name": "Minuman",
      "current_stock": 2.5,
      "avg_daily_sales_7d": 5.2,
      "avg_daily_sales_30d": 4.8,
      "reorder_point": 10.0,
      "recommendation": "35",
      "reason": "Berdasarkan rata-rata 7 hari: 5.2 unit/hari, lead time 5 hari, safety stock 10"
    }
  ],
  "meta": {
    "total": 1,
    "products_below_reorder_point": 1
  }
}
```

---

## Stock Management

### Adjust Stock

**POST** `/admin/products/{product}/adjust-stock`

#### Deskripsi
Manual stock adjustment untuk correcting inventory.

#### Authentication
Diperlukan (role SUPERVISOR)

#### Path Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-------------|
| product | integer | Product ID |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| quantity | number | Yes | min:0.001 |
| adjustment_type | string | Yes | INCREASE or DECREASE |
| reason | string | Yes | max:255 |
| note | string | No | max:500 |

#### Example Request
```bash
curl -X POST http://localhost/api/admin/products/1/adjust-stock \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -d '{
    "quantity": 50,
    "adjustment_type": "INCREASE",
    "reason": "Stock opname correction",
    "note": "Penyesuaian stok setelah physical count"
  }'
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 456,
    "product_id": 1,
    "previous_quantity": 100,
    "adjustment": 50,
    "new_quantity": 150,
    "adjustment_type": "INCREASE",
    "reason": "Stock opname correction",
    "note": "Penyesuaian stok setelah physical count",
    "created_by": "admin",
    "created_at": "2026-06-28 21:30:00"
  },
  "message": "Stock berhasil diadjust."
}
```

---

## Staff Management

### List Staff

**GET** `/api/admin/staff`

#### Authentication
Diperlukan (role SUPERVISOR)

#### Query Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-------------|
| status | string | Filter by status (ACTIVE/INACTIVE) |
| role | string | Filter by role (CASHIER/SUPERVISOR) |
| search | string | Search by name or username |

#### Response
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
      "last_login_at": "2026-06-28 20:45:00"
    }
  ],
  "meta": {
    "total": 1,
    "active": 1,
    "inactive": 0
  }
}
```

### Create Staff

**POST** `/api/admin/staff`

#### Authentication
Diperlukan (role SUPERVISOR)

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | max:255 |
| username | string | Yes | max:255, unique |
| password | string | Yes | min:8 |
| pin | string | Yes | exactly 6 digits |
| role | string | Yes | CASHIER or SUPERVISOR |
| is_active | boolean | No | default: true |

#### Response
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

### Deactivate Staff

**PATCH** `/api/admin/staff/{staff}`

#### Authentication
Diperlukan (role SUPERVISOR)

#### Response
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

## Approval Workflow

### List Pending Approvals

**GET** `/api/supervisor/refunds?status=pending`

#### Authentication
Diperlukan (role SUPERVISOR)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 78,
      "sale_id": 123,
      "status": "PENDING_APPROVAL",
      "total_amount": 7500,
      "items": [
        {
          "product_name": "Teh Botol Sasa 250ml",
          "quantity": 1,
          "price": 7500
        }
      ],
      "refund_method": "CASH",
      "note": "Customer tidak jadi beli",
      "created_by": "kasir1",
      "created_at": "2026-06-28 21:00:00"
    }
  ],
  "meta": {
    "total": 1,
    "pending": 1,
    "approved": 0,
    "rejected": 0
  }
}
```

### Approve Refund

**PATCH** `/api/supervisor/refunds/{refund}/approve`

#### Request Body
```json
{
  "approval_note": "Setujui refund sesuai kebijakan"
}
```

### Reject Refund

**PATCH** `/api/supervisor/refunds/{refund}/reject`

#### Request Body
```json
{
  "rejection_reason": "Refund melewati batas waktu 2 hari"
}
```

---

## Push Notifications

### Get VAPID Public Key

**GET** `/api/push/vapid-public-key`

#### Response
```json
{
  "public_key": "BOtXK2J..."
}
```

### Subscribe to Push

**POST** `/api/push/subscribe`

#### Request Body
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BNQ...",
    "auth": "..."
  }
}
```

### Send Notification

**POST** `/api/admin/push/send`

#### Request Body
```json
{
  "title": "Order Baru",
  "body": "Ada order baru dari customer Budi",
  "data": {
    "order_id": 123,
    "type": "new_order"
  }
}
```

---

## Sync Operations

### Sync Offline Transactions

**POST** `/api/pos/sync`

#### Request Body
```json
{
  "transactions": [
    {
      "local_txn_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "device_id": "POS-001",
      "items": [
        {
          "product_id": 123,
          "quantity": 2,
          "price": 6000
        }
      ],
      "payment_method": "CASH",
      "total_amount": 12000,
      "created_at": "2026-06-28T21:00:00.000Z"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "synced": [
      {
        "local_txn_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "sale_id": 789,
        "created_at": "2026-06-28 21:00:00"
      }
    ],
    "failed": [
      {
        "local_txn_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "error": "Product stock insufficient",
        "retryable": true
      }
    ],
    "duplicates": [
      {
        "local_txn_uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "sale_id": 790,
        "created_at": "2026-06-28 21:05:00"
      }
    ],
    "summary": {
      "total": 3,
      "synced": 1,
      "failed": 1,
      "duplicates": 1
    }
  }
}
```

---

## Error Codes

### Validation Errors (422)

```json
{
  "message": "Validasi gagal",
  "errors": {
    "field_name": ["Pesan error 1", "Pesan error 2"]
  }
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error."
}
```

---

## Notes

### Partial Failures

Batch operations mungkin mengembalikan partial failures:
- Successful transactions tetap processed
- Failed transactions dilog dan dapat diretry
- Batch status menunjukkan overall success atau failure

### Stock Management

- Stock ditrack dengan precision 3 decimal
- Sale items mengurangi stock immediately
- Refunds mengembalikan stock ke inventory
- Inventory recommendations dihitung berdasarkan rata-rata penjualan 7 hari
- Reorder point formula: (avg_sales_7d × lead_time) + safety_stock

### Sync Process

- POS sync menggunakan batch processing untuk offline transactions
- Idempotency di-enforce menggunakan device_id + local_txn_uuid
- Duplicate transactions dideteksi dan di-skip

### Authentication

- Session-based authentication digunakan
- CSRF tokens diperlukan untuk POST/PUT/DELETE requests
- Staff bisa login menggunakan username/password atau 6-digit PIN
- Supervisor login memberikan akses ke both admin dan POS features
- Cashier login membatasi akses hanya ke POS features
