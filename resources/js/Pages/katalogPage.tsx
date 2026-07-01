import { Head, Link } from '@inertiajs/react';
import { startTransition, useDeferredValue, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    LayoutGrid,
    MapPin,
    MessageCircleMore,
    ScanSearch,
    SlidersHorizontal,
    Store,
} from 'lucide-react';

import { PUBLIC_CATEGORIES, PUBLIC_PRODUCTS, formatRupiah, getProductWhatsappUrl } from './publicCatalogData';

const whatsappUrl = 'https://wa.me/6281284719284?text=Halo%20PayTo%2C%20saya%20ingin%20memesan%20produk.';

const stockFilters = [
    { id: 'all', label: 'Semua stok' },
    { id: 'ready', label: 'Tersedia' },
    { id: 'empty', label: 'Habis' },
] as const;

type StockFilterId = (typeof stockFilters)[number]['id'];

function BrandMark() {
    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-emerald-900 text-lg font-semibold tracking-[-0.08em] text-white shadow-[0_18px_44px_-28px_rgba(6,78,59,0.45)]">
            P
        </div>
    );
}

function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-emerald-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
            Langsung ke konten
        </a>
    );
}

function ProductVisual({ imageColor, index }: { imageColor?: string; index: number }) {
    const tone = imageColor ?? 'from-stone-200 to-stone-100';
    const variants = [
        (
            <div className="relative h-36 w-28">
                <span className="absolute inset-x-1 bottom-0 h-28 rounded-[1.9rem] bg-white/92 shadow-[0_24px_46px_-30px_rgba(41,37,36,0.25)]"></span>
                <span className="absolute left-5 top-4 h-18 w-18 rounded-full bg-amber-100"></span>
                <span className="absolute left-4 top-12 h-16 w-20 rounded-[1.6rem] bg-amber-700"></span>
                <span className="absolute left-6 top-16 h-2 w-16 rounded-full bg-amber-200"></span>
            </div>
        ),
        (
            <div className="relative h-34 w-34">
                <span className="absolute inset-x-2 bottom-0 h-22 rounded-[2rem] bg-white/96 shadow-[0_24px_46px_-28px_rgba(41,37,36,0.2)]"></span>
                <span className="absolute left-3 top-12 h-10 w-28 rounded-[1.8rem] bg-amber-900"></span>
                <span className="absolute left-5 top-8 h-26 w-24 rounded-full bg-amber-300"></span>
                <span className="absolute left-10 top-16 h-5 w-14 rounded-full bg-yellow-200"></span>
            </div>
        ),
        (
            <div className="relative h-34 w-34">
                <span className="absolute inset-x-5 bottom-0 h-24 rounded-[1.8rem] bg-white/96 shadow-[0_24px_46px_-28px_rgba(41,37,36,0.2)]"></span>
                <span className="absolute left-8 top-7 h-18 w-18 rounded-full bg-stone-100"></span>
                <span className="absolute left-10 top-10 h-14 w-14 rounded-full bg-stone-300"></span>
                <span className="absolute left-13 top-15 h-4 w-8 rounded-full bg-stone-400"></span>
            </div>
        ),
        (
            <div className="relative h-34 w-34">
                <span className="absolute inset-x-4 bottom-0 h-24 rounded-[1.9rem] bg-white/94 shadow-[0_24px_46px_-28px_rgba(41,37,36,0.2)]"></span>
                <span className="absolute left-9 top-7 h-10 w-16 rounded-full bg-rose-100"></span>
                <span className="absolute left-7 top-13 h-13 w-20 rounded-[1.6rem] bg-rose-500"></span>
                <span className="absolute left-12 top-17 h-3 w-10 rounded-full bg-rose-100"></span>
            </div>
        ),
    ];

    return (
        <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br ${tone}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_34%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(6,78,59,0.08),transparent_32%)]"></div>
            {variants[index % variants.length]}
        </div>
    );
}

