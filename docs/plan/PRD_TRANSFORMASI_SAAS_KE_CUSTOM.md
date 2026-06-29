# PRD: Transformasi PayTo dari Konsep SaaS ke Aplikasi Custom Single-Tenant

**Dibuat:** 29 Juni 2026  
**Versi:** 1.0  
**Status:** Ready for Implementation  

---

## Problem Statement

PayTo saat ini dibangun sebagai aplikasi Point of Sale (POS) dengan arsitektur yang mengarah ke multi-tenant SaaS, namun dalam praktiknya hanya akan digunakan oleh satu mitra secara eksklusif. Arsitektur SaaS membawa kompleksitas yang tidak diperlukan (tenant isolation, multi-tenant database design, billing system) sementara kebutuhan bisnis yang sebenarnya adalah:

1. **Pelanggan end-user tidak memiliki akses** - Sistem hanya untuk internal kasir dan admin
2. **Tidak ada katalog publik** - Produk tidak bisa dilihat oleh pengunjung/calon pembeli
3. **Pemesanan manual via WhatsApp** - Pelanggan memesan lewat WA, kemudian kasir/admin input manual ke sistem
4. **Single tenant deployment** - Hanya satu mitra, tidak perlu multi-tenant isolation

Sebagai akibatnya, mitra kehilangan **3 opportunity penting**:
- Landing page untuk showcase produk ke calon pembeli
- Katalog online yang bisa diakses publik untuk meningkatkan brand awareness
- Integrasi WhatsApp yang memudahkan pemesanan pelanggan

Transformasi ini akan mengubah PayTo dari "internal-only POS system" menjadi **"POS + E-commerce Hybrid untuk single tenant"** dengan tetap mempertahankan fitur POS yang sudah ada.

---

## Solution

Transformasi PayTo menjadi aplikasi **custom single-tenant** dengan penambahan 3 fitur customer-facing:

### 1. Landing Page untuk Guest Users
- Halaman utama yang showcase produk unggulan dan informasi toko
- Tidak perlu login untuk mengakses
- Call-to-action untuk pemesanan via WhatsApp

### 2. Katalog Produk Publik
- Daftar lengkap produk dengan foto, harga, dan ketersediaan stok
- Fitur search dan filter berdasarkan kategori
- Guest users bisa browse tanpa registrasi
- Responsive design untuk mobile browsing

### 3. Pemesanan via WhatsApp
- Tombol "Pesan via WhatsApp" pada setiap produk
- Pre-filled WhatsApp message dengan detail produk
- Admin/kasir menerima order via WA, lalu input ke sistem POS
- Tracking order yang dibuat dari WhatsApp order

### Arsitektur Baru
- **Hapus multi-tenant abstractions** - Single database, single deployment
- **Simplifikasi authentication** - Tidak perlu tenant isolation logic
- **Public routes untuk guest** - `/` dan `/katalog` accessible tanpa auth
- **Role baru: GUEST** - View-only access untuk katalog

---

## User Stories

### Guest User (Calon Pembeli)

1. Sebagai pengunjung website, saya ingin melihat landing page yang menarik dengan informasi toko dan produk unggulan, sehingga saya tertarik untuk membeli
2. Sebagai calon pembeli, saya ingin melihat katalog produk lengkap dengan foto dan harga, sehingga saya bisa memutuskan produk mana yang ingin dibeli
3. Sebagai calon pembeli, saya ingin bisa search produk berdasarkan nama, sehingga saya cepat menemukan yang saya cari
4. Sebagai calon pembeli, saya ingin filter produk berdasarkan kategori, sehingga saya hanya lihat produk yang relevan
5. Sebagai calon pembeli, saya ingin melihat apakah produk tersedia (in stock), sehingga saya tidak memesan barang yang kosong
6. Sebagai calon pembeli, saya ingin klik tombol "Pesan via WhatsApp" pada produk, sehingga saya langsung bisa chat dengan toko
7. Sebagai calon pembeli, saya ingin WhatsApp message sudah terisi detail produk (nama, harga, qty), sehingga saya tidak perlu ketik manual
8. Sebagai mobile user, saya ingin katalog bisa diakses dengan lancar di smartphone, sehingga saya bisa browse sambil mobile
9. Sebagai pengunjung, saya ingin lihat jam operasional dan informasi kontak toko, sehingga saya tahu kapan bisa order
10. Sebagai pengunjung, saya ingin melihat testimoni atau produk terlaris, sehingga saya punya referensi produk yang recommended

