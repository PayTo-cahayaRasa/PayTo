<?php

use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\PosLoginController;
use App\Http\Controllers\Auth\PosLogoutController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Pos\ReceiptController;
use App\Http\Controllers\StorefrontCheckoutController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

// Public storefront routes
Route::get('/', [StorefrontController::class, 'index'])->name('landing');
Route::get('/katalog', [StorefrontController::class, 'catalog'])->name('catalog.index');
Route::get('/checkout', [StorefrontCheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [StorefrontCheckoutController::class, 'store'])->middleware('throttle:checkout')->name('checkout.store');
Route::get('/checkout/sukses/{orderNumber}', [StorefrontCheckoutController::class, 'success'])->name('checkout.success');
Route::get('/lacak-pesanan', [StorefrontCheckoutController::class, 'trackingLookup'])->name('orders.lookup');
Route::post('/lacak-pesanan', [StorefrontCheckoutController::class, 'findTracking'])->middleware('throttle:checkout')->name('orders.find');
Route::get('/pesanan/{orderNumber}', [StorefrontCheckoutController::class, 'track'])->name('orders.track');

Route::get('/login', function (): \Inertia\Response|RedirectResponse {
    $user = request()->user();

    if ($user) {
        return redirect()->route($user->role === 'SUPERVISOR' ? 'admin.index' : 'pos.index');
    }

    return inertia('login');
})->name('login');

Route::post('/login', [PosLoginController::class, 'store'])
    ->middleware(['guest', 'throttle:login'])
    ->name('login.store');

Route::get('/lupa-password', [PasswordResetController::class, 'requestPage'])->middleware('guest')->name('password.request');
Route::post('/lupa-password', [PasswordResetController::class, 'send'])->middleware(['guest', 'throttle:login'])->name('password.email');
Route::get('/reset-password/{token}', [PasswordResetController::class, 'resetPage'])->middleware('guest')->name('password.reset');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('guest')->name('password.update');
Route::get('/lupa-pin', [PasswordResetController::class, 'pinRequestPage'])->middleware('guest')->name('pin.request');
Route::post('/lupa-pin', [PasswordResetController::class, 'sendPin'])->middleware(['guest', 'throttle:login'])->name('pin.email');
Route::get('/reset-pin/{token}', [PasswordResetController::class, 'resetPinPage'])->middleware('guest')->name('pin.reset');
Route::post('/reset-pin', [PasswordResetController::class, 'resetPin'])->middleware('guest')->name('pin.update');

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
Route::get('/pos/sales/{sale}/receipt/download', [ReceiptController::class, 'download'])
    ->middleware(['auth', 'role:CASHIER,SUPERVISOR'])
    ->name('pos.receipt.download');

// Protected Admin route - Supervisor only
Route::get('/admin', function () {
    return inertia('admin');
})->middleware(['auth', 'role:SUPERVISOR'])->name('admin.index');
