export type PublicCatalogProduct = {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
    sku: string;
    description: string;
    details: string[];
    imageColor?: string;
};

export const PUBLIC_CATEGORIES = [
    { id: 'All', label: 'Semua' },
    { id: 'Minuman', label: 'Minuman' },
    { id: 'Makanan', label: 'Makanan' },
];

export const PUBLIC_PRODUCTS: PublicCatalogProduct[] = [
    {
        id: 1,
        name: 'Kopi Susu Aren',
        price: 18000,
        category: 'Minuman',
        stock: 45,
        sku: 'BV-001',
        description: 'Kopi susu dingin dengan espresso, susu segar, dan gula aren yang lembut untuk diminum kapan saja.',
        details: ['Disajikan dingin', 'Rasa manis seimbang', 'Cocok untuk daily order'],
        imageColor: 'from-amber-200 to-orange-100',
    },
    {
        id: 2,
        name: 'Americano Iced',
        price: 15000,
        category: 'Minuman',
        stock: 12,
        sku: 'BV-002',
        description: 'Americano dingin dengan karakter kopi yang ringan, bersih, dan cocok untuk pengunjung yang suka rasa bold tanpa susu.',
        details: ['Tanpa susu', 'Body ringan', 'Pilihan cepat untuk takeaway'],
        imageColor: 'from-stone-300 to-stone-100',
    },
    {
        id: 3,
        name: 'Croissant Butter',
        price: 22000,
        category: 'Makanan',
        stock: 5,
        sku: 'FD-001',
        description: 'Croissant berlapis dengan aroma butter yang hangat, renyah di luar, dan lembut di bagian dalam.',
        details: ['Fresh bake', 'Tekstur flaky', 'Cocok dipadukan dengan kopi'],
        imageColor: 'from-yellow-200 to-amber-100',
    },
    {
        id: 4,
        name: 'Spaghetti Carbonara',
        price: 35000,
        category: 'Makanan',
        stock: 8,
        sku: 'FD-002',
        description: 'Pasta carbonara dengan saus creamy, daging asap, dan taburan keju untuk pilihan makan yang lebih mengenyangkan.',
        details: ['Porsi reguler', 'Creamy dan gurih', 'Favorit menu makan siang'],
        imageColor: 'from-orange-200 to-red-100',
    },
    {
        id: 5,
        name: 'Mineral Water',
        price: 5000,
        category: 'Minuman',
        stock: 100,
        sku: 'BV-003',
        description: 'Air mineral botol untuk pendamping menu utama atau kebutuhan minuman sederhana yang selalu tersedia.',
        details: ['Botol dingin', 'Ready stock tinggi', 'Pilihan paling praktis'],
        imageColor: 'from-cyan-200 to-blue-100',
    },
    {
        id: 6,
        name: 'Red Velvet Cake',
        price: 28000,
        category: 'Makanan',
        stock: 0,
        sku: 'FD-003',
        description: 'Kue red velvet dengan cream cheese lembut dan rasa manis yang halus untuk pilihan dessert.',
        details: ['Layer cake', 'Cream cheese frosting', 'Saat ini sedang restock'],
        imageColor: 'from-rose-300 to-pink-100',
    },
    {
        id: 7,
        name: 'Matcha Latte',
        price: 24000,
        category: 'Minuman',
        stock: 15,
        sku: 'BV-004',
        description: 'Minuman matcha latte dengan rasa earthy yang lembut dan susu yang menenangkan, cocok untuk sore hari.',
        details: ['Disajikan dingin', 'Rasa matcha ringan', 'Pilihan non-coffee populer'],
        imageColor: 'from-emerald-200 to-green-100',
    },
    {
        id: 8,
        name: 'Beef Burger',
        price: 45000,
        category: 'Makanan',
        stock: 10,
        sku: 'FD-004',
        description: 'Burger daging sapi dengan roti lembut, saus gurih, dan isi yang padat untuk menu utama yang mengenyangkan.',
        details: ['Porsi besar', 'Daging sapi juicy', 'Cocok untuk makan siang'],
        imageColor: 'from-orange-300 to-amber-200',
    },
    {
        id: 9,
        name: 'Dimsum Ayam',
        price: 20000,
        category: 'Makanan',
        stock: 25,
        sku: 'FD-005',
        description: 'Dimsum ayam kukus dengan tekstur lembut dan rasa gurih ringan untuk menu snack atau teman ngobrol.',
        details: ['Isi 4 pcs', 'Disajikan hangat', 'Praktis untuk sharing'],
        imageColor: 'from-yellow-100 to-orange-50',
    },
    {
        id: 10,
        name: 'Ice Lychee Tea',
        price: 18000,
        category: 'Minuman',
        stock: 20,
        sku: 'BV-005',
        description: 'Teh dingin dengan aroma leci yang segar dan manis ringan, cocok untuk pilihan minuman yang ringan.',
        details: ['Aroma fruity', 'Disajikan dingin', 'Rasa segar untuk siang hari'],
        imageColor: 'from-red-100 to-rose-50',
    },
];

export function getPublicCatalogProduct(productId: number): PublicCatalogProduct | undefined {
    return PUBLIC_PRODUCTS.find((product) => product.id === productId);
}

export function getProductWhatsappUrl(productName: string): string {
    return `https://wa.me/6281284719284?text=${encodeURIComponent(`Halo PayTo, saya ingin memesan produk ${productName}.`)}`;
}

export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