### Kasir (Existing Role - Enhanced)

11. Sebagai kasir, saya ingin menerima notifikasi WhatsApp ketika ada order baru dari pelanggan, sehingga saya bisa segera proses
12. Sebagai kasir, saya ingin bisa input transaksi dengan flag "WhatsApp Order", sehingga saya bisa tracking order source
13. Sebagai kasir, saya ingin copy-paste detail order dari WhatsApp ke form checkout, sehingga input lebih cepat
14. Sebagai kasir, saya ingin field tambahan untuk nomor WhatsApp pelanggan pada transaksi, sehingga saya bisa follow-up
15. Sebagai kasir, saya tetap bisa proses transaksi walk-in customer seperti biasa tanpa gangguan fitur baru

### Admin/Supervisor (Existing Role - Enhanced)

16. Sebagai admin, saya ingin upload foto produk untuk ditampilkan di katalog, sehingga produk lebih menarik
17. Sebagai admin, saya ingin set produk mana yang ditampilkan di katalog publik (featured), sehingga saya kontrol visibility
18. Sebagai admin, saya ingin edit konten landing page (banner, description, contact info), sehingga saya bisa update informasi toko
19. Sebagai admin, saya ingin lihat laporan transaksi berdasarkan source (walk-in vs WhatsApp order), sehingga saya tahu efektivitas channel
20. Sebagai admin, saya ingin disable katalog publik sementara jika diperlukan, sehingga saya punya kontrol penuh
21. Sebagai admin, saya ingin set minimum order untuk WhatsApp order, sehingga tidak ada order kecil yang tidak ekonomis
22. Sebagai admin, saya ingin customize WhatsApp message template, sehingga format order sesuai kebutuhan
23. Sebagai admin, saya ingin analytics berapa banyak klik "Pesan via WhatsApp" per produk, sehingga saya tahu produk mana yang paling diminati

### Developer/Maintainer

24. Sebagai developer, saya ingin remove semua multi-tenant logic yang tidak terpakai, sehingga codebase lebih sederhana
25. Sebagai developer, saya ingin hapus fitur-fitur SaaS yang tidak diperlukan (billing, subscriptions, tenant management), sehingga aplikasi lebih fokus
26. Sebagai developer, saya ingin database schema yang simplified tanpa tenant_id, sehingga queries lebih cepat
27. Sebagai developer, saya ingin public API endpoints yang well-documented untuk katalog, sehingga future integration mudah
28. Sebagai developer, saya ingin environment variable untuk enable/disable fitur katalog publik, sehingga flexible untuk deployment
29. Sebagai developer, saya ingin migration script yang backward-compatible, sehingga data existing tidak hilang

---

## Implementation Decisions

### Arsitektur & Breaking Changes

**Hapus Multi-Tenant Abstractions:**
- Remove `tenant_id` columns dari semua tables (jika ada)
- Hapus tenant scoping logic dari Eloquent models
- Simplify middleware stack - remove tenant resolution middleware
- Single database deployment - tidak perlu database per tenant
- Hardcode business info di config atau app_settings table

**Public Access Layer:**
- Buat route group `web.public` untuk landing page dan katalog
- Tidak require authentication untuk route group ini
- CSRF protection tetap aktif tapi tidak check auth
- Rate limiting untuk prevent scraping (60 requests/minute per IP)

**Role & Permission Model:**
- Keep existing roles: KASIR, SUPERVISOR
- TIDAK perlu role GUEST - anonymous access is enough
- Add permission check: `can_view_admin` vs `can_view_public`

