# Overview Arsitektur Sistem

Dokumen ini menjelaskan keputusan desain arsitektur di balik sistem POS PayTo dan mengapa mereka dipilih.

## Rationale Tech Stack

### Mengapa Laravel 12?

Laravel 12 dipilih sebagai fondasi backend karena memberikan keseimbangan yang excellent antara productivity dan performance developer. Ekosistem yang robust mencakup built-in authentication, Eloquent ORM untuk database operations, dan powerful routing system. Untuk sistem POS yang perlu handle concurrent transactions secara andal, database transaction support dan queue system Laravel sangat penting. Kematangan framework berarti solusi battle-tested untuk masalah umum seperti concurrency, data validation, dan error handling sudah tersedia.

### Mengapa React 19 dengan Inertia v2?

Frontend menggunakan React 19 karena menawarkan JavaScript patterns paling modern dan developer experience terbaik untuk membangun interface interaktif. Inertia v2 dipilih khusus karena memungkinkan kita membangun Single Page Application (SPA) tanpa kompleksitas mengelola API backend terpisah. Kita mendapatkan manfaat client-side routing dan state management sambil menjaga aplikasi logic di Laravel controllers. Arsitektur ini sangat mengurangi waktu development dan menjaga type safety di seluruh stack.

### Mengapa Tailwind CSS v4?

Tailwind CSS v4 menyediakan utility-first styling yang memungkinkan rapid UI development sambil maintain konsistensi di seluruh aplikasi. Utility classes membuatnya mudah menciptakan responsive designs yang bekerja di berbagai ukuran layar—dari desktop registers hingga mobile devices. Sistem konfigurasi Tailwind memungkinkan kita maintain design language yang konsisten melalui theme colors, spacing scale, dan typography system.

## Layer Arsitektur Aplikasi

### Frontend Layer (React + Inertia)

Frontend adalah SPA yang di-render di sisi client yang berkomunikasi dengan backend Laravel melalui Inertia's page protocol. Berbeda dengan API tradisional yang mengembalikan JSON, Inertia mengembalikan halaman yang fully rendered yang di-mount di sisi client. Pendekatan ini menjaga code kita DRY—Laravel controllers menangani baik data retrieval maupun page rendering. React components tinggal di `resources/js/Pages` dan di-organize berdasarkan feature (POS interface untuk kasir, admin dashboard untuk manager).

Frontend maintain local state untuk UI interactions (open modals, form inputs) sementara Inertia props menangani server-side data. Pemisahan concern ini menjaga components focused dan testable.

### Backend Layer (Laravel)

Backend di-structure menggunakan pola MVC klasik dengan beberapa modern Laravel 12 conventions. Controllers menangani HTTP requests, form request validation memastikan data integrity, dan services encapsulate business logic. Service `CheckoutProcessor` adalah contoh utama—dengan mengekstrak checkout logic ke service dedicated, kita bisa reuse di berbagai konteks (online checkout, offline batch sync, refunds) tanpa duplicate code.

Database operations menggunakan Eloquent ORM secara eksklusif. Ini menyediakan beberapa manfaat: relationship methods membuat querying related data intuitive dan mencegah N+1 query problems, casts memastikan data types konsisten, dan query builders memungkinkan complex queries sambil maintain readability.

### Data Layer (Database)

Database schema di-design mengelilingi core POS workflows: products, sales, refunds, dan inventory management. Setiap entity memiliki Eloquent model yang sesuai dengan relationship methods yang mendefinisikan bagaimana entity berinteraksi. Misalnya, `Sale` memiliki banyak `SaleItem` records, dan setiap `SaleItem` milik `Product`.

Schema mencakup data "snapshot" (seperti `product_name_snapshot` pada sale items) dan data "current" (seperti product stock). Pemilihan desain ini memastikan bahwa historical records tetap akurat bahkan ketika product details berubah. Jika nama atau harga product berubah setelah sale, historical record mempertahankan nilai asli.

## Alur Request/Response

