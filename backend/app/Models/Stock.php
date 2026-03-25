<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stock extends Model
{
    protected $fillable = [
        'company_id', 'branch_id', 'purchase_item_id', 'lot_name',
        'original_carat', 'remaining_carat', 'original_pieces', 'remaining_pieces', 'cost_rate'
    ];

    protected $casts = [
        'original_carat'  => 'decimal:3',
        'remaining_carat' => 'decimal:3',
        'cost_rate'       => 'decimal:2',
    ];

    public function purchaseItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseItem::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
