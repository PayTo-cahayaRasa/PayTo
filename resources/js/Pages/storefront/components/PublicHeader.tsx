import { Menu, ShoppingCart, Trash2, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { formatRupiah } from '../data/publicCatalogData';
import { businessWhatsappUrl } from '../constants';
import type { PublicHeaderProps } from '../types';
import { BrandMark } from './BrandMark';
import { HeaderIconButton } from './HeaderIconButton';

export function PublicHeader({ business, cartItems, onIncreaseCartItem, onDecreaseCartItem, onClearCart }: PublicHeaderProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const cartRef = useRef<HTMLDivElement | null>(null);
    const previousCartItemsCountRef = useRef<number | null>(null);
    const whatsappUrl = businessWhatsappUrl(business);
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="sticky top-0 z-50 px-4 pt-3 pb-2 sm:px-5 lg:px-8">
            <nav className={`mx-auto flex min-h-[4.25rem] max-w-[1848px] items-center justify-between gap-3 rounded-[2rem] border border-[#f1e6d7] px-3 py-2 shadow-[0_24px_48px_-36px_rgba(58,33,23,0.25)] sm:h-[4.5rem] sm:px-7 sm:py-0 lg:px-8 transition-all duration-300 ${isScrolled ? 'bg-white/60 backdrop-blur-md shadow-md' : 'bg-[#fffdf9]'}`}>
                <BrandMark business={business} />

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
                                            {whatsappUrl ? (
                                                <a
                                                    href={whatsappUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#25d366] px-4 text-sm font-semibold text-white"
                                                >
                                                    Checkout via WhatsApp
                                                </a>
                                            ) : null}
                                        </div>
                                    </>
                                ) : (
                                    <p className="mt-4 text-sm leading-7 text-[#8d6b4e]">
                                        Tambahkan produk terlebih dahulu untuk melanjutkan order {business.name}.
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
