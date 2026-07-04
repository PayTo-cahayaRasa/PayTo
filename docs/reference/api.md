# Referensi API

## Overview

PayTo API adalah REST API yang digunakan untuk komunikasi antara frontend (React/Inertia) dan backend (Laravel). Sistem menggunakan session-based authentication.

### Base URL

```
http://localhost/api
```

### Authentication

API PayTo menggunakan session-based authentication via Laravel Sanctum.
Client POS menggunakan cookie-based session authentication.

**Login Flow:**
1. POST ke `/login` dengan username dan password
2. Response mengembalikan redirect ke halaman kasir/admin
3. Subsequent requests gunakan authenticated session

### Response Format

Semua responses berformat JSON:

```json
{
  "data": { ... },
  "message": "Pesan sukses opsional",
  "errors": { ... }
}
```

### HTTP Status Codes

| Kode | Deskripsi |
|------|-------------|
| 200 | Sukses |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests (Rate Limited) |
| 500 | Internal Server Error |

### Rate Limiting

| Endpoint Group | Limit |
|----------------|-------|
| Admin API (read) | 60 req/min |
| Admin API (write) | 10 req/5 min |
| Sensitive actions | 5 req/5 min |
| Checkout | 30 req/min |
| Refund | 10 req/min |
| Login | 5 req/min |

---

## Authentication Routes

### Login

**POST** `/login`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Username |
| password | string | Yes | Password |

```bash
curl -X POST http://localhost/login \
  -H "Content-Type: application/json" \
  -d '{"username": "kasir1", "password": "password123"}'
```

#### Response (302)

Redirect ke `/kasir` jika sukses, kembali ke `/login` jika gagal.

---

### Logout

**POST** `/logout`

#### Response (302)

Redirect ke `/login`.

---

## Admin Dashboard Routes

### Get Dashboard Statistics

**GET** `/api/admin/dashboard`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": {
    "today_sales_total": 1500000.00,
    "today_transactions": 25,
    "low_stock_count": 3,
    "pending_approvals_count": 2,
    "weekly_sales_trend": [
      { "date": "2026-07-01", "total": 1250000 },
      { "date": "2026-07-02", "total": 1380000 }
    ],
    "recent_activities": [
      {
        "id": 1,
        "type": "SALE",
        "description": "Penjualan #001",
        "amount": 150000,
        "user": "Kasir Satu",
        "created_at": "2026-07-04T10:30:00Z"
      }
    ]
  }
}
```

---

### Get Profile

**GET** `/api/admin/profile`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": {
    "id": 1,
    "name": "Admin User",
    "username": "admin",
    "role": "SUPERVISOR",
    "email": "admin@example.com",
    "is_active": true,
    "last_login_at": "2026-07-04T08:00:00Z"
  }
}
```

---

## Product Management

### List Products

**GET** `/api/admin/products`

#### Authentication
Supervisor only

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number |
| per_page | integer | Items per page (default: 15) |
| search | string | Search by name/SKU/barcode |
| category | string | Filter by category |
| status | string | Filter by status (ACTIVE/INACTIVE) |

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "name": "Kopi Sachet",
      "sku": "KPF-001",
      "barcode": "1234567890123",
      "price": 2500.00,
      "cost": 2000.00,
      "uom": "pcs",
      "is_active": true,
      "stock_on_hand": 100.000,
      "created_at": "2026-01-15T08:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 50,
    "last_page": 4
  }
}
```

---

### Get Product

**GET** `/api/admin/products/{product}`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": {
    "id": 1,
    "name": "Kopi Sachet",
    "sku": "KPF-001",
    "barcode": "1234567890123",
    "price": 2500.00,
    "cost": 2000.00,
    "uom": "pcs",
    "is_active": true,
    "stock_on_hand": 100.000,
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-07-01T10:00:00Z"
  }
}
```

---

### Get Product History

**GET** `/api/admin/products/{product}/history`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "action": "CREATED",
      "changes": {
        "name": "Kopi Sachet",
        "price": 2500
      },
      "actor": {
        "id": 1,
        "name": "Admin"
      },
      "created_at": "2026-01-15T08:00:00Z"
    }
  ]
}
```

---

### Create Product

**POST** `/api/admin/products`

#### Authentication
Supervisor only

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| sku | string | No | SKU (unique) |
| barcode | string | No | Barcode (unique) |
| price | number | Yes | Selling price |
| cost | number | No | Cost price |
| uom | string | No | Unit of measure |
| is_active | boolean | No | Active status (default: true) |

```bash
curl -X POST http://localhost/api/admin/products \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -d '{
    "name": "Kopi Sachet",
    "sku": "KPF-001",
    "price": 2500
  }'
