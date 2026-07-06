import { Link } from '@inertiajs/react';
import {
    Check,
    CupSoda,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Heart,
    Leaf,
    Facebook,
    Instagram,
    Medal,
    Mail,
    MapPin,
    Menu,
    MessageCircle,
    Send,
    ShoppingCart,
    Star,
    Store,
    Trash2,
    UtensilsCrossed,
    UserRound,
    Wheat,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { PUBLIC_PRODUCTS, formatRupiah, getProductWhatsappUrl, type PublicCatalogProduct } from './publicCatalogData';

export const whatsappUrl = 'https://wa.me/6281284719284?text=Halo%20PayTo%2C%20saya%20ingin%20memesan%20produk.';
export const storefrontShopSectionId = 'shop-products';
export const storefrontShopHref = `/#${storefrontShopSectionId}`;

const publicCartStorageKey = 'payto-public-cart';

const categoryIcons = {
    All: Store,
    Minuman: CupSoda,
    Makanan: UtensilsCrossed,
} as const;

const marketplaceItems = [
    { label: 'Shopee', dot: 'bg-[#f97316]' },
    { label: 'Tokopedia', dot: 'bg-[#22c55e]' },
    { label: 'Lazada', dot: 'bg-[#8b5cf6]' },
    { label: 'GoFood', dot: 'bg-[#ef4444]' },
] as const;

type PublicFrameProps = {
    children: ReactNode;
};

type PublicHeaderProps = {
    cartItems: PublicCartLineItem[];
    onIncreaseCartItem: (productId: number) => void;
    onDecreaseCartItem: (productId: number) => void;
    onClearCart: () => void;
};

type HeroSectionProps = {
    badgeLabel: string;
    heading: string;
    description: string;
};

type CatalogSidebarProps = {
    categories: Array<{ id: string; label: string }>;
    selectedCategory: string;
    onSelectCategory?: (categoryId: string) => void;
};

type ProductCardProps = {
    product: PublicCatalogProduct;
    index: number;
    detailHref: string;
    onAddToCart?: () => void;
};

type MinimalPaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

type PublicCartEntry = {
    productId: number;
    quantity: number;
};

export type PublicCartLineItem = {
    product: PublicCatalogProduct;
    quantity: number;
};

function SunBadgeIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10">
            <circle cx="24" cy="24" r="11" fill="#f59a21" />
            <circle cx="24" cy="24" r="7.8" fill="#fbd56a" />
            <path
                d="M24 4v7M24 37v7M4 24h7M37 24h7M10.6 10.6l4.9 4.9M32.5 32.5l4.9 4.9M37.4 10.6l-4.9 4.9M15.5 32.5l-4.9 4.9"
                stroke="#f59a21"
                strokeWidth="2.6"
                strokeLinecap="round"
            />
            <path d="M9 30c10-1 18-6 26-15" stroke="#f59a21" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
    );
}

function BrandMark() {
    return (
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7ed] sm:h-11 sm:w-11">
                <SunBadgeIcon />
            </div>
            <span className="truncate font-display text-[1.45rem] font-semibold leading-none tracking-[-0.04em] text-[#3a2117] sm:text-[2rem]">
                PayTo
            </span>
        </div>
    );
}

