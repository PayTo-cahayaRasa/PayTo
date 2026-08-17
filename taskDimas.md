# Fitur Lupa Password via Email Reset Link

## Active Skills

- `brainstorming` — desain telah ditetapkan: pemulihan mandiri dengan email reset link.
- `laravel-specialist` — memakai password broker bawaan Laravel 12.
- `laravel-tdd` — cakupan PHPUnit untuk alur reset.
- `security-review` — token, anti-enumeration, throttling, dan invalidasi sesi.

## SPEC

**Goal:** Pengguna kasir maupun supervisor dapat meminta tautan reset melalui email pribadi, lalu mengganti password login secara aman.

**Scope:**

- Email wajib dan unik untuk seluruh pengguna.
- Seeder membuat akun awal dengan email dari konfigurasi environment.
- Profil masing-masing pengguna dapat menampilkan dan mengganti emailnya sendiri.
- Halaman login menyediakan aksi **“Lupa password?”**.
- Link reset dikirim ke email terdaftar menggunakan mekanisme password reset Laravel.
- Pengguna dapat mengganti `password_hash`, lalu login kembali dengan password baru.

**Non-goals:**

- Reset PIN kasir/supervisor melalui email.
- OTP WhatsApp/SMS.
- Penggantian email oleh supervisor atas nama pengguna lain, kecuali sudah memang didukung oleh menu staf terpisah.

### Acceptance Criteria

- [ ] `users.email` ada, unik, dan wajib diisi untuk akun aktif.
- [ ] Seeder akun Cahaya Rasa menyimpan email yang berasal dari konfigurasi, bukan hard-code.
- [ ] Login page memiliki link ke halaman permintaan reset password.
- [ ] Request reset menerima email dan selalu memberi respons sukses generik, tanpa menyatakan apakah email terdaftar.
- [ ] Hanya akun aktif dengan email valid yang menerima email berisi link reset.
- [ ] Link reset bertoken, sekali pakai, dan mengikuti masa berlaku broker Laravel (saat ini 60 menit).
- [ ] Password baru memenuhi aturan password aplikasi: minimal 8 karakter, huruf besar/kecil, angka, dan simbol.
- [ ] Password disimpan pada `password_hash`, bukan kolom `password`.
- [ ] Setelah password berhasil direset, token tidak lagi dapat dipakai dan password baru dapat dipakai login.
- [ ] Profil admin dan kasir dapat memperbarui email miliknya sendiri dengan validasi unique.
- [ ] Semua alur utama, kegagalan validasi, token invalid/kedaluwarsa, serta email yang tidak ditemukan diuji.

## Repository Findings

- `auth.php` sudah menyiapkan broker `users`, tabel `password_reset_tokens`, throttle 60 detik, dan kedaluwarsa token 60 menit.
- `User` sudah menggunakan `Notifiable`, tetapi autentikasi kustom memverifikasi `password_hash` pada `User::fetchForLogin()`.
- `users` belum memiliki `email`; `UserSeeder` juga belum memberikan email.
- Mailer default pada `mail.php` adalah `log`; SMTP perlu diatur pada `.env` agar email benar-benar terkirim.
- Profile API admin hanya menampilkan email semu (`username` yang mengandung `@`) pada `AdminProfileController`; POS profile belum mengirim email.
- Profile UI saat ini bersifat tampilan saja: `ProfileTab.tsx` dan `ProfileView.tsx` belum punya form/endpoint pembaruan.
- Manajemen staf sudah mempunyai pola Form Request, API controller, rate limiting, dan test feature yang dapat diikuti.

## PLAN

- [ ] **1. Siapkan fondasi data pengguna**
  - Buat migration untuk menambah `users.email` yang nullable terlebih dahulu, isi email untuk data yang sudah ada, kemudian tambahkan unique index dan jadikan wajib setelah data tervalidasi.
  - Perbarui `User.php`: masukkan `email` ke `$fillable`, cast yang relevan, dan jadikan model kompatibel penuh dengan password broker Laravel.
  - Pastikan migration password-reset bawaan Laravel tersedia dan tabel `password_reset_tokens` ada pada instalasi baru maupun database existing.
  - Perbarui `UserFactory.php` agar setiap user test memiliki email unik.

- [ ] **2. Perbarui pembuatan dan manajemen staf**
  - Tambahkan nilai email pada `seeders.php`, menggunakan environment variables baru untuk email kasir dan supervisor.
  - Perbarui `UserSeeder.php` agar menyimpan `email` dari config ke akun awal.
  - Tambahkan rule `email:rfc,dns` dan `unique:users,email` pada `StaffStoreRequest` dan `StaffUpdateRequest`.
  - Perbarui `StaffManagementController` untuk menyimpan dan mengembalikan email pada data staf.
  - Sesuaikan UI manajemen staf bila form staf telah ada agar input email wajib dikirim bersama request.

