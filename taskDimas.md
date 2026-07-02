# Task Transformasi PayTo Menjadi Aplikasi Custom Single-Tenant

**Sumber utama:** [`docs/plan/PRD_TRANSFORMASI_SAAS_KE_CUSTOM.md`](docs/plan/PRD_TRANSFORMASI_SAAS_KE_CUSTOM.md)

**Status:** Siap dikerjakan

**Urutan pengerjaan:** Wajib mengikuti prioritas `P0` sampai `P5`

**Target sistem:** Satu toko, satu deployment, satu database, dan banyak staf internal

## Tujuan

Mengubah PayTo menjadi aplikasi POS dan katalog publik untuk satu toko tanpa kompleksitas SaaS maupun offline-first. Pelanggan melihat produk dari storefront, memulai percakapan melalui WhatsApp, kemudian kasir memasukkan dan menyelesaikan transaksi tersebut di POS sebagai pesanan bersumber `WHATSAPP`.

Dokumen ini khusus memecah pekerjaan berikut:

- pengamanan dan penyederhanaan deployment single-tenant;
- penghapusan PWA, offline queue, sync batch, idempotency client, dan push notification;
- pengurangan pengaturan aplikasi yang tidak digunakan;
- pengaturan profil toko sebagai satu sumber data;
- pemesanan manual melalui WhatsApp yang tercatat di POS;
- storefront minimum yang dibutuhkan untuk alur WhatsApp;
- pencetakan struk melalui dialog cetak browser ke printer thermal.

## Keputusan yang Sudah Dikunci

| Area | Keputusan |
| --- | --- |
| Model deployment | Single-tenant untuk satu toko; banyak akun staf tetap didukung |
| Multi-tenant | Tidak dibangun dan tidak disiapkan untuk fase ini |
| PWA | Dihapus seluruhnya, termasuk transaksi offline dan push notification |
| Koneksi | Aplikasi POS menjadi online-only |
| WhatsApp | Menggunakan tautan `wa.me`; chat tidak dibaca otomatis oleh sistem |
| Pencatatan pesanan WA | Kasir memasukkan pesanan manual dan memilih sumber `WHATSAPP` |
| Diskon | Promo diskon per produk tetap tersedia |
| Diskon pelanggan | Tidak dibuat; loyalty, membership, voucher, dan harga khusus pelanggan tidak termasuk scope |
| Pengaturan | Gunakan tabel `app_settings` yang sudah ada |
| Printer | Gunakan halaman struk dan `window.print()`; tidak ada silent printing atau pemilihan printer langsung dari browser |
| Storefront | Gunakan halaman Inertia; tidak membuat public JSON API yang redundan |
| Pelanggan | Tidak memiliki akun dan tidak ada role `GUEST`; akses katalog bersifat anonim |

## Temuan Kondisi Repo

Temuan ini harus digunakan sebagai baseline. Jangan menyalin asumsi PRD tanpa memeriksa implementasi yang sudah ada.

- Repo tidak memiliki tabel `tenants`, kolom `tenant_id`, tenant middleware, billing SaaS, subscription SaaS, atau UI tenant management.
- `routes/web.php` dan `routes/api.php` belum melindungi seluruh halaman dan endpoint internal dengan middleware autentikasi dan role.
- Beberapa controller menggunakan pengguna pertama sebagai fallback ketika request tidak terautentikasi. Perilaku ini merupakan blocker deployment.
- PWA saat ini terdiri dari service worker, manifest, IndexedDB queue, sync batch, idempotency key, dan Web Push.
- `app_settings` sudah digunakan untuk template struk dan beberapa pengaturan POS. Jangan membuat tabel `landing_page_settings` kedua.
- `SettingsTab.tsx` berisi kontrol yang belum persisten atau tidak terhubung ke business logic: batas diskon, stok negatif, mode debug, dan factory reset.
- Endpoint pengaturan printer hanya menyimpan nama printer dan mengembalikan respons sukses; endpoint tersebut tidak benar-benar terhubung ke printer.
- Diskon yang sudah aktif adalah promo per produk. Tidak ditemukan sistem diskon khusus pelanggan.
- Landing page saat ini masih berupa promosi produk SaaS PayTo, bukan storefront milik satu toko.
- `composer.lock` dan `package.json` menjadi sumber versi aplikasi. Koneksi Laravel Boost saat penyusunan dokumen menunjuk ke aplikasi/database lain dan tidak boleh dipakai untuk menentukan schema PayTo sampai konfigurasinya diperbaiki.

## Matriks Prioritas

