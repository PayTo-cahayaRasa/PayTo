import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, MessageCircle } from 'lucide-react';

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

                <main id="main-content" className="px-4 pb-4 pt-6 sm:px-5 lg:px-8">
                    <div className="mx-auto max-w-462 space-y-4">
                        <Link
                            href={storefrontShopHref}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#eadfcf] bg-white px-4 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fff8ed]"
                        >
                            <ChevronLeft size={16} strokeWidth={1.9} />
                            Kembali ke Katalog
                        </Link>

                        <section className="overflow-hidden rounded-[2.4rem] border border-[rgba(58,35,24,0.08)] bg-[rgba(255,250,243,0.95)] shadow-[0_30px_60px_-48px_rgba(58,35,24,0.72)]">
                            <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-9">
                                <div className="rounded-4xl bg-[linear-gradient(180deg,#fff9f1,#f6e6cf)] p-4 shadow-[inset_0_0_0_1px_rgba(58,35,24,0.05)]">
                                    <ProductVisual index={product.id} product={product} />
                                </div>

                                <div className="max-w-2xl">
                                    <p className="inline-flex rounded-full bg-[#fff1da] px-4 py-2 text-sm font-semibold text-[#a06b2f]">
                                        {product.stock > 0 ? 'Tersedia' : 'Stok habis'}
                                    </p>
                                    <h1 className="mt-5 font-display text-[3.2rem] font-semibold leading-[0.94] tracking-[-0.05em] text-[#3a2318] sm:text-[4.4rem]">
                                        {product.name}
                                    </h1>
                                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#aa7b52]">{product.sku}</p>
                                    <p className="mt-6 max-w-160 text-base leading-8 text-[#7a5d47] sm:text-lg">
                                        {product.description || 'Deskripsi produk belum tersedia.'}
                                    </p>

                                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                        <article className="rounded-3xl border border-[rgba(58,35,24,0.08)] bg-white px-4 py-4">
                                            <p className="text-sm text-[#8a6a4e]">Harga</p>
                                            <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                                {formatRupiah(product.finalPrice ?? product.price)}
                                            </p>
                                            {(product.discount ?? 0) > 0 && (
                                                <p className="text-sm font-semibold text-[#9b7860] line-through">{formatRupiah(product.price)}</p>
                                            )}
                                        </article>
                                        <article className="rounded-3xl border border-[rgba(58,35,24,0.08)] bg-white px-4 py-4">
                                            <p className="text-sm text-[#8a6a4e]">Stok</p>
                                            <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                                {product.stock > 0 ? `${product.stock} tersedia` : 'Sedang habis'}
                                            </p>
                                        </article>
                                    </div>

                                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                        {product.whatsappUrl && (
                                            <a
                                                href={product.whatsappUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f5941d] px-6 text-sm font-semibold text-white transition duration-300 hover:-translate-y-px hover:bg-[#ee8a14]"
                                            >
                                                <MessageCircle size={16} strokeWidth={2} />
                                                Pesan via WhatsApp
                                            </a>
                                        )}
                                        <Link
                                            href="/katalog"
                                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(58,35,24,0.12)] bg-white px-6 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fff5e6]"
                                        >
                                            Lihat Produk Lain
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-4xl border border-[rgba(58,35,24,0.08)] bg-white px-6 py-6 shadow-[0_26px_48px_-42px_rgba(58,35,24,0.65)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aa7b52]">Informasi toko</p>
                            <h2 className="mt-2 font-display text-[2.2rem] font-semibold tracking-[-0.05em] text-[#3a2318]">{business.name}</h2>
                            <p className="mt-3 text-sm leading-7 text-[#7a5d47]">{business.address}</p>
                            <p className="text-sm leading-7 text-[#7a5d47]">{business.operating_hours}</p>
                        </section>

                        <PublicFooter business={business} />
                    </div>
                </main>
            </PublicFrame>
        </>
    );
}
