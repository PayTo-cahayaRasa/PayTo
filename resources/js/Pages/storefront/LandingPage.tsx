import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type { PublicCatalogProduct } from './data/publicCatalogData';
import type { BusinessProfile } from './types';
import {
    BlackCtaSection,
    CatalogSidebar,
    HeroSection,
    MinimalPagination,
    ProductCard,
    PublicFooter,
    PublicFrame,
    PublicHeader,
    SkipLink,
    storefrontShopSectionId,
    usePublicCart,
} from '.';

type CatalogSettings = {
    enabled: boolean;
    whatsapp_enabled: boolean;
};

type PaginatedProducts = {
    data: PublicCatalogProduct[];
    current_page: number;
    last_page: number;
};

type LandingPageProps = {
    business: BusinessProfile;
    catalog: CatalogSettings;
    featuredProducts?: PublicCatalogProduct[];
    products?: PaginatedProducts | null;
    search?: string;
};

export default function LandingPage({ business, catalog, featuredProducts = [], products = null, search = '' }: LandingPageProps) {
    const visibleProducts = products?.data ?? featuredProducts;
    const { addToCart, cartItems, clearCart, decreaseCartItem } = usePublicCart(visibleProducts);
    const [searchQuery, setSearchQuery] = useState(search);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const isCatalogPage = products !== null;
    const categories = [
        { id: 'All', label: 'Semua Produk' },
        ...Array.from(new Set(visibleProducts.map((product) => product.category).filter(Boolean))).map((category) => ({
            id: category as string,
            label: category as string,
        })),
    ];
    const filteredProducts = selectedCategory === 'All'
        ? visibleProducts
        : visibleProducts.filter((product) => product.category === selectedCategory);

    function submitSearch(event: FormEvent): void {
        event.preventDefault();
        router.get(
            '/katalog',
            { q: searchQuery.trim() || undefined },
            {
                only: ['products', 'search'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    }

    return (
        <>
            <Head title={business.name}>
                <meta name="description" content={`${business.name} - katalog produk dan pemesanan via WhatsApp.`} />
            </Head>

            <PublicFrame>
                <SkipLink />
                <PublicHeader
                    business={business}
                    cartItems={cartItems}
                    onIncreaseCartItem={addToCart}
                    onDecreaseCartItem={decreaseCartItem}
                    onClearCart={clearCart}
                />

                <main id="main-content">
                    <HeroSection business={business} />

                    <section id={storefrontShopSectionId} className="relative z-20 -mt-36 px-4 pb-3 sm:-mt-44 sm:px-5 lg:-mt-54 lg:px-8">
                        <div className="mx-auto max-w-462 rounded-t-[2.25rem] border border-b-0 border-[#f1e6d7] bg-[#fffdf9]/98 px-4 py-6 shadow-[0_-18px_46px_-38px_rgba(58,33,23,0.32)] backdrop-blur-sm sm:px-7 sm:py-9 lg:px-9">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="font-display text-[2.35rem] font-semibold leading-none tracking-[-0.05em] text-[#3a2117] sm:text-[3rem]">
                                        Shop Produk
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-[#7a5d47]">Pilih camilan favorit Anda, langsung dari {business.name}.</p>
                                </div>
                                <form onSubmit={submitSearch} className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                                    <label className="flex min-h-12 items-center gap-3 rounded-full border border-[#eadfcf] bg-white px-4">
                                        <Search size={17} strokeWidth={1.8} className="text-[#8d6b4e]" />
                                        <input
                                            id="catalog-search"
                                            value={searchQuery}
                                            onChange={(event) => setSearchQuery(event.target.value)}
                                            placeholder="Cari produk"
                                            className="w-full bg-transparent text-sm text-[#3a2117] outline-none placeholder:text-[#b69877]"
                                        />
                                    </label>
                                    <button className="min-h-12 rounded-full bg-[#3a2117] px-5 text-sm font-semibold text-white" type="submit">Cari</button>
                                </form>
                            </div>

                            {!catalog.enabled ? (
                                <div className="mt-7 rounded-3xl border border-dashed border-[#eadfcf] bg-white px-5 py-8 text-center text-[#7a5d47]">
                                    Katalog sedang dinonaktifkan.
                                </div>
                            ) : visibleProducts.length === 0 ? (
                                <div className="mt-7 rounded-3xl border border-dashed border-[#eadfcf] bg-white px-5 py-8 text-center text-[#7a5d47]">
                                    Belum ada produk toko yang tersedia.
                                </div>
                            ) : (
                                <>
                                    <div className="mt-7 grid gap-5 lg:grid-cols-[16rem_1fr]">
                                        <CatalogSidebar categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                            {filteredProducts.map((product) => {
                                                const quantity = cartItems.find((item) => item.product.id === product.id)?.quantity ?? 0;

                                                return (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        quantity={quantity}
                                                        onAddToCart={() => addToCart(product.id)}
                                                        onDecreaseCartItem={() => decreaseCartItem(product.id)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {products && (
                                        <MinimalPagination
                                            currentPage={products.current_page}
                                            totalPages={products.last_page}
                                            onPageChange={(page) => router.get(
                                                '/katalog',
                                                { q: searchQuery.trim() || undefined, page },
                                                {
                                                    only: ['products', 'search'],
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                },
                                            )}
                                        />
                                    )}

                                    {!isCatalogPage && (
                                        <div className="mt-7 text-center">
                                            <Link href="/katalog" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f5941d] px-6 text-sm font-semibold text-white">
                                                Lihat Semua Produk
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    <BlackCtaSection business={business} />
                    <PublicFooter business={business} />
                </main>
            </PublicFrame>
        </>
    );
}
