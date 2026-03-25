<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('purchase_items', 'remaining_carat')) {
            Schema::table('purchase_items', function (Blueprint $table) {
                $table->decimal('remaining_carat', 10, 3)->default(0)->after('carat');
            });
        }
        
        if (!Schema::hasColumn('branches', 'slug')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->string('slug')->after('name');
            });
        }
        
        if (!Schema::hasColumn('companies', 'slug')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('slug')->after('name');
            });
        }
    }

    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropColumn('remaining_carat');
        });
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
