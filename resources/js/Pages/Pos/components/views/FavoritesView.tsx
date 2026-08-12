import React from 'react';
import { Star } from 'lucide-react';

import ProductCard from '../ProductCard';
import type { Product } from '../../types';

type FavoritesViewProps = {
    favorites: Product[];
    onAddToCart: (product: Product) => void;
    formatRupiah: (num: number) => string;
};

export default function FavoritesView({ favorites, onAddToCart, formatRupiah }: FavoritesViewProps) {
    return (
        <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar-light animate-in fade-in zoom-in-95 duration-300">
            {favorites.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {favorites.map((product) => (
                        <ProductCard key={product.id} product={product} onAdd={onAddToCart} formatRupiah={formatRupiah} />
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-cocoa-400">
                    <Star size={48} className="mb-4 opacity-20" />
                    <p>Belum ada item favorit.</p>
                </div>
            )}
        </div>
    );
}
