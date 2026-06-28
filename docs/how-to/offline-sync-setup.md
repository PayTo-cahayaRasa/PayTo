# Setup Sync Offline

Pelajari cara mengonfigurasi dan mengelola transaksi offline saat POS kehilangan koneksi ke server.

## Overview

Fitur sync offline memungkinkan POS tetap beroperasi saat outage jaringan dengan mengantrikan transaksi secara local dan sync otomatis saat koneksi pulih.

---

## Masalah: Perlu menginstall dan enable PWA untuk fungsionalitas offline

POS terminal perlu bekerja offline saat outage internet.

### Solusi

Install PWA pada POS terminal:

**Langkah 1: Verifikasi service worker registration**

Aplikasi otomatis register service worker. Cek browser console untuk:

```
ServiceWorker registration successful with scope: https://pos.example.com/
```

**Langkah 2: Install PWA ke home screen**

Trigger install prompt:

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button
  document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed successfully');
    }
    
    deferredPrompt = null;
    document.getElementById('installBtn').style.display = 'none';
  }
});
```

**Langkah 3: Verifikasi offline functionality**

Buka DevTools > Application > Service Workers > uncheck "Online" > refresh page. POS tetap berfungsi.

---

## Masalah: Melakukan transaksi offline

Transaksi dilakukan saat tidak ada internet.

### Solusi

Offline transactions disimpan di IndexedDB:

```javascript
// Store offline transaction
const offlineTransaction = {
  local_txn_uuid: crypto.randomUUID(),
  device_id: 'POS-001',
  items: [
    { product_id: 123, quantity: 2, price: 6000 }
  ],
  payment_method: 'CASH',
  total_amount: 12000,
  created_at: new Date().toISOString(),
  status: 'PENDING_SYNC'
};

// Save to IndexedDB
const db = await openDB('payto-offline', 1);
const tx = db.transaction('transactions', 'readwrite');
await tx.store.put(offlineTransaction);
await tx.done;

console.log('Transaction saved locally');
```

**Offline transaction data structure:**

| Field | Type | Description |
|-------|------|-------------|
| `local_txn_uuid` | string | Unique UUID untuk idempotency |
| `device_id` | string | ID device (POS terminal) |
| `items` | array | List of sale items |
| `payment_method` | string | CASH, CREDIT, TRANSFER |
| `total_amount` | decimal | Total amount |
| `customer_name` | string | Optional |
| `created_at` | string | ISO timestamp |
| `status` | string | PENDING_SYNC |

---

## Masalah: Sync transactions saat online

Transaksi offline perlu disync ke server saat koneksi pulih.

### Solusi

Flush offline queue:

```javascript
const flushOfflineQueue = async () => {
  const db = await openDB('payto-offline', 1);
  const tx = db.transaction('transactions', 'readwrite');
  const cursor = await tx.store.openCursor();
  
  const pendingTransactions = [];
  while (cursor) {
    if (cursor.value.status === 'PENDING_SYNC') {
      pendingTransactions.push(cursor.value);
    }
    cursor = await cursor.advance();
  }
  
  if (pendingTransactions.length === 0) {
    console.log('No pending transactions');
    return;
  }
  
  // Sync in batches
  const batch = pendingTransactions.slice(0, 50);
  
  try {
    const response = await fetch('/api/pos/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        transactions: batch.map(t => ({
          local_txn_uuid: t.local_txn_uuid,
          device_id: t.device_id,
          items: t.items,
          payment_method: t.payment_method,
          total_amount: t.total_amount,
          customer_name: t.customer_name,
          created_at: t.created_at
        }))
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Remove synced transactions
      for (const txn of batch) {
        await tx.store.delete(txn.local_txn_uuid);
      }
      console.log(`Synced ${batch.length} transactions`);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    await tx.done;
  }
};

