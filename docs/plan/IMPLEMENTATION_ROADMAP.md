# Roadmap Implementasi: Transformasi PayTo

**PRD Reference:** [PRD_TRANSFORMASI_SAAS_KE_CUSTOM.md](./PRD_TRANSFORMASI_SAAS_KE_CUSTOM.md)  
**Created:** 29 Juni 2026  
**Estimated Timeline:** 2-3 minggu  

---

## Executive Summary

### Apa yang Berubah?

PayTo akan bertransformasi dari **internal-only POS** menjadi **POS + E-commerce Hybrid**:

| Sebelum | Sesudah |
|---------|---------|
| Hanya kasir/admin yang bisa akses | Ada landing page & katalog untuk publik |
| Produk tidak visible ke calon pembeli | Katalog online dengan foto & harga |
| Pemesanan hanya walk-in | Pemesanan via WhatsApp + walk-in |
| Arsitektur mengarah ke SaaS | Single-tenant, simplified architecture |

### Fitur Baru

1. **Landing Page** - Showcase produk unggulan & info toko
2. **Katalog Produk Publik** - Browse produk tanpa login, dengan search & filter
3. **Pemesanan WhatsApp** - Tombol "Pesan via WhatsApp" dengan pre-filled message

### Breaking Changes

- Remove multi-tenant logic (tenant_id, tenant scoping)
- Remove unused SaaS features (billing, subscriptions)
- Database schema changes (new tables, new columns)

---

## Development Phases

### Phase 1: Database & Backend Foundation (Week 1)

**Goal:** Setup database schema dan backend API tanpa touching existing features

#### Tasks:

- [ ] **Migration 1:** Add catalog support to products
  ```sql
  ALTER TABLE products ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
  ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT FALSE;
  ALTER TABLE products ADD COLUMN description TEXT NULL;
  ```

- [ ] **Migration 2:** Create product_images table
  ```sql
  CREATE TABLE product_images (...);
  ```

- [ ] **Migration 3:** Create landing_page_settings table
  ```sql
  CREATE TABLE landing_page_settings (...);
  ```

- [ ] **Migration 4:** Add WhatsApp fields to sales
  ```sql
  ALTER TABLE sales ADD COLUMN source ENUM('WALK_IN','WHATSAPP','ONLINE');
  ALTER TABLE sales ADD COLUMN customer_phone VARCHAR(20) NULL;
  ALTER TABLE sales ADD COLUMN customer_name VARCHAR(255) NULL;
  ```

- [ ] **Migration 5:** Create/enhance categories table
  ```sql
  CREATE TABLE categories (...);
  ALTER TABLE products ADD COLUMN category_id BIGINT UNSIGNED NULL;
  ```

- [ ] **Seeders:** 
  - LandingPageSettingsSeeder (default business info)
  - CategoriesSeeder (sample categories)

- [ ] **Models:**
  - ProductImage model dengan relationship ke Product
  - LandingPageSetting model dengan accessor untuk JSON
  - Add scopes ke Product: `scopePublic()`, `scopeFeatured()`
  - Add relationship: Product `hasMany` ProductImage
  - Add relationship: Product `belongsTo` Category

- [ ] **API Controllers (Backend Only):**
  - PublicProductController (index, show) - no auth required
  - PublicCategoryController (index) - no auth required
  - PublicSettingController (index) - no auth required
  - Admin/ProductImageController (store, destroy) - auth required
  - Admin/LandingPageController (update) - auth required

- [ ] **Routes:**
  - Public API routes di `routes/api.php` (no auth middleware)
  - Admin API routes di `routes/api.php` (auth middleware)

- [ ] **Config:**
  - Create `config/catalog.php` dengan feature flags
  - Update `.env.example` dengan new environment variables

- [ ] **Testing:**
  - Feature test: public API accessible tanpa auth
  - Feature test: admin API requires auth
  - Unit test: Product scopes (public, featured)
  - Unit test: ProductImage relationship

