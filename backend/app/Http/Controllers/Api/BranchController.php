<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Branch::with('company')->withCount('users');

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure unique name within the same company
        if (Branch::where('company_id', $validated['company_id'])->where('slug', $validated['slug'])->exists()) {
            return response()->json(['message' => 'A branch with this name already exists in this company.'], 422);
        }

        $branch = Branch::create($validated);

        return response()->json($branch->load('company'), 201);
    }

    public function show(Branch $branch): JsonResponse
    {
        return response()->json($branch->load('company', 'users'));
    }

    public function update(Request $request, Branch $branch): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
            
            // Check uniqueness in same company
            if (Branch::where('company_id', $branch->company_id)
                ->where('slug', $validated['slug'])
                ->where('id', '!=', $branch->id)
                ->exists()) {
                return response()->json(['message' => 'A branch with this name already exists in this company.'], 422);
            }
        }

        $branch->update($validated);

        return response()->json($branch->load('company'));
    }

    public function destroy(Branch $branch): JsonResponse
    {
        $branch->delete();
        return response()->json(['message' => 'Branch deleted successfully.']);
    }
}
