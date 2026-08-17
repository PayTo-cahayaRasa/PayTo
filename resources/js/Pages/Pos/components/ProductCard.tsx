import { Plus, Star, Tag } from 'lucide-react';

import type { Product } from '../types';

type ProductCardProps = {
    product: Product;
    onAdd: (product: Product) => void;
    formatRupiah: (num: number) => string;
};

export default function ProductCard({ product, onAdd, formatRupiah }: ProductCardProps) {
    const hasDiscount = (product.discount ?? 0) > 0;
    const discountPercent = product.discount ?? 0;
    const discountedPrice = hasDiscount
        ? product.price - (product.price * discountPercent) / 100
        : product.price;

    return (
        <div
            onClick={() => onAdd(product)}
            className={`group relative flex flex-col p-2.5 sm:p-3 rounded-2xl sm:rounded-[1.75rem] transition-all duration-300 cursor-pointer
		${product.stock === 0 ? 'opacity-60 grayscale' : 'hover:-translate-y-1 active:scale-[0.98]'}
		bg-white/30 hover:bg-white/60 backdrop-blur-sm border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
		`}
        >
            <div className={`aspect-square w-full rounded-xl sm:rounded-[1.25rem] mb-2 sm:mb-3 flex items-center justify-center relative overflow-hidden bg-linear-to-br ${product.imageColor || 'from-cocoa-200 to-cocoa-100'}`}>
                <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/20 to-white/0 opacity-50"></div>
                <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-sm relative z-10">
                    {product.category === 'Minuman' ? '🥤' : product.category === 'Dessert' ? '🍰' : '🍔'}
                </span>
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="absolute inset-0 z-10 h-full w-full object-contain p-2" /> : null}
                <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 z-20">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white/90 sm:bg-white rounded-full flex items-center justify-center shadow-md sm:shadow-lg text-snack-600">
                        <Plus size={16} strokeWidth={3} />
                    </div>
                </div>
                {product.isFavorite && (
                    <div className="absolute top-2 right-2 text-snack-400 drop-shadow-sm z-10">
                        <Star size={14} fill="currentColor" className="sm:w-[16px] sm:h-[16px]" />
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-cocoa-900/10 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <span className="bg-cocoa-800/90 text-white text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold shadow-lg">Habis</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col px-0.5 sm:px-1 gap-0.5 sm:gap-1">
                <h3 className="font-bold text-cocoa-700 text-xs sm:text-sm leading-snug line-clamp-2">{product.name}</h3>
                <span className="text-[10px] font-mono text-cocoa-400 -mt-0.5 flex items-center gap-1">
                    <Tag size={10} className="opacity-70" /> {product.sku}
                </span>
                <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-cocoa-800 text-xs sm:text-base font-mono truncate">
                            {formatRupiah(discountedPrice).replace(",00", "")}
                        </span>
                        {hasDiscount && (
                            <span className="text-[9px] sm:text-[10px] font-mono text-cocoa-400 line-through">
                                {formatRupiah(product.price).replace(",00", "")}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {hasDiscount && (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded-md border border-danger-200 bg-danger-50 text-danger-600">
                                -{discountPercent}%
                            </span>
                        )}
                        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${product.stock < 10
                            ? 'text-snack-600 bg-snack-50 border-snack-200'
                            : 'text-cocoa-700 bg-cocoa-100/70 border-cocoa-200/70'
                            }`}>
                            Stok: {product.stock}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
