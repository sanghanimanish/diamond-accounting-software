<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('account_id')->constrained('accounts')->onDelete('restrict'); // Cash/Bank
            $table->foreignId('entity_account_id')->constrained('accounts')->onDelete('restrict'); // Cust/Supplier
            $table->foreignId('journal_entry_id')->nullable()->constrained()->onDelete('set null');
            
            $table->enum('type', ['PAYMENT', 'RECEIPT']); // PAYMENT (to Supplier), RECEIPT (from Customer)
            $table->string('reference_no')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