**Deliverable:** Backend API berfungsi, bisa di-test via Postman/curl

---

### Phase 2: Frontend - Public Pages (Week 2)

**Goal:** Build landing page dan katalog untuk guest users

#### Tasks:

- [ ] **Setup React Pages:**
  - Create `resources/js/Pages/Public/LandingPage.jsx`
  - Create `resources/js/Pages/Public/KatalogPage.jsx`
  - Create `resources/js/Pages/Public/ProductDetailPage.jsx`

- [ ] **Landing Page Components:**
  - HeroSection (banner, title, CTA)
  - FeaturedProducts grid (fetch dari API)
  - AboutUs section
  - ContactInfo section (WA, jam operasional)
  - Footer

- [ ] **Katalog Page Components:**
  - ProductGrid (fetch dari API dengan pagination)
  - SearchBar (live search)
  - CategoryFilter sidebar
  - SortDropdown (harga, nama, terbaru)
  - ProductCard dengan "Pesan via WhatsApp" button

- [ ] **Product Detail Page:**
  - ImageCarousel (multiple images)
  - ProductInfo (nama, harga, stock status)
  - Description section
  - Large "Pesan via WhatsApp" CTA button
  - RelatedProducts section

- [ ] **WhatsApp Integration:**
  - WhatsAppButton component
  - Generate wa.me link dengan encoded message
  - Message template dari landing_page_settings
  - Track clicks (optional analytics)

- [ ] **Routes (Frontend):**
  - `GET /` → LandingPage
  - `GET /katalog` → KatalogPage
  - `GET /katalog/{slug}` → ProductDetailPage

- [ ] **Styling:**
  - Responsive design (mobile-first)
  - Tailwind CSS utilities
  - Consistent design system (colors, spacing, typography)

- [ ] **Testing:**
  - Feature test: landing page renders correctly
  - Feature test: katalog shows products
  - Feature test: search & filter works
  - Feature test: WhatsApp link generation
  - Manual test: responsive on mobile devices

**Deliverable:** Public-facing pages live dan accessible di browser

---

### Phase 3: Admin Enhancements (Week 2-3)

**Goal:** Admin panel untuk manage katalog dan landing page

#### Tasks:

- [ ] **Product Management (Enhanced):**
  - Add image upload section di product edit form
  - Add "Public Visibility" toggle checkbox
  - Add "Featured Product" toggle checkbox
  - Add description field (rich text editor optional)
  - Display uploaded images dengan delete button

- [ ] **Landing Page Editor (New):**
  - Create `resources/js/Pages/Admin/LandingPageEditor.jsx`
  - Form untuk edit hero title/subtitle
  - Image uploader untuk hero image
  - Textarea untuk about us content
  - Input untuk WhatsApp number
  - Input untuk operating hours (structured format)
  - Preview button (open katalog di new tab)

- [ ] **Analytics Dashboard (Enhanced):**
  - Add chart: Sales by source (Walk-in vs WhatsApp)
  - Add table: Top products by WhatsApp clicks
  - Add metric: Katalog page views (if tracking enabled)

- [ ] **File Upload Handler:**
  - Image validation (size, format)
  - Image processing (resize, thumbnail generation)
  - Storage management (delete old files)

- [ ] **Testing:**
  - Feature test: admin can upload product images
  - Feature test: admin can toggle visibility
  - Feature test: admin can edit landing page settings
  - Feature test: non-admin cannot access these features

**Deliverable:** Admin dapat fully manage katalog dan landing page

---

### Phase 4: POS Integration (Week 3)

**Goal:** Integrate WhatsApp order source ke existing POS flow

#### Tasks:

- [ ] **Checkout Form (Enhanced):**
  - Add "Order Source" dropdown (Walk-in, WhatsApp)
  - Conditional fields: if source = WhatsApp, show:
    - Customer Phone input
    - Customer Name input
  - Validation untuk phone number format

- [ ] **Backend:**
  - Update CheckoutProcessor untuk handle new fields
  - Store source, customer_phone, customer_name ke sales table
  - Add validation rules di PosCheckoutRequest

