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
        Schema::create('product_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict'); // Foreign key to the products table
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('restrict'); // Foreign key to the transactions table
            $table->decimal('quantity', 10, 2); // Quantity of the product in the transaction
            $table->decimal('harga_jual', 10, 2); // Price of the product at the time of the transaction
            $table->decimal('harga_modal', 10, 2); // Price of the product at the time of the transaction
            $table->text('notes')->nullable(); // Additional notes for the transaction
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_transactions');
    }
};
