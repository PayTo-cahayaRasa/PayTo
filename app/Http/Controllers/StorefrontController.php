<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('landingPage');
    }

    public function catalog(): RedirectResponse
    {
        return redirect('/#shop-products');
    }

    public function show(int $product): Response
    {
        return Inertia::render('katalogDetailPage', [
            'productId' => $product,
        ]);
    }
}
