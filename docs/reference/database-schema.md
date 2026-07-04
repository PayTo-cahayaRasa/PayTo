# Referensi Database Schema

## Overview

- **Database Engine**: MySQL
- **Default Connection**: `mysql` via `DB_CONNECTION`
- **Database Name**: `paytocahaya`

## Tables by Category

### Core Tables (POS)

| Table | Description |
|-------|-------------|
| `users` | System users (kasir, supervisor) dengan role POS |
| `products` | Product catalog dengan pricing dan inventory |
| `sales` | Sales transactions |
| `sale_items` | Line items untuk setiap sale |
| `payments` | Payment records per sale |
| `stock_items` | Inventory stock levels per product |
| `stock_movements` | Historical stock movement records |
| `refunds` | Refund records |
| `refund_items` | Refunded items per refund |
| `approvals` | Approval workflow untuk discount/void/refund |

### Supporting Tables

| Table | Description |
|-------|-------------|
| `app_settings` | Application configuration |
| `audit_logs` | Activity audit trail |
| `inventory_recommendations` | Automated restocking recommendations |

### System Tables

| Table | Description |
|-------|-------------|
| `sessions` | User session management |
| `cache` | Cache storage |
| `cache_locks` | Cache lock management |
| `jobs` | Queue job records |
| `job_batches` | Batch job tracking |
| `failed_jobs` | Failed queue jobs |
| `migrations` | Migration history |

---

## Table Details

### `users`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `name` | varchar(255) | NO | Full name |
| `username` | varchar(255) | NO | Unique username |
| `email` | varchar(255) | NO | Email (unique) |
| `email_verified_at` | timestamp | YES | Email verification |
| `password` | varchar(255) | NO | Hashed password |
| `phone_number` | varchar(20) | YES | Phone number |
| `profile_photo_path` | varchar(255) | YES | Photo path |
| `role` | enum('CASHIER','SUPERVISOR') | NO | User role |
| `pin_hash` | varchar(255) | YES | PIN hash (kasir) |
| `supervisor_pin_hash` | varchar(255) | YES | Supervisor PIN hash |
| `is_active` | boolean | NO | Active status |
| `last_login_at` | timestamp | YES | Last login |
| `last_logout_at` | timestamp | YES | Last logout |
| `work_date` | date | YES | Current work date |
| `work_seconds` | int unsigned | NO | Accumulated work time |
| `remember_token` | varchar(100) | YES | Remember me token |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Unique: `username`
- Unique: `email`

**Foreign Keys:** None

---

### `products`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `name` | varchar(255) | NO | Product name |
| `sku` | varchar(255) | YES | SKU (unique) |
| `barcode` | varchar(255) | YES | Barcode (unique) |
| `price` | decimal(12,2) | NO | Selling price |
| `cost` | decimal(12,2) | YES | Cost price |
| `uom` | varchar(255) | NO | Unit of measure |
| `is_active` | boolean | NO | Active status |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Unique: `sku`
- Unique: `barcode`

**Foreign Keys:** None

---

### `sales`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `server_invoice_no` | varchar(255) | YES | Server invoice number |
| `local_txn_uuid` | char(36) | NO | Local transaction UUID |
| `status` | enum | NO | DRAFT, PENDING_PAYMENT, PAID, VOID, SYNC_FAILED |
| `source` | enum | YES | ONLINE, OFFLINE |
| `customer_name` | varchar(255) | YES | Customer name |
| `customer_phone` | varchar(20) | YES | Customer phone |
| `cashier_id` | bigint unsigned | NO | Cashier user FK |
| `subtotal` | decimal(12,2) | NO | Subtotal |
| `discount_total` | decimal(12,2) | NO | Total discount |
| `tax_total` | decimal(12,2) | NO | Tax total |
| `grand_total` | decimal(12,2) | NO | Grand total |
| `paid_total` | decimal(12,2) | NO | Amount paid |
| `change_total` | decimal(12,2) | NO | Change amount |
| `occurred_at` | timestamp | YES | Transaction time |
| `synced_at` | timestamp | YES | Sync timestamp |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Unique: `server_invoice_no`
- Unique: `local_txn_uuid`
- Foreign: `cashier_id` → `users.id`

---

### `sale_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `sale_id` | bigint unsigned | NO | Sale FK |
| `product_id` | bigint unsigned | NO | Product FK |
| `product_name_snapshot` | varchar(255) | NO | Product name at sale time |
| `unit_price` | decimal(12,2) | NO | Unit price |
| `qty` | decimal(12,3) | NO | Quantity |
| `discount_amount` | decimal(12,2) | NO | Discount per line |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)
- Foreign: `product_id` → `products.id` (NO ACTION)

---

### `payments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `sale_id` | bigint unsigned | NO | Sale FK |
| `method` | varchar(32) | NO | Payment method |
| `amount` | decimal(12,2) | NO | Payment amount |
| `reference` | varchar(255) | YES | Payment reference |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)

---

### `stock_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `product_id` | bigint unsigned | NO | Product FK (unique) |
| `on_hand` | decimal(12,3) | NO | Current stock |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Unique: `product_id`
- Foreign: `product_id` → `products.id` (CASCADE)

---

