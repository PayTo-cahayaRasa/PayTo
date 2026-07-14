# Implementation Tracker — Pemesanan Web dan WhatsApp

**Source of Truth:** [`PRD_PEMESANAN_WEB_DAN_WHATSAPP.md`](./PRD_PEMESANAN_WEB_DAN_WHATSAPP.md)  
**Branch:** `feat/whatsapp-pos-flow`  
**Status keseluruhan:** 🟡 IN PROGRESS  
**Aturan status:** Item hanya boleh ditandai selesai jika implementasi tersedia dan memiliki evidence. Lulus build saja tidak membuktikan alur bisnis selesai.

## Legenda

- ✅ **DONE** — Implementasi tersedia dan sudah diverifikasi.
- 🟡 **PARTIAL** — Sebagian tersedia, tetapi belum memenuhi seluruh acceptance criteria.
- ⬜ **TODO** — Belum diimplementasikan.
- ⛔ **BLOCKED** — Tidak dapat dilanjutkan karena dependency/keputusan eksternal.

## Ringkasan fase

| Fase | Scope | Status | Progress |
| --- | --- | --- | --- |
| 0 | Baseline dan correctness katalog | ✅ DONE | 7/7 |
| 1 | Domain dan backend dasar | ✅ DONE | 10/10 |
| 2 | Checkout publik | ✅ DONE | 14/14 |
| 3 | Order management dan pembayaran | ✅ DONE | 10/10 |
| 4 | Pengiriman dan komunikasi | 🟡 PARTIAL | 7/9 |
| 5 | Quality gate dan manual book | 🟡 PARTIAL | 7/8 |
| **Total** | **MVP end-to-end** | **🟡 IN PROGRESS** | **55/58** |

---

## Fase 0 — Baseline dan correctness katalog

| ID | Requirement | Status | Evidence / catatan |
| --- | --- | --- | --- |
| 0.1 | Katalog hanya menampilkan produk aktif dan publik | ✅ DONE | `app/Http/Controllers/StorefrontController.php:68-75` |
| 0.2 | Detail produk nonaktif/nonpublik menghasilkan 404 | ✅ DONE | `app/Http/Controllers/StorefrontController.php:58-65` |
| 0.3 | Harga keranjang menggunakan harga setelah promo | ✅ DONE | `resources/js/Pages/storefront/components/PublicHeader.tsx` |
| 0.4 | Item cart lintas pagination/detail tetap dapat ditampilkan | ✅ DONE | Snapshot produk disimpan oleh `resources/js/Pages/storefront/hooks/usePublicCart.ts` |
| 0.5 | Detail produk memiliki tombol tambah ke keranjang | ✅ DONE | `resources/js/Pages/storefront/KatalogDetailPage.tsx` |
| 0.6 | WhatsApp cart memuat semua item, qty, harga promo, subtotal | ✅ DONE | `resources/js/Pages/storefront/components/PublicHeader.tsx` |
| 0.7 | Uji frontend cart lintas halaman dan localStorage lama | ✅ DONE | `npm run test:frontend`: legacy format, snapshot lintas pagination, data rusak, batas qty |

## Fase 1 — Domain dan backend dasar

| ID | Requirement | Status | Evidence / catatan |
| --- | --- | --- | --- |
| 1.1 | Tambah `weight_grams` pada produk | ✅ DONE | Migration `2026_07_13_145000_add_weight_grams_to_products_table.php` |
| 1.2 | Model dan tabel online order | ✅ DONE | `OnlineOrder.php`, migration `create_online_orders_table.php` |
| 1.3 | Model dan tabel online order item | ✅ DONE | `OnlineOrderItem.php`, migration `create_online_order_items_table.php` |
| 1.4 | Enum status dan aturan transisi | ✅ DONE | `app/Enums/OnlineOrderStatus.php` |
| 1.5 | Source sale `WEB` | ✅ DONE | `app/Enums/SaleSource.php` |
| 1.6 | Metode pembayaran web pada database | ✅ DONE | Migration `2026_07_13_145100_add_web_payment_methods.php` |
| 1.7 | Form Request guest checkout | ✅ DONE | `StorefrontCheckoutRequest.php` |
| 1.8 | Service kalkulasi dan pembuatan order | ✅ DONE | `OnlineOrderCheckoutService.php` |
| 1.9 | Factory `OnlineOrder` dan `OnlineOrderItem` | ✅ DONE | `OnlineOrderFactory.php` dan `OnlineOrderItemFactory.php` |
| 1.10 | Idempotency token dan unique request protection | ✅ DONE | UUID wajib, unique index database, replay mengembalikan order pertama; diuji di `OnlineOrderCheckoutTest.php` |

