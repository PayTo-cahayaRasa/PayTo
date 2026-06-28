# Offline Sync Mechanism: Why It Matters for POS

## The Problem with Traditional POS Systems

Most traditional Point of Sale systems assume constant internet connectivity. This assumption breaks down in real-world scenarios:

- Weak Wi-Fi signals in retail environments
- Internet outages during peak hours
- Network configuration issues
- ISP outages affecting entire blocks

When connectivity is lost, traditional POS systems become unusable. Cashiers cannot process transactions, leading to lost sales and frustrated customers. Even minor connectivity issues can cause significant revenue loss during busy periods.

## Why Offline-First Matters

The offline-first architecture is not a nice-to-have—it's a business necessity for a POS system. Consider these scenarios:

**Scenario 1: Peak Hour Outage**
A grocery store experiences a 15-minute internet outage during lunch rush. With offline-first, transactions continue normally. After connectivity is restored, all 200+ transactions sync automatically. Without it, the store loses those 15 minutes of sales entirely.

**Scenario 2: Mobile Cashiers**
Pop-up shops, food trucks, and event vendors often operate in areas with unreliable connectivity. Offline-first ensures they can accept payments anywhere, then sync when back online.

**Scenario 3: Network Partition**
Sometimes networks partition—devices can communicate locally but not reach the internet. This is common in large stores with multiple networks. Offline-first handles this gracefully.

## IndexedDB Storage Strategy

### Why IndexedDB?

IndexedDB is a browser-native NoSQL database designed for storing structured data on the client. It was chosen over alternatives for specific reasons:

**localStorage is insufficient**: localStorage has a ~5MB limit per origin and stores only strings. A single receipt with multiple items could easily exceed this.

**WebSQL is deprecated**: WebSQL is no longer maintained and not supported in modern browsers.

**IndexedDB advantages**:
- Large storage capacity (typically 50-80% of disk space)
- Asynchronous operations that don't block UI
- Index-based queries for efficient lookups
- Support for complex data structures

### The Database Schema

The offline queue uses a simple but effective schema:

```typescript
interface QueuedTransaction {
    local_txn_uuid: string;  // UUID v4 for idempotency
    occurred_at: string;     // When transaction occurred (ISO 8601)
    payment_method: 'CASH' | 'EWALLET';
    cash_received?: number;
    reference?: string;
    items: CheckoutLineItem[];
}
```

Each transaction is stored with a unique local UUID. The `occurred_at` timestamp is critical—it preserves the actual transaction time even if syncing is delayed. This matters for daily sales reports and audit trails.

### Connection and Transactions

IndexedDB operations are wrapped in an abstraction layer (`db.ts`) that handles:

- Database versioning and upgrades
- Transaction management (read/write modes)
- Error recovery with automatic retries
- Connection pooling for concurrent operations

The abstraction ensures that database operations never fail silently. If a transaction cannot be written, the user sees an error rather than thinking their sale succeeded.

## Batch Sync Protocol

### The Challenge of Syncing

Syncing thousands of transactions one-by-one would be extremely slow and inefficient. It would:

- Exhaust battery on mobile devices
- Waste bandwidth with HTTP overhead
- Increase the chance of partial failures
- Block the UI during sync

### Batch Processing

The sync protocol sends transactions in batches:

1. Queue collects all pending transactions (up to a configurable limit)
2. Each transaction is enriched with the local UUID
3. Batch is sent as a single JSON payload to `/api/pos/sync/batches`
4. Server processes the entire batch atomically
5. Results are returned with per-transaction status
6. Successful transactions are removed from local queue
7. Failed transactions remain for retry

The batch endpoint accepts this structure:

```json
{
  "device_id": "device-uuid-here",
  "batch_uuid": "batch-uuid-here",
  "transactions": [
    {
      "local_txn_uuid": "uuid-1",
      "occurred_at": "2026-06-28T20:00:00Z",
      "checkout": { /* transaction data */ }
    }
  ]
}
```

### Why Batch UUID?

The `batch_uuid` serves multiple purposes:

- **Traceability**: Each sync attempt has a unique identifier for debugging
- **Idempotency**: The same batch can be retried without duplicate processing
- **Audit trail**: Database stores when each batch was pushed and its status

## Idempotency with local_txn_uuid

### The Duplicate Transaction Problem

Network unreliability creates a classic distributed systems problem: if a sync request times out, should the client retry? If yes, how do we prevent duplicate transactions?

**The naive approach fails**:
1. Client sends transaction to server
2. Server processes and saves to database
3. Network error occurs before response reaches client
4. Client retries
5. Transaction is processed again—duplicate sale!

### The Idempotency Solution

Each transaction has a `local_txn_uuid` that is:

- Generated client-side before the transaction is even started
- Included in the request to the backend
- Stored in the database alongside the sale

On the server, the `PosSyncController` checks for existing idempotency keys:

```php
$idempotencyKey = $deviceId . ':' . $localTransactionUuid;
$existingKey = SyncIdempotencyKey::query()
    ->where('key', $idempotencyKey)
    ->first();
```

If found, the server returns the original sale ID without processing again.

### Why This Matters

This pattern ensures that:

- **No data loss**: Retries don't result in lost transactions
- **No duplicates**: The same transaction UUID is never processed twice
- **Consistency**: The client and server have the same view of what was sold

The `local_txn_uuid` is generated using `crypto.randomUUID()` in the browser, which provides cryptographically strong uniqueness. The probability of collision is negligible (1 in 2^122).

## Conflict Resolution

### What Constitutes a Conflict?

In a distributed POS system, conflicts can occur in several forms:

**Inventory Conflict**:
1. Transaction A decrements stock from 10 to 5
2. Transaction B (offline) also sees stock at 10
3. Both try to sell 6 units each
4. One must fail to prevent negative inventory

**Resolution Strategy**: The `CheckoutProcessor` validates stock availability within a database transaction. If stock was decremented by another process, the transaction fails with a clear error message: "Stock tidak tersedia."

**Price Conflict**:
1. Offline transaction created with price $10
2. Price updated to $12 while offline
3. Transaction syncs with old price

**Resolution Strategy**: We don't prevent this. Historical transactions are immutable records. They reflect the price at the time of sale, which is correct for auditing. Current stock and pricing are separate concerns.

**Duplicate Transaction**:
Already handled by the idempotency key check.

### Best Effort vs Strong Consistency

PayTo uses a "best effort" approach for offline transactions. Transactions are processed in the order they were created (based on `occurred_at`), but there's no distributed locking mechanism. This is intentional:

- **Performance**: Distributed locking adds latency and complexity
- **Scalability**: Locks don't scale well with many devices
- **Acceptable risk**: For POS, occasional out-of-order processing is acceptable; losing sales is not

## Sync Status Tracking

### The Status Enum

Each synced transaction receives one of four statuses:

**PROCESSED**: Transaction was successfully saved to the database. The sale is now part of the official sales record.

**DUPLICATE**: The `local_txn_uuid` was already processed. This could happen due to intentional retries or network retries. The original sale ID is returned.

**FAILED**: The transaction could not be processed. Common reasons:
- Product no longer exists (deleted while offline)
- Insufficient stock (stock was sold by another device)
- Validation errors (malformed data)

**PENDING**: Not currently used, but reserved for transactions queued for future sync attempts.

### Client-Side Handling

The `flushCheckoutQueue` function handles results intelligently:

```typescript
const removableStatuses = new Set(['PROCESSED', 'DUPLICATE']);

for (const result of results) {
    if (removableStatuses.has(result.status)) {
        await deleteQueuedTransaction(result.local_txn_uuid);
    }
}
```

Transactions with status `PROCESSED` or `DUPLICATE` are removed from the local queue. `FAILED` transactions remain for manual review or retry.

### Dashboard Visibility

The admin dashboard shows sync status for each transaction:

- **SYNCED**: Transaction was successfully processed and is in the database
- **PENDING**: Transaction exists in the offline queue but hasn't been synced yet

This visibility is crucial for store managers to verify that all sales are accounted for.

## Reliability Guarantees

### Data Durability

Transactions stored in IndexedDB survive browser restarts, crashes, and power failures. They're written to disk, not kept in memory.

### Retry Logic

If a sync fails due to network error, the queue persists and retries on next online event:

```typescript
window.addEventListener('online', () => {
    void flushCheckoutQueue();
});
```

This ensures eventual consistency—even if sync fails repeatedly, it will eventually succeed when connectivity is restored.

### Manual Intervention

For transactions that remain in FAILED status, the admin interface provides visibility and manual resolution options. This might include:

- Verifying product still exists
- Adjusting stock manually
- Approving the sale as valid despite validation failure

The goal is never to lose sales data. If a transaction cannot be processed automatically, it's flagged for human review rather than discarded.

## Summary: Why Offline-First Is Essential

The offline-first architecture transforms POS from a connectivity-dependent system into a reliable business tool. It's not about avoiding connectivity—it's about designing for when connectivity fails.

Key takeaways:

- **Zero downtime**: Transactions continue during outages
- **No data loss**: All sales are eventually recorded
- **No duplicates**: Idempotency prevents double-charging
- **Reconciliation**: Clear sync status and audit trail
- **Business continuity**: Store operations continue regardless of network status

For a retail business, these guarantees translate directly to revenue protection and customer satisfaction.
