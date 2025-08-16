<?php

namespace App\Http\Controllers;

use App\Models\Operational;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperationalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $q = Operational::query();

        if ($request->filled('start_date')) {
            $q->whereDate('date', '>=', $request->date('start_date'));
        }
        if ($request->filled('end_date')) {
            $q->whereDate('date', '<=', $request->date('end_date'));
        }

        $q->orderByDesc('date')->orderByDesc('id');

        $data = $q->paginate(12);
        return response()->json($data);
        // return JsonResource::collection($data)
        //     ->additional([
        //         'current_page' => $data->currentPage(),
        //         'last_page'    => $data->lastPage(),
        //     ]);
    }

    // POST /operationals
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'total' => ['required', 'numeric'],
            'date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $op = new Operational();
        $op->name = $validated['name'];
        $op->total = $validated['total'];
        $op->date = $validated['date'];
        $op->description = $validated['description'];
        $op->save();

        return response()->json($op, 201);
    }
    // GET /operationals/{id}
    public function show(Operational $operational)
    {
        return response()->json($operational);
    }

    // PUT/PATCH /operationals/{id}
    public function update(Request $request, Operational $operational)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'total' => ['sometimes', 'required', 'numeric'],
            'date' => ['sometimes', 'required', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $operational->update($validated);
        return response()->json($operational);
    }

    // DELETE /operationals/{id}
    public function destroy(Operational $operational)
    {
        $operational->delete();
        return response()->noContent();
    }
}
