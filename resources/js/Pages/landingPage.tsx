import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenText,
    Clock3,
    MapPin,
    MessageCircleMore,
    MoveRight,
    ShieldCheck,
    ShoppingBag,
    Store,
} from 'lucide-react';

import { PUBLIC_PRODUCTS, formatRupiah } from './publicCatalogData';

const navigationLinks = [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Shop', href: '#shop' },
    { label: 'About', href: '#about' },
];

const whatsappUrl = 'https://wa.me/6281284719284?text=Halo%20PayTo%2C%20saya%20ingin%20memesan%20produk.';

const featuredProducts = PUBLIC_PRODUCTS.slice(0, 3);
const showcaseProducts = PUBLIC_PRODUCTS.slice(3, 6);

const storeHighlights = [
    {
        title: 'Aman & terpercaya',
        description: 'Pengunjung bisa melihat produk publik tanpa masuk ke sistem internal.',
        icon: ShieldCheck,
    },
    {
        title: 'Cepat diproses',
        description: 'Pemesanan dimulai dari WhatsApp lalu diteruskan ke alur kasir yang sama.',
        icon: MessageCircleMore,
    },
    {
        title: 'Produk unggulan',
        description: 'Kami memiliki beberapa produk unggulan yang siap dipilih.',
        icon: ShoppingBag,
    },
];

const orderSteps = [
    'Pilih produk dari etalase pilihan atau buka katalog lengkap.',
    'Hubungi toko melalui tombol WhatsApp untuk mulai order.',
    'Tim toko konfirmasi pesanan lalu memprosesnya di sistem PayTo.',
];

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
    ];

    return (
        <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br ${tone}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_34%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(6,78,59,0.08),transparent_32%)]"></div>
            {variants[index % variants.length]}
        </div>
    );
}

