# Authentication and Authorization: Dual-Layer Security for POS

## Why Two Login Methods?

Most web applications use username/password authentication exclusively. PayTo adds a second authentication method—PIN-based login—for critical business reasons.

### The Cashier Problem

In a retail environment, multiple cashiers share the same register throughout the day:

- Shift changes: Cashier A finishes their shift, Cashier B takes over
- Breaks: Cashier steps away temporarily but doesn't log out
- Unattended register: Cashier leaves their station briefly

With only username/password authentication:

- **Security risk**: Passwords must be shared among cashiers, violating security best practices
- **Accountability: Hard to track who made which sale if multiple people use the same credentials
- **Convenience**: Typing complex passwords repeatedly is slow during busy periods

### Dual Authentication Solution

PayTo solves this with a two-tier system:

**Tier 1: Username/Password (for initial login)**
- Used for admin/login access
- Strong passwords enforced by the system
- Stored securely with bcrypt hashing

**Tier 2: PIN (for POS operations)**
- 6-digit numeric PIN (like ATM)
- Fast to enter on mobile/keypad devices
- Unique per cashier
- Stored separately from passwords

## Session Management

### Session Lifecycle

When a user accesses the POS system:

1. **Initial Authentication**
   - User enters username and password
   - Server validates credentials using `User::fetchForLogin()`
   - If successful, Laravel session is created
   - User is redirected to `/kasir` (POS page)

2. **POS Session Activation**
   - On the POS page, user enters 6-digit PIN
   - Server validates PIN using `User::fetchForPin()`
   - If successful, session is marked as "POS authenticated"
   - Cashier can now process transactions

3. **Session Invalidation**
   - When cashier logs out from admin panel
   - When PIN is reset by supervisor
   - When user is deactivated

### Session Storage

Laravel uses database-driven sessions (configured in `config/session.php`). This choice offers:

- **Persistence**: Sessions survive application restarts
- **Inspection**: Can query active sessions for debugging
- **Revocation**: Can invalidate all sessions for a user instantly
- **Audit**: Session start/end times are logged

The `sessions` table stores:
- Session ID (hash)
- User ID (foreign key to users table)
- Payload (serialized session data)
- Last activity timestamp
- IP address (for security auditing)

### Work Time Tracking

Each session tracks work duration:

```php
// From User model
'work_date' => 'date',        // Date of current shift
'work_seconds' => 'integer',  // Duration of current shift
```

**When cashier logs in**:
- `work_date` is set to today's date
- `work_seconds` is reset to 0

**During the shift**:
- `last_login_at` is updated to current timestamp
- Work time accumulates in memory

**When cashier logs out**:
- `last_logout_at` is set to current timestamp
- Total shift duration is calculated: `now() - last_login_at`
- `work_seconds` is updated to reflect total time worked today

This enables daily reporting: "Cashier X worked 4 hours today, processed 127 transactions."

## Role Enforcement

### The Role Model

Two roles exist in the system:

**CASHIER (KASIR)**

Cashiers are frontline staff who process sales. Their access is strictly limited:

- Can view products catalog
- Can process sales and refunds
- Can view their own transaction history
- **Cannot** access admin dashboard
- **Cannot** manage products or users
- **Cannot** view other cashiers' transactions

**ADMIN (SUPERVISOR)**

Admins are managers or supervisors. They have comprehensive access:

- Can view all products and inventory
- Can manage users (add, edit, deactivate cashiers)
- Can reset cashier PINs
- Can view all transactions across all cashiers
- Can approve/reject refund requests
- Can configure system settings

### Authorization Implementation

Laravel's authorization system enforces these rules using policies:

```php
// In a controller
$this->authorize('view', $user);  // Check if current user can view this user

// In a Blade template
@can('view-admin-dashboard')
    <a href="/admin">Admin Dashboard</a>
@endcan
```

**UserPolicy**:
```php
public function view(User $user, User $target)
{
    // Admins can view anyone
    if ($user->role === 'ADMIN') {
        return true;
    }
    
    // Cashiers can only view themselves
    return $user->id === $target->id;
}
```

**PosPolicy**:
```php
public function processSale(User $user)
{
    return $user->role === 'CASHIER' && $user->is_active;
}
```

### Role-Based Routing

Routes are protected using middleware:

```php
// web.php
Route::get('/admin', function () {
    return inertia('admin');
})->middleware('auth', 'role:ADMIN');

Route::get('/kasir', [PosController::class, 'index'])
    ->middleware('auth', 'role:CASHIER');
```

