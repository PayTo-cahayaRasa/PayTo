import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    MapPin,
    MessageCircleMore,
    ShieldCheck,
    Store,
} from 'lucide-react';

import { PUBLIC_PRODUCTS, formatRupiah, getProductWhatsappUrl, getPublicCatalogProduct } from './publicCatalogData';

type KatalogDetailPageProps = {
    productId: number;
};

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
            <div className="relative h-44 w-36">
                <span className="absolute inset-x-2 bottom-0 h-34 rounded-[2.2rem] bg-white/94 shadow-[0_28px_50px_-30px_rgba(41,37,36,0.24)]"></span>
                <span className="absolute left-6 top-6 h-22 w-22 rounded-full bg-amber-100"></span>
                <span className="absolute left-5 top-16 h-20 w-24 rounded-[1.9rem] bg-amber-700"></span>
                <span className="absolute left-8 top-22 h-2 w-18 rounded-full bg-amber-200"></span>
            </div>
        ),
        (
            <div className="relative h-44 w-44">
                <span className="absolute inset-x-3 bottom-0 h-28 rounded-[2.2rem] bg-white/94 shadow-[0_28px_50px_-30px_rgba(41,37,36,0.24)]"></span>
                <span className="absolute left-6 top-14 h-12 w-32 rounded-[1.9rem] bg-amber-900"></span>
                <span className="absolute left-8 top-8 h-32 w-28 rounded-full bg-amber-300"></span>
                <span className="absolute left-14 top-20 h-6 w-16 rounded-full bg-yellow-200"></span>
            </div>
        ),
        (
            <div className="relative h-44 w-44">
                <span className="absolute inset-x-7 bottom-0 h-30 rounded-[2rem] bg-white/94 shadow-[0_28px_50px_-30px_rgba(41,37,36,0.24)]"></span>
                <span className="absolute left-10 top-10 h-24 w-24 rounded-full bg-stone-100"></span>
                <span className="absolute left-12 top-14 h-18 w-18 rounded-full bg-stone-300"></span>
                <span className="absolute left-17 top-21 h-4 w-10 rounded-full bg-stone-400"></span>
            </div>
        ),
        (
            <div className="relative h-44 w-44">
                <span className="absolute inset-x-6 bottom-0 h-30 rounded-[2.1rem] bg-white/94 shadow-[0_28px_50px_-30px_rgba(41,37,36,0.24)]"></span>
                <span className="absolute left-12 top-10 h-12 w-20 rounded-full bg-rose-100"></span>
                <span className="absolute left-10 top-18 h-18 w-24 rounded-[1.7rem] bg-rose-500"></span>
                <span className="absolute left-16 top-24 h-3 w-12 rounded-full bg-rose-100"></span>
            </div>
        ),
    ];

    return (
        <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2.4rem] bg-gradient-to-br ${tone}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_34%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(6,78,59,0.08),transparent_32%)]"></div>
            {variants[index % variants.length]}
        </div>
    );
}