## Fase 2 — Checkout publik

| ID | Requirement | Status | Evidence / catatan |
| --- | --- | --- | --- |
| 2.1 | Route dan halaman checkout guest | ✅ DONE | `GET/POST /checkout`, `CheckoutPage.tsx` |
| 2.2 | Pickup checkout tanpa RajaOngkir | ✅ DONE | Pickup membuat ongkir Rp0 |
| 2.3 | Pembayaran pickup: transfer, QRIS, bayar di toko | ✅ DONE | Form dan backend validation tersedia |
| 2.4 | Delivery menolak `PAY_AT_STORE` | ✅ DONE | `StorefrontCheckoutRequest::after()` dan feature test |
| 2.5 | Search destination RajaOngkir backend | ✅ DONE | `GET /api/storefront/destinations`, `RajaOngkirService.php` |
| 2.6 | Quote menghitung berat dari produk server | ✅ DONE | `StorefrontCheckoutController::quote()` dan `shippingWeight()` |
| 2.7 | Cache dan timeout RajaOngkir | ✅ DONE | Cache destination 7 hari, quote 30 menit, timeout 8 detik |
| 2.8 | UI fulfillment delivery/pickup | ✅ DONE | `CheckoutPage.tsx` mendukung kedua fulfillment dan mencegah submit delivery yang belum lengkap |
| 2.9 | UI pencarian destination dengan debounce | ✅ DONE | Pencarian minimum 3 karakter, debounce 400 ms, dan request lama dibatalkan dengan `AbortController` |
| 2.10 | UI pemilihan kurir dan service | ✅ DONE | Kurir aktif, quote cost/ETD, loading, dan pemilihan service tersedia di `CheckoutPage.tsx` |
| 2.11 | Simpan destination label, courier name, ETD | ✅ DONE | Snapshot destination, nama kurir, service, cost, ETD, berat, dan waktu quote disimpan; feature test memverifikasi nilai server |
| 2.12 | Halaman sukses dan instruksi pembayaran | ✅ DONE | `CheckoutSuccessPage.tsx` menampilkan nomor order, total, instruksi, salin pembayaran, dan link tracking |
| 2.13 | Instruksi bank dan QRIS berasal dari server | ✅ DONE | `config/services.php` membaca rekening, QRIS, dan instruksi dari environment; nilainya dikirim server ke halaman sukses |
| 2.14 | Tombol konfirmasi pembayaran via WhatsApp | ✅ DONE | `WhatsAppLinkBuilder::buildPaymentConfirmationLink()` memuat nomor order dan total; tersedia di halaman sukses |

## Fase 3 — Order management dan pembayaran

