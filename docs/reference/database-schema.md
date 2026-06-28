# Referensi Database Schema

## Overview

- **Database Engine**: MySQL
- **Total Tables**: 24
- **Default Connection**: `mysql` via `DB_CONNECTION`
- **Database Name**: `payto`

## Tables by Category

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | System users (cashiers, supervisors) dengan role-based access |
| `products` | Product catalog dengan pricing dan inventory tracking |
| `categories` | Product category definitions |
| `sales` | Sales transactions dengan multi-payment support |
| `sale_items` | Line items untuk setiap sale transaction |
| `stock_items` | Inventory stock levels per product |
| `stock_movements` | Historical stock movement records |
| `refunds` | Product refund records |
| `refund_items` | Individual refunded items |

### System Tables

| Table | Description |
|-------|-------------|
| `app_settings` | Application configuration key-value pairs |
| `cache` | Cache storage untuk application data |
| `cache_locks` | Cache lock management untuk concurrent access |
| `failed_jobs` | Failed queue job records |
| `jobs` | Queue job waiting/processing records |
| `sync_batches` | Device sync batch tracking |
| `sync_idempotency_keys` | Idempotency key tracking untuk sync operations |

### Feature Tables

| Table | Description |
|-------|-------------|
| `approvals` | Approval workflow records untuk special actions |
| `push_subscriptions` | Web push notification subscription data |
| `work_time_logs` | Employee work time tracking logs |
| `inventory_recommendations` | Automated inventory restocking recommendations |
| `receipt_templates` | Receipt template definitions |
| `receipt_print_logs` | Receipt printing audit trail |
| `audit_logs` | Application activity audit trail |

## Table Details

### `app_settings`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `key` | varchar(255) | NO | - | Unique setting key |
| `value` | text | YES | NULL | Setting value |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Unique: `key`

**Foreign Keys:** None

---

### `products`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `name` | varchar(255) | NO | - | Product name |
| `sku` | varchar(255) | YES | NULL | Stock keeping unit |
| `barcode` | varchar(255) | YES | NULL | Product barcode |
| `price` | decimal(12,2) | NO | 0.00 | Selling price |
| `cost` | decimal(12,2) | YES | NULL | Cost price |
| `discount` | decimal(8,2) | NO | 0.00 | Default discount |
| `uom` | varchar(255) | NO | 'pcs' | Unit of measure |
| `is_active` | tinyint(1) | NO | 1 | Active status |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Unique: `barcode`
- Unique: `sku`

**Foreign Keys:** None

---

### `users`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `name` | varchar(255) | NO | - | Full name |
| `username` | varchar(255) | NO | - | Unique username |
| `password_hash` | varchar(255) | NO | - | Password hash |
| `remember_token` | varchar(100) | YES | NULL | Remember me token |
| `role` | enum('CASHIER','SUPERVISOR') | NO | 'CASHIER' | User role |
| `supervisor_pin_hash` | varchar(255) | YES | NULL | Supervisor PIN hash |
| `pin_hash` | varchar(255) | YES | NULL | User PIN hash |
| `is_active` | tinyint(1) | NO | 1 | Active status |
| `last_login_at` | timestamp | YES | NULL | Last login time |
| `last_logout_at` | timestamp | YES | NULL | Last logout time |
| `work_date` | date | YES | NULL | Current work date |
| `work_seconds` | int unsigned | NO | 0 | Work time accumulated |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Unique: `username`

**Foreign Keys:** None

---

### `sales`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `server_invoice_no` | varchar(255) | YES | NULL | Server-side invoice number |
| `local_txn_uuid` | char(36) | NO | - | Local transaction UUID |
| `status` | enum('DRAFT','PENDING_PAYMENT','PAID','VOID','SYNC_FAILED') | NO | 'DRAFT' | Sale status |
| `subtotal` | decimal(12,2) | NO | 0.00 | Subtotal amount |
| `discount_total` | decimal(12,2) | NO | 0.00 | Total discounts |
| `tax_total` | decimal(12,2) | NO | 0.00 | Total tax |
| `total` | decimal(12,2) | NO | 0.00 | Grand total |
| `cashier_id` | bigint unsigned | NO | - | Cashier user ID |
| `sync_batch_id` | bigint unsigned | YES | NULL | Sync batch reference |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `cashier_id` → `users.id` (NO ACTION)
- Foreign: `sync_batch_id` → `sync_batches.id` (SET NULL)

---

### `sale_items`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `sale_id` | bigint unsigned | NO | - | Sale reference |
| `product_id` | bigint unsigned | NO | - | Product reference |
| `product_name_snapshot` | varchar(255) | NO | - | Product name at time of sale |
| `unit_price` | decimal(12,2) | NO | - | Unit selling price |
| `qty` | decimal(12,3) | NO | 0.000 | Quantity sold |
| `discount_amount` | decimal(12,2) | NO | 0.00 | Discount per line |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)
- Foreign: `product_id` → `products.id` (NO ACTION)

