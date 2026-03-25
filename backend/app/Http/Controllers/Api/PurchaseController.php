<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Purchase::with('supplier', 'journalEntry', 'items');
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        return response()->json($query->latest('purchase_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'    => 'required|exists:companies,id',
            'branch_id'     => 'nullable|exists:branches,id',
            'supplier_id'   => 'required|exists:suppliers,id',
            'purchase_no'   => 'required|string|unique:purchases,purchase_no',
            'purchase_date' => 'required|date',
            'notes'         => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.carat'     => 'required|numeric|min:0.001',
            'items.*.rate'      => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = collect($validated['items'])->sum(function($item) {
                return $item['carat'] * $item['rate'];
            });

            // 1. Create Purchase Header
            $purchase = Purchase::create([
                'company_id'    => $validated['company_id'],
                'branch_id'     => $validated['branch_id'],
                'supplier_id'   => $validated['supplier_id'],
                'purchase_no'   => $validated['purchase_no'],
                'purchase_date' => $validated['purchase_date'],
                'notes'         => $validated['notes'],
                'total_amount'  => $totalAmount,
            ]);

            // 2. Create Purchase Items
            // 2. Create Purchase Items & Formal Stock Records
            foreach ($validated['items'] as $itemData) {
                $pItem = PurchaseItem::create([
                    'purchase_id'     => $purchase->id,
                    'item_name'       => $itemData['item_name'],
                    'carat'           => $itemData['carat'],
                    'remaining_carat' => $itemData['carat'], 
                    'rate'            => $itemData['rate'],
                    'subtotal'        => $itemData['carat'] * $itemData['rate'],
                ]);

                // Create Master Stock Record
                $stock = \App\Models\Stock::create([
                    'company_id'       => $validated['company_id'],
                    'branch_id'        => $validated['branch_id'],
                    'purchase_item_id' => $pItem->id,
                    'lot_name'         => $itemData['item_name'],
                    'original_carat'   => $itemData['carat'],
                    'remaining_carat'  => $itemData['carat'],
                    'cost_rate'        => $itemData['rate'],
                ]);

                // Record Movement IN
                \App\Models\StockMovement::create([
                    'stock_id'       => $stock->id,
                    'type'           => 'IN',
                    'carat'          => $itemData['carat'],
                    'reference_id'   => $purchase->id,
                    'reference_type' => 'Purchase',
                    'notes'          => 'Purchase In: ' . $purchase->purchase_no,
                ]);
            }

            // 3. Automate Journal Entry: DR Stock, CR Supplier
            $supplier = Supplier::findOrFail($validated['supplier_id']);
            
            // Find or create a Stock account for the company
            $stockAccount = Account::firstOrCreate(
                ['company_id' => $validated['company_id'], 'slug' => 'diamond-stock-asset'],
                [
                    'name' => 'Diamond Stock (Asset)',
                    'code' => 'STK-' . $validated['company_id'],
                    'type' => 'Asset',
                    'description' => 'Automated stock ledger for diamond inventory.',
                ]
            );

            $journalEntry = JournalEntry::create([
                'company_id'   => $validated['company_id'],
                'branch_id'    => $validated['branch_id'],
                'reference_no' => 'PUR-JV-' . $purchase->purchase_no,
                'entry_date'   => $validated['purchase_date'],
                'narration'    => 'Auto journal for Purchase No: ' . $purchase->purchase_no . '. Supplier: ' . $supplier->name,
                'total_amount' => $totalAmount,
            ]);

            // DR Stock
            JournalItem::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id'       => $stockAccount->id,
                'debit'            => $totalAmount,
                'credit'           => 0,
                'note'             => 'Stock addition from purchase',
            ]);

            // CR Supplier
            JournalItem::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id'       => $supplier->account_id,
                'debit'            => 0,
                'credit'           => $totalAmount,
                'note'             => 'Payable to supplier ' . $supplier->name,
            ]);

            $purchase->update(['journal_entry_id' => $journalEntry->id]);

            return response()->json($purchase->load('items', 'supplier', 'journalEntry.items.account'), 201);
        });
    }

    public function show(Purchase $purchase): JsonResponse
    {
        return response()->json($purchase->load('items', 'supplier', 'journalEntry.items.account'));
    }

    public function destroy(Purchase $purchase): JsonResponse
    {
        return DB::transaction(function () use ($purchase) {
            foreach ($purchase->items as $item) {
                if ($item->stock) {
                    $item->stock->delete(); // This will cascade to movements
                }
            }

            if ($purchase->journal_entry_id) {
                JournalEntry::find($purchase->journal_entry_id)?->delete();
            }
            $purchase->delete();
            return response()->json(['message' => 'Purchase and its stock deleted successfully.']);
        });
    }
}
