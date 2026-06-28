# Manajemen Produk dan Inventory

Pelajari cara menambah, memperbarui, dan mengelola produk di sistem POS PayTo, termasuk tracking inventory dan alert stok rendah.

## Overview

Manajemen produk memungkinkan administrator untuk memelihara katalog produk dan memonitor level inventory. Sistem menyediakan rekomendasi restock otomatis berdasarkan history penjualan.

---

## Masalah: Perlu menambah produk baru

Perlu menambah produk baru ke katalog dengan level stok awal.

### Solusi

Gunakan admin products API untuk membuat produk baru:

```bash
POST /api/admin/products
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Teh Botol Sasa 250ml",
  "sku": "TEH-SASA-250",
  "category_id": 3,
  "price": 5000,
  "cost_price": 3500,
  "stock_quantity": 100,
  "reorder_point": 20,
  "is_active": true,
  "description": "Teh botol sasa ukuran 250ml",
  "product_type": "physical"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Teh Botol Sasa 250ml",
    "sku": "TEH-SASA-250",
    "category_id": 3,
    "category_name": "Minuman",
    "price": 5000,
    "cost_price": 3500,
    "stock_quantity": 100,
    "reorder_point": 20,
    "is_active": true,
    "status": "ACTIVE",
    "product_type": "physical",
    "description": "Teh botol sasa ukuran 250ml",
    "created_at": "2026-06-28 21:00:00",
    "updated_at": "2026-06-28 21:00:00"
  },
  "message": "Produk berhasil ditambahkan."
}
```

---

## Masalah: Perlu memperbarui produk yang sudah ada

Perlu update harga atau stok produk yang sudah ada.

### Solusi

Update produk:

```bash
PUT /api/admin/products/123
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Teh Botol Sasa 250ml",
  "sku": "TEH-SASA-250",
  "category_id": 3,
  "price": 6000,
  "cost_price": 3800,
  "stock_quantity": 150,
  "reorder_point": 25,
  "is_active": true,
  "description": "Teh botol sasa ukuran 250ml (harga baru)",
  "product_type": "physical"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Teh Botol Sasa 250ml",
    "sku": "TEH-SASA-250",
    "category_id": 3,
    "category_name": "Minuman",
    "price": 6000,
    "cost_price": 3800,
    "stock_quantity": 150,
    "reorder_point": 25,
    "is_active": true,
    "status": "ACTIVE",
    "product_type": "physical",
    "description": "Teh botol sasa ukuran 250ml (harga baru)",
    "created_at": "2026-06-28 21:00:00",
    "updated_at": "2026-06-28 21:15:00"
  },
  "message": "Produk berhasil diperbarui."
}
```

---

## Masalah: Perlu melihat daftar produk

Lihat semua produk dengan filter dan pagination.

### Solusi

```bash
GET /api/admin/products?category=3&status=active&search=Teh&page=1&limit=20
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Teh Botol Sasa 250ml",
      "sku": "TEH-SASA-250",
      "category_id": 3,
      "category_name": "Minuman",
      "price": 6000,
      "cost_price": 3800,
      "stock_quantity": 150,
      "reorder_point": 25,
      "is_active": true,
      "status": "ACTIVE",
      "product_type": "physical"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20
  }
}
```

---

## Masalah: Perlu melihat low stock alerts

Identifikasi produk dengan stok di bawah reorder point.

### Solusi

```bash
GET /api/admin/products?low_stock=true
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "name": "Sampo Cap Bambang 500ml",
      "sku": "SAMPO-BAM-500",
      "category_name": "Kecantikan",
      "current_stock": 8,
      "reorder_point": 20,
      "days_until_out": 3,
      "recommendation": "Restock segera"
    },
    {
      "id": 78,
      "name": "Tisu Kertas Ajaib 10s",
      "sku": "TISU-AJA-10",
      "category_name": "Kebersihan",
      "current_stock": 15,
      "reorder_point": 30,
      "days_until_out": 2,
      "recommendation": "Restock segera"
    }
  ],
  "meta": {
    "total_low_stock": 2
  }
}
```

---

