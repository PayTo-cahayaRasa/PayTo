<?php

namespace App\Models;

use App\Enums\SaleSource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'server_invoice_no',
        'local_txn_uuid',
        'status',
        'source',
        'customer_name',
        'customer_phone',
        'cashier_id',
        'subtotal',
        'discount_total',
        'tax_total',
        'grand_total',
        'paid_total',
        'change_total',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'source' => SaleSource::class,
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'paid_total' => 'decimal:2',
            'change_total' => 'decimal:2',
            'occurred_at' => 'datetime',
        ];
    }

    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SaleItem::class, 'sale_id');
    }

    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Payment::class, 'sale_id');
    }

    public function refunds(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Refund::class, 'sale_id');
    }

    public function cashier(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
