import { Head } from '@inertiajs/react';
import { ChevronDown, Search } from 'lucide-react';
import { startTransition, useDeferredValue, useState } from 'react';

import { applyPublicCatalogFilter, PUBLIC_CATEGORIES, PUBLIC_PRODUCTS, sortPublicCatalogProducts } from './publicCatalogData';
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
} from './publicStorefront';

export default function LandingPage() {
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

    return (
        <>
            <Head title="Cahaya Rasa">
                <meta
                    name="description"
                    content="Cahaya Rasa dengan tampilan storefront baru bernuansa hangat, tradisional, dan tetap memakai data asli produk untuk pemesanan via WhatsApp."
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

                <main id="main-content">
                    <HeroSection
                        heading={'Renyahnya\nKeripik\nCahaya Rasa'}
                    />

                    <section id={storefrontShopSectionId} className="relative z-10 -mt-2 px-4 py-3 sm:px-5 lg:-mt-4 lg:px-8">
                        <div className="mx-auto max-w-[1848px] rounded-[2rem] border border-[#f1e6d7] bg-[#fffdf9] px-4 py-5 shadow-[0_24px_48px_-36px_rgba(58,33,23,0.18)] sm:px-7 sm:py-8 lg:px-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <h2 className="font-display text-[2.35rem] font-semibold leading-none tracking-[-0.05em] text-[#3a2117] sm:text-[3rem]">
                                    Shop Produk
                                </h2>
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
                                            placeholder="Cari produk Cahaya Rasa"
                                            className="w-full bg-transparent text-sm text-[#3a2117] outline-none placeholder:text-[#b69877]"
                                        />
                                    </label>
                                    <label className="flex w-full flex-col items-start gap-2 self-start text-sm font-medium text-[#725442] sm:w-auto sm:flex-row sm:items-center sm:gap-3">
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

                                    <MinimalPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <BlackCtaSection />
                    <PublicFooter />
                </main>
            </PublicFrame>
        </>
    );
}
