import { useEffect, useMemo, useState } from 'react';

import { PUBLIC_PRODUCTS } from '../data/publicCatalogData';
import { publicCartStorageKey } from '../constants';
import type { PublicCartEntry, PublicCartLineItem } from '../types';

export function usePublicCart() {
    const [cartEntries, setCartEntries] = useState<PublicCartEntry[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const savedCart = window.localStorage.getItem(publicCartStorageKey);

        if (savedCart) {
            try {
                setCartEntries(JSON.parse(savedCart) as PublicCartEntry[]);
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
                const product = PUBLIC_PRODUCTS.find((catalogProduct) => catalogProduct.id === entry.productId);

                if (!product) {
                    return null;
                }

                return {
                    product,
                    quantity: entry.quantity,
                };
            })
            .filter((entry): entry is PublicCartLineItem => entry !== null);
    }, [cartEntries]);

    function addToCart(productId: number): void {
        setCartEntries((currentEntries) => {
            const current = currentEntries.find((entry) => entry.productId === productId);

            if (current) {
                return currentEntries.map((entry) =>
                    entry.productId === productId ? { ...entry, quantity: entry.quantity + 1 } : entry,
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
