# Referensi Eloquent Models

Dokumen ini menyediakan referensi komprehensif untuk semua Eloquent models di aplikasi PayTo.

## Daftar Isi

- [AppSetting](#appsetting)
- [Approval](#approval)
- [AuditLog](#auditlog)
- [InventoryRecommendation](#inventoryrecommendation)
- [Payment](#payment)
- [Product](#product)
- [PushSubscription](#pushsubscription)
- [Refund](#refund)
- [RefundItem](#refunditem)
- [ReceiptPrintLog](#receiptprintlog)
- [ReceiptTemplate](#receipttemplate)
- [Sale](#sale)
- [SaleItem](#saleitem)
- [StockItem](#stockitem)
- [StockMovement](#stockmovement)
- [SyncBatch](#syncbatch)
- [SyncIdempotencyKey](#syncidempotencykey)
- [User](#user)

---

## AppSetting

Pengaturan aplikasi yang disimpan sebagai key-value pairs dengan informasi type.

**Tabel:** `app_settings`

**Fillable:**
- `key` (string)
- `value` (array, cast)
- `type` (string)

**Casts:**
- `value` => `array`

**Relationships:**
- None

**Methods:**
- None

**Notes:**
- Tidak menggunakan timestamps (`$timestamps = false`)
- Digunakan untuk konfigurasi dinamis yang dapat diupdate tanpa perlu ubah code

---

## Approval

Melacak approval requests untuk berbagai actions (refund, dll) dengan workflow approval supervisor.

**Tabel:** `approvals`

**Fillable:**
- `action` (string)
- `sale_id` (integer)
- `requested_by` (integer, foreign key ke users)
- `approved_by` (integer, foreign key ke users)
- `status` (string)
- `reason` (text)
- `payload_json` (json, cast)
- `occurred_at` (datetime, cast)

**Casts:**
- `payload_json` => `array`
- `occurred_at` => `datetime`

**Relationships:**
- `sale()` - BelongsTo: Sale
- `requester()` - BelongsTo: User (requested_by)
- `approver()` - BelongsTo: User (approved_by)

**Methods:**
- None

---

## AuditLog

Merekam events dan perubahan sistem-wide untuk tujuan audit.

**Tabel:** `audit_logs`

**Fillable:**
- `actor_id` (integer, foreign key ke users)
- `event` (string)
- `entity_type` (string)
- `entity_id` (integer)
- `meta_json` (json, cast)
- `occurred_at` (datetime, cast)

**Casts:**
- `meta_json` => `array`
- `occurred_at` => `datetime`

**Relationships:**
- `actor()` - BelongsTo: User

**Methods:**
- None

---

## InventoryRecommendation

Rekomendasi yang digenerate untuk restocking produk berdasarkan sales history.

**Tabel:** `inventory_recommendations`

**Fillable:**
- `product_id` (integer, foreign key ke products)
- `avg_daily_sales_7d` (decimal:3, cast)
- `avg_daily_sales_30d` (decimal:3, cast)
- `lead_time_days` (integer)
- `safety_stock` (decimal:3, cast)
- `reorder_point` (decimal:3, cast)
- `suggested_reorder_qty` (decimal:3, cast)
- `computed_at` (datetime, cast)

**Casts:**
- `avg_daily_sales_7d` => `decimal:2`
- `avg_daily_sales_30d` => `decimal:2`
- `safety_stock` => `decimal:2`
- `reorder_point` => `decimal:2`
- `suggested_reorder_qty` => `decimal:2`
- `computed_at` => `datetime`

**Relationships:**
- `product()` - BelongsTo: Product

**Methods:**
- None

---

## Payment

Merekam payment methods dan amounts untuk sales.

**Tabel:** `payments`

**Fillable:**
- `sale_id` (integer, foreign key ke sales)
- `method` (string)
- `amount` (decimal:2, cast)
- `reference` (string)
- `status` (string)

**Casts:**
- `amount` => `decimal:2`

**Relationships:**
- `sale()` - BelongsTo: Sale

---

## Product

Produk catalog dengan pricing dan inventory tracking.

**Tabel:** `products`

**Fillable:**
- `name` (string)
- `sku` (string)
- `barcode` (string)
- `price` (decimal:2, cast)
- `cost` (decimal:2, cast)
- `discount` (decimal:2, cast)
- `uom` (string)
- `is_active` (boolean, cast)
- `product_type` (string)

**Casts:**
- `price` => `decimal:2`
- `cost` => `decimal:2`
- `discount` => `decimal:2`
- `is_active` => `boolean`

**Relationships:**
- `stockItem()` - HasOne: StockItem
- `saleItems()` - HasMany: SaleItem
- `refunds()` - HasMany: Refund
- `category()` - BelongsTo: Category

**Methods:**
- `isLowStock()` - Check if stock below reorder point

---

## PushSubscription

Web push notification subscription data untuk users.

**Tabel:** `push_subscriptions`

**Fillable:**
- `user_id` (integer, foreign key ke users)
- `endpoint` (string)
- `keys` (json, cast)
- `device_info` (text)
- `active` (boolean, cast)

**Casts:**
- `keys` => `array`
- `active` => `boolean`

**Relationships:**
- `user()` - BelongsTo: User

**Methods:**
- `getHeaders()` - Get WebPush headers for sending notifications

---

## Refund

Product refund records dengan approval workflow.

**Tabel:** `refunds`

**Fillable:**
- `sale_id` (integer, foreign key ke sales)
- `requested_by` (integer, foreign key ke users)
- `approved_by` (integer, foreign key ke users)
- `approved_at` (datetime, cast)
- `reason` (text)
- `status` (string)
- `total_amount` (decimal:2, cast)
- `refund_method` (string)
- `note` (text)

**Casts:**
- `total_amount` => `decimal:2`
- `approved_at` => `datetime`

**Relationships:**
- `sale()` - BelongsTo: Sale
- `requestedBy()` - BelongsTo: User
- `approvedBy()` - BelongsTo: User
- `items()` - HasMany: RefundItem

**Methods:**
- `approve($note)` - Approve refund
- `reject($reason)` - Reject refund

---

## RefundItem

Individual refunded items dalam refund.

**Tabel:** `refund_items`

**Fillable:**
- `refund_id` (integer, foreign key ke refunds)
- `sale_item_id` (integer, foreign key ke sale_items)
- `product_id` (integer, foreign key ke products)
- `product_name_snapshot` (string)
- `unit_price` (decimal:2, cast)
- `qty` (decimal:3, cast)

**Casts:**
- `unit_price` => `decimal:2`
- `qty` => `decimal:3`

**Relationships:**
- `refund()` - BelongsTo: Refund
- `saleItem()` - BelongsTo: SaleItem
- `product()` - BelongsTo: Product

---

## ReceiptPrintLog

Melacak kapan receipts dicetak, termasuk template dan user info.

**Tabel:** `receipt_print_logs`

**Fillable:**
- `sale_id` (integer, foreign key ke sales)
- `template_id` (integer, foreign key ke receipt_templates)
- `printed_by` (integer, foreign key ke users)
- `printed_at` (datetime, cast)

**Casts:**
- `printed_at` => `datetime`

**Relationships:**
- `sale()` - BelongsTo: Sale
- `template()` - BelongsTo: ReceiptTemplate
- `printer()` - BelongsTo: User

---

## ReceiptTemplate

Menyimpan receipt template configurations dalam format JSON.

**Tabel:** `receipt_templates`

**Fillable:**
- `name` (string)
- `version` (string)
- `is_active` (boolean, cast)
- `template_json` (json, cast)
- `created_by` (integer, foreign key ke users)

**Casts:**
- `is_active` => `boolean`
- `template_json` => `array`

**Relationships:**
- `creator()` - BelongsTo: User

---

## Sale

Main sales transaction records dengan totals dan sync status.

**Tabel:** `sales`

**Fillable:**
- `server_invoice_no` (string)
- `local_txn_uuid` (string)
- `status` (string)
- `cashier_id` (integer, foreign key ke users)
- `subtotal` (decimal:2, cast)
- `discount_total` (decimal:2, cast)
- `tax_total` (decimal:2, cast)
- `grand_total` (decimal:2, cast)
- `paid_total` (decimal:2, cast)
- `change_total` (decimal:2, cast)
- `occurred_at` (datetime, cast)
- `synced_at` (datetime, cast)

**Casts:**
- `subtotal` => `decimal:2`
- `discount_total` => `decimal:2`
- `tax_total` => `decimal:2`
- `grand_total` => `decimal:2`
- `paid_total` => `decimal:2`
- `change_total` => `decimal:2`
- `occurred_at` => `datetime`
- `synced_at` => `datetime`

**Relationships:**
- `cashier()` - BelongsTo: User
- `items()` - HasMany: SaleItem
- `payments()` - HasMany: Payment
- `refunds()` - HasMany: Refund
- `syncBatch()` - BelongsTo: SyncBatch

**Methods:**
- `isPaid()` - Check if sale is paid
- `canBeRefunded()` - Check if sale can be refunded

---

## SaleItem

Individual items dalam sale transaction.

**Tabel:** `sale_items`

**Fillable:**
- `sale_id` (integer, foreign key ke sales)
- `product_id` (integer, foreign key ke products)
- `product_name_snapshot` (string)
- `unit_price` (decimal:2, cast)
- `qty` (decimal:3, cast)
- `discount_amount` (decimal:2, cast)

**Casts:**
- `unit_price` => `decimal:2`
- `qty` => `decimal:3`
- `discount_amount` => `decimal:2`

**Relationships:**
- `sale()` - BelongsTo: Sale
- `product()` - BelongsTo: Product
- `refundItems()` - HasMany: RefundItem

---

## StockItem

Inventory stock levels per product.

**Tabel:** `stock_items`

**Fillable:**
- `product_id` (integer, foreign key ke products)
- `on_hand` (decimal:3, cast)

**Casts:**
- `on_hand` => `decimal:3`

**Relationships:**
- `product()` - BelongsTo: Product

---

## StockMovement

Historical stock movement records.

**Tabel:** `stock_movements`

**Fillable:**
- `product_id` (integer, foreign key ke products)
- `type` (enum: SALE_OUT, RETURN_IN, ADJUSTMENT, SYNC_CORRECTION)
- `qty_delta` (decimal:3, cast)
- `reference_type` (string)
- `reference_id` (string)
- `created_at` (timestamp)

**Casts:**
- `qty_delta` => `decimal:3`

**Relationships:**
- `product()` - BelongsTo: Product

---

## SyncBatch

Tracks batch synchronization attempts dengan status dan error handling.

**Tabel:** `sync_batches`

**Fillable:**
- `device_id` (string)
- `batch_uuid` (string)
- `status` (enum: RECEIVED, PROCESSED, FAILED)
- `error_message` (text)
- `retry_count` (integer)
- `created_at` (timestamp)
- `processed_at` (timestamp)

**Methods:**
- None

---

## SyncIdempotencyKey

Tracks idempotency keys untuk sync operations untuk mencegah duplicate processing.

**Tabel:** `sync_idempotency_keys`

**Fillable:**
- `local_txn_uuid` (string)
- `device_id` (string)
- `ref_id` (integer)
- `ref_type` (string)

**Relationships:**
- None

---

## User

System users (cashiers, supervisors) dengan role-based access.

**Tabel:** `users`

**Fillable:**
- `name` (string)
- `username` (string)
- `password` (string)
- `pin` (string)
- `role` (enum: CASHIER, SUPERVISOR)
- `status` (string)
- `last_login_at` (timestamp)
- `last_logout_at` (timestamp)
- `work_date` (date)
- `work_seconds` (integer)

**Casts:**
- `password` => `hashed`
- `pin` => `hashed`
- `last_login_at` => `datetime`
- `last_logout_at` => `datetime`

**Relationships:**
- `sales()` - HasMany: Sale
- `refundsRequested()` - HasMany: Refund
- `refundsApproved()` - HasMany: Refund
- `workTimeLogs()` - HasMany: WorkTimeLog
- `pushSubscriptions()` - HasMany: PushSubscription
- `auditLogs()` - HasMany: AuditLog
- `receiptsPrinted()` - HasMany: ReceiptPrintLog
- `approvals()` - HasMany: Approval
- `createdReceiptTemplates()` - HasMany: ReceiptTemplate

**Methods:**
- `isCashier()` - Check if user role is CASHIER
- `isSupervisor()` - Check if user role is SUPERVISOR
- `canManageProducts()` - Check if user can manage products
- `canApproveRefunds()` - Check if user can approve refunds

---

## Summary Statistics

- **Total Models:** 17
- **Models dengan Timestamps:** 13
- **Models tanpa Timestamps:** 4 (AppSetting, SyncIdempotencyKey, dan lainnya tanpa timestamps)
- **Models dengan JSON Fields:** 7 (AppSetting, Approval, InventoryRecommendation, ReceiptTemplate, dll)
- **Kompleksitas Relasi Terbanyak:** User (11 relationships)
- **Models Termudah:** SyncIdempotencyKey, AppSetting

## Database Connection

Semua models menggunakan default database connection yang dikonfigurasi di `config/database.php`.

## Migration References

Lihat `database/migrations/` untuk schema definitions yang sesuai dengan setiap model.