| Prioritas | Fokus | Alasan | Memblokir |
| --- | --- | --- | --- |
| `P0` | Autentikasi, role, dan boundary single-tenant | Endpoint internal saat ini dapat diakses tanpa perlindungan yang memadai | Semua fase |
| `P1` | Penghapusan PWA dan offline sync | Mengurangi sumber bug dan mengubah baseline menjadi online-only | Finalisasi POS dan deployment |
| `P2` | Pengaturan toko dan pencetakan struk | Menyediakan satu sumber identitas toko untuk seluruh UI | Storefront dan WhatsApp |
| `P3` | Pencatatan pesanan WhatsApp di POS | Menyediakan data transaksi berdasarkan channel | Laporan channel |
| `P4` | Storefront minimum dan tombol WhatsApp | Membuka channel pemesanan untuk pelanggan | Peluncuran publik |
| `P5` | Regression test, migrasi, dan deployment | Memastikan transformasi aman digunakan | Production release |

## P0 — Pengamanan Single-Tenant

**Tujuan:** memastikan hanya halaman publik yang dapat diakses guest dan seluruh operasi internal selalu memiliki identitas staf yang valid.

**Syarat mulai:** tidak ada.

### P0.1 — Kunci boundary route publik dan internal

- [x] Pertahankan route publik hanya untuk landing page, katalog, detail produk, halaman login, dan submit login.
- [x] Lindungi `/admin` dengan middleware `auth` dan role `SUPERVISOR`.
- [x] Lindungi `/kasir` dengan middleware `auth` dan izinkan role `CASHIER` serta `SUPERVISOR`.
- [x] Terapkan middleware `web` dan `auth` pada API internal agar session login Inertia dapat digunakan dan request state-changing mendapat proteksi CSRF.
- [x] Kelompokkan `/api/admin/*` untuk role `SUPERVISOR`.
- [x] Kelompokkan `/api/pos/*` untuk role `CASHIER` atau `SUPERVISOR`.
- [x] Daftarkan middleware role di `bootstrap/app.php` sesuai struktur Laravel 12.
- [x] Beri nama route web yang dipakai frontend agar URL tidak ditulis ulang secara manual di banyak tempat.

**Kontrak akses:**

| Area | Guest | Cashier | Supervisor |
| --- | --- | --- | --- |
| Landing dan katalog | Diizinkan | Diizinkan | Diizinkan |
| Login | Diizinkan | Redirect bila sudah login | Redirect bila sudah login |
| POS kasir | Ditolak | Diizinkan | Diizinkan |
| Admin | Ditolak | Ditolak | Diizinkan |
| API POS | `401` | Diizinkan | Diizinkan |
| API admin | `401` | `403` | Diizinkan |

### P0.2 — Hapus fallback pengguna

- [x] Hapus pola `$request->user() ?? User::query()->first()` dan fallback serupa dari controller serta service.
- [x] Ambil kasir hanya dari `$request->user()` setelah middleware autentikasi dijalankan.
- [x] Pastikan `cashier_id` selalu berasal dari session, bukan payload client.
- [x] Kembalikan `401` untuk request tanpa session dan `403` untuk role yang tidak sesuai.
- [ ] Perbarui seluruh feature test API agar menggunakan `actingAs()` dengan role yang sesuai.

### P0.3 — Rate limiting dan session production

- [x] Buat named rate limiter untuk login dengan batas lima percobaan per menit per kombinasi username dan IP.
- [x] Buat named rate limiter untuk checkout dan refund agar double-submit cepat dapat dibatasi tanpa menghambat operasi normal.
- [ ] Terapkan limiter publik pada katalog berdasarkan IP.
- [x] Pastikan deployment production menggunakan cookie `secure`, `http_only`, dan `same_site` yang sesuai.
- [ ] Pastikan `APP_DEBUG=false` dan HTTPS digunakan sebelum storefront dibuka ke publik.

### P0.4 — Ubah identitas UI dari SaaS menjadi satu toko

- [ ] Hapus copy "uji coba gratis", onboarding bisnis, pertumbuhan banyak outlet, dan CTA SaaS dari landing page.
- [x] Hapus label "Toko Cabang Pusat" dan "outlet" yang di-hardcode.
- [x] Pertahankan istilah peran internal "Kasir" dan "Supervisor".
- [x] Jangan menambahkan tenant switcher, pemilih cabang, paket berlangganan, billing, atau registrasi publik.
- [ ] Tunda isi storefront final sampai data `business.profile` pada `P2` tersedia.

### Definition of Done P0

