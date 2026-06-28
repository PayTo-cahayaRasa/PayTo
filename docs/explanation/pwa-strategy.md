# PWA Strategy: Building a Reliable Offline-First POS Application

## Why Progressive Web App for POS?

Most business applications don't consider PWA capabilities, but for a Point of Sale system, Progressive Web App features are essential. This isn't just about "installing an app"—it's about building resilience against the unpredictable reality of retail environments.

### The Reality of Retail Networks

Retail environments are harsh for connectivity:

- **Wi-Fi interference**: Microwaves, metal shelves, and dense construction materials
- **High user density**: Multiple devices competing for bandwidth
- **Physical obstructions**: Refrigerators, display cases, and metal structures
- **Intermittent outages**: ISP issues, router reboots, network maintenance

Even 99.9% uptime means 8.76 hours of downtime per year—unacceptable for a revenue-generating system.

### What PWA Solves

Progressive Web Apps provide:

1. **Installability**: Users can install to home screen like a native app
2. **Offline operation**: Works without internet connectivity
3. **Push notifications**: Real-time alerts for approvals, restocks, etc.
4. **Background sync**: Automatic data sync when online again
5. **App-like UX**: Full-screen, no browser chrome, icon on home screen

For PayTo, these features combine to create a POS system that works reliably regardless of network conditions.

## Service Worker Architecture

### What Is a Service Worker?

A service worker is a script that runs in the background, separate from web pages. It intercepts network requests, manages caching, and enables offline functionality.

### PayTo's Service Worker (`public/sw.js`)

The service worker has three main responsibilities:

**1. Installation and Precaching**

```typescript
const CACHE_NAME = 'payto-pwa-v2';
const PRECACHE_URLS = ['/', '/manifest.json', '/offline.html'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});
```

During installation, critical files are cached immediately:
- Application root (`/`)
- Manifest file for installability
- Offline HTML page for offline fallback

`skipWaiting()` ensures the new service worker activates immediately without waiting for existing clients to close.

**2. Fetch Interception and Caching Strategy**

```typescript
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') {
        return;  // Only cache GET requests
    }

    const acceptHeader = request.headers.get('accept') || '';
    const isHtmlRequest = acceptHeader.includes('text/html');

    if (request.mode === 'navigate') {
        // For page navigation, try network, fallback to offline page
        event.respondWith(
            fetch(request)
                .then((response) => response)
                .catch(async () => caches.match(OFFLINE_URL))
        );
        return;
    }

    // For other assets, try cache, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Don't cache HTML responses
                if (!isHtmlRequest && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return response;
            });
        })
    );
});
```

**Navigation requests** (HTML pages):
- Try to fetch from network
- If fails, show offline HTML page
- This allows the app to open even without internet

**Asset requests** (JS, CSS, images):
- Check cache first (fast)
- If not cached, fetch from network
- Cache successful responses for future offline use
- HTML responses are not cached (always fresh)

**3. Push Notification Handling**

```typescript
self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch {
        payload = {
            title: 'Notifikasi PayTo',
            body: 'Anda memiliki notifikasi baru.',
        };
    }

    const options = {
        body: payload.body || 'Anda memiliki notifikasi baru.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: { url: payload.url || '/kasir' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
```

Push notifications alert supervisors to:
- Pending refund approvals
- Low stock alerts
- Inventory recommendations
- System updates

### Cache Versioning

The `CACHE_NAME` includes a version number (`payto-pwa-v2`). When the service worker updates:

1. New service worker installs with new cache name
2. Old cache is deleted during activation
3. New cache is populated
4. Existing clients are updated

This ensures users always have the latest version while minimizing downtime.

## Manifest Configuration

### Purpose of manifest.json

The manifest file tells browsers how to install and display the PWA:

```json
{
    "id": "/",
    "name": "PayTo POS",
    "short_name": "PayTo",
    "start_url": "/login",
    "scope": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4F46E5",
    "description": "PayTo POS App with offline checkout queue and push notifications.",
    "icons": [...]
}
```

### Key Properties Explained

**`start_url`**: Sets where the PWA opens. `/login` is chosen because users must authenticate before accessing POS functionality.

**`display: "standalone"`**: Removes browser chrome (address bar, tabs, etc.). The app looks and feels like a native app.

**`scope`**: Defines the navigation scope. `/` means the entire site is part of the PWA.

**`theme_color`**: Sets the browser UI color (address bar on Android). Matches PayTo's brand color.