The `role` middleware checks the authenticated user's role and redirects if unauthorized.

## PIN Security

### PIN Hashing

PINs are hashed separately from passwords using bcrypt (same algorithm). The `users` table has:

```php
'pin_hash' => 'hashed',
'supervisor_pin_hash' => 'hashed',  // For supervisor-level PINs
```

**Security properties**:
- Bcrypt uses a cost factor (default 12) making brute force difficult
- Salt is automatically generated and stored with the hash
- Even if database is compromised, PINs remain protected

### PIN Change Policy

PINs can only be changed in two ways:

1. **Self-service**: Cashier can change their own PIN in the Profile view
2. **Supervisor reset**: Admin can reset cashier PIN using `resetPin` endpoint

Both methods require re-authentication with the old PIN for security.

### PIN Input UX

The PIN input field is designed for speed and security:

- Numeric keypad (6-digit limit)
- Masked input (shows asterisks)
- Clear error feedback for invalid PINs
- Auto-focus for quick entry

```tsx
<input
    type="password"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={6}
    value={pin}
    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
/>
```

## Logout and Session Cleanup

### The Logout Flow

When a user logs out:

1. **Client-side**: 
   - User clicks "Log Out" button
   - Inertia POST request sent to `/pos/logout`

2. **Server-side**:
   - `PosLogoutController` validates the user
   - `last_logout_at` is set to current timestamp
   - Session is invalidated
   - User is redirected to login page

3. **Post-logout**:
   - All session data is cleared
   - PIN is no longer valid (must re-authenticate)
   - Active sessions are removed from database

### Session Cleanup

Sessions are automatically cleaned up when:

- **Expiration**: Laravel's session garbage collector removes sessions older than the configured lifetime (typically 120 minutes of inactivity)
- **Manual invalidation**: Admins can invalidate specific sessions
- **User deactivation**: When a cashier is deactivated, their sessions are immediately invalidated

### Why Immediate Invalidation Matters

Immediate session cleanup is critical for security. If a cashier's device is stolen or compromised:

1. Session is invalidated on logout
2. Stolen device immediately loses access
3. No window for unauthorized use

## Audit Trail

### What Gets Logged

Every authentication event is recorded in the `audit_logs` table:

```php
// From AuditLog model
'event' => 'string',           // login, logout, pin_reset, failed_login
'ip_address' => 'string',      // User's IP
'user_agent' => 'string',      // Browser info
'details' => 'json',           // Additional context
```

**Events logged**:
- Successful login
- Failed login (wrong password)
- Failed PIN entry (wrong PIN)
- PIN reset
- Logout
- Session expiration

### Why Audit Logs Matter

Audit logs serve multiple purposes:

1. **Security investigation**: Trace who accessed what and when
2. **Compliance**: Meet regulatory requirements for access control
3. **Troubleshooting**: Identify if a cashier had authentication issues
4. **Fraud prevention**: Detect suspicious patterns (multiple failed logins)

### Example Audit Log Entry

```json
{
  "event": "login",
  "user_id": 42,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0",
  "details": {
    "username": "kasir_001",
    "role": "CASHIER"
  },
  "created_at": "2026-06-28T20:30:15Z"
}
```

## Best Practices Enforced

### Password Policy

While not explicitly enforced in the database, the login form guides best practices:

- Passwords must be at least 8 characters
- Mix of letters and numbers recommended
- No password is stored in plain text

### Session Timeout

Laravel sessions expire after inactivity (default 120 minutes). This prevents:

- Abandoned sessions from remaining active
- Unauthorized access if cashier forgets to log out
- Resource exhaustion from stale sessions

### Brute Force Protection

While not implemented yet, the system is designed to support rate limiting:

```php
// Can be added to login routes
'middleware' => 'throttle:6,1'  // 6 attempts per 1 minute
```

This would prevent automated attacks trying to guess passwords or PINs.

## Summary: Security Design Philosophy

The authentication system follows several key principles:

**Defense in Depth**: Two-factor authentication (password + PIN) protects against credential theft.

**Separation of Concerns**: Login credentials are separate from operational PINs.

**Accountability**: Every action is tied to a specific user.

**Immediate Revocation**: Sessions are invalidated immediately on logout or deactivation.

**Comprehensive Logging**: All authentication events are recorded for auditing.

**Role-Based Access Control**: Users can only access what their role permits.

This architecture ensures that even if one layer is compromised, the system remains secure. It's designed not just for today's requirements, but for scaling to multiple locations, multiple cashiers per location, and future compliance requirements.
