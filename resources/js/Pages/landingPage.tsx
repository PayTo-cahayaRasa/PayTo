import { Head, Link, usePage } from '@inertiajs/react';
import { startTransition, useEffect, useState } from 'react';
import { CircleCheckBig, ShieldCheck, Star, Truck } from 'lucide-react';

import { applyPublicCatalogFilter, formatRupiah, PUBLIC_CATEGORIES, PUBLIC_PRODUCTS } from './publicCatalogData';
import {
    BlackCtaSection,
    CatalogSidebar,
    HeroSection,
    MinimalPagination,
    ProductCard,
    ProductVisual,
    PublicFooter,
    PublicFrame,
    PublicHeader,
    type SecondaryFilterId,
    SkipLink,
    usePublicCart,
    whatsappUrl,
} from './publicStorefront';

const featuredProducts = PUBLIC_PRODUCTS.slice(0, 3);
const categoryCounts = {
    All: PUBLIC_PRODUCTS.length,
    Minuman: PUBLIC_PRODUCTS.filter((product) => product.category === 'Minuman').length,
    Makanan: PUBLIC_PRODUCTS.filter((product) => product.category === 'Makanan').length,
};

const storeHighlights = [
    {
        icon: Truck,
        label: 'Gratis Ongkir',
        description: 'Area tertentu setiap hari',
    },
    {
        icon: ShieldCheck,
        label: 'Produk Terjamin',
        description: 'Kualitas terpilih & aman',
    },
    {
        icon: CircleCheckBig,
        label: 'Checkout Cepat',
        description: 'Langsung via WhatsApp',
    },
];

