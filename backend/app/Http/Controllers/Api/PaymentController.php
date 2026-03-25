<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['account', 'entityAccount', 'journalEntry']);
        
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest('payment_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'        => 'required|exists:companies,id',
            'branch_id'         => 'nullable|exists:branches,id',
            'type'              => 'required|in:PAYMENT,RECEIPT',
            'account_id'        => 'required|exists:accounts,id', // Cash/Bank
            'entity_account_id' => 'required|exists:accounts,id', // Customer/Supplier
            'reference_no'      => 'required|string|unique:payments,reference_no',
            'payment_date'      => 'required|date',
            'amount'            => 'required|numeric|min:0.01',
            'notes'             => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Save Payment Record
            $payment = Payment::create($validated);

            // 2. Automate Journal Entry
            $journalEntry = JournalEntry::create([
                'company_id'   => $validated['company_id'],
                'branch_id'    => $validated['branch_id'],
                'reference_no' => 'PAY-JV-' . $payment->reference_no,
                'entry_date'   => $validated['payment_date'],
                'narration'    => ($validated['type'] === 'RECEIPT' ? 'Inbound Receipt: ' : 'Outbound Payment: ') . $payment->notes,
                'total_amount' => $validated['amount'],
            ]);

            if ($validated['type'] === 'RECEIPT') {
                // DR Cash/Bank
                JournalItem::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id'       => $validated['account_id'],
                    'debit'            => $validated['amount'],
                    'credit'           => 0,
                    'note'             => 'Receipt collection',
                ]);
                // CR Entity (Customer)
                JournalItem::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id'       => $validated['entity_account_id'],
                    'debit'            => 0,
                    'credit'           => $validated['amount'],
                    'note'             => 'Collection from customer',
                ]);
            } else {
                // PAYMENT (Outbound)
                // DR Entity (Supplier)
                JournalItem::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id'       => $validated['entity_account_id'],
                    'debit'            => $validated['amount'],
                    'credit'           => 0,
                    'note'             => 'Payment made to supplier',
                ]);
                // CR Cash/Bank
                JournalItem::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id'       => $validated['account_id'],
                    'debit'            => 0,
                    'credit'           => $validated['amount'],
                    'note'             => 'Cash/Bank disbursement',
                ]);
            }

            $payment->update(['journal_entry_id' => $journalEntry->id]);

            return response()->json($payment->load('account', 'entityAccount', 'journalEntry.items.account'), 201);
        });
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json($payment->load('account', 'entityAccount', 'journalEntry.items.account'));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        if ($payment->journal_entry_id) {
            JournalEntry::find($payment->journal_entry_id)?->delete();
        }
        $payment->delete();
        return response()->json(['message' => 'Payment and associated journal entry reversed and deleted.']);
    }
}