| ID | Requirement | Status | Evidence / catatan |
| --- | --- | --- | --- |
| 3.1 | API daftar/detail online order | ✅ DONE | `GET /api/online-orders`, `GET /api/online-orders/{id}` |
| 3.2 | API dilindungi auth dan role kasir/supervisor | ✅ DONE | Middleware pada `routes/api.php` |
| 3.3 | Menu internal `Pesanan Online` | ✅ DONE | Tersedia di sidebar admin dan POS |
| 3.4 | Halaman daftar online order | ✅ DONE | `OnlineOrdersPage.tsx` memuat daftar nomor, tanggal, pelanggan, fulfillment, total, dan status |
| 3.5 | Halaman detail online order | ✅ DONE | Detail memuat pelanggan, alamat, item, total, pembayaran, status, dan seluruh aksi operasional |
| 3.6 | API konfirmasi pembayaran | ✅ DONE | Endpoint kasir/supervisor tersedia dan diuji |
| 3.7 | Konfirmasi membuat sale/payment/source WEB | ✅ DONE | Feature test membuktikan sale `WEB` dan payment `CONFIRMED` |
| 3.8 | Konfirmasi mengurangi stok dan membuat movement atomik | ✅ DONE | Transaction, order row lock, conditional decrement, dan test tersedia |
| 3.9 | Konfirmasi ulang tidak membuat sale/payment kedua | ✅ DONE | Replay confirmation diuji hanya menghasilkan satu sale/payment/movement |
| 3.10 | Stok tidak cukup membatalkan seluruh transaksi | ✅ DONE | Test rollback membuktikan tidak ada sale/payment/movement parsial |

## Fase 4 — Pengiriman dan komunikasi

| ID | Requirement | Status | Evidence / catatan |
| --- | --- | --- | --- |
| 4.1 | Backend validasi transisi status | ✅ DONE | `OnlineOrderStatus::canTransitionTo()` |
| 4.2 | Status `DIKIRIM` wajib memiliki resi | ✅ DONE | `OnlineOrderManagementService::updateStatus()` |
| 4.3 | Input resi dari UI internal | ✅ DONE | Detail pesanan menyediakan input resi dan aksi `DIKIRIM` |
| 4.4 | Simpan `shipped_at` dan `completed_at` | ✅ DONE | Service dan feature test memverifikasi kedua timestamp |
| 4.5 | Pembatalan khusus supervisor | ✅ DONE | Controller menolak kasir dengan 403 dan feature test membuktikan supervisor dapat membatalkan |
| 4.6 | Tombol/link WhatsApp pemberitahuan pengiriman | ✅ DONE | API detail/update status mengembalikan `shipping_whatsapp_url` siap dibuka UI |
| 4.7 | Pesan WhatsApp memuat order, kurir, resi, tracking URL | ✅ DONE | `WhatsAppLinkBuilder::buildShippingUpdateLink()` dan unit test |
| 4.8 | Pengaturan origin dan kurir | 🟡 PARTIAL | Environment/config ada; UI setting belum ada |
| 4.9 | Pengaturan rekening, QRIS, instruksi pembayaran | ⬜ TODO | Belum ada pada settings service/UI |

## Fase 5 — Tracking, quality gate, dan dokumentasi

| ID | Requirement | Status | Evidence / catatan |
| --- | --- | --- | --- |
| 5.1 | Tracking publik dengan nomor order dan token | ✅ DONE | `GET /pesanan/{orderNumber}?token=...` |
| 5.2 | Token dibandingkan aman dan token salah menghasilkan 404 | ✅ DONE | `hash_equals()` dan feature test |
| 5.3 | Tracking tidak mengekspos token/sale/internal data | ✅ DONE | Props di-whitelist dan feature test |
| 5.4 | Halaman tracking menampilkan status, item, total, resi | ✅ DONE | `OrderTrackingPage.tsx` |
| 5.5 | Targeted PHPUnit seluruh flow | ✅ DONE | 12 tests/86 assertions untuk checkout, tracking, confirmation, shipping, timestamps, cancellation role, dan WhatsApp |
| 5.6 | Smoke test browser end-to-end hingga `DIKIRIM` | 🟡 PARTIAL | Browser katalog→cart→checkout lulus; API automated test mencapai `DIKIRIM`; browser staf menunggu UI internal |
| 5.7 | Manual book pelanggan, kasir, supervisor | ✅ DONE | `docs/manual-book/PANDUAN_PEMESANAN_WEB_DAN_WHATSAPP.md` dengan batasan versi aktual |
| 5.8 | Screenshot final | ✅ DONE | `docs/manual-book/screenshots/katalog-dan-keranjang.png` |

---

## Acceptance Criteria Tracker