- [x] Guest hanya dapat membuka route publik.
- [x] Cashier tidak dapat membuka endpoint admin.
- [x] Tidak ada controller yang memilih pengguna pertama sebagai fallback.
- [ ] Semua test otorisasi dan autentikasi terfokus lulus.
- [x] Terminologi SaaS, multi-outlet, dan uji coba tidak tampil pada UI production.

## P1 — Hapus PWA dan Kompleksitas Offline

**Tujuan:** menjadikan PayTo aplikasi online-only dan menghapus seluruh jalur transaksi offline yang tidak dibutuhkan untuk satu outlet.

**Syarat mulai:** `P0` selesai agar checkout online sudah memiliki session staf yang benar.

### P1.1 — Amankan data sebelum penghapusan

- [ ] Backup database sebelum migration penghapusan tabel dijalankan.
- [ ] Periksa setiap perangkat kasir dan pastikan IndexedDB `payto-offline-db` tidak memiliki transaksi tertunda.
- [ ] Proses transaksi tertunda melalui sync lama sebelum endpoint sync dihapus.
- [ ] Jangan menghapus queue browser jika masih ada transaksi yang belum tercatat di server.
- [ ] Dokumentasikan waktu backup dan hasil pengecekan perangkat pada catatan deployment, bukan di source code.

### P1.2 — Hapus PWA dari frontend

- [x] Hapus pemanggilan `initializePwa()` dari entrypoint React.
- [x] Hapus `resources/js/pwa/registerPwa.ts`.
- [x] Hapus `resources/js/pwa/offlineQueue.ts`.
- [x] Hapus `resources/js/pwa/pushNotifications.ts`.
- [x] Hapus penggunaan `enqueueCheckoutTransaction()`, `flushCheckoutQueue()`, dan `countQueuedTransactions()` dari halaman kasir.
- [x] Hapus status online/offline, jumlah queue, retry sync, serta pesan transaksi disimpan offline dari UI kasir.
- [x] Ubah kegagalan jaringan saat checkout menjadi error yang jelas; cart tidak boleh dikosongkan sebelum server mengonfirmasi transaksi.
- [x] Hapus menu dan tombol “Sinkronisasi Otomatis” serta “Refresh”.
- [x] Hapus manifest link, theme metadata khusus PWA, dan Web Push public key dari layout aplikasi bila masih ada.
- [x] Hapus `public/manifest.json`, `public/sw.js`, halaman offline, serta aset yang hanya dipakai PWA setelah memastikan tidak digunakan bagian lain.

### P1.3 — Bersihkan service worker lama pada browser

- [x] Tambahkan cleanup satu kali yang memanggil `navigator.serviceWorker.getRegistrations()` lalu melakukan `unregister()` pada registrasi PayTo.
- [x] Hapus cache bernama `payto-pwa-*` melalui Cache Storage API.
- [ ] Hapus IndexedDB `payto-offline-db` hanya setelah pemeriksaan queue pada `P1.1` selesai.
- [x] Pertahankan cleanup selama satu siklus deployment agar perangkat lama menerima pembaruan.
- [ ] Hapus helper cleanup pada release berikutnya setelah seluruh perangkat outlet diverifikasi tidak memiliki service worker aktif.

### P1.4 — Hapus backend sync dan push

- [x] Hapus route `POST /api/pos/sync/batches`.
- [x] Hapus seluruh route `/api/push/*`.
- [x] Hapus `PosSyncController`, `PosSyncBatchRequest`, `SyncBatch`, dan `SyncIdempotencyKey`.
- [x] Hapus `PushSubscriptionController`, `PushSubscriptionStoreRequest`, dan `PushSubscription`.
- [x] Hapus test sync batch dan push subscription setelah perilaku pengganti online-only sudah diuji.
- [x] Hapus dependency `minishlink/web-push` melalui Composer dan perbarui lock file.
- [x] Hapus konfigurasi VAPID dan Web Push yang tidak lagi dipakai dari `.env.example` serta `config/services.php` bila ada.

### P1.5 — Migration penghapusan tabel

- [x] Buat migration baru; jangan mengedit migration lama yang sudah pernah dijalankan.
- [x] Drop tabel dalam urutan aman: `sync_idempotency_keys`, `sync_batches`, lalu `push_subscriptions`.
- [x] Buat method `down()` yang mengembalikan struktur tabel lama secara lengkap untuk kebutuhan rollback teknis.
- [x] Pertahankan `sales.local_txn_uuid` sebagai UUID transaksi server-side untuk kompatibilitas data lama.
- [x] Pastikan checkout online selalu menghasilkan UUID di backend dan tidak menerima idempotency key dari client.
- [x] Jangan menghapus data diskon historis pada `sales` maupun `sale_items`.

