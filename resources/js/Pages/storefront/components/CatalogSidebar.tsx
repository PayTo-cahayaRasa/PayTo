import { CupSoda, Store, UtensilsCrossed, Wheat } from 'lucide-react';

import type { CatalogSidebarProps } from '../types';

const categoryIcons = {
    All: Store,
    Minuman: CupSoda,
    Makanan: UtensilsCrossed,
} as const;

export function CatalogSidebar({ categories, selectedCategory, onSelectCategory }: CatalogSidebarProps) {
    return (
        <aside className="rounded-[1.8rem] border border-[#f0e4d4] bg-[#fffdf9] p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {categories.map((category, index) => {
                    const Icon = categoryIcons[category.id as keyof typeof categoryIcons] ?? Wheat;
                    const isActive = selectedCategory === category.id;

                    return (
                        <button
                            type="button"
                            key={category.id}
                            onClick={onSelectCategory ? () => onSelectCategory(category.id) : undefined}
                            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[0.98rem] transition ${
                                isActive
                                    ? 'bg-[#fff0d7] font-semibold text-[#3a2117]'
                                    : 'font-medium text-[#5f5044] hover:bg-[#fff8ed]'
                            }`}
                        >
                            <Icon size={17} strokeWidth={1.8} className={isActive ? 'text-[#cd872d]' : 'text-[#7e7369]'} />
                            <span>{index === 0 ? 'Semua Produk' : category.label}</span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
