import assert from 'node:assert/strict';
import test from 'node:test';

import type { PublicCatalogProduct } from '../data/publicCatalogData.ts';
import { addPublicCartEntry, parsePublicCart, resolvePublicCart } from './publicCartState.ts';

const firstProduct: PublicCatalogProduct = {
    id: 1,
    name: 'Produk Halaman Satu',
    price: 20000,
    finalPrice: 18000,
    stock: 10,
    sku: 'PAGE-1',
    description: 'Produk pertama',
};
const secondProduct: PublicCatalogProduct = {
    id: 2,
    name: 'Produk Halaman Dua',
    price: 30000,
    stock: 5,
    sku: 'PAGE-2',
    description: 'Produk kedua',
};

test('legacy localStorage entries remain readable', () => {
    const entries = parsePublicCart(JSON.stringify([{ productId: 1, quantity: 2 }]));

    assert.deepEqual(entries, [{ productId: 1, quantity: 2 }]);
    assert.deepEqual(resolvePublicCart(entries, [firstProduct]), [{ product: firstProduct, quantity: 2 }]);
});

test('product snapshots keep cart items visible across pagination', () => {
    const firstPageCart = addPublicCartEntry([], firstProduct);
    const secondPageCart = addPublicCartEntry(firstPageCart, secondProduct);
    const restored = parsePublicCart(JSON.stringify(secondPageCart));

    assert.deepEqual(resolvePublicCart(restored, [secondProduct]), [
        { product: firstProduct, quantity: 1 },
        { product: secondProduct, quantity: 1 },
    ]);
});

test('invalid and corrupt localStorage values are discarded', () => {
    assert.deepEqual(parsePublicCart('{invalid'), []);
    assert.deepEqual(parsePublicCart(JSON.stringify([
        { productId: 0, quantity: 1 },
        { productId: 1, quantity: 100 },
        { productId: 1, quantity: 1 },
    ])), [{ productId: 1, quantity: 1 }]);
});

test('cart quantity is capped at 99', () => {
    const entries = [{ productId: firstProduct.id, quantity: 99, product: firstProduct }];
    assert.equal(addPublicCartEntry(entries, firstProduct)[0].quantity, 99);
});
