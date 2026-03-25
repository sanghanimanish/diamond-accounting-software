<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = ['stock_id', 'type', 'carat', 'pieces', 'reference_id', 'reference_type', 'notes'];

    protected $casts = [
        'carat' => 'decimal:3',
    ];

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