---

### `stock_items`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `product_id` | bigint unsigned | NO | - | Product reference |
| `on_hand` | decimal(12,3) | NO | 0.000 | Current stock level |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `product_id` → `products.id` (NO ACTION)

---

### `stock_movements`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `product_id` | bigint unsigned | NO | - | Product reference |
| `type` | enum('SALE_OUT','RETURN_IN','ADJUSTMENT','SYNC_CORRECTION') | NO | - | Movement type |
| `qty_delta` | decimal(12,3) | NO | - | Quantity change |
| `reference_type` | varchar(255) | YES | NULL | Reference entity type |
| `reference_id` | varchar(255) | YES | NULL | Reference entity ID |
| `created_at` | timestamp | YES | NULL | Creation timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `product_id` → `products.id` (NO ACTION)

---

### `refunds`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `sale_id` | bigint unsigned | NO | - | Original sale reference |
| `requested_by` | bigint unsigned | NO | - | User who requested refund |
| `approved_by` | bigint unsigned | YES | NULL | User who approved refund |
| `approved_at` | timestamp | YES | NULL | Approval timestamp |
| `reason` | text | YES | NULL | Refund reason |
| `status` | enum('REQUESTED','APPROVED','COMPLETED') | NO | 'REQUESTED' | Refund status |
| `total_amount` | decimal(12,2) | NO | 0.00 | Total refund amount |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)
- Foreign: `requested_by` → `users.id` (NO ACTION)
- Foreign: `approved_by` → `users.id` (NO ACTION)

---

### `refund_items`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `refund_id` | bigint unsigned | NO | - | Refund reference |
| `sale_item_id` | bigint unsigned | NO | - | Original sale item |
| `product_id` | bigint unsigned | NO | - | Product reference |
| `product_name_snapshot` | varchar(255) | NO | - | Product name snapshot |
| `unit_price` | decimal(12,2) | NO | - | Unit price at refund |
| `qty` | decimal(12,3) | NO | 0.000 | Refunded quantity |
| `created_at` | timestamp | YES | NULL | Creation timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `refund_id` → `refunds.id` (CASCADE)
- Foreign: `sale_item_id` → `sale_items.id` (CASCADE)
- Foreign: `product_id` → `products.id` (NO ACTION)

---

### `approvals`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `action` | enum('DISCOUNT_OVERRIDE','PRICE_OVERRIDE','VOID','REFUND') | NO | - | Approval action type |
| `sale_id` | bigint unsigned | YES | NULL | Related sale (if any) |
| `requested_by` | bigint unsigned | NO | - | User who requested |
| `approved_by` | bigint unsigned | YES | NULL | User who approved |
| `approved_at` | timestamp | YES | NULL | Approval timestamp |
| `reason` | text | YES | NULL | Reason for approval |
| `status` | enum('PENDING','APPROVED','REJECTED') | NO | 'PENDING' | Approval status |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)
- Foreign: `requested_by` → `users.id` (NO ACTION)
- Foreign: `approved_by` → `users.id` (NO ACTION)

---

### `push_subscriptions`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `user_id` | bigint unsigned | NO | - | User reference |
| `endpoint` | text | NO | - | Push endpoint URL |
| `keys_p256dh` | text | NO | - | VAPID public key |
| `keys_auth` | text | NO | - | VAPID auth secret |
| `device_info` | text | YES | NULL | Device information |
| `active` | tinyint(1) | NO | 1 | Subscription active |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `user_id` → `users.id` (CASCADE)

---

### `work_time_logs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `user_id` | bigint unsigned | NO | - | User reference |
| `work_date` | date | NO | - | Work date |
| `start_time` | time | NO | - | Shift start time |
| `end_time` | time | YES | NULL | Shift end time |
| `pause_duration` | int unsigned | NO | 0 | Pause time in seconds |
| `action` | enum('START','PAUSE','RESUME','END') | NO | - | Work action |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | Log timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `user_id` → `users.id` (CASCADE)

---

### `inventory_recommendations`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `product_id` | bigint unsigned | NO | - | Product reference |
| `avg_daily_sales_7d` | decimal(12,3) | NO | 0.000 | 7-day average daily sales |
| `avg_daily_sales_30d` | decimal(12,3) | NO | 0.000 | 30-day average daily sales |
| `lead_time_days` | int | NO | 0 | Supplier lead time |
| `safety_stock` | decimal(12,3) | NO | 0.000 | Safety stock level |
| `reorder_point` | decimal(12,3) | NO | 0.000 | Calculated reorder point |
| `suggested_reorder_qty` | decimal(12,3) | NO | 0.000 | Recommended reorder quantity |
| `computed_at` | timestamp | YES | NULL | Recommendation computed time |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `product_id` → `products.id` (CASCADE)

---

