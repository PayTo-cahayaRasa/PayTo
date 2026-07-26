import { Info, Minus, Package, Plus, ShoppingCart } from 'lucide-react';

import { formatRupiah } from '../data/publicCatalogData';
import type { ProductCardProps } from '../types';
import { ProductVisual } from './ProductVisual';

export function ProductCard({ product, quantity = 0, onAddToCart, onDecreaseCartItem }: ProductCardProps) {
    function handleAddToCart(): void {
        if (product.stock <= 0) return;

        onAddToCart?.();
    }

    return (
        <article className="overflow-hidden rounded-[1.2rem] border border-[#f0e4d4] bg-white shadow-[0_14px_30px_-24px_rgba(58,33,23,0.18)]">
            <button
                type="button"
                aria-label={`Tampilkan informasi ${product.name}`}
                aria-describedby={`product-description-${product.id}`}
                className="group relative block w-full px-2.5 pt-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c22]"
            >
                <ProductVisual product={product} />
                <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1.5 text-[0.7rem] font-semibold text-[#3a2117] shadow-sm backdrop-blur-sm">
                    <Info size={13} aria-hidden="true" />
                    Info
                </span>
                <span
                    id={`product-description-${product.id}`}
                    className="pointer-events-none absolute inset-x-2.5 bottom-0 top-2.5 flex flex-col justify-end rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(38,21,14,0.14),rgba(38,21,14,0.94))] p-4 text-white opacity-0 transition duration-200 group-hover:opacity-100 group-focus:opacity-100 motion-reduce:transition-none"
                >
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#ffd89b]">Deskripsi produk</span>
                    <span className="mt-1.5 line-clamp-4 text-sm leading-5 text-white/90">
                        {product.description || 'Deskripsi produk belum tersedia.'}
                    </span>
                </span>
            </button>
            <div className="px-3 pb-3 pt-3">
                <h3 className="font-display text-[1.15rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#3a2117] sm:text-[1.3rem]">
                    {product.name}
                </h3>
                <div className={`mt-1.5 flex items-center gap-1.5 text-[0.8rem] font-semibold ${product.stock > 0 ? 'text-[#7a654f]' : 'text-red-700'}`}>
                    <Package size={13} strokeWidth={1.9} aria-hidden="true" />
                    <span>{product.stock > 0 ? `${product.stock} tersedia` : 'Stok habis'}</span>
                </div>
                <div className="mt-2 flex min-h-[3.1rem] flex-col justify-start">
                    <p className="text-[1.15rem] font-semibold tracking-[-0.04em] text-[#3a2117] sm:text-[1.3rem]">{formatRupiah(product.finalPrice ?? product.price)}</p>
                    {(product.discount ?? 0) > 0 && (
                        <p className="text-xs font-semibold text-[#9b7860] line-through">{formatRupiah(product.price)}</p>
                    )}
                </div>
                <div className="mt-2.5">
                    {quantity > 0 ? (
                        <div className="flex min-h-[2.4rem] w-full items-center justify-between rounded-xl border border-[#e5d4bf] bg-[#fff7ea] p-1 text-[#3a2117]">
                            <button
                                type="button"
                                onClick={onDecreaseCartItem}
                                aria-label={`Kurangi ${product.name} dari keranjang`}
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-[#f0dfc7] focus-visible:outline-2 focus-visible:outline-[#9b5c22]"
                            >
                                <Minus size={15} strokeWidth={2} />
                            </button>
                            <span className="text-center text-xs font-semibold" aria-live="polite">
                                <strong className="block text-base leading-none">{quantity}</strong>
                                <span className="mt-0.5 block text-[0.65rem] text-[#896b52]">di keranjang</span>
                            </span>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={quantity >= product.stock}
                                aria-label={`Tambah ${product.name} ke keranjang`}
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-[#f0dfc7] focus-visible:outline-2 focus-visible:outline-[#9b5c22] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <Plus size={15} strokeWidth={2} />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className="inline-flex min-h-[2.4rem] w-full items-center justify-center gap-2 rounded-xl border border-[#eadfcf] bg-[#fff7ea] px-3 text-[0.8rem] font-semibold text-[#3a2117] transition duration-300 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            <ShoppingCart size={15} strokeWidth={1.9} aria-hidden="true" />
                            {product.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
