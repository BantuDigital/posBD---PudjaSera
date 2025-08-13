<?php

namespace App\Http\Controllers;

use DB;
use Exception;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\ProductTransaction;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions with search, filter, and pagination.
     */
    public function index(Request $request)
    {
        $query = DB::table('transactions')
            ->join('products', 'transactions.product_id', '=', 'products.id')
            ->select(
                'transactions.id',
                'transactions.transaction_date',
                'transactions.quantity',
                'transactions.notes',
                'transactions.harga_modal',
                'transactions.harga_jual',
                'products.name'
            )->groupBy('transactions.id');

        // Search by transaction number or product name
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->Where('products.name', 'like', "%$search%");
            });
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('transactions.transaction_date', '>=', $request->input('date_from'));
        }
        if ($request->has('date_to')) {
            $query->where('transactions.transaction_date', '<=', $request->input('date_to'));
        }

        // Filter terbaru/terlama
        $order = $request->input('order', 'desc'); // default terbaru
        $query->orderBy('transactions.created_at', $order);

        // Pagination
        $transactions = $query->paginate(10);

        return response()->json($transactions);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        return response()->json($transaction);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string'

        ]);

        DB::beginTransaction();
        try {
            $product = Product::where('id',$validated['product_id'])->first();
            if ($product->stock - $validated['quantity'] < 0) {
                # code... 
                throw new Exception("Stock tidak mencukupi");
                
            }
            $product->stock-=$validated['quantity'];
            $product->save();
            $transaction = new Transaction();
            
            $transaction->transaction_date = $validated['date']; // Use the date from frontend
            $transaction->product_id = $validated['product_id'];
            $transaction->quantity = $validated['quantity'];
            $transaction->harga_jual = $product->harga_jual;
            $transaction->harga_modal = $product->harga_modal;
            $transaction->notes = $validated['notes'] ?? null;
            $transaction->save();


            DB::commit();
            return response()->json([
                'message' => 'Transaksi berhasil dibuat',
                'data' => $transaction
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Gagal : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        //
    }
}
