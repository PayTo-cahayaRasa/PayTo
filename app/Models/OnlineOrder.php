<?php

namespace App\Models;

use App\Enums\OnlineOrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnlineOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'tracking_token', 'idempotency_key', 'customer_name', 'customer_phone', 'fulfillment_method',
        'shipping_address', 'destination_id', 'destination_label', 'shipping_courier_code',
        'shipping_courier_name', 'shipping_service', 'shipping_cost', 'shipping_etd',
        'shipping_weight_grams', 'shipping_quoted_at', 'subtotal', 'discount_total', 'grand_total',
        'payment_method', 'status', 'sale_id', 'tracking_number', 'customer_note', 'paid_at',
        'shipped_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => OnlineOrderStatus::class,
            'shipping_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'shipping_quoted_at' => 'datetime',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OnlineOrderItem::class);
    }

    public function sale(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
