<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->onDelete('cascade');
            $table->foreignId('purchase_item_id')->constrained()->onDelete('restrict'); // Stock source
            
            $table->decimal('carat', 10, 3);
            $table->decimal('sale_rate', 15, 2);
            $table->decimal('cost_rate', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('item_profit', 15, 2);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