function ProductSkeleton() {
    return (
        <article className="overflow-hidden rounded-[1.9rem] border border-stone-200/80 bg-white/72 p-4 shadow-[0_18px_44px_-34px_rgba(41,37,36,0.14)]">
            <div className="flex items-center justify-between">
                <div className="h-6 w-24 animate-pulse rounded-full bg-stone-200"></div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-stone-200"></div>
            </div>
            <div className="mt-4 aspect-[4/3] animate-pulse rounded-[2rem] bg-stone-200"></div>
            <div className="mt-4 h-6 w-2/3 animate-pulse rounded-full bg-stone-200"></div>
            <div className="mt-3 h-4 w-24 animate-pulse rounded-full bg-stone-200"></div>
            <div className="mt-5 flex items-center justify-between">
                <div className="h-7 w-28 animate-pulse rounded-full bg-stone-200"></div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-stone-200"></div>
            </div>
            <div className="mt-5 h-12 animate-pulse rounded-full bg-stone-200"></div>
        </article>
    );
}

export default function KatalogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStock, setSelectedStock] = useState<StockFilterId>('all');
    const deferredSearch = useDeferredValue(searchQuery);

    const visibleProducts = PUBLIC_PRODUCTS.filter((product) => {
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

    const isSearching = deferredSearch !== searchQuery;
    const readyCount = PUBLIC_PRODUCTS.filter((product) => product.stock > 0).length;
    const emptyCount = PUBLIC_PRODUCTS.filter((product) => product.stock === 0).length;
    const leadProduct = visibleProducts[0] ?? PUBLIC_PRODUCTS[0];

    return (
        <>
            <Head title="Katalog publik">
                <meta
                    name="description"
                    content="Katalog produk publik PayTo untuk guest users, lengkap dengan foto, harga, ketersediaan stok, pencarian, dan filter kategori."
                />
            </Head>

            <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(22,101,52,0.06),transparent_22%),linear-gradient(180deg,#fcfbf7,#f7f4ee)] px-4 py-4 font-sans text-stone-800 selection:bg-emerald-900 selection:text-white sm:px-6 lg:px-8">
                <div className="pointer-events-none fixed inset-0 opacity-[0.2] [background-image:radial-gradient(rgba(120,113,108,0.16)_0.7px,transparent_0.7px)] [background-size:14px_14px]"></div>
                <SkipLink />

                <div className="relative mx-auto max-w-7xl">
                    <header className="border-b border-stone-200/80 pb-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <BrandMark />
                                <div>
                                    <p className="text-[2rem] font-semibold tracking-[-0.07em] text-stone-950">PayTo</p>
                                    <p className="text-sm text-stone-500">Katalog publik untuk guest users</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="/#beranda"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-200 focus:ring-offset-2 focus:ring-offset-stone-50"
                                >
                                    <ArrowLeft size={16} />
                                    Kembali ke beranda
                                </a>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-emerald-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-stone-50"
                                >
                                    <MessageCircleMore size={16} />
                                    Order via WhatsApp
                                </a>
                            </div>
                        </div>
                    </header>

                    <main id="main-content" className="pb-10 pt-8 lg:pb-14">
                        <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
                            <div className="max-w-2xl">
                                <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">Katalog produk</p>
                                <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.08em] text-stone-950 text-balance sm:text-6xl lg:leading-[0.96]">
                                    Pilih produk yang Anda inginkan.
                                </h1>

                                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                    <article className="rounded-[1.7rem] border border-stone-200/80 bg-white/74 p-4 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.16)]">
                                        <p className="text-sm text-stone-500">Total produk</p>
                                        <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">{PUBLIC_PRODUCTS.length}</p>
                                    </article>
                                    <article className="rounded-[1.7rem] border border-stone-200/80 bg-white/74 p-4 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.16)]">
                                        <p className="text-sm text-stone-500">Siap dibeli</p>
                                        <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-emerald-900">{readyCount}</p>
                                    </article>
                                    <article className="rounded-[1.7rem] border border-stone-200/80 bg-white/74 p-4 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.16)]">
                                        <p className="text-sm text-stone-500">Stok habis</p>
                                        <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">{emptyCount}</p>
                                    </article>
                                </div>
                            </div>

                            <div className="rounded-[2.3rem] border border-stone-200/80 bg-white/74 p-3 shadow-[0_28px_80px_-46px_rgba(41,37,36,0.24)]">
                                <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#d6d0c7,#f5f1ea_35%,#e4ddd3_75%)] p-6 sm:p-8">
                                    <div className="grid gap-4 sm:grid-cols-[0.88fr_1.12fr] sm:items-end">
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 z-10 rounded-2xl bg-white/92 px-3 py-2 text-sm text-stone-800 shadow-[0_14px_34px_-24px_rgba(41,37,36,0.28)]">
                                                <p className="font-medium">{leadProduct.name}</p>
                                                <p className="mt-1 text-base font-semibold">{formatRupiah(leadProduct.price)}</p>
                                            </div>
                                            <ProductVisual imageColor={leadProduct.imageColor} index={0} />
                                        </div>

                                        <div className="rounded-[1.8rem] border border-white/70 bg-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                                            <p className="text-xs font-semibold tracking-[0.14em] text-stone-400 uppercase">Etalase lengkap</p>
                                            <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-stone-950">
                                                Cari produk favorit lalu chat toko.
                                            </p>
                                            <p className="mt-3 text-sm leading-7 text-stone-600">
                                                Katalog ini tetap terasa terbuka dan ringan, tetapi semua informasi penting
                                                seperti harga dan stok tetap terlihat jelas.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pt-10 lg:pt-12">
                            <div className="grid gap-8 lg:grid-cols-[0.29fr_0.71fr]">
                                <aside className="space-y-5">
                                    <div className="rounded-[2rem] border border-stone-200/80 bg-white/76 p-5 shadow-[0_18px_44px_-34px_rgba(41,37,36,0.16)]">
                                        <div className="flex items-center gap-2 text-stone-950">
                                            <SlidersHorizontal size={16} className="text-emerald-900" />
                                            <h2 className="text-lg font-semibold tracking-[-0.03em]">Filter katalog</h2>
                                        </div>

                                        <div className="mt-5 grid gap-5">
                                            <div className="grid gap-2">
                                                <label htmlFor="catalog-search" className="text-sm font-semibold text-stone-900">
                                                    Search produk
                                                </label>
                                                <div className="flex items-center gap-3 rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
                                                    <ScanSearch size={16} className="shrink-0 text-stone-400" />
                                                    <input
                                                        id="catalog-search"
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(event) => {
                                                            const nextValue = event.target.value;
                                                            startTransition(() => {
                                                                setSearchQuery(nextValue);
                                                            });
                                                        }}
                                                        className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
                                                        placeholder="Cari nama produk atau SKU"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <p className="text-sm font-semibold text-stone-900">Kategori</p>
                                                <div className="flex flex-wrap gap-2 lg:flex-col">
                                                    {PUBLIC_CATEGORIES.map((category) => (
                                                        <button
                                                            type="button"
                                                            key={category.id}
                                                            onClick={() => {
                                                                startTransition(() => {
                                                                    setSelectedCategory(category.id);
                                                                });
                                                            }}
                                                            className={`inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold transition duration-300 lg:rounded-[1.2rem] ${
                                                                selectedCategory === category.id
                                                                    ? 'bg-emerald-900 text-white'
                                                                    : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                                                            }`}
                                                        >
                                                            <span>{category.label}</span>
                                                            <span className="hidden text-xs lg:inline">
                                                                {category.id === 'All'
                                                                    ? PUBLIC_PRODUCTS.length
                                                                    : PUBLIC_PRODUCTS.filter((product) => product.category === category.id).length}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <p className="text-sm font-semibold text-stone-900">Ketersediaan stok</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {stockFilters.map((filter) => (
                                                        <button
                                                            type="button"
                                                            key={filter.id}
                                                            onClick={() => {
                                                                startTransition(() => {
                                                                    setSelectedStock(filter.id);
                                                                });
                                                            }}
                                                            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition duration-300 ${
                                                                selectedStock === filter.id
                                                                    ? 'bg-stone-950 text-white'
                                                                    : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                                                            }`}
                                                        >
                                                            {filter.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[2rem] border border-stone-200/80 bg-white/76 p-5 shadow-[0_18px_44px_-34px_rgba(41,37,36,0.16)]">
                                        <div className="flex items-center gap-2 text-stone-950">
                                            <Store size={16} className="text-emerald-900" />
                                            <h2 className="text-lg font-semibold tracking-[-0.03em]">Info toko</h2>
                                        </div>
                                        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600">
                                            <div className="rounded-[1.4rem] bg-stone-50 px-4 py-4">
                                                <p className="font-semibold text-stone-900">Alamat toko</p>
                                                <p className="mt-1">Jl. Kemang Raya No. 88, Jakarta Selatan</p>
                                            </div>
                                            <a
                                                href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 transition hover:text-emerald-800"
                                            >
                                                <MapPin size={15} />
                                                Buka lokasi toko
                                            </a>
                                        </div>
                                    </div>
                                </aside>

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-4 rounded-[2rem] border border-stone-200/80 bg-white/76 px-5 py-5 shadow-[0_18px_44px_-34px_rgba(41,37,36,0.16)] sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">Daftar produk</p>
                                            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">
                                                {visibleProducts.length} produk siap dibrowse
                                            </h2>
                                            <p className="mt-2 text-sm leading-7 text-stone-600">
                                                Gunakan search dan filter untuk mempersempit pilihan, lalu lanjutkan order melalui WhatsApp.
                                            </p>
                                        </div>

                                    </div>

                                    {isSearching ? (
                                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                            {[0, 1, 2, 3, 4, 5].map((item) => (
                                                <ProductSkeleton key={item} />
                                            ))}
                                        </div>
                                    ) : visibleProducts.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                            {visibleProducts.map((product, index) => {
                                                return (
                                                    <article
                                                        key={product.id}
                                                        className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/78 shadow-[0_18px_46px_-34px_rgba(41,37,36,0.18)] transition duration-300 hover:-translate-y-[2px] hover:bg-white"
                                                    >
                                                        <div className="grid h-full">
                                                            <div className="p-4">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-stone-500 uppercase">
                                                                        {product.category}
                                                                    </span>
                                                                    <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold text-stone-500">
                                                                        {product.stock > 0 ? `Stok ${product.stock}` : 'Habis'}
                                                                    </span>
                                                                </div>

                                                                <Link href={`/katalog/${product.id}`} className="mt-4 block">
                                                                    <ProductVisual imageColor={product.imageColor} index={index} />
                                                                </Link>
                                                            </div>

                                                            <div className="flex flex-1 flex-col px-4 pb-4 lg:px-5 lg:pb-5">
                                                                <div>
                                                                    <Link href={`/katalog/${product.id}`} className="block">
                                                                        <h3 className="text-2xl font-semibold tracking-[-0.05em] text-stone-950 transition hover:text-emerald-900">
                                                                            {product.name}
                                                                        </h3>
                                                                    </Link>
                                                                    <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-stone-400 uppercase">
                                                                        {product.sku}
                                                                    </p>
                                                                    <p className="mt-4 flex-1 text-sm leading-7 text-stone-600">
                                                                        Produk publik dengan informasi harga dan stok yang tetap mudah dipindai di mobile maupun desktop.
                                                                    </p>
                                                                </div>

                                                                <div className="mt-5 flex items-end justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-2xl font-semibold tracking-[-0.04em] text-emerald-900">
                                                                            {formatRupiah(product.price)}
                                                                        </p>
                                                                        <p className={`mt-1 text-sm font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                                            {product.stock > 0 ? 'Siap dibeli' : 'Menunggu restock'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                                                    <Link
                                                                        href={`/katalog/${product.id}`}
                                                                        className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3.5 text-center text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98]"
                                                                    >
                                                                        Lihat detail
                                                                    </Link>
                                                                    <a
                                                                        href={getProductWhatsappUrl(product.name)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-center text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-stone-800 active:scale-[0.98]"
                                                                    >
                                                    
                                                                        Order via WhatsApp
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-[2.1rem] border border-dashed border-stone-300 bg-white/70 px-6 py-10 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.14)]">
                                            <div className="max-w-xl">
                                                <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">Tidak ada hasil</p>
                                                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-stone-950">
                                                    Produk tidak ditemukan untuk kombinasi filter ini.
                                                </h3>
                                                <p className="mt-3 text-sm leading-7 text-stone-600">
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
                                                        className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-emerald-800 active:scale-[0.98]"
                                                    >
                                                        Reset filter
                                                    </button>
                                                    <a
                                                        href={whatsappUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98]"
                                                    >
                                                        <MessageCircleMore size={16} />
                                                        Tanya via WhatsApp
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
