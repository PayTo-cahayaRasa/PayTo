export type StorefrontProduct = {
    id: number;
    slug: string;
    name: string;
    category: string;
    description: string;
    price: number;
    accent: string;
};

export const storefrontProducts: StorefrontProduct[] = [
    {
        id: 1,
        slug: 'single-origin-espresso',
        name: 'Single Origin Espresso',
        category: 'Kopi',
        description: 'Espresso pekat dengan aroma cokelat dan rasa akhir yang bersih.',
        price: 45000,
        accent: 'from-amber-500 to-orange-700',
    },
    {
        id: 2,
        slug: 'velvet-cappuccino',
        name: 'Velvet Cappuccino',
        category: 'Kopi Susu',
        description: 'Perpaduan espresso, susu hangat, dan foam lembut.',
        price: 52000,
        accent: 'from-indigo-500 to-violet-700',
    },
    {
        id: 3,
        slug: 'honey-almond-latte',
        name: 'Honey Almond Latte',
        category: 'Signature',
        description: 'Latte ringan dengan madu dan sentuhan almond.',
        price: 50000,
        accent: 'from-emerald-500 to-teal-700',
    },
];

export function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
