import { useEffect, useMemo, useState } from 'react';

import { PUBLIC_PRODUCTS } from '../data/publicCatalogData';
import { publicCartStorageKey } from '../constants';
import type { PublicCartEntry, PublicCartLineItem } from '../types';
import type { PublicCatalogProduct } from '../data/publicCatalogData';

const MAX_CART_QUANTITY = 99;

function isPublicCartEntry(value: unknown): value is PublicCartEntry {
    if (!value || typeof value !== 'object') return false;
    const entry = value as Record<string, unknown>;
    return Number.isSafeInteger(entry.productId) && Number(entry.productId) > 0
        && Number.isSafeInteger(entry.quantity) && Number(entry.quantity) > 0
        && Number(entry.quantity) <= MAX_CART_QUANTITY;
}

export function usePublicCart(products: PublicCatalogProduct[] = PUBLIC_PRODUCTS) {
    const [cartEntries, setCartEntries] = useState<PublicCartEntry[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const savedCart = window.localStorage.getItem(publicCartStorageKey);

        if (savedCart) {
            try {
                const parsed: unknown = JSON.parse(savedCart);
                setCartEntries(Array.isArray(parsed) ? parsed.filter(isPublicCartEntry) : []);
            } catch {
                setCartEntries([]);
            }
        }

        setHasLoaded(true);
    }, []);

    useEffect(() => {
        if (!hasLoaded || typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(publicCartStorageKey, JSON.stringify(cartEntries));
    }, [cartEntries, hasLoaded]);

    const cartItems = useMemo(() => {
        return cartEntries
            .map((entry) => {
                const product = products.find((catalogProduct) => catalogProduct.id === entry.productId);

                if (!product) {
                    return null;
                }

                return {
                    product,
                    quantity: entry.quantity,
                };
            })
            .filter((entry): entry is PublicCartLineItem => entry !== null);
    }, [cartEntries, products]);

    function addToCart(productId: number): void {
        setCartEntries((currentEntries) => {
            const current = currentEntries.find((entry) => entry.productId === productId);

            if (current) {
                return currentEntries.map((entry) =>
                    entry.productId === productId
                        ? { ...entry, quantity: Math.min(entry.quantity + 1, MAX_CART_QUANTITY) }
                        : entry,
                );
            }

            return [...currentEntries, { productId, quantity: 1 }];
        });
    }

    function decreaseCartItem(productId: number): void {
        setCartEntries((currentEntries) =>
            currentEntries
                .map((entry) => (entry.productId === productId ? { ...entry, quantity: entry.quantity - 1 } : entry))
                .filter((entry) => entry.quantity > 0),
        );
    }

    function clearCart(): void {
        setCartEntries([]);
    }

    return {
        cartItems,
        addToCart,
        decreaseCartItem,
        clearCart,
    };
}