function HeaderIconButton({
    badge,
    ariaLabel,
    children,
    className,
    onClick,
}: {
    badge?: string;
    ariaLabel: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
            className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfcf] bg-[#fffaf4] text-[#3a2117] transition duration-200 hover:-translate-y-px hover:bg-white sm:h-11 sm:w-11 ${className ?? ''}`}
        >
            {badge ? (
                <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[#f59a21] px-1 text-[10px] font-semibold leading-4 text-white">
                    {badge}
                </span>
            ) : null}
            {children}
        </button>
    );
}

function HeroLandscape() {
    return (
        <svg aria-hidden="true" viewBox="0 0 1200 340" className="h-full w-full opacity-60" fill="none">
            <path
                d="M0 272C82 243 148 211 238 210C343 208 400 273 494 275C589 276 661 215 759 212C876 208 984 275 1200 248V340H0V272Z"
                fill="#efd9ae"
                opacity="0.58"
            />
            <path
                d="M0 300C102 265 171 244 273 247C361 250 437 304 514 301C617 297 694 235 798 236C922 238 1047 308 1200 286V340H0V300Z"
                fill="#e8cb96"
                opacity="0.38"
            />
            <path d="M48 304 156 197 248 304" stroke="#ddb97e" strokeWidth="4" strokeLinejoin="round" opacity="0.52" />
            <path d="M160 304 217 246 286 304" stroke="#ddb97e" strokeWidth="4" strokeLinejoin="round" opacity="0.48" />
            <path d="M776 304v-66l43-33 45 33v66" stroke="#d8b272" strokeWidth="4" strokeLinejoin="round" opacity="0.5" />
            <path d="M848 304v-84l56-41 60 41v84" stroke="#cfaa6a" strokeWidth="4" strokeLinejoin="round" opacity="0.54" />
            <path d="M948 304v-70l46-35 50 35v70" stroke="#cfaa6a" strokeWidth="4" strokeLinejoin="round" opacity="0.4" />
            <path d="M865 179v-26l38-27 41 27v26" stroke="#cfaa6a" strokeWidth="4" strokeLinejoin="round" opacity="0.42" />
            <path d="M790 233v-18l28-22 28 22v18" stroke="#d8b272" strokeWidth="4" strokeLinejoin="round" opacity="0.42" />
        </svg>
    );
}

function HeroClouds() {
    return (
        <svg aria-hidden="true" viewBox="0 0 220 90" className="absolute left-[40%] top-[3.5rem] h-14 w-32 opacity-30 sm:left-[42%] sm:top-[4.25rem] sm:h-20 sm:w-48 sm:opacity-40" fill="none">
            <path
                d="M27 60c0-13 10-23 23-23 5 0 9 1 13 4 4-10 14-17 26-17 15 0 28 11 30 25 3-2 7-3 11-3 12 0 22 10 22 22H27v-8Z"
                fill="#efd9ae"
            />
        </svg>
    );
}

function HeroDecorBackdrop() {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.92),transparent_24%),linear-gradient(180deg,#fffaf3_0%,#fdf3e5_65%,#f7e7cc_100%)]" />
            <div className="absolute inset-x-0 bottom-[-3.5rem] h-[24rem] opacity-90">
                <HeroLandscape />
            </div>
            <div className="absolute inset-y-0 left-0 w-32 bg-[linear-gradient(90deg,#fef8ef_0%,rgba(254,248,239,0.78)_36%,rgba(254,248,239,0)_100%)] sm:w-40 lg:w-52" />
            <div className="absolute inset-y-0 right-0 w-32 bg-[linear-gradient(270deg,#f8ebd5_0%,rgba(248,235,213,0.78)_36%,rgba(248,235,213,0)_100%)] sm:w-40 lg:w-52" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,250,243,0.96)_0%,rgba(255,250,243,0.55)_55%,rgba(255,250,243,0)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(247,231,204,0)_0%,rgba(250,239,221,0.68)_45%,#fbf3e7_78%,#fdf6ec_100%)]" />
            <div className="absolute inset-x-[10%] bottom-[5.5rem] h-24 rounded-[50%] bg-[radial-gradient(circle,rgba(229,198,145,0.18)_0%,rgba(229,198,145,0.08)_42%,transparent_76%)] blur-2xl" />
        </div>
    );
}

function Sparkle({ className }: { className: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 2v20M2 12h20" stroke="#f2b649" strokeWidth="1.8" strokeLinecap="round" />
            <path d="m4.8 4.8 14.4 14.4M19.2 4.8 4.8 19.2" stroke="#f2b649" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        </svg>
    );
}

function LeafBranch({ className, mirrored = false }: { className: string; mirrored?: boolean }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 90 220"
            className={`${className} ${mirrored ? '-scale-x-100' : ''}`}
            fill="none"
        >
            <path d="M25 205C35 146 48 90 76 26" stroke="#d9ab67" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M33 170c18-2 26-12 32-27-18 1-27 10-32 27Z" fill="#e5be79" />
            <path d="M44 136c18-2 26-12 31-28-18 2-27 11-31 28Z" fill="#e1b26a" />
            <path d="M54 98c16-2 23-11 28-25-16 2-24 10-28 25Z" fill="#d7a25a" />
            <path d="M22 145c13 2 22 9 27 22-15-1-23-8-27-22Z" fill="#ecc788" />
            <path d="M15 110c12 2 20 8 25 20-14-1-21-8-25-20Z" fill="#eac17f" />
        </svg>
    );
}

