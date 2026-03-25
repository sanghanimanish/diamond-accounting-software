<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Ledger Report: Detailed history of a specific account.
     */
    public function ledger(Request $request, Account $account = null): JsonResponse
    {
        $query = JournalItem::with(['journalEntry'])
            ->orderBy('created_at', 'asc');

        if ($account) {
            $query->where('account_id', $account->id);
        } else if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        } else {
            return response()->json(['message' => 'Account ID is required'], 400);
        }

        $items = $query->get();
        $balance = 0;
        
        $report = $items->map(function ($item) use (&$balance) {
            $balance += ($item->debit - $item->credit);
            return [
                'date'      => $item->journalEntry->entry_date,
                'ref'       => $item->journalEntry->reference_no,
                'narration' => $item->journalEntry->narration,
                'note'      => $item->note,
                'debit'     => $item->debit,
                'credit'    => $item->credit,
                'balance'   => $balance,
            ];
        });

        return response()->json([
            'account' => $account ?? Account::find($request->account_id),
            'items'   => $report
        ]);
    }

    /**
     * Trial Balance: All accounts with their net debit/credit totals.
     */
    public function trialBalance(Request $request): JsonResponse
    {
        $companyId = $request->company_id;
        
        $accounts = Account::where('company_id', $companyId)
            ->withSum('journalItems as total_debit', 'debit')
            ->withSum('journalItems as total_credit', 'credit')
            ->get();

        $totalDr = $accounts->sum('total_debit');
        $totalCr = $accounts->sum('total_credit');

        return response()->json([
            'accounts' => $accounts,
            'total_dr' => $totalDr,
            'total_cr' => $totalCr,
            'balanced' => abs($totalDr - $totalCr) < 0.01,
        ]);
    }

    /**
     * Profit & Loss Statement (Income Statement).
     */
    public function profitAndLoss(Request $request): JsonResponse
    {
        $companyId = $request->company_id;

        $incomeAccounts = Account::where('company_id', $companyId)
            ->where('type', 'Income')
            ->withSum('journalItems as total_debit', 'debit')
            ->withSum('journalItems as total_credit', 'credit')
            ->get()
            ->map(function($a) {
                $a->balance = $a->total_credit - $a->total_debit;
                return $a;
            });

        $expenseAccounts = Account::where('company_id', $companyId)
            ->where('type', 'Expense')
            ->withSum('journalItems as total_debit', 'debit')
            ->withSum('journalItems as total_credit', 'credit')
            ->get()
            ->map(function($a) {
                $a->balance = $a->total_debit - $a->total_credit;
                return $a;
            });

        $totalIncome  = $incomeAccounts->sum('balance');
        $totalExpense = $expenseAccounts->sum('balance');

        return response()->json([
            'income'        => $incomeAccounts,
            'expenses'      => $expenseAccounts,
            'total_income'  => $totalIncome,
            'total_expense' => $totalExpense,
            'net_profit'    => $totalIncome - $totalExpense,
        ]);
    }

    /**
     * Balance Sheet.
     */
    public function balanceSheet(Request $request): JsonResponse
    {
        $companyId = $request->company_id;

        $assetAccounts = Account::where('company_id', $companyId)
            ->where('type', 'Asset')
            ->withSum('journalItems as total_debit', 'debit')
            ->withSum('journalItems as total_credit', 'credit')
            ->get()
            ->map(function($a) {
                $a->balance = $a->total_debit - $a->total_credit;
                return $a;
            });

        $liabilityAccounts = Account::where('company_id', $companyId)
            ->where('type', 'Liability')
            ->withSum('journalItems as total_debit', 'debit')
            ->withSum('journalItems as total_credit', 'credit')
            ->get()
            ->map(function($a) {
                $a->balance = $a->total_credit - $a->total_debit;
                return $a;
            });

        // Simplified Profit & Loss calculation for BS
        $totalIncome = DB::table('journal_items')
            ->join('accounts', 'journal_items.account_id', '=', 'accounts.id')
            ->where('accounts.company_id', $companyId)
            ->where('accounts.type', 'Income')
            ->sum(DB::raw('credit - debit'));

        $totalExpense = DB::table('journal_items')
            ->join('accounts', 'journal_items.account_id', '=', 'accounts.id')
            ->where('accounts.company_id', $companyId)
            ->where('accounts.type', 'Expense')
            ->sum(DB::raw('debit - credit'));

        $netProfit = $totalIncome - $totalExpense;

        $totalAssets = $assetAccounts->sum('balance');
        $totalLiabilities = $liabilityAccounts->sum('balance');

        return response()->json([
            'assets'            => $assetAccounts,
            'liabilities'       => $liabilityAccounts,
            'total_assets'      => $totalAssets,
            'total_liabilities' => $totalLiabilities,
            'net_profit'        => $netProfit, // Owners equity part
            'total_l_e'         => $totalLiabilities + $netProfit,
        ]);
    }
}
