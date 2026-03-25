<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseItem extends Model
{
    protected $fillable = ['purchase_id', 'item_name', 'carat', 'remaining_carat', 'rate', 'subtotal'];

    protected $casts = [
        'carat' => 'decimal:3',
        'remaining_carat' => 'decimal:3',
        'rate' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function stock(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Stock::class);
    }
}