### Definition of Done P1

- [x] Tidak ada service worker baru yang diregistrasikan.
- [x] Tidak ada IndexedDB checkout queue atau fallback transaksi offline.
- [x] Route sync dan push mengembalikan `404`.
- [x] Tidak ada class PHP atau import TypeScript yang merujuk sync batch, idempotency client, atau Web Push.
- [x] Checkout online berhasil dan kegagalan jaringan tidak menghapus cart.
- [x] Build frontend dan test checkout online lulus.

## P2 — Pengaturan Single-Tenant dan Pencetakan Struk

**Tujuan:** menyediakan satu sumber data untuk identitas toko, konfigurasi katalog/WhatsApp, dan isi struk.

**Syarat mulai:** `P0` selesai. `P1` harus selesai sebelum menu pengaturan kasir dirapikan.

### P2.1 — Tetapkan kontrak `app_settings`

- [x] Gunakan key `business.profile` dengan value JSON berisi `name`, `address`, `whatsapp_number`, dan `operating_hours`.
- [x] Gunakan key `catalog.settings` dengan value JSON berisi `enabled`, `whatsapp_enabled`, dan `whatsapp_message_template`.
- [x] Pertahankan key `receipt.settings` untuk `header` dan `footer`.
- [x] Jangan membuat tabel `landing_page_settings`.
- [x] Hapus atribut `type` dari model atau write path karena tabel `app_settings` saat ini tidak memiliki kolom tersebut.
- [x] Buat service khusus untuk membaca default, melakukan merge dengan data tersimpan, dan menghindari pengulangan query/key string.

**Bentuk data yang wajib digunakan:**

```json
{
  "business": {
    "name": "Nama Toko",
    "address": "Alamat toko",
    "whatsapp_number": "6281234567890",
    "operating_hours": "Senin-Sabtu 08.00-20.00 WIB"
  },
  "catalog": {
    "enabled": true,
    "whatsapp_enabled": true,
    "whatsapp_message_template": "Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}."
  }
}
```

Aturan nomor WhatsApp:

- simpan dalam format internasional digit-only tanpa `+`, spasi, atau tanda hubung;
- panjang 8 sampai 15 digit;
- validasi dilakukan melalui Form Request;
- tautan akhir menggunakan `https://wa.me/{nomor}`.

Placeholder template yang diizinkan hanya `{product_name}`, `{price}`, dan `{qty}`. Tolak placeholder lain agar template tidak menghasilkan pesan yang tidak dapat diproses.

### P2.2 — API pengaturan toko

- [x] Tambahkan `GET /api/admin/business-settings` untuk supervisor.
- [x] Tambahkan `PUT /api/admin/business-settings` untuk supervisor.
- [x] Gunakan Form Request terpisah dengan custom error message bahasa Indonesia.
- [x] Simpan `business.profile` dan `catalog.settings` secara atomik dalam database transaction.
- [x] Jangan menerima nama key setting bebas dari client.
- [x] Jangan expose pengaturan internal atau rahasia pada props storefront.

### P2.3 — Rapikan UI pengaturan

- [x] Ubah `App Settings` menjadi `Pengaturan Toko`.
- [x] Hubungkan form ke API pengaturan toko dan tampilkan state loading, sukses, validasi, serta error server.
- [x] Pertahankan halaman template struk yang sudah ada.
- [x] Hapus batas diskon kasir karena tidak terhubung ke business rule.
- [x] Hapus toggle stok negatif karena tidak terhubung ke checkout.
- [x] Hapus mode debug dari UI production.
- [x] Hapus factory reset local data.
- [x] Hapus form nama printer, status "terhubung", dan endpoint test print palsu.
- [x] Pertahankan promo diskon produk pada manajemen produk dan POS.

### P2.4 — Implementasikan pencetakan struk nyata melalui browser

- [x] Tambahkan route autentikasi `GET /pos/sales/{sale}/receipt` untuk cashier dan supervisor.
- [x] Ambil sale beserta item, pembayaran, kasir, dan `receipt.settings` melalui controller.
- [x] Buat halaman Inertia struk yang hanya menampilkan data transaksi server-side.
- [x] Tambahkan print stylesheet untuk kertas thermal 80 mm dan sembunyikan tombol saat proses print.
- [x] Tambahkan tombol "Cetak Struk" yang memanggil `window.print()` dari interaksi pengguna.
- [x] Kembalikan `receipt_url` pada respons checkout agar frontend tidak menyusun URL sendiri.
- [ ] Buka halaman struk hanya setelah checkout berhasil.
- [x] Pastikan route struk tidak dapat diakses guest.
- [x] Nyatakan silent printing, WebUSB, WebSerial, QZ Tray, dan pemilihan printer otomatis sebagai di luar scope.

