# Laporan Audit Keamanan PayTo
**Tanggal Audit:** 29 Juni 2026  
**Auditor:** Hermes Agent dengan laravel-security skill  
**Framework:** Laravel 12.x  
**Lokasi Project:** D:\MiniProject\PayTo

---

## Executive Summary

Audit keamanan menemukan **25 vulnerabilities** pada dependencies dan **beberapa isu keamanan kritis** yang memerlukan perbaikan segera sebelum deployment ke production.

### Tingkat Risiko Keseluruhan: 🔴 **HIGH**

---

## 1. CRITICAL ISSUES ⚠️

### 1.1 File .env Tersimpan di Repository
**Severity:** CRITICAL  
**Status:** ❌ GAGAL

```bash
# Ditemukan:
WARNING: .env file exists in repository!
```

**Risiko:**
- Secret keys, database credentials, dan API keys bisa ter-expose di version control
- Jika repository public atau ter-leak, semua credentials akan terbuka

**Rekomendasi:**
```bash
# Hapus .env dari git tracking
git rm --cached .env
git commit -m "Remove .env from version control"

# Pastikan .gitignore sudah benar (sudah OK)
# Verifikasi tidak ada .env di history:
git log --all --full-history -- .env
# Jika ada, consider git filter-branch atau BFG Repo-Cleaner
```

### 1.2 Dependencies dengan Security Vulnerabilities
**Severity:** HIGH/MEDIUM  
**Status:** ❌ GAGAL

**25 vulnerabilities terdeteksi** pada 12 packages:

#### High Severity (3 issues):
1. **web-token/jwt-library** - RSA1_5 Bleichenbacher/Marvin padding oracle
2. **web-token/jwt-library** - Chacha20Poly1305 authentication bypass
3. **phpseclib/phpseclib** - Security advisory PKSA-4n73-5wbj-mgqr

#### Medium Severity (22 issues):
- **guzzlehttp/guzzle** (<7.12.1): Cookie domain & HTTPS proxy vulnerabilities
- **guzzlehttp/psr7** (<2.12.1): CRLF injection vulnerabilities
- **laravel/framework** (<12.61.1): Temporary Signed URL Path Confusion
- **league/flysystem** (<3.34.0): Path traversal
- **monolog/monolog** (<3.11.0): Session fixation
- **phpseclib/phpseclib**: Multiple crypto vulnerabilities
- **symfony components**: Multiple XSS and injection issues

**Rekomendasi:**
```bash
# Update semua dependencies
composer update

# Atau update spesifik packages yang vulnerable:
composer require guzzlehttp/guzzle:^7.12.1
composer require guzzlehttp/psr7:^2.12.1
composer require laravel/framework:^12.61.1
composer require league/flysystem:^3.34.0
composer require monolog/monolog:^3.11.0

# Jalankan audit setelah update
composer audit
```

### 1.3 Tidak Ada Rate Limiting pada Authentication & API
**Severity:** HIGH  
**Status:** ❌ GAGAL

**Routes tanpa throttling:**
```php
// routes/web.php
Route::post('/login', [...]);  // ❌ Tidak ada rate limit

// routes/api.php
Route::post('/pos/checkout', [...]);  // ❌ Tidak ada rate limit
Route::post('/admin/approvals/{approval}/approve', [...]);  // ❌ Tidak ada rate limit
```

**Risiko:**
- Brute force attacks pada login (username/password & PIN)
- API abuse dan DoS attacks
- Credential stuffing attacks

**Rekomendasi:**
```php
// routes/web.php
Route::post('/login', [...])->middleware('throttle:5,1');  // 5 attempts per minute

// routes/api.php (gunakan named rate limiter)
// Di bootstrap/app.php atau AppServiceProvider:
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('pos-checkout', function (Request $request) {
    return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
});

// Terapkan ke routes:
Route::middleware('throttle:api')->group(function () {
    // API routes here
});

Route::post('/pos/checkout', [...])->middleware('throttle:pos-checkout');
```

### 1.4 API Routes Tanpa Authentication Middleware
**Severity:** CRITICAL  
**Status:** ❌ GAGAL

**Semua API routes tidak memiliki middleware auth:**
```php
// routes/api.php - SEMUA endpoint tidak protected!
Route::get('/admin/dashboard', [...]);  // ❌ Siapa saja bisa akses
Route::post('/admin/products', [...]);   // ❌ Siapa saja bisa create
Route::delete('/admin/products/{product}', [...]);  // ❌ Siapa saja bisa delete
Route::post('/pos/checkout', [...]);     // ❌ Siapa saja bisa checkout
```