### `stock_movements`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `product_id` | bigint unsigned | NO | Product FK |
| `type` | enum | NO | SALE_OUT, RETURN_IN, ADJUSTMENT, SYNC_CORRECTION |
| `qty_delta` | decimal(12,3) | NO | Quantity change |
| `reference_type` | varchar(255) | YES | Reference entity |
| `reference_id` | varchar(255) | YES | Reference ID |
| `created_at` | timestamp | YES | Creation timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `product_id` → `products.id` (NO ACTION)

---

### `refunds`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `sale_id` | bigint unsigned | NO | Original sale FK |
| `requested_by` | bigint unsigned | NO | Requester user FK |
| `approved_by` | bigint unsigned | YES | Approver user FK |
| `approved_at` | timestamp | YES | Approval timestamp |
| `reason` | text | YES | Refund reason |
| `status` | enum | NO | REQUESTED, APPROVED, COMPLETED |
| `total_amount` | decimal(12,2) | NO | Refund total |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)
- Foreign: `requested_by` → `users.id` (NO ACTION)
- Foreign: `approved_by` → `users.id` (NO ACTION)

---

### `refund_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `refund_id` | bigint unsigned | NO | Refund FK |
| `sale_item_id` | bigint unsigned | NO | Original sale item FK |
| `product_id` | bigint unsigned | NO | Product FK |
| `product_name_snapshot` | varchar(255) | NO | Product name snapshot |
| `unit_price` | decimal(12,2) | NO | Unit price |
| `qty` | decimal(12,3) | NO | Refunded quantity |
| `created_at` | timestamp | YES | Creation timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `refund_id` → `refunds.id` (CASCADE)
- Foreign: `sale_item_id` → `sale_items.id` (CASCADE)
- Foreign: `product_id` → `products.id` (NO ACTION)

---

### `approvals`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `action` | enum | NO | DISCOUNT_OVERRIDE, PRICE_OVERRIDE, VOID, REFUND |
| `sale_id` | bigint unsigned | YES | Related sale FK |
| `requested_by` | bigint unsigned | NO | Requester FK |
| `approved_by` | bigint unsigned | YES | Approver FK |
| `approved_at` | timestamp | YES | Approval timestamp |
| `reason` | text | YES | Reason |
| `status` | enum | NO | PENDING, APPROVED, REJECTED |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)
- Foreign: `requested_by` → `users.id` (NO ACTION)
- Foreign: `approved_by` → `users.id` (NO ACTION)

---

### `app_settings`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `key` | varchar(255) | NO | Setting key (unique) |
| `value` | text | YES | Setting value |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Unique: `key`

---

### `audit_logs`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `actor_id` | bigint unsigned | NO | Actor user FK |
| `event` | varchar(255) | NO | Event type |
| `entity_type` | varchar(255) | NO | Entity type |
| `entity_id` | bigint unsigned | NO | Entity ID |
| `meta_json` | json | YES | Additional metadata |
| `occurred_at` | timestamp | YES | Event timestamp |
| `created_at` | timestamp | YES | Log timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `actor_id` → `users.id` (NO ACTION)

---

### `inventory_recommendations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint unsigned | NO | Primary key |
| `product_id` | bigint unsigned | NO | Product FK |
| `avg_daily_sales_7d` | decimal(12,3) | NO | 7-day avg daily sales |
| `avg_daily_sales_30d` | decimal(12,3) | NO | 30-day avg daily sales |
| `lead_time_days` | int | NO | Supplier lead time |
| `safety_stock` | decimal(12,3) | NO | Safety stock level |
| `reorder_point` | decimal(12,3) | NO | Calculated reorder point |
| `suggested_reorder_qty` | decimal(12,3) | NO | Suggested reorder qty |
| `computed_at` | timestamp | YES | Computation timestamp |
| `created_at` | timestamp | YES | Creation timestamp |
| `updated_at` | timestamp | YES | Last update |

**Indexes:**
- Primary: `id`
- Foreign: `product_id` → `products.id` (CASCADE)

---

## Status Enums

### `sales.status`:
- `DRAFT` - Sale draft
- `PENDING_PAYMENT` - Waiting for payment
- `PAID` - Payment received
- `VOID` - Sale cancelled
- `SYNC_FAILED` - Sync failed

### `sales.source`:
- `ONLINE` - Online transaction
- `OFFLINE` - Offline transaction

### `refunds.status`:
- `REQUESTED` - Refund requested
- `APPROVED` - Refund approved
- `COMPLETED` - Refund completed

### `approvals.status`:
- `PENDING` - Waiting for approval
- `APPROVED` - Approved
- `REJECTED` - Rejected

### `approvals.action`:
- `DISCOUNT_OVERRIDE` - Discount override
- `PRICE_OVERRIDE` - Price override
- `VOID` - Sale void
- `REFUND` - Refund request

### `stock_movements.type`:
- `SALE_OUT` - Stock decreased
- `RETURN_IN` - Stock increased
- `ADJUSTMENT` - Manual adjustment
- `SYNC_CORRECTION` - Sync correction

### `users.role`:
- `CASHIER` - Kasir
- `SUPERVISOR` - Supervisor/Admin

---

*Last updated: July 4, 2026*