### `receipt_templates`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `name` | varchar(255) | NO | - | Template name |
| `version` | varchar(50) | NO | '1.0' | Template version |
| `is_active` | tinyint(1) | NO | 1 | Active status |
| `template_json` | json | NO | - | Template configuration |
| `created_by` | bigint unsigned | NO | - | Creator user reference |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `created_by` → `users.id` (NO ACTION)

---

### `receipt_print_logs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `sale_id` | bigint unsigned | NO | - | Sale reference |
| `template_id` | bigint unsigned | NO | - | Template reference |
| `printed_by` | bigint unsigned | NO | - | Printer user reference |
| `status` | enum('SUCCESS','FAILED') | NO | - | Print status |
| `error_message` | text | YES | NULL | Error details |
| `created_at` | timestamp | YES | NULL | Print timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `sale_id` → `sales.id` (CASCADE)
- Foreign: `template_id` → `receipt_templates.id` (NO ACTION)
- Foreign: `printed_by` → `users.id` (NO ACTION)

---

### `audit_logs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `actor_id` | bigint unsigned | NO | - | Actor user reference |
| `event` | varchar(255) | NO | - | Event type |
| `entity_type` | varchar(255) | NO | - | Entity type |
| `entity_id` | bigint unsigned | NO | - | Entity ID |
| `meta_json` | json | YES | NULL | Additional metadata |
| `occurred_at` | timestamp | YES | NULL | Event timestamp |
| `created_at` | timestamp | YES | NULL | Log timestamp |

**Indexes:**
- Primary: `id`
- Foreign: `actor_id` → `users.id` (NO ACTION)

---

### `failed_jobs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `uuid` | varchar(255) | NO | - | Unique UUID |
| `connection` | text | NO | - | Queue connection name |
| `queue` | text | NO | - | Queue name |
| `payload` | longtext | NO | - | Job payload |
| `exception` | longtext | NO | - | Exception details |
| `failed_at` | timestamp | NO | CURRENT_TIMESTAMP | Failure timestamp |

**Indexes:**
- Primary: `id`
- Unique: `uuid`

---

### `jobs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `queue` | varchar(255) | NO | - | Queue name |
| `payload` | longtext | NO | - | Job payload |
| `attempts` | tinyint unsigned | NO | 0 | Number of attempts |
| `reserved_at` | int unsigned | YES | NULL | Reserved timestamp |
| `available_at` | int unsigned | NO | - | Available timestamp |
| `created_at` | int unsigned | NO | - | Creation timestamp |

**Indexes:**
- Primary: `id`
- Index: `queue`

---

### `sync_batches`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `device_id` | varchar(255) | NO | - | Device identifier |
| `batch_uuid` | char(36) | NO | - | Batch UUID |
| `status` | enum('RECEIVED','PROCESSED','FAILED') | NO | 'RECEIVED' | Batch status |
| `error_message` | text | YES | NULL | Error details |
| `retry_count` | int | NO | 0 | Retry attempts |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `processed_at` | timestamp | YES | NULL | Processing timestamp |

**Indexes:**
- Primary: `id`

---

### `sync_idempotency_keys`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint unsigned | NO | - | Primary key |
| `local_txn_uuid` | char(36) | NO | - | Local transaction UUID |
| `device_id` | varchar(255) | NO | - | Device identifier |
| `ref_id` | bigint unsigned | NO | - | Reference entity ID |
| `ref_type` | varchar(255) | NO | - | Reference entity type |
| `created_at` | timestamp | YES | NULL | Creation timestamp |

**Indexes:**
- Primary: `id`
- Unique: `local_txn_uuid`, `device_id`

---

### Status Enums

**`sales.status`:**
- `DRAFT` - Sale draft
- `PENDING_PAYMENT` - Waiting for payment
- `PAID` - Payment received
- `VOID` - Sale cancelled
- `SYNC_FAILED` - Sync failed

**`refunds.status`:**
- `REQUESTED` - Refund requested
- `APPROVED` - Refund approved
- `COMPLETED` - Refund completed

**`approvals.status`:**
- `PENDING` - Waiting for approval
- `APPROVED` - Approved
- `REJECTED` - Rejected

**`work_time_logs.action`:**
- `START` - Shift started
- `PAUSE` - Shift paused
- `RESUME` - Shift resumed
- `END` - Shift ended

**`stock_movements.type`:**
- `SALE_OUT` - Stock decreased due to sale
- `RETURN_IN` - Stock increased due to return
- `ADJUSTMENT` - Manual stock adjustment
- `SYNC_CORRECTION` - Stock correction from sync

**`receipt_print_logs.status`:**
- `SUCCESS` - Print successful
- `FAILED` - Print failed

**`sync_batches.status`:**
- `RECEIVED` - Batch received
- `PROCESSED` - Batch processed
- `FAILED` - Batch processing failed

---

*Last updated: June 28, 2026*