**Workaround di controller (tidak ideal):**
```php
// AdminProfileController.php line 17-20
$user = request()->user();
if (!$user || $user->role !== 'SUPERVISOR') {
    $user = User::query()->where('role', 'SUPERVISOR')->orderBy('id')->first();
}
```
☝️ **Ini fallback yang berbahaya!** Jika tidak ada user authenticated, akan gunakan SUPERVISOR pertama.

**Rekomendasi:**
```php
// routes/api.php - Tambahkan middleware auth
use Illuminate\Support\Facades\Route;

// Public routes (jika ada)
Route::post('/push/subscriptions', [...]);

// Protected POS routes
Route::middleware(['auth:sanctum'])->prefix('pos')->group(function () {
    Route::get('/products', [...]);
    Route::post('/checkout', [...]);
    Route::post('/refunds', [...]);
    Route::post('/logout', [...]);
    // ... other pos routes
});

// Protected Admin routes (tambahkan role middleware)
Route::middleware(['auth:sanctum', 'role:SUPERVISOR'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [...]);
    Route::apiResource('products', ProductQueryController::class);
    Route::apiResource('staff', StaffManagementController::class);
    // ... other admin routes
});
```

**Buat Role Middleware:**
```php
// app/Http/Middleware/EnsureUserHasRole.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        return $next($request);
    }
}

// Daftarkan di bootstrap/app.php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role' => \App\Http\Middleware\EnsureUserHasRole::class,
    ]);
})
```

### 1.5 Tidak Ada CSRF Protection untuk State-Changing Operations
**Severity:** HIGH  
**Status:** ⚠️ PARTIAL

**Status:**
- Web routes: CSRF protection aktif (Laravel default)
- API routes: ❌ Tidak ada CSRF protection (by design untuk stateless API)

**Namun ada masalah:**
```php
// routes/web.php
Route::post('/login', [...]); // ✅ CSRF protected
// Tapi tidak ada CSRF token di form jika menggunakan Inertia
```

**Rekomendasi untuk SPA (Inertia):**
```php
// config/sanctum.php - Pastikan stateful domains configured
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),

// Gunakan Sanctum middleware untuk API + SPA:
Route::middleware(['web'])->group(function () {
    Route::post('/login', [...]);
});
```

---

## 2. HIGH PRIORITY ISSUES 🔴

### 2.1 Session Configuration - Insecure Cookies
**Severity:** HIGH  
**Status:** ❌ GAGAL

```php
// config/session.php
'secure' => env('SESSION_SECURE_COOKIE', false),  // ❌ Default false
'http_only' => true,  // ✅ OK
'same_site' => 'lax',  // ✅ OK
'encrypt' => env('SESSION_ENCRYPT', false),  // ❌ Default false
```

```bash
# .env.example
SESSION_ENCRYPT=false  # ❌ Tidak encrypted
# SESSION_SECURE_COOKIE tidak ada
```

**Risiko:**
- Session cookies bisa dikirim via HTTP (tidak encrypted) → man-in-the-middle
- Session data tidak encrypted di storage

**Rekomendasi:**
```bash
# .env.example & production .env
SESSION_SECURE_COOKIE=true   # Force HTTPS-only cookies
SESSION_ENCRYPT=true          # Encrypt session data
```

### 2.2 Tidak Ada HTTPS Enforcement
**Severity:** HIGH (untuk production)  
**Status:** ❌ GAGAL

**Tidak ada middleware atau config untuk force HTTPS di production.**

**Rekomendasi:**
```php
// app/Providers/AppServiceProvider.php
namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
```

Atau buat middleware:
```php
// app/Http/Middleware/ForceHttps.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttps
{
    public function handle(Request $request, Closure $next): mixed
    {
        if (!$request->secure() && app()->environment('production')) {
            return redirect()->secure($request->getRequestUri());
        }
        return $next($request);
    }
}

// Daftarkan sebagai global middleware di bootstrap/app.php
```

### 2.3 PIN Authentication Vulnerability - Timing Attack
**Severity:** MEDIUM-HIGH  
**Status:** ⚠️ CONCERN

