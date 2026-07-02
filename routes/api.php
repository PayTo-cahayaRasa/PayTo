<?php

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminProfileController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\BusinessSettingsController;
use App\Http\Controllers\Api\InventoryRecommendationController;
use App\Http\Controllers\Api\PosApiController;
use App\Http\Controllers\Api\PosCheckoutController;
use App\Http\Controllers\Api\PosRefundController;
use App\Http\Controllers\Api\PosSettingsController;
use App\Http\Controllers\Api\ProductQueryController;
use App\Http\Controllers\Api\ReceiptSettingsController;
use App\Http\Controllers\Api\StaffManagementController;
use Illuminate\Support\Facades\Route;

// Admin API endpoints - Supervisor only
Route::middleware(['web', 'auth', 'role:SUPERVISOR'])->prefix('admin')->name('api.admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [AdminProfileController::class, 'show'])->name('profile');

    // Product management
    Route::get('/products', [ProductQueryController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductQueryController::class, 'store'])->name('products.store');
    Route::get('/products/{product}', [ProductQueryController::class, 'show'])->name('products.show');
    Route::put('/products/{product}', [ProductQueryController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductQueryController::class, 'destroy'])->name('products.destroy');
    Route::get('/products/{product}/history', [ProductQueryController::class, 'history'])->name('products.history');

    // Inventory recommendations
    Route::get('/inventory/recommendations', [InventoryRecommendationController::class, 'index'])->name('inventory.recommendations');

    // Receipt settings
    Route::get('/receipt-settings', [ReceiptSettingsController::class, 'index'])->name('receipt-settings.index');
    Route::put('/receipt-settings', [ReceiptSettingsController::class, 'update'])->name('receipt-settings.update');

    // Business settings
    Route::get('/business-settings', [BusinessSettingsController::class, 'index'])->name('business-settings.index');
    Route::put('/business-settings', [BusinessSettingsController::class, 'update'])->name('business-settings.update');

    // Approvals
    Route::get('/approvals', [ApprovalController::class, 'index'])->name('approvals.index');
    Route::get('/approvals/pending', [ApprovalController::class, 'pending'])->name('approvals.pending');
    Route::post('/approvals/{approval}/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('/approvals/{approval}/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');

    // Staff management
    Route::get('/staff', [StaffManagementController::class, 'index'])->name('staff.index');
    Route::post('/staff', [StaffManagementController::class, 'store'])->name('staff.store');
    Route::get('/staff/{user}', [StaffManagementController::class, 'show'])->name('staff.show');
    Route::put('/staff/{user}', [StaffManagementController::class, 'update'])->middleware('throttle:sensitive-action')->name('staff.update');
    Route::delete('/staff/{user}', [StaffManagementController::class, 'destroy'])->middleware('throttle:sensitive-action')->name('staff.destroy');
    Route::post('/staff/{user}/reset-pin', [StaffManagementController::class, 'resetPin'])->middleware('throttle:sensitive-action')->name('staff.reset-pin');
});

// POS API endpoints - Cashier and Supervisor
Route::middleware(['web', 'auth', 'role:CASHIER,SUPERVISOR'])->prefix('pos')->name('api.pos.')->group(function () {
    Route::get('/products', [PosApiController::class, 'products'])->name('products');
    Route::get('/history', [PosApiController::class, 'history'])->name('history');
    Route::get('/profile', [PosApiController::class, 'profile'])->name('profile');
    Route::post('/checkout', [PosCheckoutController::class, 'store'])->middleware('throttle:checkout')->name('checkout');
    Route::post('/refunds', [PosRefundController::class, 'store'])->middleware('throttle:refund')->name('refunds');
    // Settings
    Route::get('/settings', [PosSettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/printer', [PosSettingsController::class, 'updatePrinter'])->name('settings.printer');
    Route::post('/settings/printer/test', [PosSettingsController::class, 'testPrinter'])->name('settings.printer.test');
});
