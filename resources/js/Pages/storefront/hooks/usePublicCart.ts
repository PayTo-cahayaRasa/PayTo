import { useEffect, useMemo, useState } from 'react';

import { PUBLIC_PRODUCTS } from '../data/publicCatalogData';
import { publicCartStorageKey } from '../constants';
import type { PublicCartEntry } from '../types';
import type { PublicCatalogProduct } from '../data/publicCatalogData';
import { addPublicCartEntry, parsePublicCart, resolvePublicCart } from './publicCartState';

export function usePublicCart(products: PublicCatalogProduct[] = PUBLIC_PRODUCTS) {
    const [cartEntries, setCartEntries] = useState<PublicCartEntry[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const savedCart = window.localStorage.getItem(publicCartStorageKey);

        setCartEntries(parsePublicCart(savedCart));

        setHasLoaded(true);
    }, []);

    useEffect(() => {
        if (!hasLoaded || typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(publicCartStorageKey, JSON.stringify(cartEntries));
    }, [cartEntries, hasLoaded]);

    const cartItems = useMemo(() => {
        return resolvePublicCart(cartEntries, products);
    }, [cartEntries, products]);

    function addToCart(productId: number): void {
        setCartEntries((currentEntries) => {
            const product = products.find((catalogProduct) => catalogProduct.id === productId);
            return product ? addPublicCartEntry(currentEntries, product) : currentEntries;
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