```php
// app/Models/User.php line 85-100
public static function fetchForPin(string $plainPin, ?string $role = null): ?self
{
    $candidates = static::query()
        ->when($role, fn (Builder $query) => $query->where('role', $role))
        ->whereNotNull('pin_hash')
        ->where('is_active', true)
        ->cursor();  // ⚠️ Load ALL active users

    foreach ($candidates as $user) {
        if (Hash::check($plainPin, $user->pin_hash)) {  // ⚠️ Check each one
            return $user;
        }
    }
    return null;
}
```

**Masalah:**
1. **Timing attack vulnerable:** Response time berbeda tergantung berapa banyak hash di-check
2. **Performance issue:** Jika 100 kasir, akan check 100 bcrypt hashes (sangat lambat)
3. **No rate limiting:** Attacker bisa brute force 6-digit PIN (1 juta kombinasi)

**Rekomendasi:**
```php
// Solusi 1: Tambahkan username/ID ke PIN login
// Login dengan: user_id + PIN (bukan PIN saja)
// Ini menghilangkan need untuk iterate semua users

// Solusi 2: Gunakan constant-time comparison + rate limiting ketat
RateLimiter::for('pin-login', function (Request $request) {
    return Limit::perMinute(3)->by($request->ip());  // Max 3 attempts per minute
});

// Solusi 3: Implement account lockout after failed attempts
// Track failed attempts dan lock account selama X minutes
```

### 2.4 Missing Input Sanitization untuk XSS
**Severity:** MEDIUM-HIGH  
**Status:** ⚠️ NEEDS REVIEW

**Request validation OK, tapi tidak ada explicit HTML sanitization:**
```php
// PosCheckoutRequest.php
'reference' => ['nullable', 'string', 'max:255'],  // ✅ Limited length
// ❌ Tapi tidak ada sanitization untuk HTML/script tags
```

**Rekomendasi:**
```php
// Tambahkan custom validation rule atau sanitize di FormRequest
public function rules(): array
{
    return [
        'reference' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-_]+$/'],
        // Atau gunakan strip_tags / htmlspecialchars di prepareForValidation()
    ];
}

protected function prepareForValidation(): void
{
    if ($this->has('reference')) {
        $this->merge([
            'reference' => strip_tags($this->reference),
        ]);
    }
}
```

### 2.5 Tidak Ada Security Headers Middleware
**Severity:** MEDIUM  
**Status:** ❌ GAGAL

**Headers yang hilang:**
- `X-Frame-Options` (clickjacking protection)
- `X-Content-Type-Options` (MIME sniffing protection)
- `Content-Security-Policy` (XSS protection)
- `Strict-Transport-Security` (HTTPS enforcement)
- `Referrer-Policy`

**Rekomendasi:**
```php
// app/Http/Middleware/SecurityHeaders.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);
        
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        
        // CSP (sesuaikan dengan kebutuhan app)
        $response->headers->set('Content-Security-Policy', 
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        );
        
        return $response;
    }
}

// Daftarkan sebagai global middleware
```

---

## 3. MEDIUM PRIORITY ISSUES 🟡

### 3.1 Mass Assignment Protection - Models Tanpa Guards
**Severity:** MEDIUM  
**Status:** ⚠️ NEEDS REVIEW

**Semua models menggunakan `$fillable` (✅ good practice):**
```php
// User.php
protected $fillable = [
    'name', 'email', 'password', 'last_login_at', 'last_logout_at', 'work_date', 'work_seconds',
];

// Sale.php
protected $fillable = [
    'server_invoice_no', 'local_txn_uuid', 'status', 'cashier_id', 'subtotal', ...
];
```

**✅ AMAN** - Tidak ada `$guarded = []` yang ditemukan.

**Rekomendasi:**
- Keep using `$fillable` whitelist
- Never use `$guarded = []`
- Review apakah semua fields di `$fillable` benar-benar boleh mass-assigned

### 3.2 Logging dan Audit Trail
**Severity:** MEDIUM  
**Status:** ❌ MISSING

**Tidak ditemukan:**
- Security event logging (failed logins, password changes, role changes)
- Audit trail untuk financial transactions
- Suspicious activity monitoring

**Rekomendasi:**
```php
// app/Services/SecurityLogger.php
namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

final class SecurityLogger
{
    public static function log(string $event, array $context = []): void
    {
        Log::channel('security')->warning($event, array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }
}

// Usage di PosLoginController:
if (! $user) {
    SecurityLogger::log('failed_login_attempt', [
        'login_method' => $loginMethod,
        'username' => $request->input('username'),
    ]);
    return response()->json(['message' => 'Kredensial tidak valid.'], 422);
}

SecurityLogger::log('successful_login', ['login_method' => $loginMethod]);
```

