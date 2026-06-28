# Workflow Persetujuan untuk Refund

Pelajari cara menangani request refund dari POS terminals dan approve atau reject sebagai supervisor.

## Overview

Workflow persetujuan memastikan bahwa transaksi refund memerlukan otorisasi supervisor sebelum diproses. Ini mencegah refund tidak autorisasi dan maintain financial accountability.

---

## Masalah: Customer request refund di POS

Customer ingin return items dan dapat refund. Kasir initiate refund request.

### Solusi

Kasir submit refund request dari POS:

```bash
POST /api/pos/refunds
Content-Type: application/json
Authorization: Bearer {cashier_token}

{
  "sale_id": 123,
  "items": [
    {
      "sale_item_id": 456,
      "quantity": 1,
      "reason": "Customer changed mind"
    }
  ],
  "refund_method": "CASH",
  "note": "Customer tidak jadi beli"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 78,
    "sale_id": 123,
    "status": "PENDING_APPROVAL",
    "total_amount": 7500,
    "items": [
      {
        "id": 89,
        "sale_item_id": 456,
        "product_id": 123,
        "product_name": "Teh Botol Sasa 250ml",
        "quantity": 1,
        "price": 7500,
        "total_price": 7500
      }
    ],
    "refund_method": "CASH",
    "note": "Customer tidak jadi beli",
    "created_by": "kasir1",
    "created_at": "2026-06-28 21:00:00",
    "approved_by": null,
    "approved_at": null,
    "rejected_by": null,
    "rejected_at": null,
    "rejection_reason": null
  },
  "message": "Refund request submitted for approval"
}
```

---

## Masalah: Supervisor view pending refund requests

Supervisor perlu lihat semua refund requests yang pending approval.

### Solusi

```bash
GET /api/supervisor/refunds?status=pending&page=1&limit=20
Authorization: Bearer {supervisor_token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 78,
      "sale_id": 123,
      "sale_number": "SALE-2026-0628-001",
      "customer_name": "Budi Santoso",
      "total_amount": 7500,
      "status": "PENDING_APPROVAL",
      "items": [
        {
          "product_name": "Teh Botol Sasa 250ml",
          "quantity": 1,
          "price": 7500
        }
      ],
      "refund_method": "CASH",
      "note": "Customer tidak jadi beli",
      "created_by": "kasir1",
      "created_at": "2026-06-28 21:00:00"
    },
    {
      "id": 79,
      "sale_id": 124,
      "sale_number": "SALE-2026-0628-002",
      "customer_name": "Ani Wijaya",
      "total_amount": 15000,
      "status": "PENDING_APPROVAL",
      "items": [
        {
          "product_name": "Sampo Cap Bambang 500ml",
          "quantity": 2,
          "price": 7500
        }
      ],
      "refund_method": "CREDIT",
      "note": "Kualitas produk tidak sesuai",
      "created_by": "kasir2",
      "created_at": "2026-06-28 21:15:00"
    }
  ],
  "meta": {
    "total": 2,
    "pending": 2,
    "approved": 0,
    "rejected": 0
  }
}
```

---

## Masalah: Supervisor approve refund

Supervisor approve refund request.

### Solusi

```bash
PATCH /api/supervisor/refunds/78/approve
Content-Type: application/json
Authorization: Bearer {supervisor_token}

{
  "approval_note": "Setujui refund sesuai kebijakan"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 78,
    "status": "APPROVED",
    "total_amount": 7500,
    "approved_by": "supervisor1",
    "approved_at": "2026-06-28 21:30:00",
    "approval_note": "Setujui refund sesuai kebijakan"
  },
  "message": "Refund approved successfully"
}
```

**Backend processing:**