- [ ] **3. Bangun endpoint profil mandiri**
  - Buat Form Request khusus pembaruan email profil, dengan autentikasi pengguna saat ini dan rule email unik yang mengecualikan akun sendiri.
  - Tambahkan endpoint terautentikasi untuk membaca serta mengubah email milik sendiri; endpoint tidak boleh menerima ID pengguna agar pengguna tidak dapat mengubah email orang lain.
  - Perbarui `AdminProfileController` agar memakai `$user->email`, bukan inferensi dari username.
  - Perbarui `ProfileQueryController` untuk mengirim email pada payload profil kasir.
  - Hubungkan `ProfileTab.tsx` dan `ProfileView.tsx` ke endpoint profil tersebut: tampilkan email, form edit, loading state, error validasi, serta konfirmasi sukses.

- [ ] **4. Implementasi backend lupa password**
  - Buat dua Form Request:
    - request email reset: `email` wajib dan valid;
    - request reset: `token`, `email`, `password`, `password_confirmation`, dengan policy password yang sama seperti staff management.
  - Buat controller autentikasi khusus untuk:
    - menampilkan halaman request reset;
    - mengirim reset link melalui `Password::sendResetLink()`;
    - menampilkan halaman reset berdasarkan token;
    - mengubah `password_hash` melalui `Password::reset()`.
  - Pada callback reset, set hanya `password_hash` dengan `Hash::make()`, perbarui `remember_token`, dan tidak menyentuh `pin_hash`.
  - Gunakan pesan respons publik yang sama untuk email terdaftar dan tidak terdaftar, misalnya: *“Jika email terdaftar, tautan reset telah dikirim.”*
  - Pastikan user tidak aktif tidak mendapatkan link reset—tetapi tetap menerima respons generik yang sama.
  - Tambahkan route guest bernama untuk request/reset serta `throttle` khusus reset password. Route reset final harus POST dan meminta token; tidak ada token pada URL log selain parameter link yang memang diperlukan.

- [ ] **5. Tambahkan antarmuka Inertia React**
  - Tambahkan link **“Lupa password?”** pada mode username di `login.tsx`; link tidak ditampilkan atau tidak mengubah alur login PIN.
  - Buat halaman Inertia untuk memasukkan email dan status setelah submit.
  - Buat halaman Inertia reset password yang membaca token route/query, menerima email, password baru, serta konfirmasi password.
  - Ikuti bahasa Indonesia, gaya Tailwind, states loading, dan penanganan error dari halaman login saat ini.
  - Setelah berhasil reset, arahkan pengguna ke `/login` dengan pesan bahwa password telah diubah; jangan melakukan login otomatis.

- [ ] **6. Konfigurasi pengiriman email**
  - Lengkapi contoh konfigurasi `.env.example`/konfigurasi environment yang sudah dilacak dengan `MAIL_MAILER=smtp`, host, port, username, password, encryption/scheme, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, dan `APP_URL`.
  - Jangan menyimpan kredensial SMTP nyata pada `.env` yang di-commit.
  - Untuk pengembangan gunakan mailer `log` atau sandbox SMTP; untuk produksi gunakan provider SMTP yang valid.
  - Verifikasi bahwa `APP_URL` merepresentasikan domain publik aplikasi karena Laravel membentuk reset URL dari konfigurasi aplikasi.

- [ ] **7. TDD dan regresi**
  - **RED:** tambahkan test PHPUnit yang membuktikan halaman request reset dapat diakses guest, email valid mengantrekan/mengirim `ResetPassword` notification, dan test gagal sebelum implementasi.
  - **RED:** uji email tidak terdaftar dan akun tidak aktif mendapat respons generik yang sama serta tidak menerima notification.
  - **RED:** uji throttle pengiriman link.
  - **RED:** uji reset valid mengubah `password_hash`, mengizinkan login dengan password baru, menghapus/menghabiskan token, serta meregenerasi remember token.
  - **RED:** uji token invalid/kedaluwarsa dan password lemah gagal tanpa mengubah password.
  - **RED:** uji endpoint profil: pengguna bisa mengubah email sendiri, email duplikat ditolak, dan pengguna tidak dapat mengubah profil pihak lain.
  - **GREEN:** implementasikan minimal sampai semua test target lulus.
  - Jalankan Pint lalu test terfokus.

## Risks

- **Migrasi data lama:** akun yang telah ada belum memiliki email. Migration tidak boleh langsung membuat kolom `NOT NULL` sebelum email setiap user dipenuhi.
- **Email delivery:** reset link hanya berfungsi di luar lokal setelah SMTP dan `APP_URL` benar di `.env`.
- **Kustom password field:** Laravel default memakai kolom `password`, sedangkan aplikasi memakai `password_hash`; implementasi harus secara eksplisit memastikan Password Broker mengubah `password_hash`.
- **Pengubahan email:** karena email menjadi recovery identifier, endpoint profil harus hanya mengubah user yang sedang terautentikasi dan wajib menerapkan unique validation.

## Verification

- `php artisan test --compact tests/Feature/AuthenticationAuthorizationTest.php` — autentikasi yang ada tetap lulus.
- Test feature baru khusus password reset — reset request, notification, token, password policy, invalid token, dan throttle lulus.
- Test feature profile — pembaruan email sendiri dan penolakan email duplikat lulus.
- `vendor/bin/pint --dirty --format agent` — kode PHP sesuai style.
- Uji manual dengan mailer sandbox/log: request reset menghasilkan notification, link membuka halaman reset, password baru dapat login.
