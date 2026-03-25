<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::with('account');
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Create Ledger Account for Supplier (Liability)
            $account = Account::create([
                'company_id' => $validated['company_id'],
                'name' => 'Supplier: ' . $validated['name'],
                'code' => 'SUP-' . strtoupper(substr(uniqid(), -6)),
                'type' => 'Liability',
                'description' => 'Automated ledger for ' . $validated['name'],
            ]);

            // 2. Create Supplier
            $validated['account_id'] = $account->id;
            $supplier = Supplier::create($validated);

            return response()->json($supplier->load('account'), 201);
        });
    }

    public function show(Supplier $supplier): JsonResponse
    {
        return response()->json($supplier->load('account', 'purchases'));
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();
        return response()->json(['message' => 'Supplier deleted successfully.']);
    }
}