function Navbar() {
    return (
        <header className="px-4 pt-4 sm:px-6 lg:px-8">
            <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-stone-200/80 pb-4">
                <div className="flex items-center gap-3">
                    <BrandMark />
                    <div>
                        <p className="text-[2rem] font-semibold tracking-[-0.07em] text-stone-950">PayTo</p>
                    </div>
                </div>

                <div className="hidden items-center gap-10 md:flex">
                    {navigationLinks.map((item, index) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`text-lg font-medium transition hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-stone-50 ${
                                index === 0 ? 'text-stone-950' : 'text-stone-500'
                            }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98] sm:inline-flex"
                    >
                        WhatsApp
                    </a>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-stone-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 focus:ring-offset-stone-50"
                    >
                        Masuk
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </nav>
        </header>
    );
}

function HeroSection() {
    return (
        <section id="beranda" className="px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                <div className="max-w-2xl pt-6 lg:pt-0">
                    <div className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-800"></span>
                        PayTo official store
                    </div>

                    <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-[-0.08em] text-stone-950 text-balance sm:text-6xl lg:text-[4.6rem] lg:leading-[0.95]">
                        Showcase toko resmi untuk semua pembelian kamu.
                    </h1>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-emerald-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-stone-50"
                        >
                            <MessageCircleMore size={18} />
                            Pesan via WhatsApp
                        </a>
                        <Link
                            href="/katalog"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-200 focus:ring-offset-2 focus:ring-offset-stone-50"
                        >
                            <BookOpenText size={18} />
                            Lihat katalog
                        </Link>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        {storeHighlights.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article key={item.title} className="flex gap-3">
                                    <div className="mt-0.5 rounded-full border border-stone-200 bg-white p-2 text-emerald-900">
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-stone-500">{item.description}</p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="relative">
                    <div className="rounded-[2.3rem] border border-stone-200/80 bg-white/75 p-3 shadow-[0_28px_80px_-46px_rgba(41,37,36,0.26)] shadow-emerald-950/10">
                        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#d6d0c7,#f5f1ea_35%,#e4ddd3_75%)] p-6 sm:p-8">
                            <div className="grid gap-4 md:grid-cols-[0.8fr_1fr_0.9fr] md:items-end">
                                {featuredProducts.map((product, index) => (
                                    <article key={product.id} className={`${index === 1 ? 'md:translate-y-8' : ''}`}>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 z-10 rounded-2xl bg-white/92 px-3 py-2 text-sm text-stone-800 shadow-[0_14px_34px_-24px_rgba(41,37,36,0.28)]">
                                                <p className="font-medium">{product.name}</p>
                                                <p className="mt-1 text-base font-semibold">{formatRupiah(product.price)}</p>
                                            </div>
                                            <ProductVisual imageColor={product.imageColor} index={index} />
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-6 flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                                <div>
                                    <p className="text-sm font-semibold text-stone-900">Produk pilihan untuk kamu</p>
                                    <p className="mt-1 text-sm text-stone-500">Lihat ringkasan etalase tanpa harus masuk ke dashboard.</p>
                                </div>
                                <Link href="/katalog" className="hidden items-center gap-2 text-sm font-semibold text-emerald-900 md:inline-flex">
                                    Buka shop
                                    <MoveRight size={15} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ShopSection() {
    return (
        <section id="shop" className="px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">Produk terbaik kami</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-stone-950 text-balance sm:text-5xl">
                            Etalase pilihan yang cukup untuk menggiring orang ke katalog lengkap.
                        </h2>
                    </div>

                    <Link
                        href="/katalog"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-900 transition duration-300 hover:-translate-y-[1px] hover:bg-emerald-950 hover:text-white active:scale-[0.98]"
                    >
                        Lihat semua produk
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-3">
                    {showcaseProducts.map((product, index) => (
                        <article
                            key={product.id}
                            className="grid overflow-hidden rounded-[1.9rem] border border-stone-200/80 bg-white/78 shadow-[0_18px_46px_-34px_rgba(41,37,36,0.18)] md:grid-cols-[9rem_minmax(0,1fr)]"
                        >
                            <div className="flex items-start justify-center p-4 md:pt-6">
                                <div className="w-full max-w-[7rem]">
                                    <ProductVisual imageColor={product.imageColor} index={index} />
                                </div>
                            </div>
                            <div className="flex flex-col p-5">
                                <p className="text-xs font-semibold tracking-[0.14em] text-stone-400 uppercase">{product.category}</p>
                                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-stone-950">{product.name}</h3>
                                <p className="mt-3 flex-1 text-sm leading-7 text-stone-600">
                                    Produk publik yang siap dipilih sebelum pelanggan melanjutkan pemesanan lewat WhatsApp.
                                </p>
                                <div className="mt-5 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-2xl font-semibold tracking-[-0.04em] text-emerald-900">{formatRupiah(product.price)}</p>
                                        <p className="mt-1 text-sm text-stone-500">Stok {product.stock}</p>
                                    </div>
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-stone-800 active:scale-[0.98]"
                                    >
                                        WhatsApp
                                        <ArrowRight size={15} />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AboutSection() {
    return (
        <section id="about" className="px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">About</p>
                    <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-stone-950 text-balance sm:text-5xl">
                        Informasi toko dan alur order disajikan sejelas mungkin untuk pengunjung baru.
                    </h2>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    <article className="rounded-[2rem] border border-stone-200/80 bg-white/78 p-6 shadow-[0_18px_46px_-34px_rgba(41,37,36,0.16)]">
                        <div className="flex items-center gap-3 text-stone-950">
                            <Clock3 size={18} className="text-emerald-900" />
                            <h3 className="text-2xl font-semibold tracking-[-0.04em]">Jam operasional</h3>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4 text-sm text-stone-600">
                                <span>Senin - Jumat</span>
                                <span className="font-medium text-stone-900">08.00 - 21.00</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4 text-sm text-stone-600">
                                <span>Sabtu</span>
                                <span className="font-medium text-stone-900">09.00 - 21.00</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-stone-600">
                                <span>Minggu</span>
                                <span className="font-medium text-stone-900">10.00 - 20.00</span>
                            </div>
                        </div>
                        <p className="mt-6 text-sm leading-7 text-stone-500">Toko siap melayani pelanggan setiap hari dengan katalog publik yang selalu bisa diakses.</p>
                    </article>

                    <article className="rounded-[2rem] border border-stone-200/80 bg-white/78 p-6 shadow-[0_18px_46px_-34px_rgba(41,37,36,0.16)]">
                        <div className="flex items-center gap-3 text-stone-950">
                            <MapPin size={18} className="text-emerald-900" />
                            <h3 className="text-2xl font-semibold tracking-[-0.04em]">Lokasi kami</h3>
                        </div>
                        <div className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
                            <p>Jl. Kemang Raya No. 88</p>
                            <p>Bangka, Mampang Prapatan</p>
                            <p>Jakarta Selatan, 12730</p>
                        </div>
                        <a
                            href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-8 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98]"
                        >
                            Lihat di Google Maps
                            <ArrowRight size={15} />
                        </a>
                    </article>

                    <article className="rounded-[2rem] border border-stone-200/80 bg-white/78 p-6 shadow-[0_18px_46px_-34px_rgba(41,37,36,0.16)]">
                        <div className="flex items-center gap-3 text-stone-950">
                            <Store size={18} className="text-emerald-900" />
                            <h3 className="text-2xl font-semibold tracking-[-0.04em]">Cara order</h3>
                        </div>
                        <div className="mt-6 space-y-4">
                            {orderSteps.map((step, index) => (
                                <div key={step} className="flex gap-4">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-sm font-semibold text-white">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm leading-7 text-stone-600">{step}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}

function ClosingSection() {
    return (
        <section className="px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,#14532d,#064e3b)] p-6 text-white shadow-[0_24px_60px_-36px_rgba(6,78,59,0.48)] sm:p-8 lg:p-10">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div>
                            <p className="text-sm font-medium tracking-[0.14em] text-emerald-100 uppercase">Siap order sekarang</p>
                            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-5xl">
                                Hubungi toko lewat WhatsApp dan lanjutkan pesananmu hari ini.
                            </h2>
                        </div>

                        <div className="grid gap-4 justify-end">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-emerald-950 transition duration-300 hover:-translate-y-[1px] hover:bg-emerald-50 active:scale-[0.98]"
                            >
                                <MessageCircleMore size={18} />
                                Pesan via WhatsApp
                            </a>
                            <Link
                                href="/katalog"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-white/10 active:scale-[0.98]"
                            >
                                Buka katalog
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>

                <footer className="flex flex-col gap-8 border-t border-stone-200/80 pt-8 text-sm text-stone-500 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3">
                            <BrandMark />
                            <p className="text-3xl font-semibold tracking-[-0.06em] text-stone-950">PayTo</p>
                        </div>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-3">
                        <div>
                            <p className="font-semibold text-stone-950">Tautan</p>
                            <div className="mt-4 grid gap-3">
                                {navigationLinks.map((item) => (
                                    <a key={item.href} href={item.href} className="transition hover:text-stone-950">
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-stone-950">Halaman</p>
                            <div className="mt-4 grid gap-3">
                                <Link href="/katalog" className="transition hover:text-stone-950">
                                    Katalog publik
                                </Link>
                                <Link href="/login" className="transition hover:text-stone-950">
                                    Login sistem
                                </Link>
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-stone-950">Hubungi kami</p>
                            <div className="mt-4 grid gap-3">
                                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="transition hover:text-stone-950">
                                    +62 1234-5678-9999
                                </a>
                                <a href="mailto:halo@payto.store" className="transition hover:text-stone-950">
                                    halo@payto.store
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </section>
    );
}

export default function LandingPage() {
    return (
        <>
            <Head title="Landing page guest users">
                <meta
                    name="description"
                    content="Landing page publik PayTo untuk guest users yang menampilkan produk unggulan, informasi toko, dan call-to-action pemesanan via WhatsApp."
                />
            </Head>

            <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(22,101,52,0.06),transparent_22%),linear-gradient(180deg,#fcfbf7,#f7f4ee)] font-sans text-stone-800 selection:bg-emerald-900 selection:text-white">
                <div className="pointer-events-none fixed inset-0 opacity-[0.2] [background-image:radial-gradient(rgba(120,113,108,0.16)_0.7px,transparent_0.7px)] [background-size:14px_14px]"></div>
                <SkipLink />
                <Navbar />
                <main id="main-content" className="relative scroll-smooth">
                    <HeroSection />
                    <ShopSection />
                    <AboutSection />
                    <ClosingSection />
                </main>
            </div>
        </>
    );
}
