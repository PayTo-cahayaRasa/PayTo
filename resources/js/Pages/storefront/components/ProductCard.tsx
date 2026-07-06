import { Link } from '@inertiajs/react';
import { ShoppingCart, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { formatRupiah, getProductWhatsappUrl } from '../data/publicCatalogData';
import type { ProductCardProps } from '../types';
import { ProductVisual } from './ProductVisual';

function reviewMeta(index: number) {
    const values = [
        { rating: '4.8', reviews: 423 },
        { rating: '4.9', reviews: 214 },
        { rating: '4.8', reviews: 309 },
        { rating: '4.7', reviews: 158 },
        { rating: '4.8', reviews: 415 },
        { rating: '4.9', reviews: 250 },
        { rating: '4.9', reviews: 197 },
        { rating: '4.9', reviews: 231 },
    ];

    return values[index % values.length];
}

export function ProductCard({ product, index, detailHref, onAddToCart }: ProductCardProps) {
    const review = reviewMeta(index);
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
            <Link href={detailHref} className="block px-2.5 pt-2.5">
                <ProductVisual product={product} index={index} />
            </Link>
            <div className="px-3 pb-3 pt-3">
                <Link href={detailHref} className="font-display text-[1.15rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#3a2117] sm:text-[1.3rem]">
                    {product.name}
                </Link>
                <div className="mt-1.5 flex items-center gap-1.5 text-[0.85rem] text-[#746557]">
                    <Star size={13} strokeWidth={1.9} className="fill-[#f59a21] text-[#f59a21]" />
                    <span className="font-semibold text-[#9a682e]">{review.rating}</span>
                    <span>({review.reviews})</span>
                </div>
                <p className="mt-2 text-[1.15rem] font-semibold tracking-[-0.04em] text-[#3a2117] sm:text-[1.3rem]">{formatRupiah(product.price)}</p>
                <div className="mt-2.5 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`inline-flex min-h-[2.4rem] flex-1 items-center justify-center rounded-[0.75rem] border px-3 text-[0.8rem] font-semibold transition duration-300 ${
                            isAddConfirmed
                                ? 'border-[#f59a21] bg-[#f59a21] text-white shadow-[0_18px_30px_-22px_rgba(245,154,33,0.8)] scale-[1.02]'
                                : 'border-[#eadfcf] bg-[#fff7ea] text-[#3a2117]'
                        }`}
                    >
                        {isAddConfirmed ? 'Berhasil Ditambahkan' : 'Tambah ke Keranjang'}
                    </button>
                    <a
                        href={getProductWhatsappUrl(product.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-[0.75rem] bg-[#3a2117] text-white"
                        aria-label="Pesan via WhatsApp"
                    >
                        <ShoppingCart size={15} strokeWidth={1.9} />
                    </a>
                </div>
            </div>
        </article>
    );
}