### Database Schema Changes

**Tabel Baru: `product_images`**
```sql
CREATE TABLE product_images (
  id BIGINT UNSIGNED PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

**Tabel Baru: `landing_page_settings`**
```sql
CREATE TABLE landing_page_settings (
  id BIGINT UNSIGNED PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  type ENUM('text', 'image', 'json') DEFAULT 'text',
  updated_at TIMESTAMP
)
```
- Menyimpan: hero_title, hero_subtitle, hero_image, about_us, contact_whatsapp, operating_hours

**Tabel Modified: `products`**
- Add column: `is_public BOOLEAN DEFAULT TRUE` - apakah ditampilkan di katalog publik
- Add column: `featured BOOLEAN DEFAULT FALSE` - produk unggulan di landing page
- Add column: `description TEXT NULL` - deskripsi lengkap untuk katalog

**Tabel Modified: `sales`**
- Add column: `source ENUM('WALK_IN', 'WHATSAPP', 'ONLINE') DEFAULT 'WALK_IN'`
- Add column: `customer_phone VARCHAR(20) NULL` - nomor WA pelanggan
- Add column: `customer_name VARCHAR(255) NULL` - nama pelanggan (untuk WA order)

**Tabel Modified: `categories` (jika belum ada, buat baru)**
```sql
CREATE TABLE categories (
  id BIGINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```
- Add foreign key ke `products.category_id`

### API Endpoints Baru

**Public Endpoints (No Auth Required):**

```
GET /                                    - Landing page
GET /katalog                             - Katalog produk (list view)
GET /katalog/{slug}                      - Detail produk
GET /api/public/products                 - API untuk fetch products (dengan pagination)
GET /api/public/products/{id}            - API untuk fetch product detail
GET /api/public/categories               - API untuk fetch categories
GET /api/public/settings                 - API untuk fetch landing page settings
```

**Admin Endpoints (Auth Required - SUPERVISOR):**

```
POST /api/admin/products/{id}/images     - Upload product images
DELETE /api/admin/products/images/{id}   - Delete product image
PUT /api/admin/products/{id}/visibility  - Toggle public visibility
PUT /api/admin/landing-page/settings     - Update landing page content
GET /api/admin/analytics/whatsapp-clicks - Analytics untuk WA clicks
```

**Enhanced POS Endpoints:**

```
POST /api/pos/checkout                   - Enhanced dengan field: source, customer_phone, customer_name
GET /api/admin/sales?source=WHATSAPP     - Filter sales by source
```

### Frontend Components

**Public-Facing Pages (New):**

1. **LandingPage.jsx**
   - Hero section dengan CTA
   - Featured products grid (6-8 produk)
   - About us section
   - Contact & operating hours
   - Footer dengan social media links

2. **KatalogPage.jsx**
   - Product grid dengan infinite scroll atau pagination
   - Search bar di top
   - Category filter sidebar
   - Sort options (harga, nama, terbaru)
   - "Pesan via WhatsApp" button per product

3. **ProductDetailPage.jsx**
   - Product image carousel
   - Product name, price, stock status
   - Description
   - "Pesan via WhatsApp" button (large, prominent)
   - Related products section

**Admin Pages (Enhanced):**

4. **ProductManagement.jsx** (enhanced)
   - Upload multiple images per product
   - Toggle public visibility checkbox
   - Mark as featured checkbox
   - Edit description field (rich text editor optional)

5. **LandingPageEditor.jsx** (new)
   - Form untuk edit hero title/subtitle
   - Upload hero image
   - Edit about us content
   - Update contact info & WhatsApp number
   - Edit operating hours

6. **AnalyticsDashboard.jsx** (enhanced)
   - Chart: Walk-in vs WhatsApp orders
   - Table: Top products by WhatsApp clicks
   - Conversion rate: views → WhatsApp clicks

**POS Pages (Minor Enhancement):**

7. **CheckoutForm.jsx** (enhanced)
   - Dropdown untuk order source
   - Conditional fields: jika source = WHATSAPP, tampilkan customer_phone & customer_name

### WhatsApp Integration

**Template Message Format:**
```
Halo, saya tertarik dengan produk:

Nama: {product_name}
Harga: Rp {price}
Qty: 1

Apakah produk ini tersedia?
```

**Implementation:**
- Gunakan `window.open()` atau `<a href="https://wa.me/{phone}?text={encoded_message}">`
- Phone number dari `landing_page_settings.contact_whatsapp`
- Encode message dengan `encodeURIComponent()`
- Track clicks dengan analytics event (optional: simpan di DB)

**Admin Control:**
- Setting: minimum order amount untuk WhatsApp order
- Setting: custom WhatsApp message template (dengan placeholder variables)
- Setting: enable/disable WhatsApp button globally

### File Upload & Storage

**Product Images:**
- Storage: `storage/app/public/products/{product_id}/{filename}`
- Symlink: `public/storage` → `storage/app/public`
- Max size: 2MB per image
- Max images per product: 5
- Supported formats: jpg, jpeg, png, webp
- Image processing: resize to 800x800 (maintain aspect ratio), generate thumbnail 200x200

**Landing Page Assets:**
- Storage: `storage/app/public/landing/{filename}`
- Hero image: max 5MB, recommended 1920x1080
- Logo: max 1MB, recommended 512x512

**File Upload Handler:**
- Use Laravel's `store()` method dengan unique filename
- Validation via `mimes:jpg,jpeg,png,webp|max:2048`
- Delete old files ketika replace image

### Configuration & Feature Flags

**Environment Variables (.env):**
```bash
# Feature Flags
KATALOG_ENABLED=true
LANDING_PAGE_ENABLED=true
WHATSAPP_ORDER_ENABLED=true

# Business Info
BUSINESS_NAME="PayTo Store"
BUSINESS_WHATSAPP="6281234567890"
BUSINESS_ADDRESS="Jl. Contoh No. 123, Jakarta"

# Catalog Settings
CATALOG_PRODUCTS_PER_PAGE=24
CATALOG_CACHE_TTL=3600  # 1 hour
```

**Config File (config/catalog.php):**
```php
return [
    'enabled' => env('KATALOG_ENABLED', false),
    'products_per_page' => env('CATALOG_PRODUCTS_PER_PAGE', 24),
    'cache_ttl' => env('CATALOG_CACHE_TTL', 3600),
    'whatsapp' => [
        'enabled' => env('WHATSAPP_ORDER_ENABLED', true),
        'phone' => env('BUSINESS_WHATSAPP'),
        'message_template' => env('WHATSAPP_MESSAGE_TEMPLATE', 'Halo, saya tertarik dengan produk: {product_name}...'),
    ],
];
```

### Fitur yang Dihapus (Breaking Changes)

**Remove Unused SaaS Features:**
1. Multi-tenant isolation logic (middleware, scopes)
2. Tenant management UI (create/delete tenant)
3. Billing & subscription system (jika ada)
4. User registration flow (aplikasi custom, user dibuat oleh admin)
5. Forgot password flow untuk public users (keep untuk internal staff)
6. API rate limiting per tenant (ganti dengan global rate limiting)

**Simplify Database:**
1. Drop column `tenant_id` dari semua tables (via migration)
2. Drop table `tenants` (jika ada)
3. Drop table `subscriptions` (jika ada)

**Simplify Auth:**
1. Remove tenant resolution dari login flow
2. Remove tenant context switching logic
3. Keep session-based auth untuk staff
4. Add public route group tanpa auth

### Migration Strategy

**Phase 1: Database Schema (Non-Breaking)**
```bash
php artisan make:migration add_catalog_support_to_products
php artisan make:migration create_product_images_table
php artisan make:migration create_landing_page_settings_table
php artisan make:migration add_whatsapp_fields_to_sales
php artisan make:migration create_categories_table
```

**Phase 2: Remove Multi-Tenant (Breaking)**
```bash
php artisan make:migration remove_tenant_id_from_all_tables --risk-breaking
php artisan make:migration drop_tenants_table --risk-breaking
```

**Phase 3: Seed Initial Data**
```bash
php artisan db:seed --class=LandingPageSettingsSeeder
php artisan db:seed --class=CategoriesSeeder
```

**Rollback Plan:**
- Backup database sebelum migration
- Keep tenant_id columns commented (jangan drop immediately)
- Feature flag untuk enable/disable katalog publik
- Gradual rollout: test di staging dulu sebelum production

---

## Testing Decisions

### Testing Seams

**Highest Seam: Feature Tests (HTTP Level)**
- Test public routes accessible tanpa auth
- Test katalog page rendering dengan products
- Test WhatsApp link generation
- Test admin dapat upload product images
- Test product visibility toggle

**Model Seam: Unit Tests**
- Test `Product::scopePublic()` hanya return `is_public = true`
- Test `Product::scopeFeatured()` hanya return `featured = true`
- Test `ProductImage` relationship dengan `Product`
- Test `LandingPageSetting` accessor untuk JSON values

**Service Seam: Integration Tests**
- Test `CheckoutProcessor` dengan source = WHATSAPP
- Test `ProductSearchService` dengan filters
- Test `LandingPageService` untuk fetch settings

### Test Cases (Good Tests = Test External Behavior)

**Public Catalog Tests:**
```php
// tests/Feature/PublicCatalogTest.php
test('guest can view landing page')
test('guest can view katalog page')
test('guest can view product detail')
test('guest cannot view admin pages')
test('katalog shows only public products')
test('katalog does not show inactive products')
test('search returns matching products')
test('filter by category returns correct products')
test('WhatsApp link contains correct phone and message')
```

**Admin Product Management Tests:**
```php
// tests/Feature/Admin/ProductManagementTest.php
test('admin can upload product image')
test('admin can delete product image')
test('admin can toggle product visibility')
test('admin can mark product as featured')
test('admin can edit product description')
test('non-admin cannot access product management')
```

**POS Enhanced Tests:**
```php
// tests/Feature/PosCheckoutTest.php
test('checkout can include WhatsApp order source')
test('checkout stores customer phone and name')
test('checkout validates phone number format')
test('sales can be filtered by source')
```

**What Makes a Good Test:**
- Test external behavior (API responses, page rendering), not internal implementation
- Don't test private methods or internal state
- Use factories for test data setup
- Mock external services (WhatsApp API jika ada)
- Avoid testing framework code (Laravel's validation, routing)

**Prior Art:**
- Existing test: `tests/Feature/PosCheckoutTest.php` - untuk test checkout flow
- Existing test: `tests/Feature/ProductManagementTest.php` - untuk test CRUD products
- Follow same pattern untuk test fitur baru

---

## Out of Scope

**Fitur yang TIDAK Termasuk PRD Ini:**

1. **WhatsApp Business API Integration** - Versi ini menggunakan WhatsApp click-to-chat (wa.me link), bukan Business API. Integrasi API penuh memerlukan setup dan biaya tersendiri.

2. **Online Payment Gateway** - Pembayaran tetap manual (cash/e-wallet di toko). Tidak ada integrasi payment gateway untuk online payment.

3. **Shopping Cart untuk Guest** - Guest hanya bisa lihat katalog, tidak bisa add to cart. Order tetap via WhatsApp.

4. **User Registration untuk Pelanggan** - Tidak ada sistem registrasi untuk end customers. Mereka tetap anonymous guests.

5. **Order Tracking untuk Pelanggan** - Tidak ada portal untuk pelanggan track order mereka. Tracking manual via WhatsApp chat.

6. **Delivery Management** - Tidak ada sistem manajemen pengiriman. Koordinasi delivery via WhatsApp.

7. **Multi-Language Support** - Aplikasi tetap bahasa Indonesia only.

8. **Mobile App Native** - Tetap web-based PWA, tidak build native iOS/Android app.

9. **Advanced Analytics** - Analytics dasar only (sales by source, WA clicks). Tidak include advanced BI/dashboard seperti cohort analysis, customer lifetime value, dll.

10. **Inventory Auto-Replenishment** - Keep existing inventory recommendations, tidak auto-generate PO ke supplier.

11. **Multi-Store Support** - Single location only. Jika future perlu multi-store, itu PRD terpisah.

12. **API untuk Third-Party Integration** - API hanya untuk internal frontend, tidak documented/supported untuk third-party developers.

13. **SEO Optimization** - Basic meta tags only, tidak include comprehensive SEO strategy (schema markup, sitemap optimization, dll).

14. **Social Media Integration** - Tidak include Instagram Shopping, Facebook Marketplace integration.

15. **Loyalty Program** - Tidak ada points, rewards, membership tiers untuk pelanggan.

---

## Further Notes

### Why This Approach?

**Arsitektur Hybrid:**
Daripada membangun aplikasi terpisah untuk katalog online, kita integrasikan langsung ke aplikasi POS existing. Ini memberikan beberapa keuntungan:
- **Single Source of Truth** - Product data, stock, pricing semua sinkron real-time
- **Simplified Maintenance** - One codebase, one deployment
- **Unified Admin Panel** - Admin manage products di satu tempat untuk POS dan katalog
- **Cost Efficient** - Tidak perlu infrastructure terpisah

**WhatsApp sebagai Order Channel:**
WhatsApp dipilih karena:
- **Adoption Rate Tinggi** - Hampir semua orang Indonesia punya WhatsApp
- **Low Friction** - Tidak perlu registrasi, install app, atau payment online
- **Personal Touch** - Chat langsung dengan penjual meningkatkan trust
- **Flexible** - Bisa nego harga, tanya detail, request custom order
- **Proven** - Sudah banyak UMKM Indonesia berhasil dengan model ini

**Guest-Only Access:**
Tidak perlu registration untuk guest karena:
- **Lower Barrier to Entry** - Pengunjung langsung bisa browse tanpa friction
- **Privacy** - Tidak perlu share personal data untuk just browsing
- **Simpler UX** - Tidak ada password to remember, email verification, dll
- **Focus on Conversion** - Goal adalah drive ke WhatsApp chat, bukan lock-in ke platform

### Backward Compatibility

**Data Migration:**
- Existing products akan default `is_public = FALSE` (opt-in model)
- Admin perlu manually enable visibility untuk produk yang mau di-publish
- Existing sales data tidak terpengaruh (default `source = WALK_IN`)

**API Compatibility:**
- Existing POS API endpoints tetap backward compatible
- New fields di `checkout` request adalah optional
- Old mobile/frontend apps tetap berfungsi tanpa update

**Feature Flags:**
Semua fitur baru bisa di-disable via environment variables, sehingga:
- Deployment bisa gradual (enable katalog dulu, WhatsApp integration later)
- Rollback mudah jika ada masalah (set `KATALOG_ENABLED=false`)
- Testing di production safe (soft launch dengan katalog hidden dulu)

### Performance Considerations

**Caching Strategy:**
- Cache katalog product list selama 1 jam (configurable)
- Invalidate cache ketika product updated via admin panel
- Use Laravel's cache tags untuk granular invalidation
- Cache landing page settings (jarang berubah)

**Image Optimization:**
- Resize images on upload untuk serve optimal sizes
- Generate multiple sizes: original, large (800px), thumbnail (200px)
- Use lazy loading untuk images di katalog
- Consider CDN untuk static assets (future optimization)

**Database Indexes:**
- Add index pada `products.is_public` untuk fast filtering
- Add index pada `products.featured` untuk landing page query
- Add index pada `sales.source` untuk analytics query
- Add index pada `product_images.product_id` untuk image loading

**Rate Limiting:**
- Public API: 60 requests/minute per IP (prevent scraping)
- Admin API: 100 requests/minute per user
- WhatsApp link clicks: track tapi tidak rate limit (genuine user actions)

### Security Considerations

**Public Access Security:**
- CSRF protection tetap aktif untuk all POST requests
- Rate limiting untuk prevent brute force/scraping
- Input sanitization untuk search query (prevent XSS)
- Validate image uploads untuk prevent malicious files
- No sensitive data exposed di public API (harga, stock ok; cost, profit margin tidak)

**Admin Security (Enhanced):**
- Add security audit untuk semua product visibility changes
- Log landing page content changes (audit trail)
- Require SUPERVISOR role untuk landing page editor
- CSRF tokens untuk image uploads

**WhatsApp Link Security:**
- Don't expose internal IDs di URL (use slug atau public ID)
- Sanitize product name di WhatsApp message (prevent injection)
- Validate phone number format dari settings

### Deployment Checklist

**Pre-Deployment:**
- [ ] Run all migrations di staging
- [ ] Seed landing page settings dengan default values
- [ ] Upload default hero image dan logo
- [ ] Set environment variables (BUSINESS_WHATSAPP, dll)
- [ ] Create storage symlink (`php artisan storage:link`)
- [ ] Test public routes accessible tanpa auth
- [ ] Test admin can upload images
- [ ] Test WhatsApp link generation

**Post-Deployment:**
- [ ] Admin configure landing page content via editor
- [ ] Admin upload product images untuk top products
- [ ] Admin enable `is_public = true` untuk produk yang ready
- [ ] Admin mark featured products untuk landing page
- [ ] Test katalog dari mobile device (responsive check)
- [ ] Share katalog link ke test customers untuk feedback
- [ ] Monitor analytics: page views, WhatsApp clicks

**Rollback Plan:**
- [ ] Backup database sebelum deployment
- [ ] Keep old codebase tagged di git
- [ ] Feature flag untuk disable katalog jika ada critical issue
- [ ] Database rollback script (drop new tables, remove columns)

### Future Enhancements (Post-MVP)

**Phase 2 Features (jika sukses):**
1. **Product Reviews** - Pelanggan bisa review produk setelah beli
2. **Wishlist** - Guest bisa save favorite products (localStorage)
3. **Share Product** - Tombol share ke social media
4. **WhatsApp Business API** - Automated order confirmation via WhatsApp
5. **Basic SEO** - Meta tags, schema markup untuk product pages
6. **Analytics Dashboard** - Comprehensive analytics untuk marketing performance
7. **Promo/Discount Codes** - Support untuk voucher codes dari WA marketing

**Potential SaaS Revival (jika mau scale):**
Jika di future ada plan untuk serve multiple mitra, PRD ini bisa jadi foundation. Tinggal add:
- Re-introduce `tenant_id` atau `merchant_id`
- Tenant subdomain routing (`mitra1.payto.id`)
- Tenant-scoped dashboard
- Tenant onboarding flow

Tapi untuk sekarang, fokus ke single-tenant done well.

---

## Appendix: Glossary

**Guest User** - Pengunjung website yang tidak login, bisa akses landing page dan katalog  
**Featured Product** - Produk unggulan yang ditampilkan di landing page  
**Public Product** - Produk yang visibility-nya enabled untuk katalog publik  
**WhatsApp Order** - Order yang berasal dari klik "Pesan via WhatsApp" di katalog  
**Walk-In Order** - Order dari customer yang datang langsung ke toko (existing flow)  
**Single-Tenant** - Aplikasi digunakan oleh satu bisnis/mitra saja (vs multi-tenant SaaS)  
**Catalog-Enabled** - Fitur katalog publik aktif (controlled by feature flag)  
**Source** - Asal order (WALK_IN, WHATSAPP, atau future: ONLINE)  

---

**Document Status:** Ready for Implementation  
**Next Steps:** 
1. Review PRD dengan stakeholder
2. Create GitHub issues untuk setiap user story
3. Estimate development time (suggested: 2-3 weeks untuk MVP)
4. Begin implementation dengan Phase 1 (database schema)

**Questions/Feedback:** [Hubungi product owner]
