import { Head } from '@inertiajs/react';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';

import { applyPublicCatalogFilter, PUBLIC_CATEGORIES, PUBLIC_PRODUCTS, getProductWhatsappUrl } from './publicCatalogData';
import {
    BlackCtaSection,
    CatalogSidebar,
    HeroSection,
    MinimalPagination,
    ProductCard,
    PublicFooter,
    PublicFrame,
    PublicHeader,
    RecommendationStrip,
    type SecondaryFilterId,
    SkipLink,
    usePublicCart,
} from './publicStorefront';

function ProductSkeleton() {
    return (
        <article className="overflow-hidden rounded-[1.8rem] bg-white">
            <div className="flex items-center justify-between">
                <div className="h-6 w-24 animate-pulse rounded-full bg-[#ececec]"></div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-[#ececec]"></div>
            </div>
            <div className="mt-4 aspect-[1/0.92] animate-pulse rounded-[1.6rem] bg-[#f3f3f3]"></div>
            <div className="mt-4 h-6 w-2/3 animate-pulse rounded-full bg-[#ececec]"></div>
            <div className="mt-3 h-4 w-24 animate-pulse rounded-full bg-[#ececec]"></div>
            <div className="mt-5 flex items-center justify-between">
                <div className="h-7 w-28 animate-pulse rounded-full bg-[#ececec]"></div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-[#ececec]"></div>
            </div>
            <div className="mt-5 h-12 animate-pulse rounded-full bg-[#ececec]"></div>
        </article>
    );
}

const stockFilters = [
    { id: 'all', label: 'Semua stok' },
    { id: 'ready', label: 'Tersedia' },
    { id: 'empty', label: 'Habis' },
] as const;

type StockFilterId = (typeof stockFilters)[number]['id'];

export default function KatalogPage() {
    const { addToCart, cartItems, clearCart, decreaseCartItem } = usePublicCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStock, setSelectedStock] = useState<StockFilterId>('all');
    const [selectedSecondaryFilter, setSelectedSecondaryFilter] = useState<SecondaryFilterId>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const deferredSearch = useDeferredValue(searchQuery);

    const filteredProducts = PUBLIC_PRODUCTS.filter((product) => {
        const query = deferredSearch.trim().toLowerCase();
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesQuery = query.length === 0
            || product.name.toLowerCase().includes(query)
            || product.sku.toLowerCase().includes(query);
        const matchesStock = selectedStock === 'all'
            || (selectedStock === 'ready' && product.stock > 0)
            || (selectedStock === 'empty' && product.stock === 0);

        return matchesCategory && matchesQuery && matchesStock;
    });
    const visibleProducts = applyPublicCatalogFilter(filteredProducts, selectedSecondaryFilter);

    const isSearching = deferredSearch !== searchQuery;
    const readyCount = PUBLIC_PRODUCTS.filter((product) => product.stock > 0).length;
    const emptyCount = PUBLIC_PRODUCTS.filter((product) => product.stock === 0).length;
    const categoryCounts = {
        All: PUBLIC_PRODUCTS.length,
        Minuman: PUBLIC_PRODUCTS.filter((product) => product.category === 'Minuman').length,
        Makanan: PUBLIC_PRODUCTS.filter((product) => product.category === 'Makanan').length,
    };
    const recommendationProducts = PUBLIC_PRODUCTS.filter((product) => product.id !== visibleProducts[0]?.id).slice(0, 4);
    const totalPages = Math.max(1, Math.ceil(visibleProducts.length / 6));
    const paginatedProducts = visibleProducts.slice((currentPage - 1) * 6, currentPage * 6);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <>
            <Head title="Katalog publik">
                <meta
                    name="description"
                    content="Katalog produk publik PayTo untuk guest users, lengkap dengan foto, harga, ketersediaan stok, pencarian, dan filter kategori."
                />
            </Head>

            <PublicFrame>
                <SkipLink />
                <PublicHeader
                    activeHref="/?section=shop"
                    cartItems={cartItems}
                    onIncreaseCartItem={addToCart}
                    onDecreaseCartItem={decreaseCartItem}
                    onClearCart={clearCart}
                />
                <main id="main-content">
                    <HeroSection
                        eyebrow="Give all you need"
                        heading="Browse the complete public catalog."
                        searchValue={searchQuery}
                        onSearchChange={(event) => {
                            const nextValue = event.target.value;
                            startTransition(() => {
                                setSearchQuery(nextValue);
                            });
                        }}
                    />

                    <section className="px-4 py-10 sm:px-6 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[0.27fr_0.73fr]">
                            <div className="space-y-6">
                                <CatalogSidebar
                                    categories={PUBLIC_CATEGORIES}
                                    selectedCategory={selectedCategory}
                                    counts={categoryCounts}
                                    selectedSecondaryFilter={selectedSecondaryFilter}
                                    onSelectCategory={(categoryId) => {
                                        startTransition(() => {
                                            setSelectedCategory(categoryId);
                                            setCurrentPage(1);
                                        });
                                    }}
                                    onSelectSecondaryFilter={(filterId) => {
                                        startTransition(() => {
                                            setSelectedSecondaryFilter(filterId);
                                            setCurrentPage(1);
                                        });
                                    }}
                                />

                                <div className="rounded-[1.7rem] bg-[#fafafa] p-5">
                                    <p className="text-sm font-semibold text-[#111111]">Stock filter</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {stockFilters.map((filter) => (
                                            <button
                                                type="button"
                                                key={filter.id}
                                                onClick={() => {
                                                    startTransition(() => {
                                                        setSelectedStock(filter.id);
                                                        setCurrentPage(1);
                                                    });
                                                }}
                                                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                                                    selectedStock === filter.id
                                                        ? 'bg-[#111111] text-white'
                                                        : 'border border-[#111111]/10 bg-white text-[#6f6f6f] hover:border-[#111111]/25 hover:text-[#111111]'
                                                }`}
                                            >
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#111111]/8 pt-5 text-center">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-[#9b9b9b]">All</p>
                                            <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#111111]">{PUBLIC_PRODUCTS.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-[#9b9b9b]">Ready</p>
                                            <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#111111]">{readyCount}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-[#9b9b9b]">Empty</p>
                                            <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#111111]">{emptyCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                {isSearching ? (
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9 xl:grid-cols-3">
                                            {[0, 1, 2, 3, 4, 5].map((item) => (
                                                <ProductSkeleton key={item} />
                                            ))}
                                        </div>
                                    ) : visibleProducts.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9 xl:grid-cols-3">
                                            {paginatedProducts.map((product, index) => {
                                                return (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        index={index}
                                                        detailHref={`/katalog/${product.id}`}
                                                        onAddToCart={() => addToCart(product.id)}
                                                        primaryHref={getProductWhatsappUrl(product.name)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-[1.8rem] border border-dashed border-[#111111]/12 bg-[#fafafa] px-6 py-10">
                                            <div className="max-w-xl">
                                                <p className="text-sm font-semibold text-[#6f6f6f]">Tidak ada hasil</p>
                                                <h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#111111]">
                                                    Produk tidak ditemukan untuk kombinasi filter ini.
                                                </h3>
                                                <p className="mt-3 text-sm leading-7 text-[#6f6f6f]">
                                                    Coba ubah kata pencarian, pilih kategori lain, atau kembalikan filter stok ke
                                                    semua agar etalase publik kembali terisi.
                                                </p>
                                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            startTransition(() => {
                                                                setSearchQuery('');
                                                                setSelectedCategory('All');
                                                                setSelectedStock('all');
                                                            });
                                                        }}
                                                        className="inline-flex items-center justify-center rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-black"
                                                    >
                                                        Reset filter
                                                    </button>
                                                    <a
                                                        href={getProductWhatsappUrl('produk PayTo')}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#111111]/12 bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition duration-200 hover:-translate-y-px hover:border-[#111111]/25"
                                                    >
                                                        Tanya via WhatsApp
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                <MinimalPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                </div>
                            </div>
                    </section>
                    <RecommendationStrip products={recommendationProducts} onAddToCart={addToCart} />
                    <BlackCtaSection />
                    <PublicFooter />
                </main>
            </PublicFrame>
        </>
    );
}