```php
// config/logging.php - Tambahkan channel security
'channels' => [
    'security' => [
        'driver' => 'single',
        'path' => storage_path('logs/security.log'),
        'level' => 'warning',
    ],
    // ... other channels
],
```

### 3.3 Password Policy Tidak Ada
**Severity:** MEDIUM  
**Status:** ❌ MISSING

**Tidak ada validation rules untuk password strength.**

**Rekomendasi:**
```php
// Saat registrasi/update password, gunakan Laravel Password rules:
use Illuminate\Validation\Rules\Password;

public function rules(): array
{
    return [
        'password' => [
            'required',
            'confirmed',
            Password::min(12)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(),  // Check against haveibeenpwned database
        ],
    ];
}

// .env
BCRYPT_ROUNDS=12  // ✅ Already set correctly
```

### 3.4 Database Query Injection Risk
**Severity:** LOW-MEDIUM  
**Status:** ✅ MOSTLY SAFE

**Review code:**
- ✅ Menggunakan Eloquent ORM (built-in protection)
- ✅ Query builder dengan parameter binding
- ❌ Tidak ditemukan raw queries yang vulnerable

**Tetap waspada:**
```php
// AMAN ✅
User::where('username', $username)->first();

// BAHAYA ❌ (jangan lakukan ini)
DB::select("SELECT * FROM users WHERE username = '$username'");

// AMAN ✅ (dengan binding)
DB::select("SELECT * FROM users WHERE username = ?", [$username]);
```

### 3.5 File Upload Security (jika ada)
**Severity:** MEDIUM  
**Status:** ℹ️ NOT APPLICABLE

**Tidak ditemukan file upload functionality di code yang di-review.**

Jika ditambahkan di masa depan, pastikan:
- Validate MIME type (gunakan `mimes` atau `mimetypes` validation)
- Limit file size
- Store uploaded files di non-public directory atau CDN
- Generate random filenames
- Scan untuk malware jika menerima executable files

---

## 4. LOW PRIORITY / BEST PRACTICES 🟢

### 4.1 Environment Configuration
**Status:** ⚠️ NEEDS IMPROVEMENT

```bash
# .env.example
APP_DEBUG=true  # ❌ Should be false by default
APP_ENV=local   # ✅ OK for example

# Missing important vars:
SESSION_SECURE_COOKIE=  # Add with default true
SESSION_ENCRYPT=        # Add with default false (true for production)
```

**Rekomendasi:**
```bash
# .env.example - Set production-safe defaults
APP_ENV=production
APP_DEBUG=false
SESSION_SECURE_COOKIE=true
SESSION_ENCRYPT=true
```

### 4.2 APP_KEY Validation
**Status:** ⚠️ SHOULD ADD

**Tidak ada runtime validation untuk APP_KEY.**

**Rekomendasi:**
```php
// bootstrap/app.php atau AppServiceProvider::boot()
if (empty(config('app.key'))) {
    throw new RuntimeException('APP_KEY is not set. Run: php artisan key:generate');
}
```

### 4.3 Trusted Proxies Configuration
**Status:** ℹ️ MISSING (OK untuk development)

**Jika menggunakan load balancer/proxy di production:**
```php
// app/Http/Middleware/TrustProxies.php
protected $proxies = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];
// NEVER use '*' - allows X-Forwarded-* spoofing
```

### 4.4 Queue Job Security
**Status:** ℹ️ NOT REVIEWED

**Jika menggunakan queues untuk payment processing, pastikan:**
```php
// Implement ShouldBeEncrypted for sensitive job data
use Illuminate\Contracts\Queue\ShouldBeEncrypted;

final class ProcessPaymentJob implements ShouldQueue, ShouldBeEncrypted
{
    // Job implementation
}
```

---

## 5. COMPLIANCE CHECKLIST

| Check | Status | Priority |
|-------|--------|----------|
| APP_DEBUG=false in production | ⚠️ Not enforced | CRITICAL |
| APP_KEY set | ⚠️ No runtime check | HIGH |
| HTTPS enforced | ❌ Missing | HIGH |
| $fillable whitelisted | ✅ OK | - |
| CSRF active | ✅ Web routes OK | - |
| Authentication middleware | ❌ Missing on API | CRITICAL |
| Rate limiting applied | ❌ Missing | HIGH |
| Input validation | ✅ Using FormRequest | - |
| File upload restrictions | N/A | - |
| composer audit clean | ❌ 25 vulnerabilities | CRITICAL |
| Password hashing | ✅ Using bcrypt | - |
| Session regeneration on login | ✅ Implemented | - |
| Security headers middleware | ❌ Missing | MEDIUM |
| Logged security events | ❌ Missing | MEDIUM |
| .env not committed | ⚠️ File exists | CRITICAL |