function HeroBadgeArtwork() {
    return (
        <div className="relative mx-auto h-[18.5rem] w-[18.5rem] sm:h-[24rem] sm:w-[24rem] lg:h-[31rem] lg:w-[31rem]">
            <div className="absolute inset-2 rounded-full bg-[radial-gradient(circle,#fffaf1_0%,rgba(253,246,236,0.75)_48%,rgba(245,208,146,0.5)_82%,transparent_100%)]" />
            <div className="absolute inset-[1rem] rounded-full border border-dashed border-[#edbe77] sm:inset-[1.25rem] lg:inset-[1.55rem]" />
            <div className="absolute left-[0.65rem] top-[5rem] sm:left-[1.1rem] sm:top-[6.8rem] lg:left-[1.8rem] lg:top-[8.6rem]">
                <LeafBranch className="h-28 w-14 sm:h-36 sm:w-16 lg:h-44 lg:w-20" />
            </div>
            <div className="absolute right-[0.75rem] top-[2.6rem] sm:right-[1.2rem] sm:top-[3.7rem] lg:right-[1.8rem] lg:top-[4.5rem]">
                <LeafBranch className="h-32 w-16 sm:h-40 sm:w-20 lg:h-52 lg:w-24" mirrored />
            </div>
            <Sparkle className="absolute left-[1.8rem] top-[4.2rem] h-7 w-7 sm:left-[2.2rem] sm:top-[5.4rem] sm:h-8 sm:w-8 lg:left-[3.1rem] lg:top-[6.9rem] lg:h-10 lg:w-10" />
            <Sparkle className="absolute right-[3rem] top-[5.2rem] h-6 w-6 sm:right-[3.8rem] sm:top-[6.7rem] sm:h-7 sm:w-7 lg:right-[4.9rem] lg:top-[8.7rem] lg:h-8 lg:w-8" />
            <Sparkle className="absolute left-[5.9rem] bottom-[2.3rem] h-5 w-5 sm:left-[7.4rem] sm:bottom-[3rem] sm:h-6 sm:w-6 lg:left-[9.7rem] lg:bottom-[4.7rem] lg:h-7 lg:w-7" />
            <div className="absolute left-1/2 top-[3.4rem] h-5 w-18 -translate-x-1/2 rounded-t-full border-t-[2px] border-dotted border-[#6a3a1c] opacity-70 sm:top-[4.2rem] sm:h-6 sm:w-24 lg:top-[5.45rem] lg:h-7 lg:w-32 lg:border-t-[3px]" />
            <div className="absolute left-1/2 top-[3.15rem] flex -translate-x-1/2 gap-1 sm:top-[3.85rem] sm:gap-1.5 lg:top-[5rem]">
                {Array.from({ length: 10 }).map((_, index) => (
                    <span key={index} className="h-1 w-1 rounded-full bg-[#fff6dd] shadow-[0_0_8px_rgba(255,246,221,0.9)] sm:h-1.5 sm:w-1.5" />
                ))}
            </div>
            <div className="absolute inset-[2.6rem] flex items-center justify-center rounded-full border-[4px] border-[#3a2117] bg-[radial-gradient(circle_at_35%_35%,#fee78d_0%,#f9d650_35%,#f4c42e_100%)] shadow-[0_28px_60px_-24px_rgba(58,33,23,0.48)] sm:inset-[3.2rem] lg:inset-[4.25rem] lg:border-[6px]">
                <div className="absolute inset-[0.55rem] rounded-full border-[1.5px] border-[#3a2117] sm:inset-[0.75rem] lg:inset-[0.9rem] lg:border-[2px]" />
                <div className="text-center text-[#3a2117]">
                    <p className="font-display text-[4.2rem] font-bold leading-none tracking-[-0.08em] sm:text-[5.7rem] lg:text-[7.75rem]">CR</p>
                    <p className="mt-1 font-display text-[1.2rem] font-semibold italic tracking-[-0.05em] sm:text-[1.55rem] lg:mt-2 lg:text-[2.2rem]">Cahaya Rasa</p>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({
    title,
    subtitle,
    icon,
}: {
    title: string;
    subtitle: string;
    icon: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-[#3a2117] sm:h-7 sm:w-7">
                {icon}
            </span>
            <div>
                <p className="text-[0.95rem] font-semibold leading-5 text-[#3a2117] sm:text-[0.98rem]">{title}</p>
                <p className="text-[0.95rem] font-medium leading-5 text-[#3a2117] sm:text-[0.98rem]">{subtitle}</p>
            </div>
        </div>
    );
}

function ProductPile({ type }: { type: 'chips' | 'sticks' | 'dark' | 'drink' }) {
    if (type === 'sticks') {
        return (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
                <div className="relative h-20 w-44">
                    {Array.from({ length: 13 }).map((_, index) => (
                        <span
                            key={index}
                            className="absolute bottom-0 h-16 w-2 rounded-full bg-[#cf9344]"
                            style={{
                                left: `${14 + index * 9}px`,
                                transform: `rotate(${index % 2 === 0 ? 32 : -24}deg)`,
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'drink') {
        return (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
                <div className="relative h-28 w-24">
                    <div className="absolute bottom-4 left-1/2 h-22 w-16 -translate-x-1/2 rounded-[1.3rem_1.3rem_1rem_1rem] bg-[linear-gradient(180deg,#6e4229,#b97f47_58%,#f0d4a1_100%)] shadow-[0_26px_30px_-22px_rgba(58,33,23,0.55)]" />
                    <div className="absolute bottom-0 left-1/2 h-7 w-20 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,#f0bf74_0%,transparent_72%)] opacity-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
            <div className="relative h-24 w-44">
                {Array.from({ length: type === 'dark' ? 18 : 20 }).map((_, index) => (
                    <span
                        key={index}
                        className={`absolute rounded-full ${type === 'dark' ? 'bg-[#5d3b26]' : 'bg-[#ecad4f]'}`}
                        style={{
                            width: `${type === 'dark' ? 24 : 28}px`,
                            height: `${type === 'dark' ? 24 : 28}px`,
                            left: `${8 + (index % 6) * 23}px`,
                            bottom: `${Math.floor(index / 6) * 12}px`,
                            opacity: 0.92 - Math.floor(index / 6) * 0.08,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function ProductVisual({ product, index }: { product: PublicCatalogProduct; index: number }) {
    const visualType =
        product.category === 'Minuman'
            ? 'drink'
            : product.name.toLowerCase().includes('stik')
              ? 'sticks'
              : product.name.toLowerCase().includes('coklat')
                ? 'dark'
                : 'chips';

    return (
        <div className="relative h-[14.7rem] overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_top_left,#fff9f1_0%,#f7ead4_55%,#f2dfbd_100%)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent_46%)]" />
            <div className="absolute left-1/2 top-4 h-[11.1rem] w-[7.7rem] -translate-x-1/2 rounded-[1.55rem_1.55rem_1rem_1rem] bg-[linear-gradient(180deg,#d89b4f_0%,#c17c36_45%,#d39549_100%)] shadow-[0_22px_34px_-18px_rgba(58,33,23,0.45)]" />
            <div className="absolute left-1/2 top-8 h-[8.4rem] w-[6.2rem] -translate-x-1/2 rounded-[1.25rem_1.25rem_0.75rem_0.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.02))] border border-white/30" />
            <div className="absolute left-1/2 top-[4.35rem] flex h-[3.2rem] w-[3.55rem] -translate-x-1/2 flex-col items-center justify-center rounded-[0.9rem] bg-[#f7d8a6] px-1.5 text-center shadow-[0_10px_18px_-12px_rgba(58,33,23,0.45)]">
                <span className="font-display text-[0.72rem] font-semibold leading-none tracking-[-0.03em] text-[#7f4b28]">PayTo</span>
                <span className="mt-0.5 text-[0.42rem] font-semibold uppercase tracking-[0.18em] text-[#9a6a37]">Daily</span>
            </div>
            <ProductPile type={visualType} />
            <div className="absolute inset-x-3 bottom-2 h-10 rounded-[50%] bg-[radial-gradient(circle,rgba(226,171,92,0.55)_0%,transparent_72%)] blur-[2px]" />
        </div>
    );
}

function reviewMeta(index: number) {
    const values = [
        { rating: '4.8', reviews: 423 },
        { rating: '4.9', reviews: 214 },
        { rating: '4.8', reviews: 309 },
        { rating: '4.7', reviews: 158 },
        { rating: '4.8', reviews: 415 },
        { rating: '4.9', reviews: 250 },
        { rating: '4.9', reviews: 197 },
        { rating: '4.9', reviews: 231 },
    ];

    return values[index % values.length];
}

export function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#3a2117] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
            Langsung ke konten
        </a>
    );
}

export function PublicFrame({ children }: PublicFrameProps) {
    return (
        <div className="min-h-dvh bg-[#fdf6ec] font-sans text-[#3a2117] selection:bg-[#f59a21] selection:text-white">
            <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_28%),linear-gradient(180deg,#fffaf3_0%,#fdf6ec_34%,#f9efdf_100%)]">
                {children}
            </div>
        </div>
    );
}

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

export function PublicHeader({ cartItems, onIncreaseCartItem, onDecreaseCartItem, onClearCart }: PublicHeaderProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const cartRef = useRef<HTMLDivElement | null>(null);
    const previousCartItemsCountRef = useRef<number | null>(null);
    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent): void {
            if (!cartRef.current?.contains(event.target as Node)) {
                setIsCartOpen(false);
            }
        }

        if (isCartOpen) {
            window.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCartOpen]);

    useEffect(() => {
        if (previousCartItemsCountRef.current !== null && totalCartItems > previousCartItemsCountRef.current) {
            setIsCartBumping(true);

            const timer = window.setTimeout(() => {
                setIsCartBumping(false);
            }, 420);

            previousCartItemsCountRef.current = totalCartItems;

            return () => {
                window.clearTimeout(timer);
            };
        }

        previousCartItemsCountRef.current = totalCartItems;
    }, [totalCartItems]);

    return (
        <header className="px-4 pt-5 sm:px-5 lg:px-8">
            <nav className="mx-auto flex min-h-[4.25rem] max-w-[1848px] items-center justify-between gap-3 rounded-[2rem] border border-[#f1e6d7] bg-[#fffdf9] px-3 py-2 shadow-[0_24px_48px_-36px_rgba(58,33,23,0.25)] sm:h-[4.5rem] sm:px-7 sm:py-0 lg:px-8">
                <BrandMark />

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <div ref={cartRef} className="relative">
                        <HeaderIconButton
                            ariaLabel="Keranjang"
                            badge={totalCartItems > 0 ? String(totalCartItems) : undefined}
                            className={isCartBumping ? 'scale-110 border-[#f59a21] bg-[#fff3df] shadow-[0_16px_28px_-18px_rgba(245,154,33,0.75)]' : ''}
                            onClick={() => setIsCartOpen((current) => !current)}
                        >
                            <ShoppingCart size={19} strokeWidth={1.9} />
                        </HeaderIconButton>
                        {isCartOpen ? (
                            <div className="absolute right-0 top-14 z-40 w-[22rem] rounded-[1.7rem] border border-[#eadfcf] bg-[#fffaf4] p-4 shadow-[0_26px_44px_-24px_rgba(58,33,23,0.3)]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#aa7b52]">Keranjang</p>
                                        <p className="mt-1 font-display text-[1.7rem] font-semibold tracking-[-0.04em] text-[#3a2117]">
                                            {totalCartItems > 0 ? `${totalCartItems} item` : 'Masih kosong'}
                                        </p>
                                    </div>
                                    {totalCartItems > 0 ? (
                                        <button
                                            type="button"
                                            onClick={onClearCart}
                                            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#eadfcf] bg-[#fff7ea] px-3.5 text-xs font-semibold text-[#8d6b4e] transition hover:-translate-y-px hover:border-[#e0c4a1] hover:text-[#3a2117]"
                                        >
                                            <Trash2 size={14} strokeWidth={1.9} />
                                            <span>Kosongkan</span>
                                        </button>
                                    ) : null}
                                </div>
                                {totalCartItems > 0 ? (
                                    <>
                                        <div className="mt-4 max-h-[19.5rem] space-y-3 overflow-y-auto pr-1 lg:max-h-[32.5rem]">
                                            {cartItems.map((item) => (
                                                <div key={item.product.id} className="rounded-[1.25rem] border border-[#f0e4d4] bg-white px-4 py-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-semibold text-[#3a2117]">{item.product.name}</p>
                                                            <p className="mt-1 text-sm text-[#8d6b4e]">{formatRupiah(item.product.price)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => onDecreaseCartItem(item.product.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#eadfcf] text-sm">
                                                                -
                                                            </button>
                                                            <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                                                            <button type="button" onClick={() => onIncreaseCartItem(item.product.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#eadfcf] text-sm">
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 rounded-[1.25rem] bg-[#fbf3e7] px-4 py-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#8d6b4e]">Subtotal</span>
                                                <span className="font-semibold text-[#3a2117]">{formatRupiah(cartTotal)}</span>
                                            </div>
                                            <a
                                                href={whatsappUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#25d366] px-4 text-sm font-semibold text-white"
                                            >
                                                Checkout via WhatsApp
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mt-4 text-sm leading-7 text-[#8d6b4e]">
                                        Tambahkan produk terlebih dahulu untuk melanjutkan order PayTo.
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>
                    <HeaderIconButton ariaLabel="Akun">
                        <UserRound size={19} strokeWidth={1.9} />
                    </HeaderIconButton>
                    <HeaderIconButton ariaLabel="Menu">
                        <Menu size={19} strokeWidth={1.9} />
                    </HeaderIconButton>
                </div>
            </nav>
        </header>
    );
}

export function HeroSection({ badgeLabel, heading, description }: HeroSectionProps) {
    return (
        <section className="overflow-x-clip px-4 pb-3 pt-5 sm:px-5 lg:px-8">
            <div className="relative mx-auto max-w-[1848px] overflow-hidden rounded-[2.5rem] px-5 pb-14 pt-8 shadow-[0_30px_65px_-46px_rgba(58,33,23,0.22)] sm:px-8 sm:pb-20 sm:pt-11 lg:overflow-visible lg:px-12 lg:pb-24">
                <HeroDecorBackdrop />
                <HeroClouds />
                <div className="relative z-10 grid items-start gap-8 lg:grid-cols-[0.54fr_0.46fr]">
                    <div className="max-w-[33rem] pt-1 sm:pt-2">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#eadfcf] bg-white px-4 py-2 text-[0.84rem] font-semibold text-[#8d6b4e] shadow-[0_16px_36px_-26px_rgba(58,33,23,0.22)] sm:text-sm">
                            <MapPin size={15} strokeWidth={1.8} />
                            {badgeLabel}
                        </div>
                        <h1 className="mt-6 whitespace-pre-line font-display text-[3.2rem] font-semibold leading-[0.88] tracking-[-0.06em] text-[#3a2117] sm:mt-7 sm:text-[4.1rem] lg:text-[5.25rem]">
                            {heading}
                        </h1>
                        <p className="mt-5 max-w-[30rem] text-[1rem] leading-8 text-[#725442] sm:mt-6 sm:text-[1.12rem] sm:leading-9">{description}</p>
                        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                            <a
                                href={storefrontShopHref}
                                className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full bg-[#f59a21] px-6 text-sm font-semibold text-white shadow-[0_22px_36px_-26px_rgba(245,154,33,0.65)] sm:w-auto"
                            >
                                <ShoppingCart size={16} strokeWidth={1.9} />
                                Belanja Sekarang
                            </a>
                            <a
                                href={storefrontShopHref}
                                className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full border border-[#e5d7c5] bg-white/80 px-6 text-sm font-semibold text-[#3a2117] sm:w-auto"
                            >
                                Lihat Produk
                                <ChevronRight size={16} strokeWidth={1.9} />
                            </a>
                        </div>
                        <div className="mt-9 grid gap-4 text-[#3a2117] sm:mt-10 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start">
                            <FeatureItem
                                title="Bahan Pilihan"
                                subtitle="Berkualitas"
                                icon={<Medal size={18} strokeWidth={1.8} />}
                            />
                            <div className="hidden h-12 w-px bg-[#eadfcf] sm:block" />
                            <FeatureItem
                                title="Tanpa Pengawet"
                                subtitle="& Pewarna Buatan"
                                icon={<Leaf size={18} strokeWidth={1.8} />}
                            />
                            <div className="hidden h-12 w-px bg-[#eadfcf] sm:block" />
                            <FeatureItem
                                title="Dibuat Dengan Hati"
                                subtitle="Rasa Rumahan"
                                icon={<Heart size={18} strokeWidth={1.8} />}
                            />
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center pt-2 lg:justify-end">
                        <HeroBadgeArtwork />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CatalogSidebar({ categories, selectedCategory, onSelectCategory }: CatalogSidebarProps) {
    return (
        <aside className="rounded-[1.8rem] border border-[#f0e4d4] bg-[#fffdf9] p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {categories.map((category, index) => {
                    const Icon = categoryIcons[category.id as keyof typeof categoryIcons] ?? Wheat;
                    const isActive = selectedCategory === category.id;

                    return (
                        <button
                            type="button"
                            key={category.id}
                            onClick={onSelectCategory ? () => onSelectCategory(category.id) : undefined}
                            className={`flex w-full items-center gap-3 rounded-[1rem] px-4 py-3 text-left text-[0.98rem] transition ${
                                isActive
                                    ? 'bg-[#fff0d7] font-semibold text-[#3a2117]'
                                    : 'font-medium text-[#5f5044] hover:bg-[#fff8ed]'
                            }`}
                        >
                            <Icon size={17} strokeWidth={1.8} className={isActive ? 'text-[#cd872d]' : 'text-[#7e7369]'} />
                            <span>{index === 0 ? 'Semua Produk' : category.label}</span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

export function ProductCard({ product, index, detailHref, onAddToCart }: ProductCardProps) {
    const review = reviewMeta(index);
    const [isAddConfirmed, setIsAddConfirmed] = useState(false);
    const addConfirmationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (addConfirmationTimerRef.current) {
                window.clearTimeout(addConfirmationTimerRef.current);
            }
        };
    }, []);

    function handleAddToCart(): void {
        onAddToCart?.();
        setIsAddConfirmed(true);

        if (addConfirmationTimerRef.current) {
            window.clearTimeout(addConfirmationTimerRef.current);
        }

        addConfirmationTimerRef.current = window.setTimeout(() => {
            setIsAddConfirmed(false);
        }, 1300);
    }

    return (
        <article className="overflow-hidden rounded-[1.45rem] border border-[#f0e4d4] bg-white shadow-[0_14px_30px_-24px_rgba(58,33,23,0.18)]">
            <Link href={detailHref} className="block px-3 pt-3">
                <ProductVisual product={product} index={index} />
            </Link>
            <div className="px-4 pb-4 pt-4">
                <Link href={detailHref} className="font-display text-[1.35rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#3a2117] sm:text-[1.6rem]">
                    {product.name}
                </Link>
                <div className="mt-2 flex items-center gap-1.5 text-[0.9rem] text-[#746557]">
                    <Star size={14} strokeWidth={1.9} className="fill-[#f59a21] text-[#f59a21]" />
                    <span className="font-semibold text-[#9a682e]">{review.rating}</span>
                    <span>({review.reviews})</span>
                </div>
                <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.04em] text-[#3a2117] sm:text-[1.6rem]">{formatRupiah(product.price)}</p>
                <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`mt-3 inline-flex min-h-[2.8rem] w-full items-center justify-between rounded-[0.85rem] border px-4 text-sm font-semibold transition duration-300 ${
                        isAddConfirmed
                            ? 'border-[#f59a21] bg-[#f59a21] text-white shadow-[0_18px_30px_-22px_rgba(245,154,33,0.8)] scale-[1.02]'
                            : 'border-[#eadfcf] bg-[#fff7ea] text-[#3a2117]'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition ${
                                isAddConfirmed ? 'bg-white/20 scale-110' : 'bg-[#f7e2bb]'
                            }`}
                        >
                            {isAddConfirmed ? <Check size={13} strokeWidth={2.4} /> : <ShoppingCart size={13} strokeWidth={2} />}
                        </span>
                        {isAddConfirmed ? 'Berhasil Ditambahkan' : 'Tambah ke Keranjang'}
                    </span>
                    <span className={`transition ${isAddConfirmed ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-70'}`}>
                        {isAddConfirmed ? <Check size={16} strokeWidth={2.2} /> : <ShoppingCart size={16} strokeWidth={1.9} />}
                    </span>
                </button>
                <a
                    href={getProductWhatsappUrl(product.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-[2.8rem] w-full items-center justify-center rounded-[0.85rem] bg-[#3a2117] px-4 text-sm font-semibold text-white"
                >
                    Pesan via WhatsApp
                </a>
            </div>
        </article>
    );
}

export function MinimalPagination({ currentPage, totalPages, onPageChange }: MinimalPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-10 flex flex-col gap-4 border-t border-[#f0e4d4] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#8d6b4e] disabled:opacity-40"
            >
                <ChevronLeft size={16} strokeWidth={1.8} />
                Previous
            </button>
            <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                        <button
                            type="button"
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                page === currentPage ? 'bg-[#3a2117] text-white' : 'text-[#8d6b4e]'
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#8d6b4e] disabled:opacity-40"
            >
                Next
                <ChevronRight size={16} strokeWidth={1.8} />
            </button>
        </div>
    );
}

export function BlackCtaSection() {
    return (
        <section className="px-4 pb-4 pt-3 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-[1848px] rounded-[1.75rem] bg-[#2b1a10] px-5 py-6 text-white shadow-[0_24px_48px_-30px_rgba(43,26,16,0.55)] sm:px-7 sm:py-7 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
                    <div>
                        <h2 className="max-w-[30rem] font-display text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.55rem]">
                            Dapatkan Update & Promo Spesial dari PayTo Rasa!
                        </h2>
                        <p className="mt-4 max-w-[29rem] text-[0.98rem] leading-7 text-[#ddc7b0] sm:text-[1rem]">
                            Jangan lewatkan promo menarik, produk terbaru, dan penawaran eksklusif untuk menu favorit Anda.
                        </p>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="flex min-h-[3.4rem] flex-col overflow-hidden rounded-[1.6rem] bg-white sm:flex-row sm:rounded-full">
                            <input
                                type="email"
                                placeholder="Masukkan email Anda"
                                className="min-h-[3.25rem] w-full px-5 text-sm text-[#3a2117] outline-none placeholder:text-[#b69877]"
                            />
                            <button type="button" className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-[#f59a21] px-6 text-sm font-semibold text-white">
                                Langganan
                                <Send size={15} strokeWidth={1.9} />
                            </button>
                        </div>
                        <div className="border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                            <p className="max-w-[18rem] text-sm leading-7 text-[#ddc7b0]">
                                Atau pesan langsung via WhatsApp untuk order dan tanya produk.
                            </p>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-white sm:w-auto"
                            >
                                <MessageCircle size={17} strokeWidth={1.9} />
                                Chat WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function PublicFooter() {
    return (
        <footer className="px-4 pb-8 pt-2 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-[1848px] px-3 py-4 sm:px-0">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.12fr_0.8fr_0.8fr_1fr]">
                    <div>
                        <BrandMark />
                        <p className="mt-4 max-w-xs text-sm leading-7 text-[#6d5948]">
                            Makanan dan minuman harian PayTo dibuat untuk rasa yang akrab, praktis, dan nyaman dipesan kapan pun.
                        </p>
                        <div className="mt-5 flex items-center gap-3">
                            {[Instagram, Facebook, MessageCircle, Mail].map((Icon, index) => (
                                <a
                                    key={index}
                                    href={index === 2 ? whatsappUrl : '#footer'}
                                    target={index === 2 ? '_blank' : undefined}
                                    rel={index === 2 ? 'noreferrer' : undefined}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfcf] text-[#3a2117]"
                                >
                                    <Icon size={15} strokeWidth={1.8} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Bantuan</h3>
                        <div className="mt-4 grid gap-3 text-sm text-[#6d5948]">
                            <a href="#footer">Cara Belanja</a>
                            <a href="#footer">Pengiriman</a>
                            <a href="#footer">Pembayaran</a>
                            <a href="#footer">FAQ</a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Marketplace</h3>
                        <div className="mt-4 grid gap-3 text-sm text-[#6d5948]">
                            {marketplaceItems.map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <span className={`h-3 w-3 rounded-full ${item.dot}`} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Kontak</h3>
                        <div className="mt-4 grid gap-4 text-sm leading-7 text-[#6d5948]">
                            <div className="flex items-start gap-3">
                                <MessageCircle size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <span>0812-8471-9284</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <span>halo@payto.store</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <span>Jl. Kemang Raya No. 88, Jakarta Selatan</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-[#eadfcf] pt-5 text-xs text-[#836b58] sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 PayTo. All Rights Reserved.</p>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <a href="#footer">Syarat & Ketentuan</a>
                        <a href="#footer">Kebijakan Privasi</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
