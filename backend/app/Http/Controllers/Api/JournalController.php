<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JournalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JournalEntry::with('items.account', 'company', 'branch');

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        return response()->json($query->latest('entry_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'   => 'required|exists:companies,id',
            'branch_id'    => 'nullable|exists:branches,id',
            'entry_date'   => 'required|date',
            'reference_no' => 'required|string|unique:journal_entries,reference_no',
            'narration'    => 'nullable|string',
            'items'        => 'required|array|min:2',
            'items.*.account_id' => 'required|exists:accounts,id',
            'items.*.debit'      => 'required|numeric|min:0',
            'items.*.credit'     => 'required|numeric|min:0',
            'items.*.note'       => 'nullable|string',
        ]);

        $totalDebit = collect($request->items)->sum('debit');
        $totalCredit = collect($request->items)->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.001) {
            throw ValidationException::withMessages([
                'items' => ['The total debits must equal total credits. (DR: ' . $totalDebit . ', CR: ' . $totalCredit . ')'],
            ]);
        }

        if ($totalDebit <= 0) {
            throw ValidationException::withMessages([
                'items' => ['Transaction amount must be greater than zero.'],
            ]);
        }

        return DB::transaction(function () use ($validated, $totalDebit) {
            $entry = JournalEntry::create([
                'company_id'   => $validated['company_id'],
                'branch_id'    => $validated['branch_id'],
                'entry_date'   => $validated['entry_date'],
                'reference_no' => $validated['reference_no'],
                'narration'    => $validated['narration'],
                'total_amount' => $totalDebit,
            ]);

            foreach ($validated['items'] as $item) {
                JournalItem::create([
                    'journal_entry_id' => $entry->id,
                    'account_id'       => $item['account_id'],
                    'debit'            => $item['debit'],
                    'credit'           => $item['credit'],
                    'note'             => $item['note'] ?? null,
                ]);
            }

            return response()->json($entry->load('items.account'), 21);
        });
    }

    public function show(JournalEntry $journal): JsonResponse
    {
        return response()->json($journal->load('items.account', 'company', 'branch'));
    }

    public function destroy(JournalEntry $journal): JsonResponse
    {
        $journal->delete();
        return response()->json(['message' => 'Journal entry deleted successfully.']);
    }
}