- [ ] **Sales History (Enhanced):**
  - Add filter dropdown: filter by source
  - Display source badge di sales list
  - Show customer info jika source = WhatsApp

- [ ] **Testing:**
  - Feature test: checkout dengan WhatsApp source
  - Feature test: customer phone & name stored correctly
  - Feature test: sales filtered by source
  - Feature test: backward compatibility (old checkout still works)

**Deliverable:** POS dapat track WhatsApp orders

---

### Phase 5: Breaking Changes & Cleanup (Week 3)

**Goal:** Remove multi-tenant abstractions dan unused code

⚠️ **WARNING: This phase contains BREAKING CHANGES**

#### Tasks:

- [ ] **Database Backup:**
  - Backup production database
  - Test restore procedure
  - Document rollback steps

- [ ] **Remove Multi-Tenant Logic:**
  - [ ] Audit codebase: search for `tenant_id` references
  - [ ] Remove tenant scoping dari Eloquent models
  - [ ] Remove tenant resolution middleware
  - [ ] Migration: drop `tenant_id` columns (or comment out for safety)
  - [ ] Migration: drop `tenants` table (if exists)
  - [ ] Remove unused routes/controllers for tenant management

- [ ] **Simplify Authentication:**
  - [ ] Remove tenant context dari login flow
  - [ ] Keep session-based auth untuk staff
  - [ ] Test login flow masih berfungsi

- [ ] **Remove Unused Features:**
  - [ ] Remove billing/subscription code (if exists)
  - [ ] Remove public user registration flow
  - [ ] Keep forgot password untuk staff only

- [ ] **Configuration:**
  - [ ] Hardcode business info di config atau app_settings
  - [ ] Remove tenant-specific config files

- [ ] **Testing:**
  - [ ] Full regression test: all existing features still work
  - [ ] Test POS flow end-to-end
  - [ ] Test admin dashboard
  - [ ] Test katalog & landing page

**Deliverable:** Clean, single-tenant codebase

---

### Phase 6: Deployment & Launch (Week 3)

**Goal:** Deploy to production dan soft launch

#### Pre-Deployment Checklist:

- [ ] Run all migrations di staging environment
- [ ] Seed landing page settings dengan real business data
- [ ] Upload hero image, logo, dan product images
- [ ] Set environment variables:
  ```bash
  KATALOG_ENABLED=true
  LANDING_PAGE_ENABLED=true
  WHATSAPP_ORDER_ENABLED=true
  BUSINESS_NAME="..."
  BUSINESS_WHATSAPP="628xxxxxxxxxx"
  ```
- [ ] Create storage symlink: `php artisan storage:link`
- [ ] Test all public routes accessible
- [ ] Test admin features: upload images, edit landing page
- [ ] Test WhatsApp link generation
- [ ] Test responsive design di mobile devices

#### Deployment Steps:

1. **Staging Deployment:**
   - [ ] Deploy code ke staging server
   - [ ] Run migrations
   - [ ] Run seeders
   - [ ] Full QA testing
   - [ ] Share staging link dengan stakeholder untuk approval

2. **Production Deployment:**
   - [ ] Schedule maintenance window (if breaking changes)
   - [ ] Backup production database
   - [ ] Deploy code
   - [ ] Run migrations
   - [ ] Run seeders
   - [ ] Verify all features working
   - [ ] Monitor error logs

3. **Post-Deployment:**
   - [ ] Admin configure landing page via editor
   - [ ] Admin upload product images (prioritize top 20 products)
   - [ ] Admin enable `is_public = true` untuk ready products
   - [ ] Admin mark 6-8 featured products
   - [ ] Test katalog dari mobile device
   - [ ] Share katalog link ke test customers
   - [ ] Monitor analytics: views, WhatsApp clicks

#### Soft Launch Plan:

- **Week 1:** Internal testing only (staff + friends & family)
- **Week 2:** Soft launch ke existing customers (share link via WA blast)
- **Week 3:** Public announcement (social media, Google My Business update)