// Trigger on network online
window.addEventListener('online', () => {
  console.log('Back online, flushing offline queue');
  flushOfflineQueue();
});
```

---

## Masalah: Sync result processing

Proses results dari sync endpoint.

### Solusi

```javascript
// Handle sync response
const processSyncResult = (result) => {
  result.data?.synced?.forEach(txn => {
    console.log(`Synced: ${txn.local_txn_uuid} -> sale_id ${txn.sale_id}`);
  });
  
  result.data?.failed?.forEach(txn => {
    console.log(`Failed: ${txn.local_txn_uuid} - ${txn.error}`);
  });
  
  result.data?.duplicates?.forEach(txn => {
    console.log(`Duplicate: ${txn.local_txn_uuid} -> sale_id ${txn.sale_id}`);
  });
};

// Example response handling
const handleSyncResponse = async (response) => {
  const result = await response.json();
  
  if (result.success) {
    const db = await openDB('payto-offline', 1);
    const tx = db.transaction('transactions', 'readwrite');
    
    // Remove successful and duplicate transactions
    for (const txn of [...result.data?.synced || [], ...result.data?.duplicates || []]) {
      await tx.store.delete(txn.local_txn_uuid);
    }
    
    await tx.done;
  }
  
  return result;
};
```

**Sync response structure:**

```json
{
  "success": true,
  "data": {
    "synced": [
      {
        "local_txn_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "sale_id": 789,
        "created_at": "2026-06-28 21:00:00"
      }
    ],
    "failed": [
      {
        "local_txn_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "error": "Product not found: ID 456",
        "retryable": true
      }
    ],
    "duplicates": [
      {
        "local_txn_uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "sale_id": 790,
        "created_at": "2026-06-28 21:05:00"
      }
    ],
    "summary": {
      "total": 3,
      "synced": 1,
      "failed": 1,
      "duplicates": 1
    }
  }
}
```

---

## Masalah: Sync failures dan manual handling

Network issues menyebabkan sync failures yang perlu investigation.

### Solusi

**Cek sync errors di response:**

```json
{
  "success": false,
  "message": "Transaction validation failed",
  "errors": [
    {
      "local_txn_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "error": "Product stock insufficient",
      "product_id": 123
    }
  ]
}
```

**View failed transactions (development):**

```javascript
// Check IndexedDB for failed transactions
const checkFailedTransactions = async () => {
  const db = await openDB('payto-offline', 1);
  const cursor = await db.transaction('transactions').store.openCursor();
  
  const failedItems = [];
  while (cursor) {
    if (cursor.value.status === 'FAILED') {
      failedItems.push(cursor.value);
    }
    cursor = await cursor.advance();
  }
  
  console.log('Failed transactions:', items);
  return failedItems;
};
```

**Manual retry:**

```javascript
const retryTransaction = async (localTxnUuid) => {
  const db = await openDB('payto-offline', 1);
  const txn = await db.get('transactions', localTxnUuid);
  
  if (txn) {
    // Update status
    txn.status = 'PENDING_SYNC';
    await db.put('transactions', txn);
    
    // Trigger sync
    await flushOfflineQueue();
  }
};
```

---

## Idempotency Handling

### Duplicate detection:

Server mendeteksi duplicate transactions menggunakan `local_txn_uuid`:

```php
// PosSyncController.php
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'transactions' => 'required|array',
        'transactions.*.local_txn_uuid' => 'required|string|uuid',
        'transactions.*.device_id' => 'required|string',
        'transactions.*.items' => 'required|array',
        'transactions.*.total_amount' => 'required|numeric',
    ]);
    
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }
    
    $results = [
        'synced' => [],
        'failed' => [],
        'duplicates' => []
    ];
    
    DB::transaction(function () use ($request, &$results) {
        foreach ($request->transactions as $txn) {
            // Check for duplicate
            $existingKey = SyncIdempotencyKey::where('local_txn_uuid', $txn['local_txn_uuid'])
                ->where('device_id', $txn['device_id'])
                ->first();
            
            if ($existingKey) {
                $results['duplicates'][] = [
                    'local_txn_uuid' => $txn['local_txn_uuid'],
                    'sale_id' => $existingKey->ref_id,
                    'created_at' => $existingKey->created_at
                ];
                continue;
            }
            
            // Process transaction
            try {
                $sale = $this->processSale($txn);
                
                // Record idempotency key
                SyncIdempotencyKey::create([
                    'local_txn_uuid' => $txn['local_txn_uuid'],
                    'device_id' => $txn['device_id'],
                    'ref_id' => $sale->id,
                    'ref_type' => Sale::class
                ]);
                
                $results['synced'][] = [
                    'local_txn_uuid' => $txn['local_txn_uuid'],
                    'sale_id' => $sale->id,
                    'created_at' => $sale->created_at
                ];
            } catch (\Exception $e) {
                $results['failed'][] = [
                    'local_txn_uuid' => $txn['local_txn_uuid'],
                    'error' => $e->getMessage(),
                    'retryable' => true
                ];
            }
        }
    });
    
    return response()->json([
        'success' => true,
        'data' => $results
    ]);
}
```

**Duplicate detection response:**

```json
{
  "local_txn_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "DUPLICATE",
  "sale_id": 789
}
```

### Best practices untuk idempotency:

1. Never reuse `local_txn_uuid` values
2. Generate UUIDs before attempting online transaction
3. Include `local_txn_uuid` in all retry attempts
4. Store UUID locally before network call

---

## Offline Queue Management

### Database structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `local_txn_uuid` | string | Unique transaction UUID |
| `device_id` | string | POS terminal ID |
| `transaction_data` | json | Full transaction data |
| `status` | enum | PENDING_SYNC, FAILED |
| `error_message` | text | Error details |
| `retry_count` | integer | Number of retry attempts |
| `last_retry_at` | timestamp | Last retry time |
| `created_at` | timestamp | Queue time |
| `updated_at` | timestamp | Last update |

### Retry logic:

```javascript
const MAX_RETRIES = 3;

