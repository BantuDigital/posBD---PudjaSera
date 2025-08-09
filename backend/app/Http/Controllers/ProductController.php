<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCOGS;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('products');

        // Search by name or category
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('category', 'like', "%$search%");
            });
        }

        // Sorting
        if ($request->has('sort_by') && $request->has('sort_order')) {
            // Ensure sort_by and sort_order are strings
            $sortBy = (string) $request->input('sort_by');
            $sortOrder = (string) $request->input('sort_order');
            $query->orderBy($sortBy, $sortOrder);
        }
        $query->select('id', 'name', 'category', 'harga_jual', 'harga_modal', 'stock', 'image_url', 'is_active');
        // Pagination
        $products = $query->paginate(10);

        return response()->json($products);
    }


    public function restock(Request $request, $productId)
    {

        try {
            $validated = $request->validate([
                'harga_jual' => 'required|numeric',
                'harga_modal' => 'required|numeric',
                'stockNew' => 'required|integer|min:1',
            ]);
            DB::beginTransaction();
            $product = Product::findOrFail($productId);

            $harga_modal_lama = $product->harga_modal;
            $stok_lama = $product->stock;
            $harga_modal_baru = $validated['harga_modal'];
            $stok_baru = $validated['stockNew'];
            $mavg_cost_baru = (($stok_lama * $harga_modal_lama) + ($stok_baru * $harga_modal_baru)) / ($stok_lama + $stok_baru);
            $product->harga_jual = $validated['harga_jual'];
            $product->harga_modal = $mavg_cost_baru;
            $product->stock += $stok_baru; // Update stock with the new stock added
            $product->save();

            DB::commit();
            return response()->json(['message' => 'Product updated successfully'], 200);

        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return response()->json(['message' => 'Invalid input', 'error' => $th->getMessage()], 422);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'harga_jual' => 'required',
            'harga_modal' => 'required',
            'stock' => 'required|integer',
            'description' => 'nullable|string',
        ]);



        DB::beginTransaction();

        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $request->validate([
                    'image' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
                ]);
                $timestamp = now()->timestamp;
                $originalName = $request->file('image')->getClientOriginalName();
                $imagePath = $request->file('image')->storeAs('products', $timestamp . '_' . $originalName, 'public');
            }

            // Insert product and get the inserted ID
            $product = Product::create([
                'name' => $validated['name'],
                'category' => $validated['category'],
                'harga_jual' => $validated['harga_jual'],
                'harga_modal' => $validated['harga_modal'],
                'stock' => $validated['stock'],
                'description' => $validated['description'],
                'image_url' => $imagePath,
                'is_active' => true,
            ]);

            DB::commit();

            return response()->json(['message' => 'Product created successfully'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create product', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $productId)
    {

        return response()->json([
            'product' => $productId,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'price' => 'required',
            'stock' => 'required|integer',
            'description' => 'nullable|string',
            'components' => 'string|required',
            'is_active' => 'required',
        ]);

        // Check the type of $request->components
        // Validasi dan decode 'components' yang wajib ada dan harus array
        $componentsRaw = $request->input('components');
        if (is_null($componentsRaw)) {
            return response()->json(['message' => "'components' field is required"], 422);
        }
        if (is_string($componentsRaw)) {
            $components = json_decode($componentsRaw, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($components)) {
                return response()->json(['message' => "'components' must be a valid JSON array"], 422);
            }
        } elseif (is_array($componentsRaw)) {
            $components = $componentsRaw;
        } else {
            return response()->json(['message' => "'components' must be an array or JSON string"], 422);
        }


        DB::beginTransaction();

        try {
            $product = Product::where('id', $id)->first();


            $cogs = ProductCOGS::where('product_id', $id)->get();
            foreach ($cogs as $value) {
                $stok_sebelum = $product->stock;
                $avg_sebelum = $value->avg_cost;
                $qty_masuk = $validated['stock'];
                // Cari komponen yang sesuai di array $components menggunakan array_filter
                $matchingComponents = array_filter($components, function ($component) use ($value) {
                    return $component['name'] == $value->component_name;
                });
                $matchingComponent = reset($matchingComponents); // Ambil elemen pertama jika ada
                $harga_baru = $matchingComponent['cost'];
                $total_biaya_baru = $qty_masuk * $harga_baru;
                // Hitung stock & modal baru
                $stok_akhir = $stok_sebelum + $qty_masuk;
                $modal_lama = $stok_sebelum * $avg_sebelum;
                $modal_baru = $total_biaya_baru;
                $avg_cost_terbaru = ($modal_lama + $modal_baru) / $stok_akhir;
                $value->avg_cost = $avg_cost_terbaru;
                $product->stock = $stok_akhir;

            }
            // Insert ulang komponen baru
            // foreach ($components as $component) {
            //     ProductCOGS::where('product_id', $id)
            //         ->where('component_name', $component['name'])
            //         ->updateOrCreate([
            //             'product_id' => $id,
            //             'component_name' => $component['name'],
            //             'avg_cost' => $component['cost']
            //         ]);
            // }

            if ($request->hasFile('image')) {

                $request->validate([
                    'image' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
                ]);
                $timestamp = now()->timestamp;
                $originalName = $request->file('image')->getClientOriginalName();
                $product->image_url = $request->file('image')->storeAs('products', $timestamp . '_' . $originalName, 'public');
                if ($product && $product->image_url) {
                    Storage::disk('public')->delete($product->image_url);
                }
            }
            // Update product attributes directly
            $product->name = $validated['name'];
            $product->category = $validated['category'];
            $product->price = $validated['price'];
            $product->stock = $validated['stock'];
            $product->description = $validated['description'];
            $product->image_url = $product->image_url;
            $product->is_active = $validated['is_active'];
            $product->save();
            DB::commit();

            return response()->json(['message' => 'Product created successfully'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create product', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }

}