Ketika kasir menyelesaikan checkout:

1. Form React `PosCheckoutRequest` validasi input secara lokal menggunakan TypeScript types
2. Form submission trigger Inertia's `post` method dengan validation rules
3. Route Laravel mapping ke `PosCheckoutController@store`
4. Controller validasi request menggunakan form request class
5. `CheckoutProcessor` memulai database transaction
6. Stock divalidasi dan dikurangi untuk setiap product
7. Record Sale dan SaleItem dibuat
8. Record payment dibuat dengan payment method
9. Database transaction commit
10. Inertia redirect ke halaman sales history dengan success message

Untuk offline transactions, flow diverges:

1. Transactions disimpan di IndexedDB dengan unique `local_txn_uuid`
2. Saat online, `flushCheckoutQueue` mengirim batches ke sync endpoint
3. `PosSyncController` memproses setiap transaction
4. Idempotency keys mencegah duplicate processing
5. Results dikembalikan dengan status (PROCESSED, DUPLICATE, FAILED)

## Strategy Autentikasi

PayTo mengimplementasikan sistem autentikasi dual-layer:

**Level 1: Session-based Authentication**

Standard Laravel sessions menyimpan ID user yang terautentikasi. Session driver menggunakan database, yang menyediakan beberapa manfaat: session expiration di-track di database, sessions bisa di-invalidate secara global, dan kita bisa audit login/logout events. Sessions dikonfigurasi dengan timeouts dan secure cookie settings yang appropriate.

**Level 2: PIN-based POS Authentication**

Untuk keamanan dan accountability, setiap POS session memerlukan secondary PIN authentication. Ini memastikan bahwa ketika kasir meninggalkan register tidak terawasi, session terproteksi. PIN di-hash menggunakan bcrypt (terpisah dari password hash), dan login attempts di-log.

**Work Time Tracking**

Setiap login dikaitkan dengan work session yang di-track oleh `work_date` dan `work_seconds`. Ini memungkinkan hourly reporting dan shift analysis. Ketika user logout, duration session di-hitung dan disimpan.

## Role-Based Access Control

Dua role ada di sistem:

**CASHIER (Kasir)**

Kasir memiliki akses hanya ke interface POS. Mereka bisa view products, process sales, dan view history transaksi mereka sendiri. Mereka tidak bisa akses admin features seperti product management atau user administration. Pemisahan ini memastikan bahwa kasir tidak bisa manipulate sistem untuk keuntungan mereka.

**ADMIN (Supervisor)**

Admin memiliki akses full ke management dashboard. Mereka bisa manage products, process refunds, view inventory real-time, dan approve refund requests. Role admin di-design untuk store managers atau supervisors yang perlu oversight dari semua operations.

Authorization di-implementasikan menggunakan Laravel's policy system. Setiap resource memiliki policy yang sesuai yang mendefinisikan apa actions yang bisa dilakukan oleh user yang terautentikasi. Misalnya, `AdminPolicy` mungkin memungkinkan view semua products tapi restrict deletion ke super-admins.

## Mengapa Arsitektur Ini Berfungsi

Arsitektur memprioritaskan beberapa prinsip utama:

**Konsistensi**: Dengan menggunakan Inertia, kita hindari inkonsistensi yang sering muncul ketika mengelola codebase frontend dan backend terpisah. Types mengalir secara natural dari server ke client.

**Maintainability**: Pemisahan concern menjaga codebase lebih mudah dipahami. Controllers menangani HTTP concerns, services menangani business logic, dan models menangani data access.

**Skalabilitas**: Sistem session database-driven dan queue-backed operations berarti sistem bisa scale horizontal. Tambah lebih banyak application servers, dan mereka semua share session store yang sama.

**Keandalan**: Database transactions memastikan data integrity. Offline queue dengan idempotency keys berarti lost connections tidak menyebabkan lost sales.

**Keamanan**: Multiple authentication layers dan role-based access control mencegah unauthorized access. Password dan PIN hashing menggunakan algorithms standar industri.
