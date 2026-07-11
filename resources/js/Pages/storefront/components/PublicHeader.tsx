import { LogIn, Menu, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { businessWhatsappUrl, storefrontShopHref } from '../constants';
import { formatRupiah } from '../data/publicCatalogData';
import type { PublicHeaderProps } from '../types';
import { BrandMark } from './BrandMark';
import { HeaderIconButton } from './HeaderIconButton';

export function PublicHeader({ business, cartItems, onIncreaseCartItem, onDecreaseCartItem, onClearCart }: PublicHeaderProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const cartRef = useRef<HTMLDivElement | null>(null);
    const cartButtonRef = useRef<HTMLDivElement | null>(null);
    const previousCartItemsCountRef = useRef<number | null>(null);
    const whatsappUrl = businessWhatsappUrl(business);
    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    function closeCart(): void {
        setIsCartOpen(false);
    }

    useEffect(() => {
        function handlePointerDown(event: MouseEvent): void {
            if (!cartRef.current?.contains(event.target as Node) && !cartButtonRef.current?.contains(event.target as Node)) {
                closeCart();
            }
        }

        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === 'Escape') closeCart();
        }

        if (isCartOpen) {
            window.addEventListener('mousedown', handlePointerDown);
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCartOpen]);

    useEffect(() => {
        if (previousCartItemsCountRef.current !== null && totalCartItems > previousCartItemsCountRef.current) {
            setIsCartBumping(true);
            const timer = window.setTimeout(() => setIsCartBumping(false), 420);
            previousCartItemsCountRef.current = totalCartItems;

            return () => window.clearTimeout(timer);
        }

        previousCartItemsCountRef.current = totalCartItems;
    }, [totalCartItems]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="sticky top-0 z-50 px-4 pb-2 pt-3 sm:px-5 lg:px-8">
            <nav className={`relative mx-auto flex max-w-462 items-center justify-between gap-4 border px-3 transition-all duration-300 motion-reduce:transition-none sm:px-5 lg:px-7 ${
                isScrolled
                    ? 'min-h-16 rounded-[1.6rem] border-white/80 bg-[#fffdf9]/88 shadow-[0_18px_42px_-28px_rgba(58,33,23,0.38)] backdrop-blur-xl'
                    : 'min-h-18 rounded-4xl border-[#eadfcf]/85 bg-[#fffdf9]/72 shadow-[0_24px_60px_-44px_rgba(58,33,23,0.3)] backdrop-blur-md'
            }`}>
                <a href="/" aria-label={`${business.name} — Beranda`} className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5c22]">
                    <BrandMark business={business} />
                </a>

                <div className="hidden items-center gap-1 rounded-full bg-[#f8efe2]/70 p-1 lg:flex">
                    <a href={storefrontShopHref} className="rounded-full px-4 py-2 text-sm font-semibold text-[#6f503c] transition hover:bg-white hover:text-[#3a2117]">Produk</a>
                    <a href="#kontak" className="rounded-full px-4 py-2 text-sm font-semibold text-[#6f503c] transition hover:bg-white hover:text-[#3a2117]">Kontak</a>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <div ref={cartButtonRef}>
                        <HeaderIconButton
                            ariaLabel={`Keranjang, ${totalCartItems} item`}
                            badge={totalCartItems > 0 ? String(Math.min(totalCartItems, 99)) : undefined}
                            isActive={isCartOpen}
                            className={isCartBumping ? 'scale-110' : ''}
                            onClick={() => setIsCartOpen((current) => !current)}
                        >
                            <ShoppingBag size={20} strokeWidth={1.8} />
                        </HeaderIconButton>
                    </div>

                    <a href="/login" className="hidden min-h-11 items-center gap-2 rounded-2xl px-3.5 text-sm font-semibold text-[#3a2117] transition hover:bg-[#f8ead6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c22] sm:inline-flex">
                        <LogIn size={18} strokeWidth={1.8} />
                        Masuk
                    </a>

                    <div className="lg:hidden">
                        <HeaderIconButton ariaLabel="Buka menu">
                            <Menu size={20} strokeWidth={1.8} />
                        </HeaderIconButton>
                    </div>
                </div>

                {isCartOpen ? (
                    <div
                        ref={cartRef}
                        className="absolute right-0 top-[calc(100%+0.65rem)] z-40 flex max-h-[min(72vh,40rem)] w-[min(25rem,calc(100vw-2rem))] origin-top-right flex-col overflow-hidden rounded-[1.75rem] border border-[#eadfcf] bg-[#fffdf9]/96 shadow-[0_30px_80px_-28px_rgba(58,33,23,0.42)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-[#efe3d4] px-5 py-5">
                            <div>
                                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#a5764e]">Keranjang Anda</p>
                                <p className="mt-1 font-display text-[1.75rem] font-semibold leading-none tracking-[-0.04em] text-[#3a2117]">
                                    {totalCartItems > 0 ? `${totalCartItems} item` : 'Masih kosong'}
                                </p>
                            </div>
                            <button type="button" onClick={closeCart} aria-label="Tutup keranjang" className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#735642] transition hover:bg-[#f8ead6] focus-visible:outline-2 focus-visible:outline-[#9b5c22]">
                                <X size={18} />
                            </button>
                        </div>

                        {totalCartItems > 0 ? (
                            <>
                                <div className="min-h-0 flex-1 overflow-y-auto px-5">
                                    {cartItems.map((item) => (
                                        <div key={item.product.id} className="flex items-center justify-between gap-4 border-b border-[#efe3d4] py-4 last:border-b-0">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-[#3a2117]">{item.product.name}</p>
                                                <p className="mt-1 text-sm text-[#8d6b4e]">{formatRupiah(item.product.price)}</p>
                                            </div>
                                            <div className="flex shrink-0 items-center rounded-full border border-[#e6d7c4] bg-[#fffaf3] p-1">
                                                <button type="button" aria-label={`Kurangi ${item.product.name}`} onClick={() => onDecreaseCartItem(item.product.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#f3e4d0] focus-visible:outline-2 focus-visible:outline-[#9b5c22]">
                                                    <Minus size={15} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-[#3a2117]" aria-live="polite">{item.quantity}</span>
                                                <button type="button" aria-label={`Tambah ${item.product.name}`} onClick={() => onIncreaseCartItem(item.product.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#f3e4d0] focus-visible:outline-2 focus-visible:outline-[#9b5c22]">
                                                    <Plus size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-[#e8d9c6] bg-[#fbf1e3]/90 px-5 py-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-[#806049]">Subtotal</span>
                                        <span className="font-display text-xl font-semibold text-[#3a2117]">{formatRupiah(cartTotal)}</span>
                                    </div>
                                    {whatsappUrl ? (
                                        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#168c45] px-5 text-sm font-bold text-white shadow-[0_18px_28px_-20px_rgba(22,140,69,0.8)] transition hover:-translate-y-px hover:bg-[#127a3c]">
                                            Checkout via WhatsApp
                                        </a>
                                    ) : null}
                                    <button type="button" onClick={onClearCart} className="mt-3 inline-flex w-full items-center justify-center gap-2 py-1 text-xs font-semibold text-[#9a6758] transition hover:text-[#713b2f]">
                                        <Trash2 size={13} />
                                        Kosongkan keranjang
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="px-6 py-10 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f8ead6] text-[#a66b2b]">
                                    <ShoppingBag size={23} strokeWidth={1.7} />
                                </div>
                                <p className="mt-4 font-semibold text-[#3a2117]">Keranjangmu masih kosong.</p>
                                <p className="mt-2 text-sm leading-6 text-[#806049]">Pilih camilan favorit untuk mulai memesan.</p>
                                <a href={storefrontShopHref} onClick={closeCart} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#ef921e] px-5 text-sm font-bold text-white">Jelajahi produk</a>
                            </div>
                        )}
                    </div>
                ) : null}
            </nav>
        </header>
    );
}
