<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard summary for today
     */
    public function index(Request $request)
    {
        $start = $request->input('start_date') ?: now()->toDateString();
        $end = $request->input('end_date');

        // Query builder untuk filter tanggal transaksi
        $trxQuery = DB::table('transactions');
        if ($end) {
            $trxQuery->whereBetween('transaction_date', [$start, $end]);
        } else {
            $trxQuery->whereDate('transaction_date', $start);
        }

        // Total penjualan
        $totalPenjualan = (clone $trxQuery)
            ->join('product_transactions', 'transactions.id', '=', 'product_transactions.transaction_id')
            ->sum(DB::raw('product_transactions.harga_jual * product_transactions.quantity'));

        // Jumlah order
        $jumlahOrder = (clone $trxQuery)->count();

        // Total laba kotor (penjualan - total COGS)
        $totalCOGS = (clone $trxQuery)
            ->join('product_transactions', 'transactions.id', '=', 'product_transactions.transaction_id')
            ->sum(DB::raw('product_transactions.harga_modal * product_transactions.quantity'));
        $labaKotor = $totalPenjualan - $totalCOGS;

        // Jumlah produk terjual
        $produkTerjual = (clone $trxQuery)
            ->join('product_transactions', 'transactions.id', '=', 'product_transactions.transaction_id')
            ->sum('product_transactions.quantity');

        // Order pending (status = 'pending')
        $orderPending = DB::table('transactions')
            ->where('status', 'pending')
            ->count();

        // Cari produk dengan stok di bawah 5
        $produkLowStock = DB::table('products')
            ->where('stock', '<', 5)
            ->select('id', 'name', 'stock')
            ->get();

        $warningLowStock = $produkLowStock->count() > 0
            ? 'Ada produk dengan stok di bawah 5!'
            : null;

        return response()->json([
            'totalPenjualan' => $totalPenjualan,
            'jumlahOrder' => $jumlahOrder,
            'labaKotor' => $labaKotor,
            'produkTerjual' => $produkTerjual,
            'orderPending' => $orderPending,
            'warningLowStock' => $warningLowStock,
            'produkLowStock' => $produkLowStock,
        ]);
    }
}
