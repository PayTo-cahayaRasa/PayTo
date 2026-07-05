# Overview Arsitektur Sistem

Dokumen ini menjelaskan keputusan desain arsitektur di balik sistem POS PayTo dan mengapa mereka dipilih.

## Rationale Tech Stack

### Mengapa Laravel 12?

Laravel 12 dipilih sebagai fondasi backend karena memberikan keseimbangan yang excellent antara productivity dan performance developer. Ekosistem yang robust mencakup built-in authentication, Eloquent ORM untuk database operations, dan powerful routing system. Untuk sistem POS yang perlu handle concurrent transactions secara andal, database transaction support dan queue system Laravel sangat penting.

### Mengapa React 19 dengan Inertia v2?

Frontend menggunakan React 19 karena menawarkan JavaScript patterns paling modern dan developer experience terbaik untuk membangun interface interaktif. Inertia v2 dipilih khusus karena memungkinkan kita membangun Single Page Application (SPA) tanpa kompleksitas mengelola API backend terpisah. Kita mendapatkan manfaat client-side routing dan state management sambil menjaga aplikasi logic di Laravel controllers.

### Mengapa Tailwind CSS v4?

Tailwind CSS v4 menyediakan utility-first styling yang memungkinkan rapid UI development sambil maintain konsistensi di seluruh aplikasi. Utility classes membuatnya mudah menciptakan responsive designs yang bekerja di berbagai ukuran layar.

## Layer Arsitektur Aplikasi

### Frontend Layer (React + Inertia)

Frontend adalah SPA yang di-render di sisi client yang berkomunikasi dengan backend Laravel melalui Inertia's page protocol. React components tinggal di `resources/js/Pages`:
- `resources/js/Pages/kasir.tsx` - Halaman kasir/POS
- `resources/js/Pages/admin.tsx` - Admin dashboard

### Backend Layer (Laravel)

Backend di-structure menggunakan pola MVC klasik:
- Controllers di `app/Http/Controllers/Api/` dan `app/Http/Controllers/Pos/`
- Form request validation di `app/Http/Requests/`
- Business logic di service classes

### Data Layer (Database)

Database schema di-design mengelilingi core POS workflows:
- `products` - Product catalog
- `sales` - Sales transactions dengan multi-payment
- `sale_items` - Line items
- `payments` - Payment records
- `stock_items` / `stock_movements` - Inventory tracking
- `refunds` / `refund_items` - Refund processing
- `approvals` - Approval workflow

## Alur Checkout

1. Kasir scan barcode atau pilih produk
2. Frontend hit `/api/pos/checkout`
3. Backend validasi dan process sale dalam transaction
4. Stock dikurangi, sale recorded
5. Response dengan invoice details

## Strategy Autentikasi

**Level 1: Session-based Authentication**

Standard Laravel sessions menyimpan ID user yang terautentikasi.

**Level 2: Role-based Access Control**

Dua role ada di sistem:
- `CASHIER` - Akses ke halaman kasir
- `SUPERVISOR` - Akses penuh ke admin dashboard

Authorization di-implementasikan menggunakan middleware `role`.

## Mengapa Arsitektur Ini Berfungsi

**Konsistensi**: Dengan menggunakan Inertia, kita hindari inkonsistensi yang sering muncul ketika mengelola codebase frontend dan backend terpisah.

**Maintainability**: Pemisahan concern menjaga codebase lebih mudah dipahami.

**Skalabilitas**: Sistem session database-driven dan queue-backed operations berarti sistem bisa scale horizontal.

**Keandalan**: Database transactions memastikan data integrity.

**Keamanan**: Multiple authentication layers dan role-based access control mencegah unauthorized access.