**`icons`**: Required for installation. 192x192 and 512x512 versions cover all devices.

### Installation Flow

**Triggering Installation**

On Android, browsers automatically show an install prompt when:
- User visits the site twice, with 5+ minutes between visits
- Site meets PWA criteria (HTTPS, manifest, service worker)

On iOS (Safari), users tap the share button and select "Add to Home Screen."

**Programmatic Prompt**

While the automatic prompt is sufficient for most cases, PayTo could enhance UX by:

1. Detecting when PWA criteria are met
2. Showing a custom "Install PayTo" button
3. Triggers `beforeinstallprompt` event
4. User clicks button to install

Current implementation relies on browser-native install prompts.

## Offline Capabilities

### What Works Offline

When internet connectivity is lost, PayTo continues to function:

**1. POS Interface**

- Product catalog remains accessible (cached)
- Cart management works normally
- Checkout form is fully functional
- Receipt preview displays correctly

**2. Transaction Queue**

- New transactions are stored in IndexedDB
- Unique `local_txn_uuid` generated for each
- Transaction recorded with actual timestamp
- User sees success confirmation

**3. History View**

- Previously viewed transactions remain accessible
- Stored in memory or browser cache
- May not show most recent offline transactions until sync

**4. Settings and Profile**

- Settings pages remain accessible
- User profile information is cached
- Changes sync when online

### What Doesn't Work Offline

Some features require server connectivity:

**1. Admin Dashboard**

- Real-time sales data requires database queries
- Product management requires API access
- User management requires authentication

**2. New Product Queries**

- Product catalog refresh requires network
- Stock levels may be stale
- New products not visible

**3. Push Notifications**

- Subscription requires server communication
- New notifications won't arrive
- Existing cached notifications remain visible

**4. Backend Features**

- Refund approvals require admin backend
- Inventory recommendations require analysis
- Reporting dashboards need real-time data

### The Offline Fallback

When completely offline, users see `public/offline.html`:

```html
<h1>Mode Offline</h1>
<p>Koneksi internet sedang tidak tersedia. Anda tetap dapat membuka aplikasi, 
dan transaksi akan disinkronkan saat kembali online.</p>
```

This message reassures users that:

- The app is still usable
- Transactions continue to be recorded
- Data will sync automatically when online

## Cache Strategies

### PayTo's Hybrid Approach

Different assets use different caching strategies based on their characteristics:

**1. Precached Assets (Critical Files)**

Files cached during service worker installation:
- `/` (app root)
- `/manifest.json`
- `/offline.html`
- `/favicon.ico`
- Core CSS/JS bundles

Strategy: Cache-first, always serve from cache, never network.

**2. Cached Assets (Static Resources)**

Images, icons, fonts, and other static resources.

Strategy: Cache with network fallback, then cache update.

```typescript
// First request: fetch from network, cache response
// Subsequent requests: serve from cache
caches.match(request).then(cached => cached || fetch(request))
```

**3. Dynamic Content (API Data)**

API responses (products, sales, etc.) are NOT cached by service worker.

Reason: Data changes frequently, stale data could cause issues.

Instead, data is cached in:
- IndexedDB (transactions, history)
- Browser memory (React state)
- Inertia props (page-specific data)

**4. Navigation Requests (HTML Pages)**

Strategy: Network-first, cache fallback.

```typescript
fetch(request).catch(() => caches.match(OFFLINE_URL))
```

This ensures:
- Users get latest HTML on network
- Offline page shown when offline
- No cached stale HTML served

## Push Notifications

### Notification Types

PayTo uses push notifications for:

1. **Refund Approvals**

Supervisor receives notification when:
- New refund request is submitted
- Refund deadline approaching
- Refund approved/rejected

2. **Low Stock Alerts**

Notification when:
- Product stock falls below threshold
- Inventory recommendation generated
- Restock needed for popular items

3. **System Alerts**

Notifications for:
- System maintenance windows
- Important updates
- Security events

### Notification Flow

**Subscription**:
```typescript
// In pushNotifications.ts
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
});

// Send subscription to server
await axios.post('/api/push/subscriptions', { subscription });
```

**Server-side Storage**:
```php
// PushSubscription model stores:
- endpoint (unique push URL)
- keys (encryption keys)
- user_id (who receives notification)
- device_info (for targeting)
```

