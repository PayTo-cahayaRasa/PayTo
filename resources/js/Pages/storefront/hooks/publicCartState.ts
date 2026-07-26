import type { PublicCatalogProduct } from '../data/publicCatalogData';
import type { PublicCartEntry, PublicCartLineItem } from '../types';

const MAX_CART_QUANTITY = 99;

function isPublicCartEntry(value: unknown): value is PublicCartEntry {
    if (!value || typeof value !== 'object') return false;
    const entry = value as Record<string, unknown>;
    return Number.isSafeInteger(entry.productId) && Number(entry.productId) > 0
        && Number.isSafeInteger(entry.quantity) && Number(entry.quantity) > 0
        && Number(entry.quantity) <= MAX_CART_QUANTITY;
}

export function parsePublicCart(value: string | null): PublicCartEntry[] {
    if (!value) return [];

    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(isPublicCartEntry) : [];
    } catch {
        return [];
    }
}

export function resolvePublicCart(entries: PublicCartEntry[], products: PublicCatalogProduct[]): PublicCartLineItem[] {
    return entries.flatMap((entry) => {
        const product = products.find((candidate) => candidate.id === entry.productId) ?? entry.product;
        return product ? [{ product, quantity: entry.quantity }] : [];
    });
}

export function addPublicCartEntry(entries: PublicCartEntry[], product: PublicCatalogProduct): PublicCartEntry[] {
    if (product.stock <= 0) return entries;

    const current = entries.find((entry) => entry.productId === product.id);
    if (current) {
        return entries.map((entry) => entry.productId === product.id
            ? { ...entry, quantity: Math.min(entry.quantity + 1, MAX_CART_QUANTITY, product.stock), product }
            : entry);
    }

    return [...entries, { productId: product.id, quantity: 1, product }];
}
