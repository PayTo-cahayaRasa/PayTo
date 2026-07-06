import { Head, Link } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, Search } from 'lucide-react';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';

import { applyPublicCatalogFilter, PUBLIC_CATEGORIES, PUBLIC_PRODUCTS, sortPublicCatalogProducts } from './publicCatalogData';
import {
    CatalogSidebar,
    MinimalPagination,
    ProductCard,
    PublicFooter,
    PublicFrame,
    PublicHeader,
    SkipLink,
    usePublicCart,
} from './publicStorefront';

export default function KatalogPage() {
    const { addToCart, cartItems, clearCart, decreaseCartItem } = usePublicCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState<'popular' | 'name-asc' | 'price-asc' | 'price-desc'>('popular');
    const [currentPage, setCurrentPage] = useState(1);
    const deferredSearch = useDeferredValue(searchQuery);

    const filteredProducts = sortPublicCatalogProducts(
        applyPublicCatalogFilter(
            PUBLIC_PRODUCTS.filter((product) => {
                const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
                const query = deferredSearch.trim().toLowerCase();
                const matchesQuery =
                    query.length === 0
                    || product.name.toLowerCase().includes(query)
                    || product.category.toLowerCase().includes(query)
                    || product.sku.toLowerCase().includes(query);

                return matchesCategory && matchesQuery;
            }),
            null,
        ),
        sortBy,
    );
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / 8));
    const visibleProducts = filteredProducts.slice((currentPage - 1) * 8, currentPage * 8);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const searchParams = new URLSearchParams(window.location.search);

        if (searchParams.get('focus') !== 'search') {
            return;
        }

        window.requestAnimationFrame(() => {
            const searchInput = document.getElementById('catalog-search') as HTMLInputElement | null;

            if (!searchInput) {
                return;
            }

            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchInput.focus();
            searchInput.select();
        });
    }, []);

    return (
        <>
            <Head title="Shop PayTo">
                <meta
                    name="description"
                    content="Halaman shop PayTo dengan visual storefront hangat, sidebar kategori, grid produk 4 kolom, dan checkout via WhatsApp."
                />
            </Head>

            <PublicFrame>
                <SkipLink />
                <PublicHeader
                    cartItems={cartItems}
                    onIncreaseCartItem={addToCart}
                    onDecreaseCartItem={decreaseCartItem}
                    onClearCart={clearCart}
                />

                <main id="main-content" className="pt-5">
                    <section className="px-4 py-3 sm:px-5 lg:px-8">
                        <div className="mx-auto max-w-[1848px] rounded-[2rem] border border-[#f1e6d7] bg-[#fffdf9] px-4 py-5 shadow-[0_24px_48px_-36px_rgba(58,33,23,0.18)] sm:px-7 sm:py-8 lg:px-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <Link
                                        href="/"
                                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#eadfcf] bg-white px-4 text-sm font-semibold text-[#3a2117] transition duration-300 hover:-translate-y-px hover:bg-[#fff8ed]"
                                    >
                                        <ChevronLeft size={16} strokeWidth={1.9} />
                                        Kembali ke Homepage
                                    </Link>
                                    <h1 className="font-display text-[2.35rem] font-semibold leading-none tracking-[-0.05em] text-[#3a2117] sm:text-[3rem]">
                                        Shop Produk
                                    </h1>
                                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#725442]">
                                        Jelajahi semua produk PayTo dengan tampilan baru yang mengikuti referensi visual, sambil tetap memakai data asli nama, harga, dan kategori.
                                    </p>
                                </div>
                                <div className="flex w-full flex-col gap-3 lg:w-auto sm:flex-row sm:flex-wrap">
                                    <label className="flex min-h-12 items-center gap-3 rounded-full border border-[#eadfcf] bg-white px-4">
                                        <Search size={17} strokeWidth={1.8} className="text-[#8d6b4e]" />
                                        <input
                                            id="catalog-search"
                                            value={searchQuery}
                                            onChange={(event) => {
                                                const nextValue = event.target.value;
                                                startTransition(() => {
                                                    setSearchQuery(nextValue);
                                                    setCurrentPage(1);
                                                });
                                            }}
                                            placeholder="Cari menu PayTo"
                                            className="w-full bg-transparent text-sm text-[#3a2117] outline-none placeholder:text-[#b69877]"
                                        />
                                    </label>
                                    <label className="flex w-full flex-col items-start gap-2 text-sm font-medium text-[#725442] sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                                        <span className="text-[#3a2117]">Urutkan:</span>
                                        <div className="relative">
                                            <select
                                                value={sortBy}
                                                onChange={(event) => {
                                                    const nextSort = event.target.value as typeof sortBy;
                                                    startTransition(() => {
                                                        setSortBy(nextSort);
                                                        setCurrentPage(1);
                                                    });
                                                }}
                                                className="min-h-12 w-full appearance-none rounded-full border border-[#eadfcf] bg-white px-5 pr-10 text-sm font-medium text-[#5f5044] outline-none sm:w-auto sm:min-w-[12rem]"
                                            >
                                                <option value="popular">Terpopuler</option>
                                                <option value="name-asc">Nama A-Z</option>
                                                <option value="price-asc">Harga Terendah</option>
                                                <option value="price-desc">Harga Tertinggi</option>
                                            </select>
                                            <ChevronDown
                                                size={16}
                                                strokeWidth={1.8}
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#725442]"
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-6 lg:grid-cols-[13.75rem_minmax(0,1fr)]">
                                <CatalogSidebar
                                    categories={PUBLIC_CATEGORIES}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={(categoryId) => {
                                        startTransition(() => {
                                            setSelectedCategory(categoryId);
                                            setCurrentPage(1);
                                        });
                                    }}
                                />

                                <div>
                                    {visibleProducts.length > 0 ? (
                                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                            {visibleProducts.map((product, index) => (
                                                <ProductCard
                                                    key={product.id}
                                                    product={product}
                                                    index={index}
                                                    detailHref={`/katalog/${product.id}`}
                                                    onAddToCart={() => addToCart(product.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-[1.6rem] border border-dashed border-[#eadfcf] bg-[#fffaf3] px-6 py-10">
                                            <p className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-[#3a2117]">
                                                Produk tidak ditemukan
                                            </p>
                                            <p className="mt-3 max-w-xl text-sm leading-7 text-[#725442]">
                                                Coba ubah kata pencarian atau kembali ke semua kategori untuk melihat etalase PayTo.
                                            </p>
                                        </div>
                                    )}

                                    <MinimalPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <PublicFooter />
                </main>
            </PublicFrame>
        </>
    );
}