### Definition of Done P2

- [x] Perubahan profil toko tetap tersedia setelah reload.
- [x] Landing, login, admin, katalog, dan struk memakai nama toko yang sama.
- [x] Nomor WhatsApp tersimpan dalam format yang valid.
- [x] Tidak ada pengaturan semu atau endpoint printer palsu.
- [x] Halaman struk menampilkan data transaksi yang benar dan membuka dialog print browser.
- [x] Test API pengaturan dan akses halaman struk lulus.

## P3 — Pesanan WhatsApp Masuk ke POS

**Tujuan:** membedakan transaksi walk-in dan pesanan yang diterima melalui WhatsApp tanpa membaca chat secara otomatis.

**Syarat mulai:** `P0` dan kontrak pengaturan WhatsApp pada `P2` selesai.

### P3.1 — Schema sumber transaksi

- [x] Tambahkan `sales.source` sebagai string terindeks dengan default `WALK_IN`.
- [x] Tambahkan `sales.customer_name` nullable.
- [x] Tambahkan `sales.customer_phone` nullable.
- [x] Gunakan PHP backed enum `SaleSource` dengan case `WalkIn = 'WALK_IN'` dan `WhatsApp = 'WHATSAPP'`.
- [x] Tambahkan cast enum pada model `Sale`.
- [x] Pertahankan seluruh sale lama sebagai `WALK_IN` saat migration dijalankan.
- [x] Jangan menambahkan nilai `ONLINE` sebelum ada checkout online di dalam sistem.

### P3.2 — Kontrak checkout

- [x] Perluas `POST /api/pos/checkout` dengan field opsional `source`, `customer_name`, dan `customer_phone`.
- [x] Default `source` menjadi `WALK_IN` bila client lama tidak mengirim field tersebut.
- [x] Wajibkan `customer_name` dan `customer_phone` hanya jika `source=WHATSAPP`.
- [x] Normalisasi nomor pelanggan menjadi digit-only tanpa mengubah nomor kosong untuk walk-in.
- [x] Tolak source selain `WALK_IN` dan `WHATSAPP`.
- [x] Simpan source serta data pelanggan di dalam transaction checkout yang sama dengan sale, item, dan payment.
- [x] Jangan menerima `cashier_id`, total, harga akhir, atau diskon hasil kalkulasi client sebagai sumber kebenaran.
- [x] Pertahankan kalkulasi promo diskon produk di backend untuk kedua source.

**Contoh payload WhatsApp:**

```json
{
  "source": "WHATSAPP",
  "customer_name": "Budi",
  "customer_phone": "6281234567890",
  "payment_method": "CASH",
  "cash_received": 50000,
  "items": [
    {
      "product_id": 1,
      "qty": 2
    }
  ]
}
```

### P3.3 — UI input pesanan WhatsApp

- [ ] Tambahkan pilihan sumber transaksi `Walk-in` dan `WhatsApp` pada alur checkout.
- [ ] Default pilihan selalu `Walk-in` untuk transaksi baru.
- [ ] Tampilkan input nama dan nomor pelanggan hanya saat `WhatsApp` dipilih.
- [ ] Tampilkan validasi sebelum request dikirim dan tetap tampilkan error dari server.
- [ ] Jangan kosongkan cart bila checkout gagal.
- [ ] Reset source serta data pelanggan setelah checkout berhasil atau kasir memilih reset transaksi.
- [ ] Tampilkan badge `WhatsApp` pada konfirmasi dan riwayat transaksi yang sesuai.
- [ ] Jangan membuat parser copy-paste chat karena format percakapan tidak terjamin.

### P3.4 — Riwayat dan laporan berdasarkan source

- [ ] Tambahkan filter `source` pada endpoint riwayat yang sudah ada.
- [ ] Tampilkan nama dan nomor pelanggan hanya untuk transaksi WhatsApp.
- [ ] Tambahkan ringkasan `WALK_IN` versus `WHATSAPP` pada dashboard admin.
- [ ] Hitung laporan dari `sales.source`, bukan dari teks catatan transaksi.
- [ ] Pertahankan laporan lama ketika filter source tidak dikirim.
- [ ] Jangan membuat analytics klik WhatsApp pada fase ini.

