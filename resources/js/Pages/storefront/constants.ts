import type { BusinessProfile } from './types';

export const storefrontShopSectionId = 'shop-products';
export const storefrontShopHref = `/#${storefrontShopSectionId}`;
export const publicCartStorageKey = 'payto-public-cart';

export function normalizeWhatsappNumber(number: string | null | undefined): string | null {
    const digits = (number ?? '').replace(/\D/g, '');

    if (!/^\d{8,15}$/.test(digits)) {
        return null;
    }

    return digits;
}

export function buildWhatsappUrl(number: string | null | undefined, message: string): string | null {
    const normalizedNumber = normalizeWhatsappNumber(number);

    if (!normalizedNumber) {
        return null;
    }

    return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export function getProductWhatsappUrl(business: BusinessProfile, productName: string): string | null {
    return buildWhatsappUrl(business.whatsapp_number, `Halo ${business.name}, saya ingin memesan produk ${productName}.`);
}

export function getCheckoutWhatsappUrl(business: BusinessProfile, message: string): string | null {
    return buildWhatsappUrl(business.whatsapp_number, message);
}

export function businessWhatsappUrl(business: BusinessProfile, message = `Halo ${business.name}, saya ingin memesan produk.`): string | null {
    return buildWhatsappUrl(business.whatsapp_number, message);
}
