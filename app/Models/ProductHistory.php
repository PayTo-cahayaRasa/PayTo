<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductHistory extends Model
{
    use HasFactory;

    protected $table = 'product_history';

    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'actor_id',
        'event',
        'old_values',
        'new_values',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    /**
     * Available audit events
     */
    public const EVENT_CREATED = 'CREATED';
    public const EVENT_UPDATED = 'UPDATED';
    public const EVENT_DELETED = 'DELETED';
    public const EVENT_STOCK_ADJUSTED = 'STOCK_ADJUSTED';
    public const EVENT_STOCK_OPNAME = 'STOCK_OPNAME';

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function actor(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Log a product change
     */
    public static function logChange(
        int $productId,
        ?int $actorId,
        string $event,
        array $oldValues = [],
        array $newValues = [],
        ?string $note = null
    ): self {
        return static::query()->create([
            'product_id' => $productId,
            'actor_id' => $actorId,
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'occurred_at' => now(),
        ]);
    }
}
