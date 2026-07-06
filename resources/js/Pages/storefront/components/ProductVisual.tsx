import type { PublicCatalogProduct } from '../data/publicCatalogData';

type ProductPileProps = {
    type: 'chips' | 'sticks' | 'dark' | 'drink';
};

function ProductPile({ type }: ProductPileProps) {
    if (type === 'sticks') {
        return (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
                <div className="relative h-20 w-44">
                    {Array.from({ length: 13 }).map((_, index) => (
                        <span
                            key={index}
                            className="absolute bottom-0 h-16 w-2 rounded-full bg-[#cf9344]"
                            style={{
                                left: `${14 + index * 9}px`,
                                transform: `rotate(${index % 2 === 0 ? 32 : -24}deg)`,
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'drink') {
        return (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
                <div className="relative h-28 w-24">
                    <div className="absolute bottom-4 left-1/2 h-22 w-16 -translate-x-1/2 rounded-[1.3rem_1.3rem_1rem_1rem] bg-[linear-gradient(180deg,#6e4229,#b97f47_58%,#f0d4a1_100%)] shadow-[0_26px_30px_-22px_rgba(58,33,23,0.55)]" />
                    <div className="absolute bottom-0 left-1/2 h-7 w-20 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,#f0bf74_0%,transparent_72%)] opacity-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
            <div className="relative h-24 w-44">
                {Array.from({ length: type === 'dark' ? 18 : 20 }).map((_, index) => (
                    <span
                        key={index}
                        className={`absolute rounded-full ${type === 'dark' ? 'bg-[#5d3b26]' : 'bg-[#ecad4f]'}`}
                        style={{
                            width: `${type === 'dark' ? 24 : 28}px`,
                            height: `${type === 'dark' ? 24 : 28}px`,
                            left: `${8 + (index % 6) * 23}px`,
                            bottom: `${Math.floor(index / 6) * 12}px`,
                            opacity: 0.92 - Math.floor(index / 6) * 0.08,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function ProductVisual({ product, index }: { product: PublicCatalogProduct; index: number }) {
    const visualType =
        product.category === 'Minuman'
            ? 'drink'
            : product.name.toLowerCase().includes('stik')
              ? 'sticks'
              : product.name.toLowerCase().includes('coklat')
                ? 'dark'
                : 'chips';

    if (product.imageUrl) {
        return (
            <div className="relative h-50 overflow-hidden rounded-[1.4rem] bg-[#f7ead4]">
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
            </div>
        );
    }

    return (
        <div className="relative h-50 overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_top_left,#fff9f1_0%,#f7ead4_55%,#f2dfbd_100%)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent_46%)]" />
            <div className="absolute left-1/2 top-3 h-38 w-26 -translate-x-1/2 rounded-[1.3rem_1.3rem_0.85rem_0.85rem] bg-[linear-gradient(180deg,#d89b4f_0%,#c17c36_45%,#d39549_100%)] shadow-[0_18px_28px_-15px_rgba(58,33,23,0.45)]" />
            <div className="absolute left-1/2 top-6 h-[7.2rem] w-[5.2rem] -translate-x-1/2 rounded-[1.05rem_1.05rem_0.65rem_0.65rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.02))] border border-white/30" />
            <div className="absolute left-1/2 top-[3.7rem] flex h-[2.7rem] w-12 -translate-x-1/2 flex-col items-center justify-center rounded-xl bg-[#f7d8a6] px-1.5 text-center shadow-[0_8px_15px_-10px_rgba(58,33,23,0.45)]">
                <span className="font-display text-[0.62rem] font-semibold leading-none tracking-[-0.03em] text-[#7f4b28]">PayTo</span>
                <span className="mt-0.5 text-[0.36rem] font-semibold uppercase tracking-[0.18em] text-[#9a6a37]">Daily</span>
            </div>
            <ProductPile type={visualType} />
            <div className="absolute inset-x-3 bottom-2 h-8 rounded-[50%] bg-[radial-gradient(circle,rgba(226,171,92,0.55)_0%,transparent_72%)] blur-[2px]" />
        </div>
    );
}
