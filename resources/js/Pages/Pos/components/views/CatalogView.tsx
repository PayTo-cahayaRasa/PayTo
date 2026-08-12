import React from 'react';

import ProductCard from '../ProductCard';
import type { Product } from '../../types';

type Category = {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
};

type CatalogViewProps = {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    products: Product[];
    onAddToCart: (product: Product) => void;
    formatRupiah: (num: number) => string;
};

export default function CatalogView({
    categories,
    selectedCategory,
    onSelectCategory,
    products,
    onAddToCart,
    formatRupiah,
}: CatalogViewProps) {
    return (
        <>
            <div className="shrink-0 overflow-x-auto no-scrollbar py-1">
                <div className="inline-flex p-1.5 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${selectedCategory === cat.id
                                ? 'bg-white shadow-md text-snack-600 scale-100'
                                : 'text-cocoa-500 hover:text-cocoa-700 hover:bg-white/40'
                                }`}
                        >
                            <cat.icon size={16} className={selectedCategory === cat.id ? 'stroke-[2.5px]' : ''} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar-light">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} onAdd={onAddToCart} formatRupiah={formatRupiah} />
                    ))}
                </div>
            </div>
        </>
    );
}
