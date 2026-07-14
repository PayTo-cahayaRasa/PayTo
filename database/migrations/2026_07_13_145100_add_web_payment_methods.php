<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payments MODIFY method ENUM('CASH', 'EWALLET', 'BANK_TRANSFER', 'QRIS_MANUAL', 'PAY_AT_STORE') NOT NULL DEFAULT 'CASH'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY method ENUM('CASH', 'EWALLET') NOT NULL DEFAULT 'CASH'");
    }
};
