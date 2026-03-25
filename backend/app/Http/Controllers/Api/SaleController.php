<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Customer;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sale::with('customer', 'journalEntry', 'items.purchaseItem');
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        return response()->json($query->latest('sale_date')->get());
    }

    /**
     * Get available stock items for a company.
     */
    public function getAvailableStock(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|exists:companies,id']);
        
        $stock = PurchaseItem::where('remaining_carat', '>', 0)
            ->whereHas('purchase', function($q) use ($request) {
                $q->where('company_id', $request->company_id);
            })
            ->with('purchase.supplier')
            ->get();

        return response()->json($stock);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'    => 'required|exists:companies,id',
            'branch_id'     => 'nullable|exists:branches,id',
            'customer_id'   => 'required|exists:customers,id',
            'sale_no'       => 'required|string|unique:sales,sale_no',
            'sale_date'     => 'required|date',
            'notes'         => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.purchase_item_id' => 'required|exists:purchase_items,id',
            'items.*.carat'            => 'required|numeric|min:0.001',
            'items.*.sale_rate'        => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $totalCost = 0;
            $itemsToProcess = [];

            // 1. Validate Stock and Prepare Data
            foreach ($validated['items'] as $itemData) {
                $pItem = PurchaseItem::lockForUpdate()->find($itemData['purchase_item_id']);
                
                if ($pItem->remaining_carat < $itemData['carat']) {
                    throw ValidationException::withMessages([
                        'items' => ["Inadequate stock for {$pItem->item_name}. Available: {$pItem->remaining_carat}."]
                    ]);
                }

                $subtotal = $itemData['carat'] * $itemData['sale_rate'];
                $cost = $itemData['carat'] * $pItem->rate;
                $lineProfit = $subtotal - $cost;

                $totalAmount += $subtotal;
                $totalCost += $cost;

                $itemsToProcess[] = [
                    'purchase_item' => $pItem,
                    'carat' => $itemData['carat'],
                    'sale_rate' => $itemData['sale_rate'],
                    'cost_rate' => $pItem->rate,
                    'subtotal' => $subtotal,
                    'profit' => $lineProfit
                ];
            }

            // 2. Create Sale Header
            $sale = Sale::create([
                'company_id'    => $validated['company_id'],
                'branch_id'     => $validated['branch_id'],
                'customer_id'   => $validated['customer_id'],
                'sale_no'       => $validated['sale_no'],
                'sale_date'     => $validated['sale_date'],
                'total_amount'  => $totalAmount,
                'total_cost'    => $totalCost,
                'profit'        => $totalAmount - $totalCost,
                'notes'         => $validated['notes'],
            ]);

            // 3. Process Items (Deduct Stock and Save Lines)
            foreach ($itemsToProcess as $processed) {
                $pItem = $processed['purchase_item'];
                $pItem->decrement('remaining_carat', $processed['carat']);

                // Update Formal Stock Record
                $stock = $pItem->stock()->lockForUpdate()->first();
                if ($stock) {
                    $stock->decrement('remaining_carat', $processed['carat']);
                    
                    // Create Movement OUT
                    \App\Models\StockMovement::create([
                        'stock_id'       => $stock->id,
                        'type'           => 'OUT',
                        'carat'          => $processed['carat'],
                        'reference_id'   => $sale->id,
                        'reference_type' => 'Sale',
                        'notes'          => 'Sale Out: ' . $sale->sale_no . ' to customer ' . $customer->name,
                    ]);
                }

                SaleItem::create([
                    'sale_id'          => $sale->id,
                    'purchase_item_id' => $pItem->id,
                    'carat'            => $processed['carat'],
                    'sale_rate'        => $processed['sale_rate'],
                    'cost_rate'        => $processed['cost_rate'],
                    'subtotal'         => $processed['subtotal'],
                    'item_profit'      => $processed['profit'],
                ]);
            }

            // 4. Create Journal Entry: DR Customer, CR Sales
            $customer = Customer::findOrFail($validated['customer_id']);
            
            // Find or create Sales account
            $salesAccount = Account::firstOrCreate(
                ['company_id' => $validated['company_id'], 'slug' => 'diamond-sales-income'],
                [
                    'name' => 'Diamond Sales (Income)',
                    'code' => 'SAL-' . $validated['company_id'],
                    'type' => 'Income',
                    'description' => 'Automated sales ledger for diamond revenue.',
                ]
            );

            $journalEntry = JournalEntry::create([
                'company_id'   => $validated['company_id'],
                'branch_id'    => $validated['branch_id'],
                'reference_no' => 'SAL-JV-' . $sale->sale_no,
                'entry_date'   => $validated['sale_date'],
                'narration'    => 'Auto journal for Sales No: ' . $sale->sale_no . '. Customer: ' . $customer->name,
                'total_amount' => $totalAmount,
            ]);

            // DR Customer (Receivable)
            JournalItem::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id'       => $customer->account_id,
                'debit'            => $totalAmount,
                'credit'           => 0,
                'note'             => 'Receivable from sale ' . $sale->sale_no,
            ]);

            // CR Sales
            JournalItem::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id'       => $salesAccount->id,
                'debit'            => 0,
                'credit'           => $totalAmount,
                'note'             => 'Sales revenue from invoice ' . $sale->sale_no,
            ]);

            $sale->update(['journal_entry_id' => $journalEntry->id]);

            return response()->json($sale->load('items.purchaseItem', 'customer', 'journalEntry.items.account'), 201);
        });
    }

    public function show(Sale $sale): JsonResponse
    {
        return response()->json($sale->load('items.purchaseItem', 'customer', 'journalEntry.items.account'));
    }

    public function destroy(Sale $sale): JsonResponse
    {
        return DB::transaction(function () use ($sale) {
            // Restore stock
            foreach ($sale->items as $item) {
                $item->purchaseItem()->increment('remaining_carat', $item->carat);
                
                // Restore formal stock
                $stock = $item->purchaseItem->stock;
                if ($stock) {
                    $stock->increment('remaining_carat', $item->carat);
                    
                    // Remove the corresponding OUT movement
                    \App\Models\StockMovement::where([
                        'stock_id'     => $stock->id,
                        'reference_id' => $sale->id,
                        'type'         => 'OUT'
                    ])->delete();
                }
            }

            if ($sale->journal_entry_id) {
                JournalEntry::find($sale->journal_entry_id)?->delete();
            }

            $sale->delete();
            return response()->json(['message' => 'Sale deleted and stock restored.']);
        });
    }
}
