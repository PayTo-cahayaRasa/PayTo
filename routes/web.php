<?php

use App\Http\Controllers\Auth\PosLoginController;
use App\Http\Controllers\Pos\PosController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', function () {
    return inertia('landingPage');
})->name('landing');

Route::get('/login', function () {
    return inertia('login');
})->middleware('guest')->name('login');

Route::post('/login', [PosLoginController::class, 'store'])
    ->middleware(['guest', 'throttle:login'])
    ->name('login.store');

// Protected POS route - Cashier and Supervisor
Route::get('/kasir', [PosController::class, 'index'])
    ->middleware(['auth', 'role:CASHIER,SUPERVISOR'])
    ->name('pos.index');

// Protected Admin route - Supervisor only
Route::get('/admin', function () {
    return inertia('admin');
})->middleware(['auth', 'role:SUPERVISOR'])->name('admin.index');
