import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Facebook,
    Home,
    Instagram,
    Linkedin,
    MapPin,
    Music4,
    Package2,
    Percent,
    Search,
    Smartphone,
    Sparkles,
    Star,
    Store,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';

import { formatRupiah, getProductWhatsappUrl, PUBLIC_PRODUCTS, type PublicCatalogProduct } from './publicCatalogData';

export const whatsappUrl = 'https://wa.me/6281284719284?text=Halo%20PayTo%2C%20saya%20ingin%20memesan%20produk.';

export const publicNavigationLinks = [
    { label: 'Beranda', href: '/?section=beranda', kind: 'page' },
    { label: 'Shop', href: '/?section=shop', kind: 'page' },
    { label: 'Blog', href: '/?section=footer', kind: 'page' },
];

const categoryIconMap = {
    All: Store,
    Minuman: Music4,
    Makanan: Package2,
} as const;

export const secondaryFilterLinks = [
    { id: 'new-arrival', label: 'New Arrival' },
    { id: 'best-seller', label: 'Best Seller' },
    { id: 'on-discount', label: 'On Discount' },
] as const;

const secondaryFilterIconMap = {
    'new-arrival': Sparkles,
    'best-seller': Star,
    'on-discount': Percent,
} as const;

export type SecondaryFilterId = (typeof secondaryFilterLinks)[number]['id'] | null;

const reviewTotals = ['1.2k Reviews', '120 Reviews', '2.4k Reviews', '640 Reviews'];
const reviewStars = ['5.0', '4.8', '4.4', '5.0'];

type PublicFrameProps = {
    children: ReactNode;
};

type PublicHeaderProps = {
    activeHref: string;
    cartItems: PublicCartLineItem[];
    onIncreaseCartItem: (productId: number) => void;
    onDecreaseCartItem: (productId: number) => void;
    onClearCart: () => void;
};

type HeroSectionProps = {
    eyebrow: string;
    heading: string;
    searchValue?: string;
    searchPlaceholder?: string;
    onSearchChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    searchActionHref?: string;
};

type CatalogSidebarProps = {
    categories: Array<{ id: string; label: string }>;
    selectedCategory: string;
    onSelectCategory?: (categoryId: string) => void;
    counts: Record<string, number>;
    selectedSecondaryFilter?: SecondaryFilterId;
    onSelectSecondaryFilter?: (filterId: SecondaryFilterId) => void;
};

type ProductCardProps = {
    product: PublicCatalogProduct;
    index: number;
    detailHref: string;
    onAddToCart?: () => void;
    primaryHref?: string;
};

type RecommendationStripProps = {
    products: PublicCatalogProduct[];
    onAddToCart?: (productId: number) => void;
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

const publicCartStorageKey = 'payto-public-cart';

function BrandMark() {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#111111]/10 bg-[#111111] text-sm font-black tracking-[-0.18em] text-white">
                PT
            </div>
            <div>
                <p className="text-lg font-black tracking-[-0.04em] text-[#111111]">PayTo</p>
            </div>
        </div>
    );
}

function HeaderIconLink({
    href,
    children,
    badge,
    ariaLabel,
    onClick,
}: {
    href: string;
    children: ReactNode;
    badge?: string;
    ariaLabel: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#111111]/10 bg-white text-[#111111] transition duration-200 hover:-translate-y-px hover:border-[#111111]/25"
        >
            {badge ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff7a00] px-1 text-[10px] font-bold leading-none text-white">
                    {badge}
                </span>
            ) : null}
            {children}
        </button>
    );
}

function FauxAvatar() {
    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#111111]/10 bg-[linear-gradient(135deg,#f5d8c1,#ffffff)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-white">P</div>
        </div>
    );
}

export function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#111111] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
            Langsung ke konten
        </a>
    );
}