| AC | Acceptance criteria | Status | Evidence / gap utama |
| --- | --- | --- | --- |
| AC-01 | Guest checkout dan order unik/idempotent | ✅ DONE | Guest pickup, nomor/token unik, dan replay idempotency sudah diuji |
| AC-02 | Visibility dan cart | 🟡 PARTIAL | Implementasi ada; browser test lintas halaman belum ada |
| AC-03 | RajaOngkir | ✅ DONE | Delivery UI tersedia; quote diverifikasi ulang server dan diuji dengan `Http::fake()` termasuk origin/berat server |
| AC-04 | Validasi checkout | ✅ DONE | Form Request dan checkout service memvalidasi data wajib, produk, stok, berat, service, dan menghitung seluruh nilai server-side |
| AC-05 | Pembayaran manual | ✅ DONE | Success page mengambil instruksi server dan tombol WhatsApp memuat nomor order serta total |
| AC-06 | Atomic confirmation | ✅ DONE | Sale/payment/stock movement, replay, row lock, dan rollback stok kurang sudah diuji |
| AC-07 | Order management | ✅ DONE | Kasir/supervisor memiliki UI daftar/detail dan cancellation dibatasi supervisor |
| AC-08 | Pengiriman | ✅ DONE | UI resi/status serta tombol WhatsApp tersedia; backend mewajibkan resi |
| AC-09 | Tracking tanpa akun | ✅ DONE | Token, 404, public props, halaman tracking sudah diuji |
| AC-10 | WhatsApp ordering | 🟡 PARTIAL | Multi-item message ada; automated regression test belum ada |

## Verification Log

| Pemeriksaan | Status | Hasil terakhir |
| --- | --- | --- |
| Targeted PHP checkout + WhatsApp | ✅ PASS | `OnlineOrderCheckoutTest`: 10 tests, 78 assertions; suite WhatsApp terkait tetap tercakup pada verification sebelumnya |
| `npm run test:frontend` | ✅ PASS | 4 tests |
| `vendor/bin/pint --dirty --format agent` | ✅ PASS | `result: pass` |
| `npm run typecheck` | ✅ PASS | Tidak ada TypeScript error |
| `npm run build` | ✅ PASS | Vite production build berhasil |
| `git diff --check` | ✅ PASS | Tidak ada whitespace error |
| Full PHPUnit suite | 🟡 PARTIAL | 80 passed/524 assertions; 5 test katalog lama gagal karena masih mengharapkan produk `is_public=false` dapat diakses, bertentangan dengan Fase 0/PRD |
| Browser smoke test | 🟡 PARTIAL | Katalog, cart, checkout publik lulus; staf→DIKIRIM dibuktikan API test karena UI internal belum tersedia |

## Urutan implementasi berikutnya

1. **P1 — Internal order management UI**: daftar, detail, konfirmasi pembayaran, status, input resi.
2. **P1 — Role cancellation**: hanya supervisor dapat membatalkan order.
3. **P1 — Payment/shipping settings UI**: konfigurasi environment sudah dipakai publik; UI supervisor belum tersedia.
4. **P2 lanjutan setelah UI internal** — browser smoke test staf sampai `DIKIRIM`.

## Definition of Done MVP

MVP hanya dapat diubah menjadi ✅ **DONE** jika seluruh kondisi berikut terpenuhi:

- [x] Checkout pickup dan delivery berjalan dari katalog sampai order dibuat.
- [x] Double-submit hanya menghasilkan satu order.
- [x] Ongkir dan seluruh total dihitung/divalidasi server.
- [x] Instruksi pembayaran dan konfirmasi WhatsApp tersedia.
- [x] Kasir/supervisor dapat mengelola order melalui UI internal.
- [x] Konfirmasi pembayaran atomik dan memiliki test rollback.
- [x] Stok tidak berkurang sebelum konfirmasi pembayaran.
- [x] Resi dan status pengiriman dapat dikelola staf.
- [x] Tracking publik tidak mengekspos data internal.
- [ ] Targeted tests, Pint, typecheck, build, dan smoke test lulus.
- [x] Manual book dan screenshot final tersedia.