export default function LandingPage() {
    const { url } = usePage();
    const { addToCart, cartItems, clearCart, decreaseCartItem } = usePublicCart();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSecondaryFilter, setSelectedSecondaryFilter] = useState<SecondaryFilterId>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const currentSection = new URL(url, 'http://localhost').searchParams.get('section') ?? 'beranda';
    const activeHref =
        currentSection === 'shop' ? '/?section=shop' : currentSection === 'footer' ? '/?section=footer' : '/?section=beranda';

    const filteredFeaturedProducts = applyPublicCatalogFilter(
        PUBLIC_PRODUCTS.filter((product) => selectedCategory === 'All' || product.category === selectedCategory),
        selectedSecondaryFilter,
    );
    const totalPages = Math.max(1, Math.ceil(filteredFeaturedProducts.length / 6));
    const paginatedFeaturedProducts = filteredFeaturedProducts.slice((currentPage - 1) * 6, currentPage * 6);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentSection]);

    return (
        <>
            <Head title="Landing page guest users">
                <meta
                    name="description"
                    content="Landing page publik PayTo untuk guest users yang menampilkan produk unggulan, informasi toko, dan call-to-action pemesanan via WhatsApp."
                />
            </Head>

            <PublicFrame>
                <SkipLink />
                <PublicHeader
                    activeHref={activeHref}
                    cartItems={cartItems}
                    onIncreaseCartItem={addToCart}
                    onDecreaseCartItem={decreaseCartItem}
                    onClearCart={clearCart}
                />
                <main id="main-content">
                    {currentSection === 'shop' ? (
                        <>
                            <section id="shop">
                                <HeroSection
                                    eyebrow="Kenyang & puas, setiap hari"
                                    heading="Etalase digital untuk pesanan makanan harianmu"
                                    searchActionHref="/?section=shop"
                                />
                            </section>

                            <section className="px-4 py-10 sm:px-6 lg:px-8">
                                <div className="grid gap-10 lg:grid-cols-[0.27fr_0.73fr]">
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

                                    <div>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9 xl:grid-cols-3">
                                            {paginatedFeaturedProducts.map((product, index) => (
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
                            </section>
                        </>
                    ) : null}

                    {currentSection === 'beranda' ? (
                        <div className="snap-y snap-mandatory">
                            <section
                                id="beranda"
                                className="relative flex min-h-dvh snap-start items-center overflow-hidden bg-[radial-gradient(circle_at_20%_18%,rgba(57,230,228,0.12),transparent_22%),linear-gradient(180deg,#ffffff_0%,#fcfcfc_100%)] px-6 py-16 sm:px-10 lg:px-16"
                            >
                                <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-[48%_52%_58%_42%/41%_44%_56%_59%] bg-[linear-gradient(135deg,#45efe7,#7ff7c1)] opacity-95 blur-[2px] will-change-transform animate-[blob-rotate_18s_ease-in-out_infinite]" />

                                <div className="absolute bottom-10 left-[9%] hidden sm:block">
                                    <div className="relative h-16 w-16 rounded-full border border-[#111111] bg-white/70 will-change-transform animate-[float_4s_ease-in-out_infinite]">
                                        <div className="absolute left-1/2 top-1/2 h-0 w-0">
                                            <span className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-[#111111] will-change-transform animate-[orbit_6s_linear_infinite]" />
                                        </div>
                                        <span className="absolute bottom-3 left-3 h-2.5 w-2.5 rounded-full bg-[#45efe7]" />
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 sm:block">
                                    <div className="relative h-16 w-16 rounded-full border border-[#111111] bg-white/70 will-change-transform animate-[float_4.8s_ease-in-out_infinite] [animation-delay:1s]">
                                        <div className="absolute left-1/2 top-1/2 h-0 w-0">
                                            <span className="absolute -left-[6px] -top-[6px] h-3 w-3 rounded-full bg-[#45efe7] will-change-transform animate-[orbit_7s_linear_infinite]" />
                                        </div>
                                        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#111111]" />
                                    </div>
                                </div>

                                <div className="absolute bottom-10 right-[9%] hidden sm:block">
                                    <div className="relative h-16 w-16 rounded-full border border-[#111111] bg-white/70 will-change-transform animate-[float_5.2s_ease-in-out_infinite] [animation-delay:2s]">
                                        <div className="absolute left-1/2 top-1/2 h-0 w-0">
                                            <span className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-[#8e88ff] will-change-transform animate-[orbit_5.8s_linear_infinite]" />
                                        </div>
                                        <span className="absolute left-3 top-3 h-3 w-3 rounded-full bg-[#111111]" />
                                    </div>
                                </div>

                                <div className="relative mx-auto grid w-full max-w-6xl gap-14">
                                    <div className="mx-auto max-w-5xl text-center">
                                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6f6f6f]">
                                            Informasi Toko
                                        </p>
                                        <h1 className="mx-auto mt-6 max-w-5xl text-[2.9rem] font-black leading-[0.93] tracking-[-0.07em] text-[#111111] sm:text-[4.4rem] lg:text-[5.8rem]">
                                            PayTo hadir untuk memenuhi selera makan harian Anda — cepat, higienis, dan terpercaya
                                        </h1>
                                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#4f4f4f] sm:text-lg">
                                            Kami menjajakan aneka makanan dan minuman rumahan pilihan, dengan pengalaman pesan yang mudah dan cepat lewat WhatsApp
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        {storeHighlights.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <div
                                                    key={item.label}
                                                    className="rounded-[2rem] border border-[#111111]/10 bg-white/88 px-5 py-5 shadow-[0_24px_80px_-50px_rgba(17,17,17,0.25)] backdrop-blur-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#111111]/10 bg-[#fafafa] text-[#111111]">
                                                            <Icon size={18} strokeWidth={2} />
                                                        </span>
                                                        <div>
                                                            <p className="font-black tracking-[-0.04em] text-[#111111]">
                                                                {item.label}
                                                            </p>
                                                            <p className="mt-1 text-sm text-[#6f6f6f]">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                            <section className="flex min-h-dvh snap-start items-center bg-white px-6 py-16 sm:px-10 lg:px-16">
                                <div className="mx-auto w-full max-w-7xl">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6f6f6f]">
                                            Produk Unggulan
                                        </p>
                                        <h2 className="mt-5 text-[2.7rem] font-black leading-[0.94] tracking-[-0.07em] text-[#111111] sm:text-[4rem] lg:text-[5rem]">
                                            Tiga pilihan best seller yang paling sering dicari.
                                        </h2>
                                    </div>

                                    <div className="mt-14 grid gap-6 lg:grid-cols-3">
                                        {featuredProducts.map((product, index) => (
                                            <article
                                                key={product.id}
                                                className="group rounded-[2.2rem] border border-[#111111]/8 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_26px_80px_-50px_rgba(17,17,17,0.25)]"
                                            >
                                                <Link href={`/katalog/${product.id}`} className="block">
                                                    <ProductVisual index={index + 20} />
                                                </Link>
                                                <div className="mt-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b8b8b]">
                                                        {product.category}
                                                    </p>
                                                    <Link
                                                        href={`/katalog/${product.id}`}
                                                        className="mt-2 block text-[1.9rem] font-black tracking-[-0.05em] text-[#111111] transition hover:text-black"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <div className="mt-3 flex items-center gap-2 text-sm text-[#6f6f6f]">
                                                        <Star
                                                            size={15}
                                                            className="fill-[#ff9f1a] text-[#ff9f1a]"
                                                            strokeWidth={1.8}
                                                        />
                                                        <span className="font-semibold text-[#111111]">
                                                            {index === 0 ? '5.0' : index === 1 ? '4.9' : '4.8'}
                                                        </span>
                                                        <span>
                                                            {index === 0
                                                                ? 'Best seller mingguan'
                                                                : index === 1
                                                                  ? 'Paling sering repeat order'
                                                                  : 'Favorit pelanggan baru'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-5 flex items-center justify-between gap-3">
                                                        <p className="text-[2rem] font-black tracking-[-0.05em] text-[#111111]">
                                                            {formatRupiah(product.price)}
                                                        </p>
                                                        <a
                                                            href={whatsappUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-black"
                                                        >
                                                            Pesan via WhatsApp
                                                        </a>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="relative flex min-h-dvh snap-start items-center overflow-hidden bg-white px-6 py-16 lg:px-12">
                                <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 lg:grid-cols-2 lg:gap-14">
                                    <div className="relative z-10">
                                        <div className="absolute left-6 top-10 z-[-1] h-[18rem] w-[18rem] rounded-[44%_56%_58%_42%/42%_38%_62%_58%] bg-[linear-gradient(135deg,#89f7c9,#39e6e4)] opacity-35 blur-2xl will-change-transform animate-[blob-rotate_18s_ease-in-out_infinite] sm:h-[22rem] sm:w-[22rem] lg:left-10 lg:top-8" />
                                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6f6f6f]">
                                            PEMESANAN WHATSAPP
                                        </p>
                                        <h2 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-[-0.06em] text-[#111111] sm:text-5xl lg:text-6xl">
                                            Yuk pesan sekarang dan biarkan kami siapkan kebutuhan Anda.
                                        </h2>
                                    </div>

                                    <div className="flex flex-col gap-8 lg:pl-10">
                                        <p className="max-w-md text-base leading-relaxed text-[#3f3f3f] lg:text-lg">
                                            Hubungi PayTo untuk konfirmasi stok, jumlah pesanan, dan pengiriman.
                                            Prosesnya cepat, langsung terhubung ke toko, dan cocok untuk kebutuhan
                                            rumah tangga harian tanpa ribet.
                                        </p>
                                        <div>
                                            <a
                                                href={whatsappUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25d366] px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-[#1ebe5d]"
                                            >
                                                Chat via WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    ) : null}

                    {currentSection === 'footer' ? (
                        <>
                            <BlackCtaSection />
                            <PublicFooter />
                        </>
                    ) : null}

                    {currentSection === 'shop' ? (
                        <>
                            <BlackCtaSection />
                            <PublicFooter />
                        </>
                    ) : null}
                </main>
            </PublicFrame>
        </>
    );
}
