<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\Settings\AppSettingsService;
use App\Services\WhatsAppLinkBuilder;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function __construct(
        private readonly AppSettingsService $settings,
        private readonly WhatsAppLinkBuilder $whatsAppLinks,
    ) {}

    public function index(): Response
    {
        $profile = $this->settings->getBusinessProfile();
        $catalog = $this->settings->getCatalogSettings();
        $products = $catalog['enabled']
            ? $this->publicProductQuery()
                ->paginate(8)
                ->through(fn (Product $product): array => $this->mapProduct($product))
            : null;

        return Inertia::render('storefront/LandingPage', [
            'business' => $profile,
            'catalog' => $catalog,
            'products' => $products,
        ]);
    }

    public function catalog(Request $request): Response
    {
        $profile = $this->settings->getBusinessProfile();
        $catalog = $this->settings->getCatalogSettings();
        $search = trim((string) $request->query('q', ''));

        $products = $catalog['enabled']
            ? $this->publicProductQuery()
                ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                ->paginate(8)
                ->withQueryString()
                ->through(fn (Product $product): array => $this->mapProduct($product))
            : null;

        return Inertia::render('storefront/LandingPage', [
            'business' => $profile,
            'catalog' => $catalog,
            'products' => $products,
            'search' => $search,
        ]);
    }

    private function publicProductQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return Product::query()
            ->with('stockItem')
            ->where('is_active', true)
            ->orderByDesc('featured')
            ->orderBy('name');
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProduct(Product $product): array
    {
        $price = (float) $product->price;
        $discount = (float) ($product->discount ?? 0);
        $finalPrice = max(0, $price - (($price * $discount) / 100));
        /** @var FilesystemAdapter $publicDisk */
        $publicDisk = Storage::disk('public');

        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'sku' => $product->sku,
            'price' => $price,
            'finalPrice' => $finalPrice,
            'discount' => $discount,
            'category' => $product->category,
            'description' => $product->description,
            'stock' => (float) ($product->stockItem?->on_hand ?? 0),
            'imageUrl' => $product->image_path ? $publicDisk->url($product->image_path) : null,
            'whatsappUrl' => $this->whatsAppLinks->buildProductLink($product),
        ];
    }
}