```php
// RefundController.php
public function approve(Refund $refund, Request $request)
{
    $validator = Validator::make($request->all(), [
        'approval_note' => 'nullable|string|max:500'
    ]);
    
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }
    
    DB::transaction(function () use ($refund, $request) {
        // Validate refund window (2 days from sale)
        $saleDate = $refund->sale->created_at;
        $currentDate = now();
        $diffInDays = $saleDate->diffInDays($currentDate);
        
        if ($diffInDays > config('pos.refund_window_days', 2)) {
            throw new \Exception('Refund melewati batas waktu 2 hari');
        }
        
        // Validate refund amount
        if ($refund->total_amount > $refund->sale->total_amount) {
            throw new \Exception('Refund amount melebihi original payment');
        }
        
        // Update refund status
        $refund->update([
            'status' => 'APPROVED',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'approval_note' => $request->approval_note
        ]);
        
        // Restore stock
        foreach ($refund->items as $item) {
            $stock = StockItem::where('product_id', $item->product_id)->lockForUpdate()->first();
            $stock->increment('quantity', $item->quantity);
            
            StockMovement::create([
                'product_id' => $item->product_id,
                'product_name_snapshot' => $item->product_name,
                'previous_quantity' => $stock->quantity - $item->quantity,
                'adjustment' => $item->quantity,
                'new_quantity' => $stock->quantity,
                'adjustment_type' => 'REFUND',
                'related_type' => Refund::class,
                'related_id' => $refund->id,
                'reason' => 'Refund approval',
                'created_by' => $request->user()->username
            ]);
        }
        
        // Restore payment if credit
        if ($refund->refund_method === 'CREDIT') {
            // Update customer credit balance
            // (implementation depends on credit system)
        }
    });
    
    return response()->json([
        'success' => true,
        'data' => $refund->load('items.product'),
        'message' => 'Refund approved successfully'
    ]);
}
```

---

## Masalah: Supervisor reject refund

Supervisor reject refund request dengan alasan.

### Solusi

```bash
PATCH /api/supervisor/refunds/78/reject
Content-Type: application/json
Authorization: Bearer {supervisor_token}

{
  "rejection_reason": "Refund melewati batas waktu 2 hari"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 78,
    "status": "REJECTED",
    "total_amount": 7500,
    "approved_by": null,
    "approved_at": null,
    "rejected_by": "supervisor1",
    "rejected_at": "2026-06-28 21:35:00",
    "rejection_reason": "Refund melewati batas waktu 2 hari"
  },
  "message": "Refund rejected"
}
```

**Reject logic:**

```php
public function reject(Refund $refund, Request $request)
{
    $validator = Validator::make($request->all(), [
        'rejection_reason' => 'required|string|max:500'
    ]);
    
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }
    
    $refund->update([
        'status' => 'REJECTED',
        'rejected_by' => $request->user()->id,
        'rejected_at' => now(),
        'rejection_reason' => $request->rejection_reason
    ]);
    
    return response()->json([
        'success' => true,
        'data' => $refund,
        'message' => 'Refund rejected'
    ]);
}
```

---

## Masalah: View refund history

Lihat history semua refund requests.

### Solusi

```bash
GET /api/supervisor/refunds?status=all&from=2026-06-01&to=2026-06-30
Authorization: Bearer {supervisor_token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 76,
      "sale_id": 120,
      "status": "APPROVED",
      "total_amount": 5000,
      "created_at": "2026-06-27 10:00:00",
      "approved_at": "2026-06-27 10:15:00"
    },
    {
      "id": 77,
      "sale_id": 121,
      "status": "REJECTED",
      "total_amount": 10000,
      "created_at": "2026-06-27 14:00:00",
      "rejected_at": "2026-06-27 14:30:00"
    },
    {
      "id": 78,
      "sale_id": 123,
      "status": "PENDING_APPROVAL",
      "total_amount": 7500,
      "created_at": "2026-06-28 21:00:00"
    }
  ],
  "meta": {
    "total": 3,
    "approved": 1,
    "rejected": 1,
    "pending": 1
  }
}
```

---

## Refund Workflow Rules

**Aturan workflow persetujuan:**

1. **Refund window**: 2 hari dari tanggal penjualan asli (dapat dikonfigurasi)
2. **Hanya penjualan yang sudah dibayar yang dapat direfund**
3. **Refund amount tidak boleh melebihi original payment**
4. **Maximum refund quantity per item adalah original purchase quantity**
5. **Semua approval direkam untuk audit purposes**
6. **Refund yang diapproved tidak dapat dibatalkan**

---

## Status Transitions

```
DRAFT (created by cashier)
    ↓ (submit for approval)
PENDING_APPROVAL (waiting for supervisor)
    ↓ (approve)
APPROVED (refund processed)
    ↓ (reject)
REJECTED (refund denied)
```

---

## Refund Processing

### Setelah approve:

1. Stock di-restore
2. Payment di-restore (untuk credit)
3. Status refund jadi APPROVED
4. History log update
5. Notification sent (optional)

### Stock restoration:

```php
// Restore stock for each item
foreach ($refund->items as $item) {
    $stock = StockItem::where('product_id', $item->product_id)
        ->lockForUpdate()
        ->first();
    
    // Increment stock
    $stock->increment('quantity', $item->quantity);
    
    // Record movement
    StockMovement::create([
        'product_id' => $item->product_id,
        'product_name_snapshot' => $item->product->name,
        'previous_quantity' => $stock->quantity - $item->quantity,
        'adjustment' => $item->quantity,
        'new_quantity' => $stock->quantity,
        'adjustment_type' => 'REFUND',
        'related_type' => Refund::class,
        'related_id' => $refund->id,
        'reason' => 'Refund approved',
        'created_by' => $refund->approvedBy->username
    ]);
}
```