### Definition of Done P3

- [ ] Checkout lama tanpa `source` tetap menghasilkan sale `WALK_IN`.
- [ ] Checkout `WHATSAPP` menolak nama atau nomor pelanggan yang kosong.
- [ ] Sale WhatsApp menyimpan source dan data pelanggan.
- [ ] Promo diskon produk dihitung sama pada walk-in dan WhatsApp.
- [ ] Riwayat dan dashboard dapat membedakan kedua channel.
- [ ] Tidak ada data yang dibuat hanya karena pelanggan membuka WhatsApp.

## P4 — Storefront Minimum Pendukung WhatsApp

**Tujuan:** menyediakan landing page dan katalog publik yang menampilkan produk toko serta membuka chat WhatsApp dengan pesan yang sudah terisi.

**Syarat mulai:** `P2` selesai. Backend `P3` dapat dikerjakan paralel, tetapi alur end-to-end baru selesai setelah keduanya tersedia.

### P4.1 — Schema katalog minimum

- [x] Tambahkan `products.slug` unique.
- [x] Tambahkan `products.description` nullable.
- [x] Tambahkan `products.is_public` dengan default `false` agar produk lama tidak langsung dipublikasikan.
- [x] Tambahkan `products.featured` dengan default `false`.
- [x] Tambahkan `products.image_path` nullable untuk satu gambar utama pada MVP.
- [x] Tambahkan index untuk `is_public`, `featured`, dan kombinasi query katalog yang benar-benar digunakan.
- [x] Generate slug unik untuk produk lama tanpa mengubah nama maupun SKU.
- [x] Jangan membuat categories, multi-image gallery, review, atau related-product engine pada scope minimum ini.

### P4.2 — Manajemen produk publik

- [x] Perluas Form Request produk untuk `description`, `is_public`, dan `featured`.
- [x] Buat Form Request upload gambar dengan tipe `jpg`, `jpeg`, `png`, atau `webp` dan ukuran maksimum 2 MB.
- [ ] Simpan gambar di disk `public` dengan nama unik.
- [ ] Hapus file lama setelah gambar pengganti berhasil disimpan.
- [ ] Hapus file produk ketika produk dihapus.
- [x] Jangan menerima path file langsung dari client.
- [ ] Tambahkan kontrol visibility, featured, deskripsi, dan gambar pada manajemen produk admin.
- [x] Pertahankan input promo diskon produk yang sudah ada.

### P4.3 — Route dan query storefront

- [x] Gunakan `GET /` untuk landing page toko.
- [x] Tambahkan `GET /katalog` untuk katalog dengan pagination dan pencarian nama produk.
- [x] Tambahkan `GET /katalog/{product:slug}` untuk detail produk.
- [x] Gunakan controller dan Inertia props; jangan membuat `/api/public/*` jika hanya dikonsumsi halaman tersebut.
- [x] Landing page hanya mengambil produk `is_active=true`, `is_public=true`, dan `featured=true`.
- [x] Katalog hanya mengambil produk aktif dan publik.
- [x] Detail produk mengembalikan `404` untuk produk nonaktif atau nonpublik.
- [x] Gunakan eager loading hanya untuk relationship yang memang dibutuhkan.
- [x] Jangan kirim `cost`, margin, supplier, audit log, atau field internal lain ke guest.
- [x] Hormati `catalog.settings.enabled`; ketika nonaktif, katalog mengembalikan halaman unavailable yang aman, bukan data produk.

### P4.4 — Builder tautan WhatsApp

- [x] Buat service backend yang menghasilkan URL `wa.me` dari pengaturan toko dan data produk.
- [x] Ganti placeholder `{product_name}`, `{price}`, dan `{qty}` dengan nilai yang sudah diformat.
- [x] Gunakan quantity awal `1`.
- [x] Encode pesan dengan benar sebelum dimasukkan ke query `text`.
- [x] Jangan masukkan cost, ID database internal, atau data staf ke pesan.
- [x] Jangan tampilkan tombol bila `whatsapp_enabled=false` atau nomor WhatsApp belum valid.
- [x] Tombol hanya membuka chat; tombol tidak membuat sale, draft order, atau reservasi stok.

### P4.5 — UI storefront

