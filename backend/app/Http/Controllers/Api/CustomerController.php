<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::with('account');
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
            // 1. Create Ledger Account for Customer (Asset)
            $account = Account::create([
                'company_id' => $validated['company_id'],
                'name' => 'Customer: ' . $validated['name'],
                'code' => 'CUS-' . strtoupper(substr(uniqid(), -6)),
                'type' => 'Asset',
                'description' => 'Trade Receivable ledger for ' . $validated['name'],
            ]);

            // 2. Create Customer
            $validated['account_id'] = $account->id;
            $customer = Customer::create($validated);

            return response()->json($customer->load('account'), 201);
        });
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer->load('account', 'sales'));
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted successfully.']);
    }
}
