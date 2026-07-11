import type { BusinessProfile } from './types';

export const storefrontShopSectionId = 'shop-products';
export const storefrontShopHref = `/#${storefrontShopSectionId}`;
export const publicCartStorageKey = 'payto-public-cart';

export const marketplaceItems = [
    { label: 'Shopee', dot: 'bg-[#f97316]' },
    { label: 'Tokopedia', dot: 'bg-[#22c55e]' },
    { label: 'Lazada', dot: 'bg-[#8b5cf6]' },
    { label: 'GoFood', dot: 'bg-[#ef4444]' },
] as const;

export function businessWhatsappUrl(business: BusinessProfile, message = `Halo ${business.name}, saya ingin memesan produk.`): string | null {
    if (!business.whatsapp_number) {
        return null;
    }

    return `https://wa.me/${business.whatsapp_number}?text=${encodeURIComponent(message)}`;
}