export function PublicFrame({ children }: PublicFrameProps) {
    return (
        <div className="min-h-dvh bg-white font-sans text-[#111111] selection:bg-[#111111] selection:text-white">
            <div className="min-h-dvh bg-white">
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
                const parsedCart = JSON.parse(savedCart) as PublicCartEntry[];
                setCartEntries(parsedCart);
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
            const existingEntry = currentEntries.find((entry) => entry.productId === productId);

            if (existingEntry) {
                return currentEntries.map((entry) =>
                    entry.productId === productId ? { ...entry, quantity: entry.quantity + 1 } : entry,
                );
            }

            return [...currentEntries, { productId, quantity: 1 }];
        });
    }

    function decreaseCartItem(productId: number): void {
        setCartEntries((currentEntries) => {
            return currentEntries
                .map((entry) =>
                    entry.productId === productId ? { ...entry, quantity: entry.quantity - 1 } : entry,
                )
                .filter((entry) => entry.quantity > 0);
        });
    }

    function clearCart(): void {
        setCartEntries([]);
    }

    return {
        cartItems,
        addToCart,
        decreaseCartItem,
        clearCart,
        totalCartItems: cartItems.reduce((totalQuantity, item) => totalQuantity + item.quantity, 0),
    };
}

export function PublicHeader({
    activeHref,
    cartItems: _cartItems,
    onIncreaseCartItem: _onIncreaseCartItem,
    onDecreaseCartItem: _onDecreaseCartItem,
    onClearCart: _onClearCart,
}: PublicHeaderProps) {
    return (
        <header className="border-b border-[#111111]/8 bg-white px-5 py-5 sm:px-8">
            <nav className="flex flex-col gap-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6">
                {/* Kolom kiri: logo */}
                <div className="flex items-center justify-between gap-6 lg:justify-start">
                    <BrandMark />
                </div>

                {/* Kolom tengah: menu, di-center */}
                <div className="hidden items-center justify-center gap-8 lg:flex">
                    {publicNavigationLinks.map((item) => {
                        const linkClassName = `text-sm font-semibold transition ${
                            activeHref === item.href ? 'text-[#111111]' : 'text-[#6f6f6f] hover:text-[#111111]'
                        }`;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                preserveScroll={false}
                                preserveState={false}
                                prefetch={false}
                                viewTransition={false}
                                data-nav-link="true"
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                }}
                                onClickCapture={(event) => {
                                    event.stopPropagation();
                                }}
                                className={linkClassName}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Menu mobile: tetap muncul di bawah logo saat < lg */}
                <div className="flex items-center gap-8 lg:hidden">
                    {publicNavigationLinks.map((item) => {
                        const linkClassName = `text-sm font-semibold transition ${
                            activeHref === item.href ? 'text-[#111111]' : 'text-[#6f6f6f] hover:text-[#111111]'
                        }`;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                preserveScroll={false}
                                preserveState={false}
                                prefetch={false}
                                viewTransition={false}
                                data-nav-link="true"
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                }}
                                onClickCapture={(event) => {
                                    event.stopPropagation();
                                }}
                                className={linkClassName}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Kolom kanan: search, cart, avatar */}
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-3">
                        <HeaderIconLink
                            href="#catalog-search"
                            ariaLabel="Cari produk"
                            onClick={() => {
                                const searchInput = document.getElementById('catalog-search') as HTMLInputElement | null;
                                searchInput?.focus();
                            }}
                        >
                            <Search size={18} strokeWidth={2} />
                        </HeaderIconLink>
                        {/* Fitur keranjang sementara dinonaktifkan.
                        <div ref={cartPanelRef} className="relative">
                            <HeaderIconLink
                                href="#cart"
                                ariaLabel="Keranjang"
                                badge={cartItems.length > 0 ? String(cartItems.reduce((total, item) => total + item.quantity, 0)) : undefined}
                                onClick={() => {
                                    setIsCartOpen((currentValue) => !currentValue);
                                }}
                            >
                                <ShoppingCart size={18} strokeWidth={2} />
                            </HeaderIconLink>

                            {isCartOpen ? (
                                <div className="absolute right-0 top-14 z-40 w-[340px] rounded-[1.8rem] border border-[#111111]/10 bg-white p-4 shadow-[0_30px_80px_-36px_rgba(17,17,17,0.28)]">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-[#6f6f6f]">Keranjang</p>
                                            <h3 className="text-lg font-black tracking-[-0.04em] text-[#111111]">
                                                {cartItems.length > 0 ? `${cartItems.length} produk dipilih` : 'Belum ada produk'}
                                            </h3>
                                        </div>
                                        {cartItems.length > 0 ? (
                                            <button
                                                type="button"
                                                onClick={onClearCart}
                                                className="text-xs font-semibold text-[#6f6f6f] transition hover:text-[#111111]"
                                            >
                                                Kosongkan
                                            </button>
                                        ) : null}
                                    </div>

                                    {cartItems.length > 0 ? (
                                        <>
                                            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                                                {cartItems.map((item) => (
                                                    <div
                                                        key={item.product.id}
                                                        className="rounded-[1.4rem] border border-[#111111]/8 bg-[#fafafa] p-3"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="font-semibold text-[#111111]">{item.product.name}</p>
                                                                <p className="mt-1 text-sm text-[#6f6f6f]">{formatRupiah(item.product.price)}</p>
                                                            </div>
                                                            <Link
                                                                href={`/katalog/${item.product.id}`}
                                                                onClick={() => {
                                                                    setIsCartOpen(false);
                                                                }}
                                                                className="text-xs font-semibold text-[#111111] transition hover:text-black"
                                                            >
                                                                Detail
                                                            </Link>
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onDecreaseCartItem(item.product.id)}
                                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#111111]/10 bg-white text-[#111111]"
                                                                >
                                                                    <Minus size={14} strokeWidth={2} />
                                                                </button>
                                                                <span className="w-6 text-center text-sm font-semibold text-[#111111]">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onIncreaseCartItem(item.product.id)}
                                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#111111]/10 bg-white text-[#111111]"
                                                                >
                                                                    <Plus size={14} strokeWidth={2} />
                                                                </button>
                                                            </div>
                                                            <p className="text-sm font-black text-[#111111]">
                                                                {formatRupiah(item.product.price * item.quantity)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 border-t border-[#111111]/8 pt-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-[#6f6f6f]">Subtotal</span>
                                                    <span className="font-black text-[#111111]">{formatRupiah(cartTotal)}</span>
                                                </div>
                                                <a
                                                    href={whatsappUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#111111] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-black"
                                                >
                                                    Checkout via WhatsApp
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-4 rounded-[1.4rem] bg-[#fafafa] px-4 py-5 text-sm leading-7 text-[#6f6f6f]">
                                            Klik tombol <span className="font-semibold text-[#111111]">Masukkan Keranjang</span> pada produk untuk menambah item ke daftar belanja.
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                        */}
                    </div>
                    <Link href="/login" aria-label="Masuk ke akun" className="transition duration-200 hover:-translate-y-px">
                        <FauxAvatar />
                    </Link>
                </div>
            </nav>
        </header>
    );
}

