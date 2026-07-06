import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, MapPin, MessageCircle, ShoppingCart, Star } from 'lucide-react';

import { PUBLIC_PRODUCTS, formatRupiah, getProductWhatsappUrl, getPublicCatalogProduct } from './publicCatalogData';
import {
    ProductCard,
    ProductVisual,
    PublicFooter,
    PublicFrame,
    PublicHeader,
    SkipLink,
    storefrontShopHref,
    usePublicCart,
} from './publicStorefront';

type KatalogDetailPageProps = {
    productId: number;
};

export default function KatalogDetailPage({ productId }: KatalogDetailPageProps) {
    const { addToCart, cartItems, clearCart, decreaseCartItem } = usePublicCart();
    const product = getPublicCatalogProduct(productId);
    const relatedProducts = PUBLIC_PRODUCTS.filter((item) => item.id !== productId).slice(0, 3);

    return (
        <>
            <Head title={product ? `${product.name} - PayTo` : 'Produk tidak ditemukan'}>
                <meta
                    name="description"
                    content={
                        product
                            ? `${product.name} tersedia di PayTo dengan harga, stok, detail produk, dan akses pesan melalui WhatsApp.`
                            : 'Produk yang dicari tidak ditemukan di katalog publik PayTo.'
                    }
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

                <main id="main-content" className="px-4 pb-4 pt-6 sm:px-5 lg:px-8">
                    {product ? (
                        <div className="mx-auto max-w-[1848px] space-y-4">
                            <div>
                                <Link
                                    href={storefrontShopHref}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#eadfcf] bg-white px-4 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fff8ed]"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                    Kembali ke Homepage
                                </Link>
                            </div>
                            <section className="overflow-hidden rounded-[2.4rem] border border-[rgba(58,35,24,0.08)] bg-[rgba(255,250,243,0.95)] shadow-[0_30px_60px_-48px_rgba(58,35,24,0.72)]">
                                <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-9">
                                    <div className="rounded-[2rem] bg-[linear-gradient(180deg,#fff9f1,#f6e6cf)] p-4 shadow-[inset_0_0_0_1px_rgba(58,35,24,0.05)]">
                                        <div className="rounded-[1.4rem] bg-white/65 px-4 py-3 text-sm font-semibold text-[#8a6a4e]">
                                            Detail produk PayTo
                                        </div>
                                        <div className="mt-4">
                                            <ProductVisual index={product.id} product={product} />
                                        </div>
                                    </div>

                                    <div className="max-w-2xl">
                                        <p className="inline-flex rounded-full bg-[#fff1da] px-4 py-2 text-sm font-semibold text-[#a06b2f]">
                                            {product.category}
                                        </p>
                                        <h1 className="mt-5 font-display text-[3.2rem] font-semibold leading-[0.94] tracking-[-0.05em] text-[#3a2318] sm:text-[4.4rem]">
                                            {product.name}
                                        </h1>
                                        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#aa7b52]">
                                            {product.sku}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-sm text-[#8f6f52]">
                                            <Star size={15} strokeWidth={2} className="fill-[#f4a621] text-[#f4a621]" />
                                            <span className="font-semibold text-[#9a6627]">4.8</span>
                                            <span>(214 review)</span>
                                        </div>
                                        <p className="mt-6 max-w-[40rem] text-base leading-8 text-[#7a5d47] sm:text-lg">
                                            {product.description}
                                        </p>

                                        <div className="mt-7 grid gap-4 sm:grid-cols-3">
                                            <article className="rounded-[1.5rem] border border-[rgba(58,35,24,0.08)] bg-white px-4 py-4">
                                                <p className="text-sm text-[#8a6a4e]">Harga</p>
                                                <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                                    {formatRupiah(product.price)}
                                                </p>
                                            </article>
                                            <article className="rounded-[1.5rem] border border-[rgba(58,35,24,0.08)] bg-white px-4 py-4">
                                                <p className="text-sm text-[#8a6a4e]">Stok</p>
                                                <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                                    {product.stock > 0 ? `${product.stock} tersedia` : 'Sedang habis'}
                                                </p>
                                            </article>
                                            <article className="rounded-[1.5rem] border border-[rgba(58,35,24,0.08)] bg-white px-4 py-4">
                                                <p className="text-sm text-[#8a6a4e]">Akses</p>
                                                <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                                    Publik
                                                </p>
                                            </article>
                                        </div>

                                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() => addToCart(product.id)}
                                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fff0da] px-6 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fde3ba]"
                                            >
                                                <span>Tambah ke Keranjang</span>
                                                <ShoppingCart size={16} strokeWidth={2} />
                                            </button>
                                            <a
                                                href={getProductWhatsappUrl(product.name)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f5941d] px-6 text-sm font-semibold text-white transition duration-300 hover:-translate-y-px hover:bg-[#ee8a14]"
                                            >
                                                <MessageCircle size={16} strokeWidth={2} />
                                                Pesan via WhatsApp
                                            </a>
                                            <Link
                                                href={storefrontShopHref}
                                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(58,35,24,0.12)] bg-white px-6 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fff5e6]"
                                            >
                                                Kembali ke Beranda
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-4 lg:grid-cols-2">
                                <article className="rounded-[2rem] border border-[rgba(58,35,24,0.08)] bg-white px-6 py-6 shadow-[0_26px_48px_-42px_rgba(58,35,24,0.65)]">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aa7b52]">Detail produk</p>
                                    <h2 className="mt-2 font-display text-[2.2rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                        Yang kamu dapat dari menu ini
                                    </h2>
                                    <div className="mt-5 space-y-3">
                                        {product.details.map((detail) => (
                                            <div key={detail} className="rounded-[1.4rem] bg-[#fbf3e7] px-4 py-4 text-sm leading-7 text-[#7a5d47]">
                                                {detail}
                                            </div>
                                        ))}
                                    </div>
                                </article>

                                <article className="rounded-[2rem] border border-[rgba(58,35,24,0.08)] bg-white px-6 py-6 shadow-[0_26px_48px_-42px_rgba(58,35,24,0.65)]">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aa7b52]">Cara pesan</p>
                                    <h2 className="mt-2 font-display text-[2.2rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                        Langkah order yang tetap sederhana
                                    </h2>
                                    <div className="mt-5 space-y-4">
                                        {[
                                            'Tambahkan ke keranjang bila ingin menyusun beberapa item sekaligus.',
                                            'Lanjutkan ke WhatsApp untuk konfirmasi jumlah, stok, dan jadwal kirim.',
                                            'Tim PayTo akan membantu total harga dan finalisasi pesanan.',
                                        ].map((step, index) => (
                                            <div key={step} className="flex gap-4">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5941d] text-sm font-semibold text-white">
                                                    {index + 1}
                                                </div>
                                                <p className="text-sm leading-7 text-[#7a5d47]">{step}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 rounded-[1.5rem] bg-[#fff5e6] px-5 py-5">
                                        <p className="text-sm font-semibold text-[#3a2318]">Lokasi toko</p>
                                        <a
                                            href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-flex items-start gap-3 text-sm leading-7 text-[#7a5d47] transition hover:text-[#3a2318]"
                                        >
                                            <MapPin size={17} strokeWidth={2} className="mt-1 text-[#b47a3b]" />
                                            <span>Jl. Kemang Raya No. 88, Jakarta Selatan</span>
                                        </a>
                                    </div>
                                </article>
                            </section>

                            <section className="rounded-[2.2rem] border border-[rgba(58,35,24,0.08)] bg-[rgba(255,250,243,0.94)] px-6 py-7 shadow-[0_30px_60px_-48px_rgba(58,35,24,0.72)]">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aa7b52]">Produk lain</p>
                                        <h2 className="mt-2 font-display text-[2.5rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                            Lengkapi pilihanmu dengan menu PayTo lainnya
                                        </h2>
                                    </div>
                                    <Link href={storefrontShopHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[#a7661c] transition hover:text-[#3a2318]">
                                        Kembali ke beranda
                                    </Link>
                                </div>

                                <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {relatedProducts.map((item, index) => (
                                        <ProductCard
                                            key={item.id}
                                            product={item}
                                            index={index + 20}
                                            detailHref={`/katalog/${item.id}`}
                                            onAddToCart={() => addToCart(item.id)}
                                        />
                                    ))}
                                </div>
                            </section>
                            <PublicFooter />
                        </div>
                    ) : (
                        <section className="mx-auto max-w-[1848px] rounded-[2.2rem] border border-dashed border-[rgba(58,35,24,0.12)] bg-white px-6 py-10">
                            <p className="text-sm font-semibold text-[#aa7b52]">Produk tidak tersedia</p>
                            <h1 className="mt-3 font-display text-[3rem] font-semibold tracking-[-0.05em] text-[#3a2318]">
                                Produk yang kamu cari belum ditemukan di etalase PayTo.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-8 text-[#7a5d47]">
                                Kembali ke shop untuk melihat produk lain, atau hubungi admin PayTo lewat WhatsApp jika ingin menanyakan ketersediaan item tertentu.
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={storefrontShopHref}
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f5941d] px-6 text-sm font-semibold text-white transition duration-300 hover:-translate-y-px hover:bg-[#ee8a14]"
                                >
                                    Kembali ke beranda
                                </Link>
                                <a
                                    href="https://wa.me/6281284719284?text=Halo%20PayTo%2C%20saya%20ingin%20menanyakan%20produk%20yang%20tidak%20saya%20temukan."
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(58,35,24,0.12)] bg-white px-6 text-sm font-semibold text-[#3a2318] transition duration-300 hover:-translate-y-px hover:bg-[#fff5e6]"
                                >
                                    Tanya via WhatsApp
                                </a>
                            </div>
                        </section>
                    )}
                </main>
            </PublicFrame>
        </>
    );
}
