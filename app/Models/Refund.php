<?php

/**
 * Represents a refund transaction for a sale, including supervisor approval data.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'approval_id',
        'sale_id',
        'requested_by',
        'approved_by',
        'total_amount',
        'reason',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'occurred_at' => 'datetime',
        ];
    }

    public function sale(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function requester(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RefundItem::class, 'refund_id');
    }
}