function HeroBackdrop() {
    return (
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#d8d6d2_0%,#f2f2f0_38%,#ddd8d3_100%)] px-4 pb-10 pt-5 sm:px-6 sm:pb-14 lg:px-10 lg:pb-20 lg:pt-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(255,255,255,0.95),transparent_18%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.72),transparent_16%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(0,0,0,0.08)_100%)]" />
            <div className="absolute inset-y-8 left-[6%] hidden w-[22%] rounded-[1.4rem] border border-white/50 bg-white/30 lg:block" />
            <div className="absolute inset-y-8 right-[6%] hidden w-[18%] rounded-[1.4rem] border border-white/50 bg-white/28 lg:block" />
            <div className="absolute left-[33%] top-[13%] hidden h-[42%] w-[34%] rounded-[1.6rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,255,255,0.18))] lg:block" />
            <div className="absolute bottom-[11%] left-[13%] hidden h-[26%] w-[17%] rounded-[2rem] bg-white/25 blur-[1px] lg:block" />
            <div className="absolute bottom-[11%] right-[15%] hidden h-[24%] w-[19%] rounded-[2rem] bg-white/25 blur-[1px] lg:block" />
            <div className="relative min-h-[300px] lg:min-h-[360px]">
                <div className="absolute inset-x-0 bottom-0 overflow-hidden">
                    <p className="translate-y-[16%] text-center text-[7rem] font-black leading-none tracking-[-0.12em] text-white drop-shadow-[0_10px_24px_rgba(17,17,17,0.06)] sm:text-[9rem] lg:text-[13rem]">
                        Shop
                    </p>
                </div>
            </div>
        </div>
    );
}

