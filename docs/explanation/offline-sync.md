# Mekanisme Sync Offline: Mengapa Ini Penting untuk POS

## Masalah dengan Sistem POS Tradisional

Sebagian besar sistem Point of Sale tradisional mengasumsikan connectivity internet konstan. Asumsi ini runtuh dalam skenario dunia nyata:

- Sinyal Wi-Fi lemah di lingkungan ritel
- Outage internet selama jam sibuk
- Isu konfigurasi jaringan
- Outage ISP yang mempengaruhi seluruh blok

Ketika connectivity hilang, sistem POS tradisional menjadi tidak usable. Kasir tidak bisa proses transaksi, menyebabkan lost sales dan customer frustration. Bahkan isu connectivity minor bisa cause revenue loss signifikan selama periode sibuk.

---

## Mengapa Offline-First Penting

Arsitektur offline-first bukanlah fitur tambahan—ini adalah business necessity untuk sistem POS. Pertimbangkan skenario ini:

**Skenario 1: Outage Jam Sibuk**
Sebuah supermarket mengalami outage internet 15 menit selama jam makan siang. Dengan offline-first, transaksi berjalan normal. Setelah connectivity pulih, semua 200+ transaksi sync otomatis. Tanpa itu, toko kehilangan 15 menit penjualan sepenuhnya.

**Skenario 2: Mobile Cashiers**
Kasir dengan tablet bergerak kehilangan signal di bagian belakang toko. Mereka bisa continue transaksi offline dan sync ketika kembali ke area dengan signal.

**Skenario 3: Network Configuration Issues**
WiFi router perlu reboot setiap malam. Dengan offline-first, transaksi malam tidak hilang.

---

## Mekanisme Offline Sync di PayTo

### Data Persistence di Client-side

Transaksi offline disimpan di IndexedDB, bukan memory:

```javascript
// IndexedDB untuk offline transactions
const openDB = async () => {
  return await idb.openDB('payto-offline', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', {
          keyPath: 'local_txn_uuid'
        });
        txStore.createIndex('status', 'status');
      }
    }
  });
};

// Save transaction
const saveTransaction = async (transaction) => {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readwrite');
  await tx.store.put(transaction);
  await tx.done;
};

// Query transactions
const getPendingTransactions = async () => {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readonly');
  const index = tx.store.index('status');
  const cursor = await index.openCursor(IDBKeyRange.only('PENDING_SYNC'));
  
  const transactions = [];
  while (cursor) {
    transactions.push(cursor.value);
    cursor = await cursor.advance();
  }
  
  return transactions;
};
```

### Transaction Queue

```javascript
// Offline queue structure
const transactionQueue = {
  local_txn_uuid: 'uuid-v4',
  device_id: 'POS-001',
  items: [
    { product_id: 123, quantity: 2, price: 6000 }
  ],
  payment_method: 'CASH',
  total_amount: 12000,
  customer_name: 'Budi',
  created_at: '2026-06-28T21:00:00.000Z',
  status: 'PENDING_SYNC',
  retry_count: 0,
  last_retry_at: null
};
```

### Idempotency Key

Setiap transaction memiliki unique `local_txn_uuid`:

```javascript
const generateIdempotencyKey = () => {
  return crypto.randomUUID(); // UUID v4
};

const transaction = {
  local_txn_uuid: generateIdempotencyKey(),
  // ... other fields
};
```

Server use ini untuk detect duplicate transactions.

---

## Checkout Process untuk Offline Transactions

### Online Flow:

```javascript
// Online checkout
const checkoutOnline = async (items, paymentMethod) => {
  const transaction = {
    local_txn_uuid: generateIdempotencyKey(),
    device_id: 'POS-001',
    items,
    payment_method: paymentMethod,
    total_amount: calculateTotal(items),
    created_at: new Date().toISOString(),
    status: 'PENDING_SYNC'
  };
  
  try {
    // Try online first
    const response = await fetch('/api/pos/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        local_txn_uuid: transaction.local_txn_uuid,
        items,
        payment_method: paymentMethod,
        total_amount: transaction.total_amount
      })
    });
    
    if (response.ok) {
      // Success - remove from queue
      await removeFromQueue(transaction.local_txn_uuid);
      return await response.json();
    } else {
      // Network error - save to queue
      await saveToQueue(transaction);
      throw new Error('Network error');
    }
  } catch (error) {
    // Network error - queue transaction
    await saveToQueue(transaction);
    console.log('Transaction queued for offline sync');
    return null;
  }
};
```

