<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // MySQL requires dropping and recreating the column to change enum values
        DB::statement('ALTER TABLE stock_movements MODIFY COLUMN type VARCHAR(50)');
        DB::statement("ALTER TABLE stock_movements MODIFY COLUMN type ENUM('SALE_OUT', 'RETURN_IN', 'ADJUSTMENT', 'SYNC_CORRECTION', 'INITIAL_STOCK', 'STOCK_IN', 'STOCK_OUT')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE stock_movements MODIFY COLUMN type VARCHAR(50)');
        DB::statement("ALTER TABLE stock_movements MODIFY COLUMN type ENUM('SALE_OUT', 'RETURN_IN', 'ADJUSTMENT', 'SYNC_CORRECTION')");
    }
};