export function HeroSection({
    eyebrow,
    heading,
    searchValue = '',
    searchPlaceholder = 'Search on PayTo',
    onSearchChange,
    searchActionHref = '/katalog',
}: HeroSectionProps) {
    return (
        <section>
            <div className="relative">
                <HeroBackdrop />
                <div className="relative -mt-12 px-4 sm:-mt-14 sm:px-6 lg:px-8">
                    <div className="grid gap-4 rounded-[1.7rem] border border-[#111111]/8 bg-white px-5 py-5 shadow-[0_24px_60px_-36px_rgba(17,17,17,0.18)] lg:grid-cols-[0.58fr_0.42fr] lg:items-center lg:px-6">
                        <div>
                            <p className="text-sm font-semibold text-[#6f6f6f]">{eyebrow}</p>
                            <h1 className="mt-2 text-[2rem] font-black tracking-[-0.06em] text-[#111111] sm:text-[2.6rem] lg:text-[3rem]">
                                {heading}
                            </h1>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label
                                htmlFor="catalog-search"
                                className="flex min-h-14 flex-1 items-center gap-3 rounded-full border border-[#111111]/8 bg-[#fafafa] px-5 text-sm text-[#6f6f6f]"
                            >
                                <Search size={18} className="text-[#8c8c8c]" strokeWidth={2} />
                                <input
                                    id="catalog-search"
                                    type="text"
                                    value={searchValue}
                                    onChange={onSearchChange}
                                    readOnly={!onSearchChange}
                                    placeholder={searchPlaceholder}
                                    className="w-full bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#9a9a9a]"
                                />
                            </label>
                            <Link
                                href={searchActionHref}
                                className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#111111] px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-black"
                            >
                                Search
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CatalogSidebar({
    categories,
    selectedCategory,
    onSelectCategory,
    counts,
    selectedSecondaryFilter = null,
    onSelectSecondaryFilter,
}: CatalogSidebarProps) {
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(true);
    const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent): void {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const parentCategory = categories[0];
    const childCategories = categories.slice(1);
    const parentCount = parentCategory ? counts[parentCategory.id] ?? 0 : 0;

    return (
        <aside className="space-y-1">
            <div>
                <h2 className="text-[1.75rem] font-black tracking-[-0.05em] text-[#111111]">Category</h2>
                <div ref={categoryDropdownRef} className="mt-3 space-y-1">
                    {parentCategory ? (
                        <button
                            type="button"
                            onClick={() => {
                                setIsCategoryDropdownOpen((currentValue) => !currentValue);
                                onSelectCategory?.(parentCategory.id);
                            }}
                            className={`flex w-full items-center gap-2 py-2 text-left text-sm transition duration-200 ${
                                selectedCategory === parentCategory.id
                                    ? 'font-semibold text-[#111111]'
                                    : 'font-medium text-[#6b6b6b] hover:text-[#111111]'
                            }`}
                        >
                            <span className="text-[#6b7280]">
                                <Store size={16} strokeWidth={2} />
                            </span>
                            <span>All Product</span>
                            <span className="ml-auto flex items-center gap-2">
                                <span className="text-sm font-semibold text-[#ef4444]">{parentCount}</span>
                                <ChevronDown
                                    size={14}
                                    className={`text-[#9ca3af] transition duration-200 ${
                                        isCategoryDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                    strokeWidth={2}
                                />
                            </span>
                        </button>
                    ) : null}

                    {isCategoryDropdownOpen
                        ? childCategories.map((category) => {
                              const Icon = categoryIconMap[category.id as keyof typeof categoryIconMap] ?? Package2;
                              const isActive = selectedCategory === category.id;
                              const count = counts[category.id] ?? 0;

                              return (
                                  <button
                                      type="button"
                                      key={category.id}
                                      onClick={onSelectCategory ? () => onSelectCategory(category.id) : undefined}
                                      className={`flex w-full items-center gap-2 py-2 pl-4 text-left text-sm transition duration-200 ${
                                          isActive
                                              ? 'font-semibold text-[#111111]'
                                              : 'font-medium text-[#6b6b6b] hover:text-[#111111]'
                                      }`}
                                  >
                                      <span className="text-[#6b7280]">
                                          <Icon size={16} strokeWidth={2} />
                                      </span>
                                      <span>{category.label === 'Semua' ? 'All Product' : category.label}</span>
                                      <span className="ml-auto text-sm text-[#9ca3af]">{count}</span>
                                  </button>
                              );
                          })
                        : null}
                </div>
            </div>

            <div className="space-y-1">
                {secondaryFilterLinks.map((item) => {
                    const isActive = selectedSecondaryFilter === item.id;
                    const Icon = secondaryFilterIconMap[item.id];

                    return (
                        <button
                            type="button"
                            key={item.id}
                            onClick={onSelectSecondaryFilter ? () => onSelectSecondaryFilter(isActive ? null : item.id) : undefined}
                            className={`flex w-full items-center gap-2 py-2 text-left text-sm transition duration-200 ${
                                isActive ? 'font-semibold text-[#111111]' : 'font-medium text-[#6f6f6f] hover:text-[#111111]'
                            }`}
                        >
                            <span className="text-[#6b7280]">
                                <Icon size={16} strokeWidth={2} />
                            </span>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-[1.7rem] bg-[#fafafa] p-5">
                <p className="text-sm font-semibold text-[#111111]">Info toko</p>
                <p className="mt-3 text-sm leading-7 text-[#6f6f6f]">WhatsApp checkout tetap aktif untuk semua produk yang tampil di etalase publik.</p>
                <a
                    href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#111111] transition hover:text-black"
                >
                    <MapPin size={15} strokeWidth={2} />
                    Jl. Kemang Raya No. 88
                </a>
            </div>
        </aside>
    );
}

export function StoreInfoSection() {
    return (
        <section className="px-5 py-6 sm:px-8 lg:px-10 xl:px-12">
            <div className="rounded-[2rem] bg-[#fafafa] p-6 sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                    <div>
                        <p className="text-sm font-semibold text-[#111111]">Info toko</p>
                        <h2 className="mt-3 text-[2rem] font-black tracking-[-0.06em] text-[#111111] sm:text-[2.6rem]">
                            WhatsApp checkout tetap aktif untuk semua produk publik.
                        </h2>
                    </div>
                    <div className="grid gap-4 text-sm leading-7 text-[#6f6f6f]">
                        <p>
                            Pilih produk yang Anda suka, masukkan ke keranjang, lalu lanjutkan pemesanan cepat lewat
                            WhatsApp untuk konfirmasi stok, varian, dan jadwal pengiriman.
                        </p>
                        <a
                            href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] transition hover:text-black"
                        >
                            <MapPin size={15} strokeWidth={2} />
                            Jl. Kemang Raya No. 88
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

function GadgetShape({ index }: { index: number }) {
    const variants = [
        (
            <div className="relative h-36 w-24">
                <span className="absolute left-1/2 top-2 h-28 w-16 -translate-x-1/2 rounded-[1.25rem] bg-[linear-gradient(180deg,#555,#1f1f1f)]" />
                <span className="absolute left-1/2 top-10 h-20 w-20 -translate-x-1/2 rounded-[1.8rem] border border-white/55 bg-[linear-gradient(180deg,#ececec,#cfcfcf)]" />
                <span className="absolute bottom-0 left-1/2 h-10 w-16 -translate-x-1/2 rounded-[1rem] bg-[#111111]" />
            </div>
        ),
        (
            <div className="relative h-36 w-36">
                <span className="absolute inset-x-5 top-4 h-28 rounded-full border-[12px] border-[#1d1d1d]" />
                <span className="absolute left-7 top-10 h-8 w-8 rounded-full bg-[#1d1d1d]" />
                <span className="absolute right-7 top-10 h-8 w-8 rounded-full bg-[#1d1d1d]" />
            </div>
        ),
        (
            <div className="relative h-36 w-36">
                <span className="absolute inset-x-3 top-8 h-20 rounded-full bg-[linear-gradient(180deg,#fdfdfd,#d5d5d5)] shadow-[inset_0_0_0_1px_rgba(17,17,17,0.08)]" />
                <span className="absolute left-1/2 top-14 h-3 w-10 -translate-x-1/2 rounded-full bg-[#d9d9d9]" />
                <span className="absolute right-8 top-12 h-4 w-4 rounded-full border border-[#111111]/8 bg-white" />
            </div>
        ),
        (
            <div className="relative h-36 w-36">
                <span className="absolute left-1/2 top-2 h-26 w-20 -translate-x-1/2 rounded-[2rem] bg-[linear-gradient(180deg,#fefefe,#d8d8d8)] shadow-[inset_0_0_0_1px_rgba(17,17,17,0.06)]" />
                <span className="absolute left-1/2 top-16 h-7 w-7 -translate-x-1/2 rounded-full bg-[#efefef]" />
            </div>
        ),
    ];

    return variants[index % variants.length];
}

export function ProductVisual({ index }: { index: number }) {
    return (
        <div className="relative flex aspect-[1/0.92] items-center justify-center overflow-hidden rounded-[1.6rem] bg-[#f5f5f5]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_34%)]" />
            <GadgetShape index={index} />
        </div>
    );
}

function ProductReview({ index }: { index: number }) {
    return (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#7d7d7d]">
            <Star size={12} className="fill-[#ff9f1a] text-[#ff9f1a]" strokeWidth={1.8} />
            <span className="font-semibold text-[#ff9f1a]">{reviewStars[index % reviewStars.length]}</span>
            <span>({reviewTotals[index % reviewTotals.length]})</span>
        </div>
    );
}

export function ProductCard({
    product,
    index,
    detailHref,
    onAddToCart,
    primaryHref,
}: ProductCardProps) {
    const categoryBadge = product.category === 'Minuman' ? 'Music' : 'Other';

    return (
        <article className="flex h-full flex-col">
            <div className="relative">
                <span className="absolute right-2 top-2 z-10 rounded-full border border-[#111111]/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#5b5b5b] sm:right-3 sm:top-3 sm:px-3 sm:text-[11px]">
                    {categoryBadge}
                </span>
                <Link href={detailHref}>
                    <ProductVisual index={index} />
                </Link>
            </div>
            <div className="flex flex-1 flex-col pt-3 sm:pt-4">
                <Link
                    href={detailHref}
                    className="text-[1.2rem] font-black tracking-[-0.05em] text-[#111111] transition hover:text-black sm:text-[1.7rem]"
                >
                    {product.name}
                </Link>
                <ProductReview index={index} />
                <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[1.35rem] font-black tracking-[-0.06em] text-[#111111] sm:text-[1.85rem]">
                        {formatRupiah(product.price)}
                    </p>
                    <p className="text-[11px] text-[#767676] sm:text-sm">
                        {product.stock > 0 ? `Stok ${product.stock}` : 'Restock'}
                    </p>
                </div>
                <div className="mt-3 flex gap-2 sm:mt-4 sm:gap-3">
                    {/* Fitur keranjang sementara dinonaktifkan.
                    <button
                        type="button"
                        onClick={onAddToCart}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#111111]/15 bg-white px-4 text-sm font-semibold text-[#111111] transition duration-200 hover:-translate-y-px hover:border-[#111111]/30"
                    >
                        Masukkan Keranjang
                    </button>
                    */}
                    <a
                        href={primaryHref ?? getProductWhatsappUrl(product.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full bg-[#111111] px-3 text-center text-[11px] font-semibold leading-tight text-white transition duration-200 hover:-translate-y-px hover:bg-black sm:min-h-11 sm:px-4 sm:text-sm"
                    >
                        Pesan via WhatsApp
                    </a>
                </div>
            </div>
        </article>
    );
}

export function MinimalPagination({ currentPage, totalPages, onPageChange }: MinimalPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-[#111111]/8 pt-6 text-sm text-[#4f4f4f] sm:flex sm:items-center sm:justify-between">
            <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="inline-flex items-center justify-self-start gap-2 font-medium text-[#6f6f6f] disabled:cursor-not-allowed disabled:opacity-45"
            >
                <ChevronLeft size={15} strokeWidth={2} />
                Previous
            </button>

            <div className="flex items-center justify-center gap-3">
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const isActive = page === currentPage;

                    return (
                        <button
                            type="button"
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition duration-200 ${
                                isActive
                                    ? 'bg-[#111111] text-white'
                                    : 'text-[#8d8d8d] hover:bg-[#f5f5f5] hover:text-[#111111]'
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="inline-flex items-center justify-self-end gap-2 font-medium text-[#6f6f6f] disabled:cursor-not-allowed disabled:opacity-45"
            >
                Next
                <ChevronRight size={15} strokeWidth={2} />
            </button>
        </div>
    );
}

export function RecommendationStrip({ products, onAddToCart }: RecommendationStripProps) {
    const carouselRef = useRef<HTMLDivElement | null>(null);

    function scrollRecommendations(direction: 'previous' | 'next'): void {
        const element = carouselRef.current;

        if (!element) {
            return;
        }

        const offset = direction === 'next' ? 320 : -320;

        element.scrollBy({
            left: offset,
            behavior: 'smooth',
        });
    }

    return (
        <section className="px-5 py-16 sm:px-8 lg:px-10 xl:px-12">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-[2.3rem] font-black tracking-[-0.06em] text-[#111111] sm:text-[3rem]">
                        Explore our recommendations
                    </h2>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                    <button
                        type="button"
                        onClick={() => scrollRecommendations('previous')}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#111111]/10 text-[#111111] transition duration-200 hover:border-[#111111]/25 hover:bg-[#fafafa]"
                    >
                        <ChevronLeft size={18} strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollRecommendations('next')}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#111111]/10 text-[#111111] transition duration-200 hover:border-[#111111]/25 hover:bg-[#fafafa]"
                    >
                        <ChevronRight size={18} strokeWidth={2} />
                    </button>
                </div>
            </div>

            <div ref={carouselRef} className="mt-8 overflow-x-auto scroll-smooth pb-2">
                <div className="grid min-w-max grid-flow-col gap-5">
                    {products.map((product, index) => (
                        <div key={product.id} className="w-[280px] sm:w-[300px]">
                            <ProductCard
                                product={product}
                                index={index + 12}
                                detailHref={`/katalog/${product.id}`}
                                onAddToCart={onAddToCart ? () => onAddToCart(product.id) : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function BlackCtaSection() {
    return (
        <section className="px-4 pb-14 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-[#111111] px-6 py-8 text-white sm:px-8 sm:py-10">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                    <div>
                        <h2 className="max-w-md text-[2.6rem] font-black tracking-[-0.06em] text-white sm:text-[3.4rem]">
                            Siap coba menu terbaru kami?
                        </h2>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#25d366] px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-[#1ebe5d]"
                        >
                            Hubungi via WhatsApp
                        </a>
                    </div>

                    <div className="grid gap-3 text-sm leading-7 text-white/72 lg:justify-items-end">
                        <p className="max-w-md text-base font-semibold text-white">PayTo — makanan enak, dekat di hati</p>
                        <p className="max-w-md">
                            Kami menyajikan hidangan special dengan bahan pilihan, siap dinikmati bersama keluarga.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function PublicFooter() {
    return (
        <footer id="footer" className="border-t border-[#111111]/8 px-4 pb-6 pt-2 sm:px-6 lg:px-8">
            <div className="grid gap-10 py-10 lg:grid-cols-[1fr_1fr_auto]">
                <div className="grid gap-8 sm:grid-cols-2">
                    <div>
                        <p className="text-lg font-black tracking-[-0.04em] text-[#111111]">About</p>
                        <div className="mt-4 grid gap-3 text-sm text-[#5f5f5f]">
                            <a href="#footer" className="transition hover:text-[#111111]">Blog</a>
                            <a href="#footer" className="transition hover:text-[#111111]">Meet The Team</a>
                            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="transition hover:text-[#111111]">
                                Contact Us
                            </a>
                        </div>
                    </div>
                    <div>
                        <p className="text-lg font-black tracking-[-0.04em] text-[#111111]">Support</p>
                        <div className="mt-4 grid gap-3 text-sm text-[#5f5f5f]">
                            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="transition hover:text-[#111111]">
                                Contact Us
                            </a>
                            <Link href="/katalog" className="transition hover:text-[#111111]">
                                Shipping
                            </Link>
                            <Link href="/katalog" className="transition hover:text-[#111111]">
                                Return
                            </Link>
                            <Link href="/login" className="transition hover:text-[#111111]">
                                FAQ
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 text-sm text-[#5f5f5f]">
                    <p className="font-semibold text-[#111111]">Store</p>
                    <a
                        href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+88+Jakarta+Selatan"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-start gap-2 transition hover:text-[#111111]"
                    >
                        <MapPin size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
                        <span>Jl. Kemang Raya No. 88, Jakarta Selatan</span>
                    </a>
                    <a href="mailto:halo@payto.store" className="transition hover:text-[#111111]">
                        halo@payto.store
                    </a>
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="transition hover:text-[#111111]">
                        WhatsApp order line
                    </a>
                </div>

                <div className="flex flex-col justify-between gap-6">
                    <div>
                        <p className="text-lg font-black tracking-[-0.04em] text-[#111111]">Social Media</p>
                        <div className="mt-4 flex items-center gap-3">
                            {[X, Facebook, Linkedin, Instagram].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#footer"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-white transition duration-200 hover:-translate-y-px"
                                >
                                    <Icon size={18} strokeWidth={2} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#111111]/8 pt-5 text-xs text-[#7c7c7c] sm:flex-row sm:items-center sm:justify-between">
                <p>Copyright © 2026 PayTo. All Rights Reserved.</p>
                <div className="flex items-center gap-5">
                    <a href="#footer" className="transition hover:text-[#111111]">Terms of Service</a>
                    <a href="#footer" className="transition hover:text-[#111111]">Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
}
