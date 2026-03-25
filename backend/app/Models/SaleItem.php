<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = ['sale_id', 'purchase_item_id', 'carat', 'sale_rate', 'cost_rate', 'subtotal', 'item_profit'];

    protected $casts = [
        'carat' => 'decimal:3',
        'sale_rate' => 'decimal:2',
        'cost_rate' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'item_profit' => 'decimal:2',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function purchaseItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseItem::class);
    }
}