- [ ] Ubah landing page menjadi hero toko, produk unggulan, informasi singkat toko, jam operasional, alamat, dan CTA katalog/WhatsApp.
- [ ] Buat katalog responsif dengan pagination dan pencarian yang tersimpan pada query string.
- [ ] Buat detail produk dengan gambar, nama, harga setelah promo, harga normal bila ada diskon, deskripsi, dan status stok sederhana.
- [ ] Gunakan `<Link>` Inertia untuk navigasi internal dan anchor biasa untuk `wa.me`.
- [ ] Beri empty state ketika belum ada produk publik.
- [ ] Beri fallback visual ketika produk belum memiliki gambar.
- [ ] Pastikan CTA WhatsApp mudah digunakan pada layar mobile.
- [ ] Hindari cart guest, login pelanggan, checkout online, dan payment gateway.

### Definition of Done P4

- [ ] Guest dapat membuka landing, katalog, dan detail produk tanpa login.
- [ ] Produk nonpublik atau nonaktif tidak pernah tampil.
- [ ] Props publik tidak memuat cost maupun data internal.
- [ ] Tombol WhatsApp membuka nomor toko dengan nama, harga, dan quantity produk yang benar.
- [ ] Membuka WhatsApp tidak membuat record transaksi.
- [ ] Storefront tetap usable pada viewport mobile dan desktop.

## P5 — Pengujian, Migrasi, dan Deployment

**Tujuan:** memverifikasi seluruh perubahan secara terfokus sebelum production release.

### P5.1 — PHPUnit feature tests

- [ ] Tambahkan test guest dapat membuka storefront.
- [ ] Tambahkan test guest ditolak dari web dan API internal.
- [ ] Tambahkan test cashier ditolak dari API admin.
- [ ] Tambahkan test supervisor dapat menggunakan API admin dan POS.
- [ ] Tambahkan test rate limiter login dan checkout.
- [ ] Tambahkan test API pengaturan toko beserta validasi nomor/template WhatsApp.
- [ ] Tambahkan test checkout walk-in backward-compatible.
- [ ] Tambahkan test checkout WhatsApp happy path dan validation failure.
- [ ] Tambahkan test promo diskon produk tetap dihitung untuk kedua source.
- [ ] Tambahkan test filter riwayat dan ringkasan dashboard berdasarkan source.
- [ ] Tambahkan test visibility storefront, pencarian, pagination, dan detail berdasarkan slug.
- [ ] Tambahkan test URL WhatsApp dan encoding pesan.
- [ ] Tambahkan test upload, replace, dan delete gambar menggunakan `Storage::fake('public')`.
- [ ] Tambahkan test route struk, isi transaksi, dan larangan akses guest.
- [ ] Perbarui test lama agar selalu mengautentikasi role yang sesuai.
- [ ] Hapus test PWA/sync/push hanya bersama penghapusan fitur terkait.

### P5.2 — Verifikasi frontend

- [ ] Verifikasi checkout gagal jaringan mempertahankan cart.
- [ ] Verifikasi conditional field pelanggan berdasarkan source.
- [ ] Verifikasi source dan data pelanggan di-reset setelah transaksi berhasil.
- [ ] Verifikasi pengaturan toko memuat dan menyimpan data API.
- [ ] Verifikasi halaman struk memanggil `window.print()` hanya dari aksi pengguna.
- [ ] Verifikasi tidak ada error console atau request ke route sync/push yang telah dihapus.
- [ ] Verifikasi tidak ada service worker aktif setelah cleanup deployment.
- [ ] Verifikasi layout storefront pada mobile, tablet, dan desktop.

### P5.3 — Perintah verifikasi

Jalankan test minimum per fase selama implementasi:

```bash
php artisan test --compact --filter=AuthenticationAuthorizationTest
php artisan test --compact --filter=BusinessSettingsTest
php artisan test --compact --filter=PosCheckout
php artisan test --compact --filter=PublicStorefrontTest
php artisan test --compact --filter=ReceiptPrintTest
```

Setelah test terfokus lulus:

```bash
vendor/bin/pint --dirty --format agent
npm run build
git diff --check
```

Jalankan full test suite setelah mendapat persetujuan:

```bash
php artisan test --compact
```

### P5.4 — Deployment production

- [ ] Backup database dan catat waktu backup.
- [ ] Pastikan queue offline seluruh perangkat kosong sebelum deploy.
- [ ] Jalankan migration di staging terlebih dahulu.
- [ ] Verifikasi data sale lama, discount history, dan produk tetap tersedia.
- [ ] Isi `business.profile`, `catalog.settings`, dan `receipt.settings` untuk toko.
- [ ] Jalankan `php artisan storage:link` bila public storage belum terhubung.
- [ ] Upload gambar produk dan aktifkan `is_public` secara manual untuk produk yang siap.
- [ ] Uji checkout walk-in dan WhatsApp dengan akun kasir nyata.
- [ ] Uji print struk dengan printer thermal yang telah dikonfigurasi pada sistem operasi.
- [ ] Uji katalog dan tautan WhatsApp dari perangkat mobile.
- [ ] Pantau error log, kegagalan checkout, dan response `401/403` setelah release.

