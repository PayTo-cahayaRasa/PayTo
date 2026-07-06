import type { ReactNode } from 'react';

import type { PublicCatalogProduct } from './data/publicCatalogData';

export type PublicFrameProps = {
    children: ReactNode;
};

export type PublicHeaderProps = {
    cartItems: PublicCartLineItem[];
    onIncreaseCartItem: (productId: number) => void;
    onDecreaseCartItem: (productId: number) => void;
    onClearCart: () => void;
};

export type HeroSectionProps = {
    heading: string;
};

export type CatalogSidebarProps = {
    categories: Array<{ id: string; label: string }>;
    selectedCategory: string;
    onSelectCategory?: (categoryId: string) => void;
};

export type ProductCardProps = {
    product: PublicCatalogProduct;
    index: number;
    detailHref: string;
    onAddToCart?: () => void;
};

export type MinimalPaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export type PublicCartEntry = {
    productId: number;
    quantity: number;
};

export type PublicCartLineItem = {
    product: PublicCatalogProduct;
    quantity: number;
};
