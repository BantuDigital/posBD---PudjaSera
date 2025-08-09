<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('harga_jual', 10, 2); // Price of the product and this not history price
            $table->decimal('harga_modal', 10, 2); // Price of the product and this not history price
            // The price is the current price of the product, not a historical price.
            // Historical prices should be managed in a separate table if needed.
            // This allows for easy updates to the product price without affecting historical data.
            // If you need to track price changes over time, consider creating a separate table for product prices.
            // This table can store historical prices along with timestamps for when the price was valid.
            $table->integer('stock')->default(0); // Stock quantity of the product
            // The stock quantity represents the current available stock of the product.
            // It is not a historical record but rather the current state of inventory.
            // If you need to track stock changes over time, consider creating a separate table for stock history.
            // This table can log stock changes with timestamps, allowing you to see how stock levels
            // have changed over time without affecting the current stock quantity.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
