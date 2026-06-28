# Setup Push Notification

Pelajari cara mengonfigurasi dan mengirim push notifications ke POS terminals untuk peringatan penting dan updates.

## Overview

Push notifications memungkinkan real-time communication dengan POS terminals untuk order confirmations, alerts, dan system updates menggunakan Web Push protocol.

---

## Masalah: Perlu generate VAPID keys untuk push notifications

Setup VAPID (Voluntary Application Server Identification) keys untuk secure push notifications.

### Solusi

**Generate VAPID keys menggunakan Laravel Tinker:**

```bash
php artisan tinker
```

```php
use WebPush\WebPush;

$publicKey = WebPush::generateVAPIDKeys();
echo "Public Key: " . $publicKey['publicKey'] . "\n";
echo "Private Key: " . $publicKey['privateKey'] . "\n";
```

**Hasil keys:**

```
Public Key: BOtXK2J... (Base64 encoded)
Private Key: d4cHd... (Base64 encoded)
```

**Simpan di `.env`:**

```
VAPID_PUBLIC_KEY=BOtXK2J...
VAPID_PRIVATE_KEY=d4cHd...
VAPID_SUBJECT=mailto:admin@example.com
```

**Get VAPID keys in PHP:**

```php
$publicKey = config('services.vapid.public_key');
$privateKey = config('services.vapid.private_key');
$subject = config('services.vapid.subject');
```

---

## Masalah: Subscribe user ke push notifications

User perlu subscribe untuk menerima push notifications.

### Solusi

**Subscribe user:**

```javascript
const subscribeUser = async () => {
  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;
  
  // Get VAPID public key
  const response = await fetch('/api/push/vapid-public-key');
  const { publicKey } = await response.json();
  
  // Subscribe
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: publicKey
  };
  
  try {
    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    
    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify(subscription)
    });
    
    console.log('Subscribed successfully');
    return subscription;
  } catch (error) {
    console.error('Subscription failed:', error);
    throw error;
  }
};
```

**Server-side subscription handler:**

```php
// PushSubscriptionController.php
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'endpoint' => 'required|url',
        'keys.p256dh' => 'required|string',
        'keys.auth' => 'required|string'
    ]);
    
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid subscription data',
            'errors' => $validator->errors()
        ], 422);
    }
    
    $user = $request->user();
    
    // Check for existing subscription
    $existing = PushSubscription::where('endpoint', $request->endpoint)
        ->where('user_id', $user->id)
        ->first();
    
    if ($existing) {
        return response()->json([
            'success' => true,
            'message' => 'Already subscribed'
        ]);
    }
    
    // Create subscription
    PushSubscription::create([
        'user_id' => $user->id,
        'endpoint' => $request->endpoint,
        'keys' => [
            'p256dh' => $request->keys->p256dh,
            'auth' => $request->keys->auth
        ],
        'device_info' => $request->header('User-Agent'),
        'active' => true
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Subscribed successfully'
    ]);
}
```

---

## Masalah: Unsubscribe dari push notifications

User ingin stop menerima push notifications.

### Soloise

**Unsubscribe user:**

```javascript
const unsubscribeUser = async () => {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    console.log('Not subscribed');
    return;
  }
  
  // Remove from server
  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  } catch (error) {
    console.error('Failed to unsubscribe from server:', error);
  }
  
  // Remove from browser
  try {
    await subscription.unsubscribe();
    console.log('Unsubscribed successfully');
  } catch (error) {
    console.error('Failed to unsubscribe from push manager:', error);
  }
};
```

**Server-side unsubscribe handler:**

```php
// PushSubscriptionController.php
public function destroy(Request $request)
{
    $validator = Validator::make($request->all(), [
        'endpoint' => 'required|url'
    ]);
    
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid request'
        ], 422);
    }
    
    $user = $request->user();
    
    $subscription = PushSubscription::where('endpoint', $request->endpoint)
        ->where('user_id', $user->id)
        ->first();
    
    if ($subscription) {
        $subscription->delete();
    }
    
    return response()->json([
        'success' => true,
        'message' => 'Unsubscribed successfully'
    ]);
}
```

---

## Masalah: Send push notification

Send notification ke user atau all POS terminals.

### Solusi

**Send single notification:**

```php
// Send to single user
public function sendToUser($userId, $title, $body, $data = [])
{
    $user = User::find($userId);
    
    if (!$user) {
        throw new \Exception('User not found');
    }
    
    $subscriptions = PushSubscription::where('user_id', $userId)
        ->where('active', true)
        ->get();
    
    $payload = json_encode([
        'title' => $title,
        'body' => $body,
        'icon' => '/images/icon-192.png',
        'data' => $data
    ]);
    
    $sent = 0;
    $failed = 0;
    
    foreach ($subscriptions as $subscription) {
        try {
            $push = new \WebPush\WebPush([
                'VAPID' => [
                    'publicKey' => config('services.vapid.public_key'),
                    'privateKey' => config('services.vapid.private_key'),
                    'subject' => config('services.vapid.subject')
                ]
            ]);
            
            $push->send(
                $subscription->endpoint,
                $payload,
                $subscription->getHeaders()
            );
            
            $sent++;
        } catch (\Exception $e) {
            \Log::error('Push notification failed: ' . $e->getMessage());
            $failed++;
            
            // Mark subscription as inactive if failed
            $subscription->update(['active' => false]);
        }
    }
    
    return [
        'sent' => $sent,
        'failed' => $failed
    ];
}

// Usage
$notification = new \App\Notifications\NewOrderNotification($order);
$notification->sendToUser($userId, 'Order Baru', 'Ada order baru dari ' . $order->customer_name);
```

