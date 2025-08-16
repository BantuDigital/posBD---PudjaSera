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
        $operationalQuery = DB::table('operationals');
        if ($end) {
            $trxQuery->whereBetween('transaction_date', [$start, $end]);
            $operationalQuery->whereBetween('date', [$start, $end]);
        } else {
            $trxQuery->whereDate('transaction_date', $start);
            $operationalQuery->whereDate('date', $start);
        }

        // Total penjualan
        $totalPenjualan = (clone $trxQuery)
            ->sum(DB::raw('harga_jual * quantity'));

      
        // Total laba kotor (penjualan - total COGS)
        $totalCOGS = (clone $trxQuery)
            ->sum(DB::raw('harga_modal * quantity'));
        $labaKotor = $totalPenjualan - $totalCOGS;

        // Jumlah produk terjual
        $produkTerjual = (clone $trxQuery)
            ->sum('quantity');

        // Total biaya operasional
        $totalOperational = (clone $operationalQuery)
            ->sum('total');

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
            'labaKotor' => $labaKotor,
            'operationalCost' => $totalOperational,
            'produkTerjual' => $produkTerjual,
            'warningLowStock' => $warningLowStock,
            'produkLowStock' => $produkLowStock,
        ]);
    }
}
