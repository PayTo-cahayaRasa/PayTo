<?php

use App\Http\Controllers\Auth\PosLoginController;
use App\Http\Controllers\Auth\PosLogoutController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Pos\ReceiptController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

// Public storefront routes
Route::get('/', [StorefrontController::class, 'index'])->name('landing');
Route::get('/katalog', [StorefrontController::class, 'catalog'])->name('catalog.index');
Route::get('/katalog/{slug}', [StorefrontController::class, 'show'])->name('catalog.show');

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

// Receipt route - Cashier and Supervisor
Route::get('/pos/sales/{sale}/receipt', [ReceiptController::class, 'show'])
    ->middleware(['auth', 'role:CASHIER,SUPERVISOR'])
    ->name('pos.receipt');

// Protected Admin route - Supervisor only
Route::get('/admin', function () {
    return inertia('admin');
})->middleware(['auth', 'role:SUPERVISOR'])->name('admin.index');
