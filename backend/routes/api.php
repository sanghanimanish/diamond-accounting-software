<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CurrencyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned the "api" middleware group. Make something great!
|
*/

// ── Public Auth Routes ──────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('api.auth.register');
    Route::post('/login',    [AuthController::class, 'login'])->name('api.auth.login');
});

// ── Protected Routes (Sanctum token required) ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::get('/me',     [AuthController::class, 'me'])->name('api.auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
    });

    // ── User Management (Admin only) ───────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/users',           [UserController::class, 'index'])->name('api.users.index');
        Route::get('/users/{user}',    [UserController::class, 'show'])->name('api.users.show');
        Route::patch('/users/{user}',  [UserController::class, 'update'])->name('api.users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('api.users.destroy');
        Route::get('/roles',           [UserController::class, 'getRoles'])->name('api.roles.index');

        // ── Company & Branch Management ─────────────────────────────
        Route::apiResource('companies', CompanyController::class);
        Route::apiResource('branches', BranchController::class);

        // ── Chart of Accounts ───────────────────────────────────────
        Route::apiResource('accounts', AccountController::class);

        // ── Journal Entries ─────────────────────────────────────────
        Route::apiResource('journal-entries', JournalController::class);

        // ── Purchase Module ─────────────────────────────────────────
        Route::apiResource('suppliers', SupplierController::class);
        Route::apiResource('purchases', PurchaseController::class);

        // ── Sales Module ────────────────────────────────────────────
        Route::get('/sales/available-stock', [SaleController::class, 'getAvailableStock'])->name('api.sales.stock');
        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('sales', SaleController::class);

        // ── Stock Management ────────────────────────────────────────
        Route::get('/stocks',            [StockController::class, 'index'])->name('api.stocks.index');
        Route::get('/stocks/movements',  [StockController::class, 'movementHistory'])->name('api.stocks.movements');
        Route::post('/stocks/email',     [StockController::class, 'emailReport'])->name('api.stocks.email');
        Route::get('/stocks/{stock}',    [StockController::class, 'show'])->name('api.stocks.show');
        Route::apiResource('currencies', CurrencyController::class);
        Route::post('/stocks/{stock}/adjust', [StockController::class, 'adjust'])->name('api.stocks.adjust');

        // ── Payments & Receipts ─────────────────────────────────────
        Route::apiResource('payments', PaymentController::class);

        // ── Financial Reports ───────────────────────────────────────
        Route::get('/reports/ledger',         [ReportController::class, 'ledger'])->name('api.reports.ledger');
        Route::get('/reports/trial-balance',  [ReportController::class, 'trialBalance'])->name('api.reports.trial-balance');
        Route::get('/reports/profit-loss',    [ReportController::class, 'profitAndLoss'])->name('api.reports.profit-loss');
        Route::get('/reports/balance-sheet',  [ReportController::class, 'balanceSheet'])->name('api.reports.balance-sheet');
    });

    // ── Add your resource routes here ────────────────────────────────────
    // Example:
    // Route::apiResource('posts', PostController::class);
    // Route::apiResource('products', ProductController::class);
});