---

## Refund Amount Calculation

```php
// Calculate refund amount
$totalRefund = 0;
foreach ($refund->items as $item) {
    $itemTotal = $item->price * $item->quantity;
    $totalRefund += $itemTotal;
}

// Validate against original sale
if ($totalRefund > $refund->sale->total_amount) {
    throw new \Exception('Refund amount exceeds original payment');
}

// Validate per-item
foreach ($refund->items as $item) {
    $originalSaleItem = SaleItem::find($item->sale_item_id);
    
    if ($item->quantity > $originalSaleItem->quantity) {
        throw new \Exception("Quantity refund melebihi original purchase");
    }
}
```

---

## Audit Logging

Setiap action di-log:

```json
{
  "id": 123,
  "user_id": 5,
  "user_name": "supervisor1",
  "action": "refund_approved",
  "metadata": {
    "refund_id": 78,
    "sale_id": 123,
    "refund_amount": 7500,
    "note": "Setujui refund sesuai kebijakan"
  },
  "created_at": "2026-06-28 21:30:00"
}
```

**Audit log structure:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | User yang melakukan action |
| `action` | string | refund_approved, refund_rejected |
| `metadata` | json | Additional data |
| `created_at` | timestamp | Waktu action |

---

## Admin Dashboard

### Refund Statistics:

```vue
<!-- RefundDashboard.vue -->
<template>
  <div>
    <h2>Refund Statistics</h2>
    
    <div class="stats">
      <div class="stat-card">
        <h3>{{ stats.total }}</h3>
        <p>Total Refunds</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.approved }}</h3>
        <p>Approved</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.rejected }}</h3>
        <p>Rejected</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.pending }}</h3>
        <p>Pending</p>
      </div>
    </div>
    
    <h3>Pending Refunds</h3>
    <div v-if="pendingRefunds.length === 0">
      No pending refunds
    </div>
    <div v-else>
      <div v-for="refund in pendingRefunds" :key="refund.id">
        <h4>Refund #{{ refund.id }}</h4>
        <p>Amount: {{ formatCurrency(refund.total_amount) }}</p>
        <p>Customer: {{ refund.customer_name }}</p>
        <button @click="approveRefund(refund.id)">Approve</button>
        <button @click="rejectRefund(refund.id)">Reject</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: {},
      pendingRefunds: []
    };
  },
  async mounted() {
    await this.loadStats();
    await this.loadPendingRefunds();
  },
  methods: {
    async loadStats() {
      const response = await fetch('/api/supervisor/refunds/stats', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const result = await response.json();
      if (result.success) {
        this.stats = result.data;
      }
    },
    async loadPendingRefunds() {
      const response = await fetch('/api/supervisor/refunds?status=pending', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const result = await response.json();
      if (result.success) {
        this.pendingRefunds = result.data;
      }
    },
    async approveRefund(id) {
      await fetch(`/api/supervisor/refunds/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          approval_note: 'Approved by supervisor'
        })
      });
      await this.loadPendingRefunds();
    },
    async rejectRefund(id) {
      await fetch(`/api/supervisor/refunds/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          rejection_reason: 'Rejected by supervisor'
        })
      });
      await this.loadPendingRefunds();
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(amount);
    }
  }
};
</script>
```

---

## Best Practices

### For Cashiers:

1. Confirm refund eligibility before submitting
2. Provide clear refund reason
3. Keep receipt of original sale
4. Inform customer about approval wait time

### For Supervisors:

1. Review refund requests promptly
2. Check refund window validity
3. Verify refund amount accuracy
4. Document rejection reasons clearly
5. Monitor refund patterns for fraud detection

### Security:

1. Limit supervisor approvals
2. Audit all refund actions
3. Set refund limits per transaction
4. Monitor high-frequency refund patterns

---

## Summary

Workflow persetujuan refund di PayTo mencakup:

- Kasir submit refund requests
- Supervisor approve atau reject
- Stock restoration upon approval
- Payment restoration for credit refunds
- Audit logging untuk compliance
- Status tracking (PENDING, APPROVED, REJECTED)
- Refund window enforcement (2 days)
- Amount validation

Dengan sistem ini, business bisa maintain financial control, prevent fraud, dan provide excellent customer service.
