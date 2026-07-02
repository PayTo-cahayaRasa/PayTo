<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name');
            $table->text('description')->nullable()->after('price');
            $table->boolean('is_public')->default(false)->index()->after('is_active');
            $table->boolean('featured')->default(false)->index()->after('is_public');
            $table->string('image_path')->nullable()->after('featured');

            // Combined index for catalog queries
            $table->index(['is_active', 'is_public']);
            $table->index(['is_active', 'is_public', 'featured']);
        });

        // Generate unique slugs for existing products
        $products = DB::table('products')->get();
        foreach ($products as $product) {
            $baseSlug = Str::slug($product->name);
            $slug = $baseSlug;
            $counter = 1;

            // Ensure uniqueness
            while (DB::table('products')->where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }

            DB::table('products')->where('id', $product->id)->update(['slug' => $slug]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'is_public']);
            $table->dropIndex(['is_active', 'is_public', 'featured']);
            $table->dropColumn(['slug', 'description', 'is_public', 'featured', 'image_path']);
        });
    }
};