const syncWithRetry = async () => {
  const db = await openDB('payto-offline', 1);
  const cursor = await db.transaction('transactions').store.openCursor();
  
  while (cursor) {
    const txn = cursor.value;
    
    if (txn.status === 'FAILED' && txn.retry_count < MAX_RETRIES) {
      // Retry transaction
      txn.retry_count = (txn.retry_count || 0) + 1;
      txn.last_retry_at = new Date().toISOString();
      txn.status = 'PENDING_SYNC';
      
      await db.put('transactions', txn);
    }
    
    cursor = await cursor.advance();
  }
};
```

---

## Monitoring Offline Sync

### Dashboard metrics:

```javascript
const getOfflineStats = async () => {
  const db = await openDB('payto-offline', 1);
  const cursor = await db.transaction('transactions').store.openCursor();
  
  let total = 0;
  let pending = 0;
  let failed = 0;
  
  while (cursor) {
    total++;
    if (cursor.value.status === 'PENDING_SYNC') {
      pending++;
    } else if (cursor.value.status === 'FAILED') {
      failed++;
    }
    cursor = await cursor.advance();
  }
  
  return { total, pending, failed };
};
```

### Sync status endpoint:

```bash
GET /api/pos/sync/status
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "is_online": true,
    "last_sync_at": "2026-06-28 21:00:00",
    "pending_transactions": 0,
    "failed_transactions": 0,
    "last_sync_summary": {
      "total": 150,
      "synced": 148,
      "failed": 0,
      "duplicates": 2
    }
  }
}
```

---

## Best Practices

### Development:

1. Test offline functionality dengan browser DevTools
2. Monitor IndexedDB storage
3. Handle sync errors gracefully
4. Show offline status to user

### Production:

1. Monitor sync queue size
2. Set up alert untuk failed transactions
3. Regular backup of IndexedDB
4. Test sync recovery scenarios

### User Experience:

1. Show "Offline" indicator when disconnected
2. Show "Syncing..." during background sync
3. Notify user of sync success/failure
4. Provide manual sync button

---

## Summary

Sync offline di PayTo mencakup:

- Service worker registration untuk offline capability
- IndexedDB storage untuk offline transactions
- Automatic sync saat online
- Idempotency untuk prevent duplicates
- Retry logic untuk failed transactions
- Manual handling dan debugging
- Monitoring dan metrics

Dengan sistem ini, POS tetap beroperasi saat offline dan transactions eventually consistent.
