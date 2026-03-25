<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Account;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Currency;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Setup Company & Branch
            $company = Company::create(['name' => 'Royal Diamond Exports', 'slug' => 'royal-diamond', 'address' => 'Opera House, Mumbai']);
            $branch = Branch::create(['company_id' => $company->id, 'name' => 'Mumbai Head Office', 'slug' => 'mumbai-ho', 'address' => 'South Mumbai']);
            
            // 2. Currencies
            $usd = Currency::updateOrCreate(['code' => 'USD'], ['name' => 'US Dollar', 'exchange_rate' => 1.0, 'is_base' => true]);
            $aed = Currency::updateOrCreate(['code' => 'AED'], ['name' => 'Dirham', 'exchange_rate' => 3.67, 'is_base' => false]);

            // 3. Chart of Accounts
            $cash = Account::create(['company_id' => $company->id, 'code' => '1001', 'name' => 'Petty Cash', 'type' => 'Asset']);
            $bank = Account::create(['company_id' => $company->id, 'code' => '1002', 'name' => 'Chase Bank', 'type' => 'Asset']);
            $stockAcc = Account::create(['company_id' => $company->id, 'code' => '1003', 'name' => 'Diamond Inventory', 'type' => 'Asset']);
            $ap = Account::create(['company_id' => $company->id, 'code' => '2001', 'name' => 'Accounts Payable', 'type' => 'Liability']);
            $ar = Account::create(['company_id' => $company->id, 'code' => '1101', 'name' => 'Accounts Receivable', 'type' => 'Asset']);
            $salesAcc = Account::create(['company_id' => $company->id, 'code' => '4001', 'name' => 'Diamond Sales', 'type' => 'Income']);
            $purchasesAcc = Account::create(['company_id' => $company->id, 'code' => '5001', 'name' => 'Diamond Purchases', 'type' => 'Expense']);

            // 4. Entities
            $supplier = Supplier::create([
                'company_id' => $company->id, 'name' => 'Global Gems LLC', 'email' => 'sales@globalgems.com', 'account_id' => $ap->id
            ]);
            $customer = Customer::create([
                'company_id' => $company->id, 'name' => 'Paris Jewelry Boutique', 'email' => 'order@parisjewelry.fr', 'account_id' => $ar->id
            ]);

            // 5. Initial Stock Purchase (100 carats)
            $purchase = Purchase::create([
                'company_id' => $company->id, 'branch_id' => $branch->id, 'supplier_id' => $supplier->id,
                'purchase_date' => now()->subDays(10), 'purchase_no' => 'PUR-501', 'total_amount' => 50000,
                'currency_id' => $usd->id, 'exchange_rate' => 1.0
            ]);

            $pItem = PurchaseItem::create([
                'purchase_id' => $purchase->id, 'item_name' => 'VVS White Stones Lot', 'carat' => 100, 'remaining_carat' => 100, 'rate' => 500, 'subtotal' => 50000
            ]);

            $stock = Stock::create([
                'company_id' => $company->id, 'branch_id' => $branch->id, 'purchase_item_id' => $pItem->id,
                'lot_name' => 'LOT-VVS-01', 'original_carat' => 100, 'remaining_carat' => 100, 'cost_rate' => 500
            ]);

            StockMovement::create([
                'stock_id' => $stock->id, 'type' => 'IN', 'carat' => 100, 'reference_type' => 'PURCHASE', 'reference_id' => $purchase->id, 'notes' => 'Initial bulk lot'
            ]);

            // Simple Journal for Purchase: DR Stock CR Supplier
            $je = JournalEntry::create([
                'company_id' => $company->id, 'branch_id' => $branch->id, 'reference_no' => 'JV-PUR-501', 'entry_date' => now()->subDays(10), 'narration' => 'Purchase of stones'
            ]);
            JournalItem::create(['journal_entry_id' => $je->id, 'account_id' => $stockAcc->id, 'debit' => 50000, 'credit' => 0]);
            JournalItem::create(['journal_entry_id' => $je->id, 'account_id' => $ap->id, 'debit' => 0, 'credit' => 50000]);
            $purchase->update(['journal_entry_id' => $je->id]);

            // 6. A Sale (10 carats sold)
            $sale = Sale::create([
                'company_id' => $company->id, 'branch_id' => $branch->id, 'customer_id' => $customer->id,
                'sale_date' => now()->subDays(5), 'sale_no' => 'INV-1001', 'total_amount' => 12000, 'total_cost' => 5000, 'profit' => 7000,
                'currency_id' => $usd->id, 'exchange_rate' => 1.0
            ]);

            SaleItem::create([
                'sale_id' => $sale->id, 'purchase_item_id' => $pItem->id, 'carat' => 10, 'sale_rate' => 1200, 'cost_rate' => 500, 'subtotal' => 12000, 'item_profit' => 7000
            ]);

            $stock->decrement('remaining_carat', 10);
            $pItem->decrement('remaining_carat', 10);
            StockMovement::create([
                'stock_id' => $stock->id, 'type' => 'OUT', 'carat' => -10, 'reference_type' => 'SALE', 'reference_id' => $sale->id, 'notes' => 'Sale to Paris Boutique'
            ]);

            // Journal for Sale: DR Customer CR Sales
            $sje = JournalEntry::create([
                'company_id' => $company->id, 'branch_id' => $branch->id, 'reference_no' => 'JV-INV-1001', 'entry_date' => now()->subDays(5), 'narration' => 'Sales invoice'
            ]);
            JournalItem::create(['journal_entry_id' => $sje->id, 'account_id' => $ar->id, 'debit' => 12000, 'credit' => 0]);
            JournalItem::create(['journal_entry_id' => $sje->id, 'account_id' => $salesAcc->id, 'debit' => 0, 'credit' => 12000]);
            $sale->update(['journal_entry_id' => $sje->id]);

            // 7. A Receipt (Payment from customer)
            $paymentFromCust = Payment::create([
                'company_id' => $company->id, 'branch_id' => $branch->id, 'type' => 'RECEIPT', 'account_id' => $bank->id,
                'entity_account_id' => $ar->id, 'amount' => 5000, 'payment_date' => now()->subDays(2), 'reference_no' => 'REC-202', 'notes' => 'Partial payment for INV-1001'
            ]);

            $pje = JournalEntry::create([
                'company_id' => $company->id, 'branch_id' => $branch->id, 'reference_no' => 'JV-REC-202', 'entry_date' => now()->subDays(2), 'narration' => 'Cash receipt from customer'
            ]);
            JournalItem::create(['journal_entry_id' => $pje->id, 'account_id' => $bank->id, 'debit' => 5000, 'credit' => 0]);
            JournalItem::create(['journal_entry_id' => $pje->id, 'account_id' => $ar->id, 'debit' => 0, 'credit' => 5000]);

            $paymentFromCust->update(['journal_entry_id' => $pje->id]);
        });
    }
}
