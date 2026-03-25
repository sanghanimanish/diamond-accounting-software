<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('purchase_item_id')->constrained()->onDelete('cascade');
            
            $table->string('lot_name');
            $table->decimal('original_carat', 10, 3);
            $table->decimal('remaining_carat', 10, 3);
            $table->integer('original_pieces')->default(1);
            $table->integer('remaining_pieces')->default(1);
            $table->decimal('cost_rate', 15, 2);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