**Sending Notification**:
```php
// From admin dashboard
WebPush::sendNotification(
    $subscription,
    json_encode(['title' => 'Refund Request', 'body' => 'New refund needs approval'])
);
```

### Notification UX Considerations

**Permission Request Timing**

Permissions are requested only after user expresses interest:
- User navigates to admin panel
- Notification system checks permission status
- If not granted, shows "Enable Notifications" button
- Clicking button triggers permission prompt

**Notification Actions**

Notifications can include actions:
- "Approve" button on refund notification
- "View" to navigate to relevant page
- "Dismiss" to clear notification

## App Installation Flow

### User Journey

1. **First Visit**
   - User visits `payto.example.com`
   - Service worker installs in background
   - Assets are precached
   - No immediate installation prompt

2. **Second Visit (5+ minutes later)**
   - Browser detects PWA criteria met
   - Automatic install prompt appears (Android)
   - User can choose to install or ignore

3. **Installation**
   - App icon added to home screen
   - Opens like native app (no browser chrome)
   - All precached assets available offline
   - Can access login page without internet

4. **Post-Installation**
   - App behaves like native app
   - Can open from home screen
   - Full-screen experience
   - Back button works as expected
   - Can receive push notifications

### Platform Differences

**Android (Chrome)**:
- Automatic install prompt
- "Add to Home Screen" in menu
- Full Chrome browser chrome initially, then removed after install

**iOS (Safari)**:
- No automatic prompt (Apple limitation)
- User must tap share button → "Add to Home Screen"
- Works perfectly after manual addition

**Desktop**:
- Not applicable (POS is mobile/tablet focused)
- Desktop browsers don't install PWAs from mobile-optimized sites

## Benefits Over Native Apps

### Why PWA Instead of Native Mobile App?

**1. No App Store Approval**

- Native apps require App Store/Play Store review
- Review can take days, rejection possible
- PWA deploys instantly with web server update

**2. Single Codebase**

- One codebase for all platforms
- No separate iOS/Android/Windows versions
- Consistent behavior across devices

**3. Instant Updates**

- New version available immediately on next visit
- No user action required
- No version fragmentation

**4. Lower Barrier to Entry**

- No installation from app store
- Just visit URL
- Install if desired

**5. Linkability**

- Can share direct links to specific pages
- Deep linking works naturally
- SEO benefits for admin documentation

### Performance Comparison

**Initial Load**:
- Native: Fast (installed)
- PWA: Slower first visit (download assets), fast subsequent visits

**Updates**:
- Native: User must update app
- PWA: Automatic on next visit

**Storage**:
- Native: Can use device storage freely
- PWA: Limited to browser storage (~50-80% of disk)

For POS, PWA wins because:
- Updates are frequent (bug fixes, features)
- Users prefer instant updates
- Browser storage is sufficient
- Link sharing is valuable for support

## Reliability Guarantees

### Uptime Metrics

The PWA architecture improves effective uptime:

**Before PWA**:
- Website unavailable → Zero functionality
- Network error → Can't access POS
- Browser cache cleared → Re-download everything

**After PWA**:
- Network down → POS still accessible (cached)
- Service worker update → Background download
- Cache cleared → Quick re-download (assets are small)

### Offline Availability

The application remains accessible offline because:

1. **Precached files** are always available
2. **Service worker** intercepts requests
3. **Offline page** provides helpful message
4. **IndexedDB** stores transactions locally

### Recovery from Errors

If something goes wrong:

**Cache corruption**:
- Service worker version bump triggers re-cache
- Old cache deleted during activation
- Fresh assets downloaded

**Service worker stuck**:
- Users can force reload (Ctrl+Shift+R)
- Service worker can be unregistered manually
- Fallback to regular web app

**Push notification issues**:
- Notifications may not arrive
- Core functionality unaffected
- Can resubscribe manually

## Summary: Why PWA for PayTo

The PWA strategy addresses the fundamental challenge of POS systems: they must work when it matters most—during peak sales periods, regardless of network conditions.

Key advantages:

1. **Resilience**: Network outages don't halt operations
2. **Reliability**: Cached assets ensure consistent performance
3. **Accessibility**: Install to home screen for quick access
4. **Real-time**: Push notifications for time-sensitive alerts
5. **Modern**: Built with web standards, no vendor lock-in
6. **Cost-effective**: No native app development overhead

For a retail business, this means lost sales due to technical issues drop to near zero. The POS system becomes a reliable tool that customers trust, regardless of internet conditions.