```

#### Response (201)

```json
{
  "data": {
    "id": 1,
    "name": "Kopi Sachet",
    "sku": "KPF-001",
    "price": 2500.00
  },
  "message": "Product created successfully"
}
```

---

### Update Product

**PUT** `/api/admin/products/{product}`

#### Authentication
Supervisor only

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| name | string | Product name |
| sku | string | SKU |
| barcode | string | Barcode |
| price | number | Selling price |
| cost | number | Cost price |
| uom | string | Unit of measure |
| is_active | boolean | Active status |

#### Response (200)

```json
{
  "data": {
    "id": 1,
    "name": "Kopi Sachet Premium",
    "price": 3000.00
  },
  "message": "Product updated successfully"
}
```

---

### Delete Product

**DELETE** `/api/admin/products/{product}`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "message": "Product deleted successfully"
}
```

---

## Inventory Management

### Get Inventory Recommendations

**GET** `/api/admin/inventory/recommendations`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Kopi Sachet",
      "current_stock": 5.000,
      "avg_daily_sales_7d": 10.000,
      "avg_daily_sales_30d": 8.000,
      "reorder_point": 20.000,
      "suggested_reorder_qty": 50.000,
      "computed_at": "2026-07-04T00:00:00Z"
    }
  ]
}
```

---

## Approvals

### List Approvals

**GET** `/api/admin/approvals`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "action": "REFUND",
      "status": "PENDING",
      "sale": {
        "id": 10,
        "server_invoice_no": "INV-2026-0010"
      },
      "requested_by": {
        "id": 2,
        "name": "Kasir Satu"
      },
      "reason": "Customer returned item",
      "created_at": "2026-07-04T10:00:00Z"
    }
  ]
}
```

---

### Get Pending Approvals

**GET** `/api/admin/approvals/pending`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "action": "REFUND",
      "status": "PENDING",
      "sale_id": 10,
      "requested_by_id": 2,
      "reason": "Customer returned item",
      "created_at": "2026-07-04T10:00:00Z"
    }
  ]
}
```

---

### Approve Request

**POST** `/api/admin/approvals/{approval}/approve`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": {
    "id": 1,
    "status": "APPROVED"
  },
  "message": "Approval granted"
}
```

---

### Reject Request

**POST** `/api/admin/approvals/{approval}/reject`

#### Authentication
Supervisor only

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Rejection reason |

#### Response (200)

```json
{
  "data": {
    "id": 1,
    "status": "REJECTED"
  },
  "message": "Approval rejected"
}
```

---

## Staff Management

### List Staff

**GET** `/api/admin/staff`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": [
    {
      "id": 2,
      "name": "Kasir Satu",
      "username": "kasir1",
      "role": "CASHIER",
      "is_active": true,
      "last_login_at": "2026-07-04T10:00:00Z",
      "work_seconds_today": 14400
    }
  ]
}
```

---

### Get Staff

**GET** `/api/admin/staff/{user}`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": {
    "id": 2,
    "name": "Kasir Satu",
    "username": "kasir1",
    "role": "CASHIER",
    "is_active": true,
    "total_transactions": 150,
    "total_sales": 15000000.00,
    "work_seconds_this_month": 432000
  }
}
```

---

### Create Staff

**POST** `/api/admin/staff`

#### Authentication
Supervisor only

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name |
| username | string | Yes | Username (unique) |
| email | string | Yes | Email (unique) |
| password | string | Yes | Password |
| role | string | Yes | CASHIER or SUPERVISOR |

#### Response (201)

```json
{
  "data": {
    "id": 3,
    "name": "Kasir Dua",
    "username": "kasir2",
    "role": "CASHIER"
  },
  "message": "Staff created successfully"
}
```

---

### Update Staff

**PUT** `/api/admin/staff/{user}`

#### Authentication
Supervisor only

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| name | string | Full name |
| email | string | Email |
| is_active | boolean | Active status |

