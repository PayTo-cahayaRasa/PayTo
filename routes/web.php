<?php

use App\Http\Controllers\Auth\PosLoginController;
use App\Http\Controllers\Auth\PosLogoutController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Pos\ReceiptController;
use App\Http\Controllers\StorefrontCheckoutController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

// Public storefront routes
Route::get('/', [StorefrontController::class, 'index'])->name('landing');
Route::get('/katalog', [StorefrontController::class, 'catalog'])->name('catalog.index');
Route::get('/katalog/{product:slug}', [StorefrontController::class, 'show'])->name('catalog.show');
Route::get('/checkout', [StorefrontCheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [StorefrontCheckoutController::class, 'store'])->middleware('throttle:checkout')->name('checkout.store');
Route::get('/checkout/sukses/{orderNumber}', [StorefrontCheckoutController::class, 'success'])->name('checkout.success');
Route::get('/lacak-pesanan', [StorefrontCheckoutController::class, 'trackingLookup'])->name('orders.lookup');
Route::post('/lacak-pesanan', [StorefrontCheckoutController::class, 'findTracking'])->middleware('throttle:checkout')->name('orders.find');
Route::get('/pesanan/{orderNumber}', [StorefrontCheckoutController::class, 'track'])->name('orders.track');

Route::get('/login', function () {
    return inertia('login');
})->middleware('guest')->name('login');

Route::post('/login', [PosLoginController::class, 'store'])
    ->middleware(['guest', 'throttle:login'])
    ->name('login.store');

Route::post('/logout', [PosLogoutController::class, 'store'])
    ->middleware('auth')
    ->name('logout');

// Protected POS route - Cashier and Supervisor
Route::get('/kasir', [PosController::class, 'index'])
    ->middleware(['auth', 'role:CASHIER,SUPERVISOR'])
    ->name('pos.index');

Route::get('/pesanan-online', fn () => inertia('online-orders/OnlineOrdersPage', ['role' => request()->user()->role]))
    ->middleware(['auth', 'role:CASHIER,SUPERVISOR'])
    ->name('online-orders.index');

// Receipt route - Cashier and Supervisor
Route::get('/pos/sales/{sale}/receipt', [ReceiptController::class, 'show'])
    ->middleware(['auth', 'role:CASHIER,SUPERVISOR'])
    ->name('pos.receipt');

// Protected Admin route - Supervisor only
Route::get('/admin', function () {
    return inertia('admin');
})->middleware(['auth', 'role:SUPERVISOR'])->name('admin.index');
