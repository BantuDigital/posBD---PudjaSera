<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class COGSController extends Controller
{
    public function index($productId)
    {
        $cogs = DB::table('product_c_o_g_s')
            ->where('product_id', $productId)
            ->get();

        return response()->json($cogs);
    }
}
