import { Info, Package, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { formatRupiah } from '../data/publicCatalogData';
import type { ProductCardProps } from '../types';
import { ProductVisual } from './ProductVisual';

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [isAddConfirmed, setIsAddConfirmed] = useState(false);
    const addConfirmationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (addConfirmationTimerRef.current) {
                window.clearTimeout(addConfirmationTimerRef.current);
            }
        };
    }, []);

    function handleAddToCart(): void {
        if (product.stock <= 0) return;

        onAddToCart?.();
        setIsAddConfirmed(true);

        if (addConfirmationTimerRef.current) {
            window.clearTimeout(addConfirmationTimerRef.current);
        }

        addConfirmationTimerRef.current = window.setTimeout(() => {
            setIsAddConfirmed(false);
        }, 1300);
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
                <div className="mt-2">
                    <p className="text-[1.15rem] font-semibold tracking-[-0.04em] text-[#3a2117] sm:text-[1.3rem]">{formatRupiah(product.finalPrice ?? product.price)}</p>
                    {(product.discount ?? 0) > 0 && (
                        <p className="text-xs font-semibold text-[#9b7860] line-through">{formatRupiah(product.price)}</p>
                    )}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className={`inline-flex min-h-[2.4rem] flex-1 items-center justify-center rounded-xl border px-3 text-[0.8rem] font-semibold transition duration-300 ${
                            isAddConfirmed
                                ? 'border-[#f59a21] bg-[#f59a21] text-white shadow-[0_18px_30px_-22px_rgba(245,154,33,0.8)] scale-[1.02]'
                                : 'border-[#eadfcf] bg-[#fff7ea] text-[#3a2117]'
                        }`}
                    >
                        {product.stock <= 0 ? 'Stok Habis' : isAddConfirmed ? 'Berhasil Ditambahkan' : 'Tambah ke Keranjang'}
                    </button>
                    {product.stock > 0 && product.whatsappUrl && (
                        <a
                            href={product.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-xl bg-[#3a2117] text-white"
                            aria-label="Pesan via WhatsApp"
                        >
                            <ShoppingCart size={15} strokeWidth={1.9} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