### Definition of Done P5

- [ ] Semua test terfokus lulus.
- [ ] Pint, build frontend, dan `git diff --check` lulus.
- [ ] Migration berhasil pada copy database production.
- [ ] Tidak ada kehilangan transaksi, item, pembayaran, atau riwayat diskon.
- [ ] Seluruh acceptance criteria bisnis telah diuji di staging.

## Interface Akhir

### Route publik

| Method | Route | Fungsi |
| --- | --- | --- |
| `GET` | `/` | Landing page toko |
| `GET` | `/katalog` | Katalog produk publik |
| `GET` | `/katalog/{product:slug}` | Detail produk publik |
| `GET` | `/login` | Form login staf |
| `POST` | `/login` | Autentikasi staf dengan rate limit |

### Route internal utama

| Method | Route | Akses | Fungsi |
| --- | --- | --- | --- |
| `GET` | `/admin` | Supervisor | Workspace admin |
| `GET` | `/kasir` | Cashier, Supervisor | POS |
| `GET` | `/api/admin/business-settings` | Supervisor | Ambil pengaturan toko |
| `PUT` | `/api/admin/business-settings` | Supervisor | Simpan pengaturan toko |
| `POST` | `/api/pos/checkout` | Cashier, Supervisor | Checkout walk-in/WhatsApp |
| `GET` | `/pos/sales/{sale}/receipt` | Cashier, Supervisor | Halaman cetak struk |

### Route yang dihapus

- `POST /api/pos/sync/batches`
- `POST /api/push/subscriptions`
- `DELETE /api/push/subscriptions`
- `POST /api/push/test`
- `POST /api/pos/settings/refresh`
- `POST /api/pos/settings/printer`
- `POST /api/pos/settings/printer/test`

## Di Luar Scope

- WhatsApp Business API dan webhook pesan masuk;
- pembuatan order otomatis dari chat;
- cart dan checkout untuk guest;
- payment gateway online;
- reservasi stok ketika tombol WhatsApp diklik;
- delivery management;
- akun dan portal pelanggan;
- loyalty, membership, voucher, atau diskon khusus pelanggan;
- analytics klik dan conversion tracking WhatsApp;
- PWA, offline checkout, background sync, dan push notification;
- silent printing, pemilihan printer otomatis, WebUSB, WebSerial, atau QZ Tray;
- multi-store, tenant management, subscription billing, dan tenant switching;
- kategori produk, multi-image gallery, review, wishlist, dan related products pada MVP.

## Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Transaksi offline belum tersinkron ikut terhapus | Wajib cek seluruh perangkat dan selesaikan queue sebelum `P1` |
| Service worker lama tetap mengontrol browser | Deploy cleanup unregister/cache selama satu siklus release |
| API internal rusak setelah auth diterapkan | Perbarui test dengan `actingAs()` dan uji role per route group |
| Produk lama langsung terekspos | Default `is_public=false` dan publikasi manual |
| Data laporan lama berubah | Default dan backfill source menjadi `WALK_IN` |
| Riwayat diskon hilang | Pertahankan kolom discount historis dan fitur promo produk |
| Nomor WhatsApp menghasilkan link invalid | Simpan format internasional digit-only dan uji URL builder |
| Browser tidak bisa silent print | Gunakan dialog `window.print()` dan konfigurasi printer melalui OS |
| Laravel Boost membaca proyek lain | Gunakan file repo dan Artisan lokal sampai koneksi Boost diperbaiki |

## Urutan Eksekusi Singkat

1. Selesaikan autentikasi, role, rate limiting, dan hapus fallback pengguna (`P0`).
2. Pastikan queue perangkat kosong, lalu hapus PWA, sync, push, dan tabel terkait (`P1`).
3. Bangun sumber pengaturan toko dan pencetakan struk browser (`P2`).
4. Tambahkan source transaksi dan input manual pesanan WhatsApp di POS (`P3`).
5. Bangun storefront minimum serta tautan WhatsApp (`P4`).
6. Jalankan regression test, staging migration, dan deployment checklist (`P5`).

Jangan memulai `P4` untuk production sebelum `P0` selesai. Jangan menjalankan migration penghapusan `P1` sebelum seluruh perangkat kasir dipastikan tidak memiliki transaksi offline tertunda.
