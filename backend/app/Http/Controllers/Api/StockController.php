<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    /**
     * Display current stock levels.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Stock::with(['purchaseItem.purchase.supplier', 'company', 'branch']);
        
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        // Only show items with carats remaining
        if ($request->get('show_zero') !== 'true') {
            $query->where('remaining_carat', '>', 0);
        }

        return response()->json($query->get());
    }

    /**
     * Get stock details including movement history.
     */
    public function show(Stock $stock): JsonResponse
    {
        return response()->json($stock->load([
            'purchaseItem.purchase.supplier', 
            'movements' => fn($q) => $q->latest()
        ]));
    }

    /**
     * Manual adjustment of stock.
     */
    public function adjust(Request $request, Stock $stock): JsonResponse
    {
        $validated = $request->validate([
            'adjustment_carat' => 'required|numeric',
            'notes'            => 'required|string',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $stock) {
            $stock->increment('remaining_carat', $validated['adjustment_carat']);
            
            StockMovement::create([
                'stock_id' => $stock->id,
                'type'     => 'ADJUSTMENT',
                'carat'    => $validated['adjustment_carat'],
                'notes'    => $validated['notes'],
            ]);

            return response()->json($stock->load('movements'));
        });
    }

    /**
     * Stock Movement Audit: Period-specific audit log.
     */
    public function movementHistory(Request $request): JsonResponse
    {
        $query = StockMovement::with(['stock.purchaseItem.purchase.supplier']);

        if ($request->has('company_id')) {
            $query->whereHas('stock', function($q) use ($request) {
                $q->where('company_id', $request->company_id);
            });
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Email current stock report to a stakeholder.
     */
    public function emailReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'      => 'required|email',
            'company_id' => 'required|exists:companies,id',
        ]);

        $stocks = Stock::where('company_id', $validated['company_id'])
            ->where('remaining_carat', '>', 0)
            ->with(['purchaseItem.purchase.supplier'])
            ->get();

        try {
            \Illuminate\Support\Facades\Mail::html(
                view('emails.stock_report', ['stocks' => $stocks])->render(),
                function($message) use ($validated) {
                    $message->to($validated['email'])
                            ->subject('Diamond Inventory Snapshot: ' . now()->format('Y-m-d'));
                }
            );
            return response()->json(['message' => 'Report dispatched successfully to ' . $validated['email']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Email failed: ' . $e->getMessage()], 500);
        }
    }
}
