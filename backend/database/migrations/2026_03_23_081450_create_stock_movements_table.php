<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            
            $table->enum('type', ['IN', 'OUT', 'ADJUSTMENT']);
            $table->decimal('carat', 10, 3);
            $table->integer('pieces')->default(0);
            
            $table->unsignedBigInteger('reference_id')->nullable(); // Sale id or Purchase id
            $table->string('reference_type')->nullable(); // 'Purchase' or 'Sale'
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
