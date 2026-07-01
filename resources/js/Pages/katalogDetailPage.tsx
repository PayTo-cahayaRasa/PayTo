import { Head, Link } from '@inertiajs/react';

import { PUBLIC_PRODUCTS, formatRupiah, getProductWhatsappUrl, getPublicCatalogProduct } from './publicCatalogData';
import {
    BlackCtaSection,
    ProductCard,
    ProductVisual,
    PublicFooter,
    PublicFrame,
    PublicHeader,
    SkipLink,
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

            <PublicFrame>
                <SkipLink />
                <PublicHeader
                    activeHref="/?section=shop"
                    cartItems={cartItems}
                    onIncreaseCartItem={addToCart}
                    onDecreaseCartItem={decreaseCartItem}
                    onClearCart={clearCart}
                />
                <main id="main-content" className="px-4 py-10 sm:px-6 lg:px-8">
                        {product ? (
                            <div className="space-y-10">
                                <section className="grid gap-10 lg:grid-cols-[0.52fr_0.48fr] lg:items-start">
                                    <div className="rounded-[2rem] bg-[linear-gradient(145deg,#f6f6f6,#ececec)] p-5 sm:p-6">
                                        <div className="rounded-[1.8rem] bg-white px-4 py-3 text-sm font-semibold text-[#6f6f6f]">
                                            Produk publik PayTo
                                        </div>
                                        <div className="mt-6 rounded-[1.8rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#efefef,#f7f7f7)] p-6 sm:p-8">
                                            <ProductVisual index={product.id} />
                                        </div>
                                    </div>

                                    <div className="max-w-2xl pt-2">
                                        <p className="inline-flex rounded-full bg-[#f6f6f6] px-3 py-1 text-xs font-semibold text-[#6f6f6f]">
                                            {product.category}
                                        </p>
                                        <h1 className="mt-5 text-[2.8rem] font-black tracking-[-0.06em] text-[#111111] sm:text-[4rem] lg:leading-[0.95]">
                                            {product.name}
                                        </h1>
                                        <p className="mt-3 text-sm font-semibold tracking-[0.12em] text-[#8b8b8b] uppercase">
                                            {product.sku}
                                        </p>
                                        <p className="mt-6 max-w-[36rem] text-base leading-8 text-[#666666] sm:text-lg">
                                            {product.description}
                                        </p>

                                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                            <article className="rounded-[1.5rem] border border-[#111111]/10 p-4">
                                                <p className="text-sm text-[#7a7a7a]">Harga</p>
                                                <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#111111]">
                                                    {formatRupiah(product.price)}
                                                </p>
                                            </article>
                                            <article className="rounded-[1.5rem] border border-[#111111]/10 p-4">
                                                <p className="text-sm text-[#7a7a7a]">Ketersediaan</p>
                                                <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#111111]">
                                                    {product.stock > 0 ? `${product.stock} stok` : 'Habis'}
                                                </p>
                                            </article>
                                            <article className="rounded-[1.5rem] border border-[#111111]/10 p-4">
                                                <p className="text-sm text-[#7a7a7a]">Akses</p>
                                                <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#111111]">Publik</p>
                                            </article>
                                        </div>

                                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                            <a
                                                href={getProductWhatsappUrl(product.name)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-black"
                                            >
                                                Pesan via WhatsApp
                                            </a>
                                            <Link
                                                href="/katalog"
                                                className="inline-flex items-center justify-center rounded-full border border-[#111111]/12 bg-white px-6 py-4 text-sm font-semibold text-[#111111] transition duration-200 hover:-translate-y-px hover:border-[#111111]/25"
                                            >
                                                Back to Shop
                                            </Link>
                                        </div>
                                    </div>
                                </section>

                                <section className="grid gap-6 lg:grid-cols-2">
                                    <article className="rounded-[1.8rem] bg-[#fafafa] p-6">
                                        <h2 className="text-[2rem] font-black tracking-[-0.05em] text-[#111111]">Detail produk</h2>
                                        <div className="mt-5 space-y-4">
                                            {product.details.map((detail) => (
                                                <div key={detail} className="rounded-[1.2rem] border border-[#111111]/8 bg-white px-4 py-4 text-sm leading-7 text-[#666666]">
                                                    {detail}
                                                </div>
                                            ))}
                                        </div>
                                    </article>

                                    <article className="rounded-[1.8rem] bg-[#fafafa] p-6">
                                        <h2 className="text-[2rem] font-black tracking-[-0.05em] text-[#111111]">Cara pemesanan</h2>
                                        <div className="mt-5 grid gap-4">
                                            {[
                                                'Klik tombol pesan melalui WhatsApp untuk memulai order.',
                                                'Sebutkan nama produk dan jumlah pesanan ke tim toko.',
                                                'Tim toko akan membantu konfirmasi stok, total harga, dan proses checkout.',
                                            ].map((step, index) => (
                                                <div key={step} className="flex gap-4">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-semibold text-white">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-sm leading-7 text-[#666666]">{step}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 rounded-[1.3rem] border border-[#111111]/8 bg-white px-5 py-5">
                                            <p className="text-sm font-semibold text-[#111111]">Lokasi toko</p>
                                            <p className="mt-2 text-sm leading-7 text-[#666666]">Jl. Kemang Raya No. 88, Jakarta Selatan</p>
                                            <a
                                                href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#111111] transition hover:text-black"
                                            >
                                                Buka lokasi toko
                                            </a>
                                        </div>
                                    </article>
                                </section>

                                <section className="pt-2">
                                    <div className="mb-5 flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#6f6f6f]">Produk lain</p>
                                            <h2 className="mt-2 text-[2.4rem] font-black tracking-[-0.05em] text-[#111111]">
                                                Lanjut lihat produk lainnya
                                            </h2>
                                        </div>
                                        <Link href="/katalog" className="hidden text-sm font-semibold text-[#6f6f6f] transition hover:text-[#111111] sm:inline-flex">
                                            Kembali ke katalog
                                        </Link>
                                    </div>

                                    <div className="grid gap-x-5 gap-y-9 md:grid-cols-2 xl:grid-cols-3">
                                        {relatedProducts.map((item, index) => (
                                            <ProductCard
                                                key={item.id}
                                                product={item}
                                                index={index + 20}
                                                detailHref={`/katalog/${item.id}`}
                                                onAddToCart={() => addToCart(item.id)}
                                                primaryHref={getProductWhatsappUrl(item.name)}
                                            />
                                        ))}
                                    </div>
                                </section>
                                <BlackCtaSection />
                                <PublicFooter />
                            </div>
                        ) : (
                            <section className="rounded-[1.8rem] border border-dashed border-[#111111]/12 bg-[#fafafa] px-6 py-10">
                                <div className="max-w-2xl">
                                    <p className="text-sm font-semibold text-[#6f6f6f]">Produk tidak tersedia</p>
                                    <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#111111] text-balance sm:text-5xl">
                                        Produk yang kamu buka tidak ditemukan di katalog publik.
                                    </h1>
                                    <p className="mt-4 text-base leading-8 text-[#666666]">
                                        Kembali ke katalog untuk melihat produk lain, atau hubungi toko lewat WhatsApp jika
                                        kamu ingin menanyakan ketersediaan item tertentu.
                                    </p>
                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href="/katalog"
                                            className="inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-black"
                                        >
                                            Back to Shop
                                        </Link>
                                        <a
                                            href="https://wa.me/6281284719284?text=Halo%20PayTo%2C%20saya%20ingin%20menanyakan%20produk%20yang%20tidak%20saya%20temukan."
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center rounded-full border border-[#111111]/12 bg-white px-6 py-4 text-sm font-semibold text-[#111111] transition duration-200 hover:-translate-y-px hover:border-[#111111]/25"
                                        >
                                            Tanya via WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </section>
                        )}
                </main>
            </PublicFrame>
        </>
    );
}