**Score: 6/15 checks passed** ❌

---

## 6. IMMEDIATE ACTION PLAN

### Phase 1: Critical Fixes (Deploy in 1-2 days)

1. **Remove .env dari repository**
   ```bash
   git rm --cached .env
   git commit -m "security: Remove .env from version control"
   ```

2. **Update vulnerable dependencies**
   ```bash
   composer update
   composer audit
   ```

3. **Add authentication middleware ke semua API routes**
   ```php
   Route::middleware(['auth:sanctum'])->group(function () {
       // All API routes
   });
   ```

4. **Add rate limiting**
   ```php
   Route::post('/login', [...])->middleware('throttle:5,1');
   Route::middleware('throttle:api')->group(function () {
       // API routes
   });
   ```

### Phase 2: High Priority (Deploy in 1 week)

5. **Configure production-safe sessions**
   ```bash
   SESSION_SECURE_COOKIE=true
   SESSION_ENCRYPT=true
   ```

6. **Implement HTTPS enforcement**
   ```php
   // AppServiceProvider::boot()
   URL::forceScheme('https');
   ```

7. **Add security headers middleware**

8. **Fix PIN authentication timing attack**
   - Add stricter rate limiting
   - Consider requiring user_id + PIN

### Phase 3: Medium Priority (Deploy in 2 weeks)

9. **Implement security logging**
10. **Add password policy validation**
11. **Create role-based middleware**
12. **Add APP_KEY runtime validation**

### Phase 4: Best Practices (Ongoing)

13. **Setup monitoring & alerting untuk failed login attempts**
14. **Regular composer audit di CI/CD pipeline**
15. **Penetration testing sebelum production launch**
16. **Setup Web Application Firewall (WAF) di production**

---

## 7. RECOMMENDED COMPOSER UPDATES

```bash
# Update vulnerable packages
composer require guzzlehttp/guzzle:^7.12.1
composer require guzzlehttp/psr7:^2.12.1
composer require laravel/framework:^12.61.1
composer require league/flysystem:^3.34.0
composer require monolog/monolog:^3.11.0
composer require phpseclib/phpseclib:^3.0.45
composer require symfony/http-foundation:^7.3.0
composer require symfony/http-kernel:^7.3.0

# Verify
composer audit
```

---

## 8. PRODUCTION DEPLOYMENT CHECKLIST

**Before deploying to production, ensure:**

- [ ] .env tidak ter-commit di git
- [ ] APP_KEY sudah di-generate untuk production
- [ ] APP_DEBUG=false
- [ ] APP_ENV=production
- [ ] SESSION_SECURE_COOKIE=true
- [ ] SESSION_ENCRYPT=true
- [ ] composer audit returns 0 vulnerabilities
- [ ] All API routes protected dengan auth middleware
- [ ] Rate limiting enabled pada login & critical endpoints
- [ ] HTTPS enforcement enabled
- [ ] Security headers middleware active
- [ ] Security logging configured
- [ ] Database backups automated
- [ ] Monitoring & alerting setup

---

## 9. CONCLUSION

Project PayTo memiliki **beberapa vulnerability kritis** yang harus diperbaiki sebelum production deployment:

1. **File .env ter-expose** di repository
2. **25 dependency vulnerabilities** (3 high, 22 medium)
3. **API routes tidak protected** dengan authentication
4. **Tidak ada rate limiting** - rentan brute force
5. **Session cookies tidak secure** untuk HTTPS

**Estimasi waktu perbaikan:** 2-3 hari untuk critical issues.

**Risk assessment:** Project **TIDAK SIAP** untuk production deployment tanpa fixing critical issues di atas.

---

## 10. REFERENCES

- [Laravel Security Best Practices](https://laravel.com/docs/12.x/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Skill Documentation](file://D:/Tools/hermes/skills/laravel-security/SKILL.md)
- [Composer Security Audit](https://getcomposer.org/doc/03-cli.md#audit)

---

**Report generated by:** Hermes Agent + laravel-security skill  
**Contact:** Jika ada pertanyaan tentang report ini
