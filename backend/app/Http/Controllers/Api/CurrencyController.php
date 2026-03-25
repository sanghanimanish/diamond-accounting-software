<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Currency::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'          => 'required|unique:currencies,code',
            'name'          => 'required|string',
            'exchange_rate' => 'required|numeric',
            'is_base'       => 'boolean'
        ]);

        if ($validated['is_base'] ?? false) {
            Currency::where('is_base', true)->update(['is_base' => false]);
        }

        return response()->json(Currency::create($validated), 201);
    }
    
    public function update(Request $request, Currency $currency): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string',
            'exchange_rate' => 'required|numeric',
            'is_base'       => 'boolean'
        ]);

        if ($validated['is_base'] ?? false) {
            Currency::where('is_base', true)->update(['is_base' => false]);
        }

        $currency->update($validated);
        return response()->json($currency);
    }
}
