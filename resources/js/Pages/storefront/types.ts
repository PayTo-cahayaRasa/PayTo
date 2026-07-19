import type { ReactNode } from 'react';

import type { PublicCatalogProduct } from './data/publicCatalogData';

export type PublicFrameProps = {
    children: ReactNode;
};

export type BusinessProfile = {
    name: string;
    tagline?: string;
    address: string;
    whatsapp_number: string;
    operating_hours: string;
    instagram_url?: string;
    tiktok_url?: string;
};

export type PublicHeaderProps = {
    business: BusinessProfile;
    cartItems: PublicCartLineItem[];
    onIncreaseCartItem: (productId: number) => void;
    onDecreaseCartItem: (productId: number) => void;
    onClearCart: () => void;
};

export type HeroSectionProps = {
    business: BusinessProfile;
};

export type CatalogSidebarProps = {
    categories: Array<{ id: string; label: string }>;
    selectedCategory: string;
    onSelectCategory?: (categoryId: string) => void;
};

export type ProductCardProps = {
    product: PublicCatalogProduct;
    quantity?: number;
    onAddToCart?: () => void;
    onDecreaseCartItem?: () => void;
};

export type MinimalPaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export type PublicFooterProps = {
    business: BusinessProfile;
};

export type PublicCartEntry = {
    productId: number;
    quantity: number;
    product?: PublicCatalogProduct;
};

export type PublicCartLineItem = {
    product: PublicCatalogProduct;
    quantity: number;
};