**Send bulk notification:**

```php
// Send to all active subscriptions
public function sendToAll($title, $body, $data = [])
{
    $subscriptions = PushSubscription::where('active', true)->get();
    
    $payload = json_encode([
        'title' => $title,
        'body' => $body,
        'icon' => '/images/icon-192.png',
        'data' => $data
    ]);
    
    $sent = 0;
    $failed = 0;
    
    foreach ($subscriptions as $subscription) {
        try {
            $push = new \WebPush\WebPush([
                'VAPID' => [
                    'publicKey' => config('services.vapid.public_key'),
                    'privateKey' => config('services.vapid.private_key'),
                    'subject' => config('services.vapid.subject')
                ]
            ]);
            
            $push->send(
                $subscription->endpoint,
                $payload,
                $subscription->getHeaders()
            );
            
            $sent++;
        } catch (\Exception $e) {
            \Log::error('Push notification failed: ' . $e->getMessage());
            $failed++;
            
            $subscription->update(['active' => false]);
        }
    }
    
    return [
        'sent' => $sent,
        'failed' => $failed
    ];
}
```

**Push notification controller:**

```php
// PushNotificationController.php
public function send(Request $request)
{
    $validator = Validator::make($request->all(), [
        'title' => 'required|string|max:100',
        'body' => 'required|string|max:500',
        'user_id' => 'nullable|exists:users,id',
        'data' => 'nullable|array'
    ]);
    
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }
    
    try {
        if ($request->user_id) {
            $result = $this->sendToUser($request->user_id, $request->title, $request->body, $request->data);
        } else {
            $result = $this->sendToAll($request->title, $request->body, $request->data);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Notifications sent',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to send notifications',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

**Example usage:**

```bash
POST /api/admin/push/send
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Order Baru",
  "body": "Ada order baru dari customer Budi",
  "data": {
    "order_id": 123,
    "type": "new_order"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Notifications sent",
  "data": {
    "sent": 3,
    "failed": 0
  }
}
```

---

## Push Event Handling di Service Worker

**Handle push events:**

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'notification-tag',
    silent: false,
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle notification action
    console.log('Action clicked:', event.action);
  } else {
    // Open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

---

## Notification Permission Handling

**Check permission status:**

```javascript
const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'unsupported';
  }
  
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notification permission granted');
    return 'granted';
  } else if (permission === 'denied') {
    console.log('Notification permission denied');
    return 'denied';
  } else {
    return 'default';
  }
};

// Usage
const permission = await checkNotificationPermission();

if (permission === 'granted') {
  await subscribeUser();
} else if (permission === 'default') {
  // Show button to request permission
  document.getElementById('notifyBtn').style.display = 'block';
}
```

**Request permission with context:**

```javascript
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('Notifications not supported in this browser');
    return;
  }
  
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Permission granted');
    await subscribeUser();
  } else {
    console.log('Permission denied');
    alert('Notifications denied. You can enable them in browser settings.');
  }
};

// Show button
document.getElementById('notifyBtn').addEventListener('click', requestNotificationPermission);
```

**Notification permission states:**

- `default`: Permission not yet requested (show prompt)
- `granted`: Permission granted (subscribe to push)
- `denied`: Permission denied (don't prompt again)

---

## Best Practices

### User Experience:

1. Only request permission after user action (e.g., "Enable notifications")
2. Explain what notifications will be sent before requesting
3. Handle denied permission gracefully
4. Provide settings to re-enable notifications
5. Don't spam notifications - only send important alerts

### Performance:

1. Keep notification payload small (< 4KB)
2. Use data fields for navigation
3. Handle push events efficiently
4. Close notifications after interaction

### Reliability:

1. Monitor failed subscriptions
2. Remove inactive subscriptions
3. Retry failed deliveries
4. Log all push events

### Security:

1. Use VAPID for authentication
2. Validate subscription data
3. Store keys securely
4. Don't expose sensitive data in notifications

---

## Testing Push Notifications

### Using Chrome DevTools:

1. Open DevTools > Application > Service Workers
2. Click "Push" button on active service worker
3. Enter payload JSON:

```json
{
  "title": "Test Notification",
  "body": "This is a test notification",
  "icon": "/images/icon-192.png",
  "data": {
    "test": true
  }
}
```

### Browser Console:

```javascript
// Check push subscription
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.getSubscription();
console.log(subscription);
```

---

## Summary

Push notification di PayTo mencakup:

- VAPID keys generation dan configuration
- Subscription management (subscribe/unsubscribe)
- Send single and bulk notifications
- Push event handling di service worker
- Permission handling
- Monitoring dan error tracking
- Best practices untuk reliability

Dengan sistem ini, business bisa communicate real-time dengan POS terminals untuk alerts dan updates.
