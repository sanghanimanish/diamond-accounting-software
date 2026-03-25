<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = ['journal_entries', 'purchases', 'sales', 'payments'];
        
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->foreignId('currency_id')->nullable()->constrained('currencies')->onDelete('set null');
                $table->decimal('exchange_rate', 15, 6)->default(1.0);
            });
        }
    }

    public function down(): void
    {
        $tables = ['journal_entries', 'purchases', 'sales', 'payments'];
        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['currency_id']);
                $table->dropColumn(['currency_id', 'exchange_rate']);
            });
        }
    }
};
