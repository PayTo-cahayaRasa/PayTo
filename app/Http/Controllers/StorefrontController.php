<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('landingPage');
    }

    public function catalog(): Response
    {
        return Inertia::render('catalog');
    }

    public function show(string $slug): Response
    {
        return Inertia::render('productDetail', [
            'slug' => $slug,
        ]);
    }
}