### Offline Flow:

```javascript
// Offline checkout
const checkoutOffline = async (items, paymentMethod) => {
  const transaction = {
    local_txn_uuid: generateIdempotencyKey(),
    device_id: 'POS-001',
    items,
    payment_method: paymentMethod,
    total_amount: calculateTotal(items),
    created_at: new Date().toISOString(),
    status: 'PENDING_SYNC',
    retry_count: 0
  };
  
  // Save to queue
  await saveToQueue(transaction);
  
  // Show success to user
  showSuccessMessage({
    message: 'Transaction saved offline',
    local_txn_uuid: transaction.local_txn_uuid
  });
  
  return transaction;
};
```

---

## Sync Process

### Background Sync:

```javascript
// Background sync on network online
window.addEventListener('online', async () => {
  if (await hasPendingTransactions()) {
    console.log('Network restored, flushing offline queue');
    await flushOfflineQueue();
  }
});

// Background sync timer
setInterval(async () => {
  if (navigator.onLine && await hasPendingTransactions()) {
    await flushOfflineQueue();
  }
}, 300000); // 5 minutes
```

### Flush Offline Queue:

```javascript
const flushOfflineQueue = async () => {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.store;
  
  // Get pending transactions
  const index = store.index('status');
  const cursor = await index.openCursor(IDBKeyRange.only('PENDING_SYNC'));
  
  const batch = [];
  const keysToDelete = [];
  
  // Collect up to 50 transactions
  while (cursor && batch.length < 50) {
    batch.push(cursor.value);
    keysToDelete.push(cursor.primaryKey);
    cursor = await cursor.advance();
  }
  
  if (batch.length === 0) {
    return;
  }
  
  // Send to server
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
      for (const key of keysToDelete) {
        await store.delete(key);
      }
      
      console.log(`Synced ${batch.length} transactions`);
    }
  } catch (error) {
    console.error('Sync failed:', error);
    
    // Update retry count
    for (const txn of batch) {
      txn.retry_count = (txn.retry_count || 0) + 1;
      txn.last_retry_at = new Date().toISOString();
      await store.put(txn);
    }
  } finally {
    await tx.done;
  }
};
```

---

## Idempotency di Server-side

### Duplicate Detection:

```php
// PosSyncController.php
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'transactions' => 'required|array|min:1|max:50',
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
            // Check for duplicate using idempotency key
            $existingKey = SyncIdempotencyKey::where('local_txn_uuid', $txn['local_txn_uuid'])
                ->where('device_id', $txn['device_id'])
                ->first();
            
            if ($existingKey) {
                // Duplicate transaction
                $results['duplicates'][] = [
                    'local_txn_uuid' => $txn['local_txn_uuid'],
                    'sale_id' => $existingKey->ref_id,
                    'created_at' => $existingKey->created_at
                ];
                continue;
            }
            
            // Process transaction
            try {
                $sale = CheckoutProcessor::process($txn, 'offline');
                
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
                \Log::error('Offline sync failed: ' . $e->getMessage());
                
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
        'data' => $results,
        'summary' => [
            'total' => count($request->transactions),
            'synced' => count($results['synced']),
            'failed' => count($results['failed']),
            'duplicates' => count($results['duplicates'])
        ]
    ]);
}
```

### Idempotency Table:

```php
// Create sync_idempotency_keys table
Schema::create('sync_idempotency_keys', function (Blueprint $table) {
    $table->id();
    $table->string('local_txn_uuid'); // Unique transaction UUID
    $table->string('device_id'); // POS terminal ID
    $table->morphs('ref'); // Reference to sale/refund
    $table->timestamps();
    
    $table->unique(['local_txn_uuid', 'device_id']);
});
```