## Masalah: Perlu melihat inventory recommendations

Lihat rekomendasi restock berdasarkan sales history.

### Solusi

```bash
GET /api/admin/products/recommendations
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Teh Botol Sasa 250ml",
      "sku": "TEH-SASA-250",
      "category_name": "Minuman",
      "current_stock": 150,
      "avg_daily_sales_7d": 15.4,
      "avg_daily_sales_30d": 12.8,
      "reorder_point": 25,
      "recommendation": "200",
      "reason": "Based on 7-day average: 15.4 units/day, lead time 5 days, safety stock 20"
    }
  ],
  "meta": {
    "total_recommendations": 1
  }
}
```

---

## Masalah: Perlu menghapus produk

Hapus produk yang sudah tidak dijual (tidak ada sales history).

### Solusi

To delete a product permanently (with no sales history):

```bash
DELETE /api/admin/products/123
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "message": "Produk berhasil dihapus."
}
```

**Important considerations:**
- Deactivated products won't appear in POS product lists
- Products with sales history should be deactivated, not deleted
- Deactivated products maintain their inventory history for reporting
- Deletion is permanent and irreversible

---

## Masalah: Perlu upload product bulk

Import multiple products sekaligus via CSV.

### Solusi

```bash
POST /api/admin/products/bulk-import
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "file": CSV file
}
```

CSV format:
```
name,sku,category_id,price,cost_price,stock_quantity,reorder_point,is_active,description
Product A,PRD-A-001,1,10000,7000,50,10,true,Description A
Product B,PRD-B-002,2,15000,10000,30,15,true,Description B
```

Response:
```json
{
  "success": true,
  "data": {
    "imported": 5,
    "failed": 0,
    "total": 5,
    "errors": []
  },
  "message": "5 products berhasil di-import."
}
```

---

## Product Categories

### Manage categories:

```bash
# List categories
GET /api/admin/categories
Authorization: Bearer {token}

# Create category
POST /api/admin/categories
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Makanan Ringan",
  "description": "Kategori makanan ringan dan camilan"
}

# Update category
PUT /api/admin/categories/1
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Makanan Ringan",
  "description": "Kategori updated"
}
```

---

## Stock Management

### Manual stock adjustment:

```bash
POST /api/admin/products/123/adjust-stock
Content-Type: application/json
Authorization: Bearer {token}

{
  "quantity": 50,
  "adjustment_type": "INCREASE",
  "reason": "Stock opname correction",
  "note": "Penyesuaian stok setelah physical count"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 456,
    "product_id": 123,
    "previous_quantity": 150,
    "adjustment": 50,
    "new_quantity": 200,
    "adjustment_type": "INCREASE",
    "reason": "Stock opname correction",
    "note": "Penyesuaian stok setelah physical count",
    "created_by": "admin",
    "created_at": "2026-06-28 21:30:00"
  },
  "message": "Stock berhasil diadjust."
}
```

Stock movement dicatat di `stock_movements` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `product_id` | bigint | Foreign key |
| `product_name_snapshot` | string | Product name (snapshot) |
| `previous_quantity` | decimal | Stock sebelum adjustment |
| `adjustment` | decimal | Amount (positive=increase, negative=decrease) |
| `new_quantity` | decimal | Stock setelah adjustment |
| `adjustment_type` | enum | INCREASE, DECREASE, SALE, REFUND, ADJUSTMENT |
| `related_type` | string | Model name (Sale, Refund, etc) |
| `related_id` | bigint | Related record ID |
| `reason` | string | Adjustment reason |
| `note` | text | Additional notes |
| `created_by` | string | Admin username |
| `created_at` | timestamp | Time of movement |

---

## Summary

Product management di PayTo mencakup:

- CRUD operations untuk products
- Inventory tracking dengan precision 3 decimal
- Low stock alerts dan recommendations
- Stock adjustments dengan audit trail
- Bulk import via CSV
- Category management
- Product deactivation vs deletion
- Integration dengan sales dan refunds

Dengan sistem ini, business bisa maintain accurate inventory, reduce stockouts, dan optimize ordering.
