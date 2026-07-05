<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->enum('method', ['CASH', 'EWALLET'])->default('CASH');
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('reference')->nullable();
            $table->enum('status', ['RECORDED'])->default('RECORDED');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