---

## Error Recovery

### Retry Logic:

```javascript
const MAX_RETRIES = 5;
const RETRY_DELAY = 60000; // 1 minute

const retryFailedTransactions = async () => {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.store;
  
  const now = new Date();
  
  // Get failed transactions
  const cursor = await store.openCursor();
  
  while (cursor) {
    const txn = cursor.value;
    
    if (txn.status === 'FAILED') {
      // Check retry count
      if ((txn.retry_count || 0) < MAX_RETRIES) {
        // Check delay
        const lastRetry = txn.last_retry_at ? new Date(txn.last_retry_at) : null;
        
        if (!lastRetry || (now - lastRetry > RETRY_DELAY)) {
          // Retry transaction
          txn.retry_count = (txn.retry_count || 0) + 1;
          txn.last_retry_at = now.toISOString();
          txn.status = 'PENDING_SYNC';
          
          await store.put(txn);
          console.log(`Retry ${txn.retry_count}: ${txn.local_txn_uuid}`);
        }
      }
    }
    
    cursor = await cursor.advance();
  }
  
  await tx.done;
};

// Run retry logic periodically
setInterval(retryFailedTransactions, 60000);
```

### Failed Transaction Handling:

```javascript
// View failed transactions
const viewFailedTransactions = async () => {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readonly');
  const store = tx.store;
  
  const failed = [];
  const cursor = await store.openCursor();
  
  while (cursor) {
    if (cursor.value.status === 'FAILED') {
      failed.push(cursor.value);
    }
    cursor = await cursor.advance();
  }
  
  return failed;
};

// Manual retry
const manualRetry = async (localTxnUuid) => {
  const db = await openDB();
  const txn = await db.get('transactions', localTxnUuid);
  
  if (txn) {
    txn.status = 'PENDING_SYNC';
    txn.retry_count = 0;
    txn.last_retry_at = null;
    await db.put('transactions', txn);
    
    console.log('Transaction marked for retry');
  }
};

// Delete failed transaction
const deleteFailedTransaction = async (localTxnUuid) => {
  const db = await openDB();
  await db.delete('transactions', localTxnUuid);
  
  console.log('Failed transaction deleted');
};
```

### Admin Interface:

```vue
<!-- FailedTransactions.vue -->
<template>
  <div>
    <h2>Failed Transactions</h2>
    
    <div v-if="failedTransactions.length === 0">
      No failed transactions
    </div>
    
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Local UUID</th>
            <th>Amount</th>
            <th>Retry Count</th>
            <th>Last Retry</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="txn in failedTransactions" :key="txn.local_txn_uuid">
            <td>{{ txn.local_txn_uuid }}</td>
            <td>{{ formatCurrency(txn.total_amount) }}</td>
            <td>{{ txn.retry_count }}</td>
            <td>{{ formatDate(txn.last_retry_at) }}</td>
            <td>
              <button @click="retry(txn.local_txn_uuid)">Retry</button>
              <button @click="deleteTxn(txn.local_txn_uuid)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      failedTransactions: []
    };
  },
  async mounted() {
    this.failedTransactions = await viewFailedTransactions();
  },
  methods: {
    async retry(uuid) {
      await manualRetry(uuid);
      this.failedTransactions = await viewFailedTransactions();
    },
    async deleteTxn(uuid) {
      await deleteFailedTransaction(uuid);
      this.failedTransactions = await viewFailedTransactions();
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(amount);
    },
    formatDate(date) {
      return new Date(date).toLocaleString('id-ID');
    }
  }
};
</script>
```

---

## Data Integrity

### Database Transactions:

CheckoutProcessor uses database transactions untuk ensure data integrity:

```php
class CheckoutProcessor
{
    public static function process(array $txnData, string $source): Sale
    {
        return DB::transaction(function () use ($txnData, $source) {
            // Validate stock
            foreach ($txnData['items'] as $item) {
                $stock = StockItem::where('product_id', $item['product_id'])
                    ->lockForUpdate()
                    ->first();
                
                if ($stock->quantity < $item['quantity']) {
                    throw new \Exception("Stock tidak tersedia untuk produk {$item['product_id']}");
                }
                
                // Decrement stock
                $stock->decrement('quantity', $item['quantity']);
                
                // Record stock movement
                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'product_name_snapshot' => $stock->product->name,
                    'previous_quantity' => $stock->quantity + $item['quantity'],
                    'adjustment' => -$item['quantity'],
                    'new_quantity' => $stock->quantity,
                    'adjustment_type' => 'SALE',
                    'related_type' => Sale::class,
                    'related_id' => null, // Will be set after sale created
                    'reason' => "Offline {$source} sale",
                    'created_by' => $txnData['user_id']
                ]);
            }
            
            // Create sale
            $sale = Sale::create([
                'user_id' => $txnData['user_id'],
                'customer_name' => $txnData['customer_name'] ?? null,
                'total_amount' => $txnData['total_amount'],
                'payment_method' => $txnData['payment_method'],
                'status' => 'PAID',
                'source' => $source
            ]);
            
            // Create sale items
            foreach ($txnData['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'product_name_snapshot' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $item['quantity'] * $item['price']
                ]);
                
                // Update stock movement with sale ID
                StockMovement::where('related_id', null)
                    ->where('related_type', StockMovement::class)
                    ->update(['related_id' => $sale->id]);
            }
            
            // Create payment
            Payment::create([
                'sale_id' => $sale->id,
                'payment_method' => $txnData['payment_method'],
                'amount' => $txnData['total_amount'],
                'status' => 'SUCCESS'
            ]);
            
            return $sale;
        });
    }
}
```

### Validation:

Stock validation dilakukan dalam transaction untuk prevent race conditions:

```php
// Validation rules for offline sync
$rules = [
    'transactions.*.items.*.product_id' => 'required|exists:products,id',
    'transactions.*.items.*.quantity' => 'required|numeric|min:0.001',
    'transactions.*.items.*.price' => 'required|numeric|min:0',
    'transactions.*.total_amount' => 'required|numeric|min:0',
];

$validator = Validator::make($request->all(), $rules);

// Validate stock availability
foreach ($txn['items'] as $item) {
    $stock = StockItem::where('product_id', $item['product_id'])
        ->lockForUpdate()
        ->first();
    
    if ($stock->quantity < $item['quantity']) {
        throw new \Exception("Stock tidak tersedia");
    }
}
```

---

## Monitoring and Metrics

### Dashboard Stats:

```javascript
const getOfflineStats = async () => {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readonly');
  const store = tx.store;
  
  let total = 0;
  let pending = 0;
  let failed = 0;
  let duplicates = 0;
  let totalAmount = 0;
  
  const cursor = await store.openCursor();
  
  while (cursor) {
    total++;
    totalAmount += cursor.value.total_amount;
    
    if (cursor.value.status === 'PENDING_SYNC') {
      pending++;
    } else if (cursor.value.status === 'FAILED') {
      failed++;
    } else if (cursor.value.status === 'DUPLICATE') {
      duplicates++;
    }
    
    cursor = await cursor.advance();
  }
  
  return {
    total,
    pending,
    failed,
    duplicates,
    totalAmount,
    pendingAmount: pending * (totalAmount / total)
  };
};
```

### Sync Status API:

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
    "pending_transactions": 3,
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

## Summary: Mengapa Offline-First Penting

Offline-first architecture mengubah POS dari sistem yang dependen connectivity menjadi alat bisnis yang andal.

Key takeaways:

- **Zero downtime**: Transaksi continue saat outage
- **No data loss**: Semua sales eventually recorded
- **No duplicates**: Idempotency mencegah double-charging
- **Reconciliation**: Clear sync status dan audit trail
- **Business continuity**: Operasi toko continue terlepas dari network status

Untuk bisnis ritel, jaminan ini translate langsung ke revenue protection dan customer satisfaction.

The goal is never to lose sales data. If a transaction cannot be processed automatically, it's flagged for human review rather than discarded.
