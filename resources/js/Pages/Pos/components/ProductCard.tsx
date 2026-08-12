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
            className={`group relative flex flex-col p-3 rounded-[1.75rem] transition-all duration-300 cursor-pointer
		${product.stock === 0 ? 'opacity-60 grayscale' : 'hover:-translate-y-1'}
		bg-white/20 hover:bg-white/60 backdrop-blur-sm border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
		`}
        >
            <div className={`aspect-square w-full rounded-[1.25rem] mb-3 flex items-center justify-center relative overflow-hidden bg-linear-to-br ${product.imageColor || 'from-cocoa-200 to-cocoa-100'}`}>
                <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/20 to-white/0 opacity-50"></div>
                <span className="text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-sm relative z-10">
                    {product.category === 'Minuman' ? 'ðŸ¥¤' : product.category === 'Dessert' ? 'ðŸ°' : 'ðŸ”'}
                </span>
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="absolute inset-0 z-10 h-full w-full object-contain p-2" /> : null}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg text-snack-600">
                        <Plus size={18} strokeWidth={3} />
                    </div>
                </div>
                {product.isFavorite && (
                    <div className="absolute top-2 right-2 text-snack-400 drop-shadow-sm z-10">
                        <Star size={16} fill="currentColor" />
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-cocoa-900/10 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <span className="bg-cocoa-800/90 text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-lg">Habis</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col px-1 gap-1">
                <h3 className="font-bold text-cocoa-700 text-sm leading-snug line-clamp-2">{product.name}</h3>
                <span className="text-[10px] font-mono text-cocoa-400 -mt-0.5 flex items-center gap-1">
                    <Tag size={10} className="opacity-70" /> {product.sku}
                </span>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                        <span className="font-bold text-cocoa-800 text-base font-mono">
                            {formatRupiah(discountedPrice).replace(",00", "")}
                        </span>
                        {hasDiscount && (
                            <span className="text-[10px] font-mono text-cocoa-400 line-through">
                                {formatRupiah(product.price).replace(",00", "")}
                            </span>
                        )}
                    </div>
                    {hasDiscount && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-danger-200 bg-danger-50 text-danger-600">
                            -{discountPercent}%
                        </span>
                    )}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border backdrop-blur-sm ${product.stock < 10
                        ? 'text-snack-600 bg-snack-50/50 border-snack-200/50'
                        : 'text-cocoa-400 bg-white/50 border-white/50'
                        }`}>
                        {product.stock}
                    </span>
                </div>
            </div>
        </div>
    );
}
