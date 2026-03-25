<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Account::with('parent');

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->orderBy('type')->orderBy('code')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'  => 'required|exists:companies,id',
            'branch_id'   => 'nullable|exists:branches,id',
            'parent_id'   => 'nullable|exists:accounts,id',
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|unique:accounts,code',
            'type'        => 'required|in:Asset,Liability,Income,Expense',
            'description' => 'nullable|string',
            'is_active'   => 'boolean'
        ]);

        $account = Account::create($validated);

        return response()->json($account->load('parent'), 201);
    }

    public function show(Account $account): JsonResponse
    {
        return response()->json($account->load('parent', 'children', 'company', 'branch'));
    }

    public function update(Request $request, Account $account): JsonResponse
    {
        $validated = $request->validate([
            'parent_id'   => 'nullable|exists:accounts,id|different:id',
            'name'        => 'sometimes|required|string|max:255',
            'code'        => 'sometimes|required|string|unique:accounts,code,' . $account->id,
            'type'        => 'sometimes|required|in:Asset,Liability,Income,Expense',
            'description' => 'nullable|string',
            'is_active'   => 'boolean'
        ]);

        $account->update($validated);

        return response()->json($account->load('parent'));
    }

    public function destroy(Account $account): JsonResponse
    {
        if ($account->children()->exists()) {
            return response()->json(['message' => 'Cannot delete an account with child accounts.'], 422);
        }

        $account->delete();
        return response()->json(['message' => 'Account deleted successfully.']);
    }
}