#### Monitoring:

- [ ] Setup error tracking (Sentry, Bugsnag, atau Laravel log monitoring)
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Track key metrics:
  - Katalog page views
  - Unique visitors
  - WhatsApp button clicks
  - Conversion rate (views → clicks)
  - Orders from WhatsApp source

---

## Rollback Plan

Jika ada critical issue di production:

### Quick Rollback (Feature Flags):

```bash
# Disable katalog immediately
KATALOG_ENABLED=false
LANDING_PAGE_ENABLED=false
WHATSAPP_ORDER_ENABLED=false

php artisan config:cache
```

### Full Rollback (Code):

1. Restore database dari backup
2. Checkout previous git tag
3. Re-deploy old codebase
4. Verify existing features working

### Partial Rollback (Database):

```sql
-- Keep new tables but disable visibility
UPDATE products SET is_public = FALSE;
UPDATE landing_page_settings SET value = 'false' WHERE key = 'enabled';
```

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing POS functionality | HIGH | LOW | Comprehensive testing, feature flags |
| Data loss during migration | HIGH | LOW | Database backup, rollback plan |
| Performance degradation | MEDIUM | MEDIUM | Caching, database indexes, load testing |
| Image storage fills disk | MEDIUM | MEDIUM | File size limits, cleanup old images |
| WhatsApp spam from bots | MEDIUM | MEDIUM | Rate limiting, CAPTCHA (future) |
| Security vulnerability in public routes | HIGH | LOW | Input sanitization, rate limiting, security audit |

---

## Success Metrics

### Technical Metrics:

- [ ] 100% passing tests (unit + feature)
- [ ] < 2s page load time untuk katalog
- [ ] < 500ms API response time
- [ ] Zero critical bugs di production
- [ ] 99.9% uptime

### Business Metrics (Month 1):

- [ ] 500+ unique visitors ke katalog
- [ ] 100+ WhatsApp button clicks
- [ ] 20+ orders dari WhatsApp source
- [ ] 10%+ conversion rate (clicks → orders)
- [ ] Positive feedback dari customers

---

## Team & Resources

**Required Skills:**
- Laravel backend developer (1 person)
- React frontend developer (1 person)
- UI/UX designer (optional, untuk polish)
- QA tester (1 person, bisa part-time)

**Tools & Infrastructure:**
- Git untuk version control
- Staging server untuk testing
- Production server (existing)
- Image storage (estimate 5-10 GB untuk start)
- Domain & SSL certificate (existing)

**Documentation:**
- PRD (this document)
- API documentation (generate via Scribe atau manual)
- User guide untuk admin (how to upload images, edit landing page)

---

## Next Steps

1. **Review this roadmap** dengan development team
2. **Estimate effort** untuk setiap phase (story points atau hours)
3. **Assign tasks** ke developers
4. **Setup project board** (GitHub Projects, Jira, atau Trello)
5. **Kickoff meeting** untuk align expectations
6. **Start Phase 1** 🚀

---

## Questions & Clarifications

**Q: Apakah perlu API rate limiting yang aggressive?**  
A: Start dengan 60 req/min untuk public API. Monitor dan adjust jika diperlukan.

**Q: Apakah perlu CAPTCHA untuk WhatsApp button?**  
A: Not for MVP. Add jika ada evidence of bot abuse.

**Q: Berapa banyak product images yang ideal per product?**  
A: Minimum 1 (primary), ideal 3-5 untuk show different angles.

**Q: Apakah katalog perlu pagination atau infinite scroll?**  
A: Pagination lebih simple dan SEO-friendly. Start dengan pagination.

**Q: Apakah perlu cache warming setelah deployment?**  
A: Good to have. Run `php artisan cache:clear` then warm dengan curl ke katalog page.

---

**Document Owner:** Development Team Lead  
**Last Updated:** 29 Juni 2026  
**Status:** Ready for Execution