#### Response (200)

```json
{
  "message": "Staff updated successfully"
}
```

---

### Delete Staff

**DELETE** `/api/admin/staff/{user}`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "message": "Staff deleted successfully"
}
```

---

### Reset PIN

**POST** `/api/admin/staff/{user}/reset-pin`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "message": "PIN reset successfully"
}
```

---

## Settings

### Get Receipt Settings

**GET** `/api/admin/receipt-settings`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": {
    "store_name": "PayTo Store",
    "store_address": "Jl. Contoh No. 1",
    "store_phone": "081234567890",
    "footer_message": "Terima kasih atas kunjungan Anda"
  }
}
```

---

### Update Receipt Settings

**PUT** `/api/admin/receipt-settings`

#### Authentication
Supervisor only

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| store_name | string | Store name |
| store_address | string | Store address |
| store_phone | string | Store phone |
| footer_message | string | Footer message |

#### Response (200)

```json
{
  "message": "Settings updated successfully"
}
```

---

### Get Business Settings

**GET** `/api/admin/business-settings`

#### Authentication
Supervisor only

#### Response (200)

```json
{
  "data": {
    "currency": "IDR",
    "tax_rate": 11,
    "low_stock_threshold": 10
  }
}
```

---

## POS Routes (Kasir)

### Get POS Products

**GET** `/api/pos/products`

#### Authentication
Cashier or Supervisor

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "name": "Kopi Sachet",
      "price": 2500.00,
      "barcode": "1234567890123",
      "stock_on_hand": 100.000
    }
  ]
}
```

---

### Get POS History

**GET** `/api/pos/history`

#### Authentication
Cashier or Supervisor

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "server_invoice_no": "INV-2026-0001",
      "grand_total": 50000.00,
      "status": "PAID",
      "items_count": 3,
      "created_at": "2026-07-04T10:30:00Z"
    }
  ]
}
```

---

### Get POS Profile

**GET** `/api/pos/profile`

#### Authentication
Cashier or Supervisor

#### Response (200)

```json
{
  "data": {
    "id": 2,
    "name": "Kasir Satu",
    "role": "CASHIER",
    "work_date": "2026-07-04",
    "work_seconds": 14400
  }
}
```

---

### Checkout

**POST** `/api/pos/checkout`

#### Authentication
Cashier or Supervisor

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | array | Yes | Cart items |
| items[].product_id | integer | Yes | Product ID |
| items[].qty | number | Yes | Quantity |
| items[].price | number | Yes | Unit price |
| items[].discount_amount | number | No | Discount per item |
| payments | array | Yes | Payment info |
| payments[].method | string | Yes | Payment method |
| payments[].amount | number | Yes | Payment amount |
| customer_name | string | No | Customer name |
| customer_phone | string | No | Customer phone |
| occurred_at | string | No | Transaction time |

```bash
curl -X POST http://localhost/api/pos/checkout \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -d '{
    "items": [
      {"product_id": 1, "qty": 2, "price": 2500}
    ],
    "payments": [
      {"method": "CASH", "amount": 10000}
    ]
  }'
```

#### Response (201)

```json
{
  "data": {
    "sale_id": 1,
    "server_invoice_no": "INV-2026-0001",
    "subtotal": 5000.00,
    "discount_total": 0.00,
    "tax_total": 550.00,
    "grand_total": 5550.00,
    "paid_total": 10000.00,
    "change_total": 4450.00,
    "status": "PAID"
  },
  "message": "Checkout successful"
}
```

---

### Refund

**POST** `/api/pos/refunds`

#### Authentication
Cashier or Supervisor

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sale_id | integer | Yes | Original sale ID |
| items | array | Yes | Items to refund |
| items[].sale_item_id | integer | Yes | Sale item ID |
| items[].qty | number | Yes | Refund quantity |
| reason | string | Yes | Refund reason |

#### Response (201)

```json
{
  "data": {
    "refund_id": 1,
    "status": "REQUESTED"
  },
  "message": "Refund requested, awaiting approval"
}
```

---

## Error Responses

### Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)

```json
{
  "message": "This action is unauthorized."
}
```

### Not Found (404)

```json
{
  "message": "Resource not found."
}
```

### Rate Limited (429)

```json
{
  "message": "Too many attempts. Please try again in X seconds."
}
```
