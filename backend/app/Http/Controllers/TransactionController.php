<?php

namespace App\Http\Controllers;

use DB;
use App\Models\Buyer;
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
            ->join('buyers', 'transactions.buyer_id', '=', 'buyers.id')
            ->join('product_transactions', 'transactions.id', '=', 'product_transactions.transaction_id')
            ->join('products', 'product_transactions.product_id', '=', 'products.id')
            ->select(
                'transactions.id',
                'transactions.transaction_number',
                'transactions.transaction_date',
                'transactions.status',
                'buyers.name as buyer_name',
                'product_transactions.quantity',
                DB::raw('(products.harga_jual * product_transactions.quantity) as total_harga')
            );

        // Search by transaction number or buyer name
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('transactions.transaction_number', 'like', "%$search%")
                    ->orWhere('buyers.name', 'like', "%$search%");
            });
        }

        // Filter terbaru/terlama
        $order = $request->input('order', 'desc'); // default terbaru
        $query->orderBy('transactions.created_at', $order);

        // Pagination
        $transactions = $query->paginate(10);

        return response()->json($transactions);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function status(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => 'required|in:completed,cancelled',
        ]);

        DB::beginTransaction();
        try {
            if ($validated['status'] == 'cancelled') {
                // If cancelled, revert stock for all products in the transaction
                $productTransactions = ProductTransaction::where('transaction_id', $transaction->id)->get();
                foreach ($productTransactions as $productTransaction) {
                    $product = Product::findOrFail($productTransaction->product_id);
                    $product->stock += $productTransaction->quantity; // Revert stock
                    $product->save();
                }
            }
            $transaction->status = $validated['status'];
            $transaction->save();
            DB::commit();
            return response()->json($transaction);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Gagal mengubah status transaksi: ' . $e->getMessage()], 500);
        }
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'buyer_id' => 'nullable|exists:buyers,id',
            'buyer_name' => 'required',
            'buyer_phone' => 'nullable',
            'buyer_address' => 'nullable',
            'status' => 'required|in:process,completed,cancelled',
            'products' => 'required|array',
        ]);


        DB::beginTransaction();
        try {
            $buyer = Buyer::where('id', $validated['buyer_id'])->first();

            if (!$buyer) {
                $buyer = new Buyer();
                $buyer->name = $validated['buyer_name'];
                $buyer->phone = $validated['buyer_phone'] ?? null;
                $buyer->address = $validated['buyer_address'] ?? null;
                $buyer->save();
            }
            if ($buyer) {
                if ($validated['buyer_phone'] || $validated['buyer_address']) {
                    $buyer->phone = $validated['buyer_phone'] ?? null;
                    $buyer->address = $validated['buyer_address'] ?? null;
                    $buyer->save();
                }
            }


            $transaction = new Transaction();
            $transaction->transaction_number = 'TRX-' . strtoupper(uniqid());
            $transaction->transaction_date = now();
            $transaction->buyer_id = $buyer->id;
            $transaction->status = $validated['status'];
            $transaction->save();

            // Assuming products are passed as an array of product IDs and quantities
            foreach ($request->input('products') as $product) {
                $productExists = Product::findOrFail($product['value']);
                $productExists->stock -= $product['qty'];
                if ($productExists->stock < 0) {
                    throw new \Exception('Stock tidak cukup untuk produk: ' . $productExists->name);
                }
                $productExists->save();

                $productTransaction = new ProductTransaction();
                $productTransaction->transaction_id = $transaction->id;
                $productTransaction->product_id = $product['value'];
                $productTransaction->quantity = $product['qty'];
                $productTransaction->harga_jual = $productExists->harga_jual;
                $productTransaction->harga_modal = $productExists->harga_modal;
                $productTransaction->notes = $product['notes'] ?? null; // Optional notes
                $productTransaction->save();
            }
            DB::commit();
            return response()->json($transaction, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Gagal : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        //
    }

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