export default function KatalogDetailPage({ productId }: KatalogDetailPageProps) {
    const product = getPublicCatalogProduct(productId);
    const relatedProducts = PUBLIC_PRODUCTS.filter((item) => item.id !== productId).slice(0, 3);

    return (
        <>
            <Head title={product ? `${product.name} - katalog publik` : 'Produk tidak ditemukan'}>
                <meta
                    name="description"
                    content={
                        product
                            ? `${product.name} tersedia di katalog publik PayTo dengan harga, stok, detail produk, dan tombol pemesanan via WhatsApp.`
                            : 'Produk yang dicari tidak ditemukan di katalog publik PayTo.'
                    }
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
                                    <p className="text-sm text-stone-500">Detail produk publik</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/katalog"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98]"
                                >
                                    <ArrowLeft size={16} />
                                    Back ke katalog
                                </Link>
                                <a
                                    href="/#beranda"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-stone-800 active:scale-[0.98]"
                                >
                                    <BookOpenText size={16} />
                                    Kembali ke beranda
                                </a>
                            </div>
                        </div>
                    </header>

                    <main id="main-content" className="pb-10 pt-8 lg:pb-14">
                        {product ? (
                            <div className="space-y-10">
                                <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                                    <div className="rounded-[2.4rem] border border-stone-200/80 bg-white/76 p-4 shadow-[0_28px_80px_-46px_rgba(41,37,36,0.22)]">
                                        <div className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(145deg,#d6d0c7,#f5f1ea_35%,#e4ddd3_75%)] p-6 sm:p-8">
                                            <div className="rounded-[1.8rem] border border-white/70 bg-white/72 px-4 py-3 text-sm text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                                                Produk publik PayTo
                                            </div>
                                            <div className="mt-6">
                                                <ProductVisual imageColor={product.imageColor} index={product.id} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-2xl">
                                        <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">{product.category}</p>
                                        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.08em] text-stone-950 text-balance sm:text-6xl lg:leading-[0.96]">
                                            {product.name}
                                        </h1>
                                        <p className="mt-3 text-sm font-semibold tracking-[0.14em] text-stone-400 uppercase">
                                            {product.sku}
                                        </p>
                                        <p className="mt-6 max-w-[36rem] text-base leading-8 text-stone-600 sm:text-lg">
                                            {product.description}
                                        </p>

                                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                            <article className="rounded-[1.7rem] border border-stone-200/80 bg-white/74 p-4 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.16)]">
                                                <p className="text-sm text-stone-500">Harga</p>
                                                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-emerald-900">
                                                    {formatRupiah(product.price)}
                                                </p>
                                            </article>
                                            <article className="rounded-[1.7rem] border border-stone-200/80 bg-white/74 p-4 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.16)]">
                                                <p className="text-sm text-stone-500">Ketersediaan</p>
                                                <p className={`mt-2 text-3xl font-semibold tracking-[-0.05em] ${product.stock > 0 ? 'text-stone-950' : 'text-rose-600'}`}>
                                                    {product.stock > 0 ? `${product.stock} stok` : 'Habis'}
                                                </p>
                                            </article>
                                            <article className="rounded-[1.7rem] border border-stone-200/80 bg-white/74 p-4 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.16)]">
                                                <p className="text-sm text-stone-500">Akses</p>
                                                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">Publik</p>
                                            </article>
                                        </div>

                                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                            <a
                                                href={getProductWhatsappUrl(product.name)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-emerald-800 active:scale-[0.98]"
                                            >
                                                <MessageCircleMore size={18} />
                                                Pesan melalui WhatsApp
                                            </a>
                                            <Link
                                                href="/katalog"
                                                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98]"
                                            >
                                                <ArrowLeft size={18} />
                                                Back ke katalog
                                            </Link>
                                        </div>
                                    </div>
                                </section>

                                <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                                    <article className="rounded-[2rem] border border-stone-200/80 bg-white/76 p-6 shadow-[0_18px_44px_-34px_rgba(41,37,36,0.16)]">
                                        <div className="flex items-center gap-2 text-stone-950">
                                            <ShieldCheck size={16} className="text-emerald-900" />
                                            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Detail produk</h2>
                                        </div>
                                        <div className="mt-5 space-y-4">
                                            {product.details.map((detail) => (
                                                <div key={detail} className="rounded-[1.4rem] bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
                                                    {detail}
                                                </div>
                                            ))}
                                        </div>
                                    </article>

                                    <article className="rounded-[2rem] border border-stone-200/80 bg-white/76 p-6 shadow-[0_18px_44px_-34px_rgba(41,37,36,0.16)]">
                                        <div className="flex items-center gap-2 text-stone-950">
                                            <Store size={16} className="text-emerald-900" />
                                            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Cara pemesanan</h2>
                                        </div>
                                        <div className="mt-5 grid gap-4">
                                            {[
                                                'Klik tombol pesan melalui WhatsApp untuk memulai order.',
                                                'Sebutkan nama produk dan jumlah pesanan ke tim toko.',
                                                'Tim toko akan membantu konfirmasi stok, total harga, dan proses checkout.',
                                            ].map((step, index) => (
                                                <div key={step} className="flex gap-4">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-sm font-semibold text-white">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-sm leading-7 text-stone-600">{step}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 rounded-[1.6rem] bg-stone-50 px-5 py-5">
                                            <p className="text-sm font-semibold text-stone-900">Lokasi toko</p>
                                            <p className="mt-2 text-sm leading-7 text-stone-600">Jl. Kemang Raya No. 88, Jakarta Selatan</p>
                                            <a
                                                href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 transition hover:text-emerald-800"
                                            >
                                                <MapPin size={15} />
                                                Buka lokasi toko
                                            </a>
                                        </div>
                                    </article>
                                </section>

                                <section>
                                    <div className="mb-5 flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">Produk lain</p>
                                            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">
                                                Lanjut lihat produk lainnya
                                            </h2>
                                        </div>
                                        <Link href="/katalog" className="hidden text-sm font-semibold text-stone-700 transition hover:text-stone-950 sm:inline-flex">
                                            Kembali ke katalog
                                        </Link>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        {relatedProducts.map((item) => (
                                            <article
                                                key={item.id}
                                                className="overflow-hidden rounded-[1.9rem] border border-stone-200/80 bg-white/78 shadow-[0_18px_46px_-34px_rgba(41,37,36,0.18)]"
                                            >
                                                <div className="p-4">
                                                    <Link href={`/katalog/${item.id}`} className="block">
                                                        <ProductVisual imageColor={item.imageColor} index={item.id} />
                                                    </Link>
                                                    <div className="mt-4">
                                                        <p className="text-xs font-semibold tracking-[0.14em] text-stone-400 uppercase">{item.category}</p>
                                                        <Link href={`/katalog/${item.id}`} className="mt-2 block text-2xl font-semibold tracking-[-0.05em] text-stone-950 transition hover:text-emerald-900">
                                                            {item.name}
                                                        </Link>
                                                        <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                                                        <div className="mt-5 flex items-center justify-between gap-3">
                                                            <p className="text-xl font-semibold text-emerald-900">{formatRupiah(item.price)}</p>
                                                            <Link
                                                                href={`/katalog/${item.id}`}
                                                                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98]"
                                                            >
                                                                Detail
                                                                <ArrowRight size={15} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <section className="rounded-[2.2rem] border border-dashed border-stone-300 bg-white/72 px-6 py-10 shadow-[0_18px_40px_-34px_rgba(41,37,36,0.14)]">
                                <div className="max-w-2xl">
                                    <p className="text-sm font-medium tracking-[0.14em] text-emerald-900 uppercase">Produk tidak tersedia</p>
                                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-stone-950 text-balance sm:text-5xl">
                                        Produk yang kamu buka tidak ditemukan di katalog publik.
                                    </h1>
                                    <p className="mt-4 text-base leading-8 text-stone-600">
                                        Kembali ke katalog untuk melihat produk lain, atau hubungi toko lewat WhatsApp jika
                                        kamu ingin menanyakan ketersediaan item tertentu.
                                    </p>
                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href="/katalog"
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:-translate-y-[1px] hover:bg-emerald-800 active:scale-[0.98]"
                                        >
                                            <ArrowLeft size={18} />
                                            Back ke katalog
                                        </Link>
                                        <a
                                            href="https://wa.me/6281284719284?text=Halo%20PayTo%2C%20saya%20ingin%20menanyakan%20produk%20yang%20tidak%20saya%20temukan."
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-[1px] hover:bg-stone-100 active:scale-[0.98]"
                                        >
                                            <MessageCircleMore size={18} />
                                            Tanya via WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
