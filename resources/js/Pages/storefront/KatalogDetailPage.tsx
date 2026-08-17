import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, MessageCircle, ShoppingBag } from 'lucide-react';

import { formatRupiah } from './data/publicCatalogData';
import type { PublicCatalogProduct } from './data/publicCatalogData';
import type { BusinessProfile } from './types';
import {
    ProductVisual,
    PublicFooter,
    PublicFrame,
    PublicHeader,
    SkipLink,
    storefrontShopHref,
    usePublicCart,
} from '.';

type KatalogDetailPageProps = {
    business: BusinessProfile;
    product: PublicCatalogProduct;
};

export default function KatalogDetailPage({ business, product }: KatalogDetailPageProps) {
    const { addToCart, cartItems, clearCart, decreaseCartItem } = usePublicCart([product]);

    return (
        <>
            <Head title={`${product.name} - ${business.name}`}>
                <meta name="description" content={product.description} />
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

                <main id="main-content" className="px-4 pb-4 pt-4 sm:px-5 lg:px-8">
                    <div className="mx-auto max-w-7xl space-y-4">
                        <Link
                            href={storefrontShopHref}
                            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--color-cream-200)] bg-white px-4 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fff8ed]"
                        >
                            <ChevronLeft size={16} strokeWidth={1.9} />
                            Kembali ke Katalog
                        </Link>

                        <section className="overflow-hidden rounded-4xl border border-[rgba(58,35,24,0.08)] bg-[rgba(255,250,243,0.95)] shadow-[0_30px_60px_-48px_rgba(58,35,24,0.72)]">
                            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                                <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#fff9f1,#f6e6cf)] p-3 shadow-[inset_0_0_0_1px_rgba(58,35,24,0.05)]">
                                    <ProductVisual product={product} />
                                </div>

                                <div className="max-w-xl">
                                    <p className="inline-flex rounded-full bg-[#fff1da] px-3 py-1.5 text-xs font-semibold text-[#a06b2f]">
                                        {product.stock > 0 ? 'Tersedia' : 'Stok habis'}
                                    </p>
                                    <h1 className="mt-4 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.05em] text-[#3a2318] sm:text-[3.5rem]">
                                        {product.name}
                                    </h1>
                                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#aa7b52]">{product.sku}</p>
                                    <p className="mt-4 max-w-145 text-sm leading-7 text-[#7a5d47] sm:text-base">
                                        {product.description || 'Deskripsi produk belum tersedia.'}
                                    </p>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <article className="rounded-2xl border border-[rgba(58,35,24,0.08)] bg-white px-4 py-3.5">
                                            <p className="text-xs text-[#8a6a4e]">Harga</p>
                                            <p className="mt-1.5 text-[1.55rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                                {formatRupiah(product.finalPrice ?? product.price)}
                                            </p>
                                            {(product.discount ?? 0) > 0 && (
                                                <p className="text-sm font-semibold text-[#9b7860] line-through">{formatRupiah(product.price)}</p>
                                            )}
                                        </article>
                                        <article className="rounded-2xl border border-[rgba(58,35,24,0.08)] bg-white px-4 py-3.5">
                                            <p className="text-xs text-[#8a6a4e]">Stok</p>
                                            <p className="mt-1.5 text-[1.55rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                                {product.stock > 0 ? `${product.stock} tersedia` : 'Sedang habis'}
                                            </p>
                                        </article>
                                    </div>

                                    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                                        <button
                                            type="button"
                                            disabled={product.stock <= 0}
                                            onClick={() => addToCart(product.id)}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-cocoa-800)] px-5 text-sm font-semibold text-white transition hover:bg-[#523326] disabled:cursor-not-allowed disabled:opacity-45"
                                        >
                                            <ShoppingBag size={16} />
                                            Tambah ke Keranjang
                                        </button>
                                        {product.stock > 0 && product.whatsappUrl && (
                                            <a
                                                href={product.whatsappUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f5941d] px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-px hover:bg-[#ee8a14]"
                                            >
                                                <MessageCircle size={16} strokeWidth={2} />
                                                Pesan via WhatsApp
                                            </a>
                                        )}
                                        <Link
                                            href="/katalog"
                                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(58,35,24,0.12)] bg-white px-5 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fff5e6]"
                                        >
                                            Lihat Produk Lain
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[rgba(58,35,24,0.08)] bg-white px-5 py-5 shadow-[0_26px_48px_-42px_rgba(58,35,24,0.65)] sm:flex sm:items-end sm:justify-between sm:gap-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aa7b52]">Informasi toko</p>
                                <h2 className="mt-1.5 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-[#3a2318]">{business.name}</h2>
                            </div>
                            <div className="mt-2 text-sm leading-6 text-[#7a5d47] sm:mt-0 sm:text-right">
                                <p>{business.address}</p>
                                <p>{business.operating_hours}</p>
                            </div>
                        </section>

                        <PublicFooter business={business} />
                    </div>
                </main>
            </PublicFrame>
        </>
    );
}
