import React from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';

import type { CartItem } from '../types';

type CartPanelProps = {
    cart: CartItem[];
    subtotal: number;
    totalDiscount: number;
    grandTotal: number;
    onClearCart: () => void;
    onUpdateQty: (id: number, delta: number) => void;
    onRemoveFromCart: (id: number) => void;

    onCheckout: () => void;
    formatRupiah: (num: number) => string;
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
};

export default function CartPanel({
    cart,
    subtotal,
    totalDiscount,
    grandTotal,
    onClearCart,
    onUpdateQty,
    onRemoveFromCart,

    onCheckout,
    formatRupiah,
    isMobileOpen = false,
    onCloseMobile,
}: CartPanelProps) {
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-cocoa-950/60 backdrop-blur-xs transition-opacity lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            {/* Cart Panel Container */}
            <div
                className={`
                    fixed inset-x-0 bottom-0 z-50 flex flex-col h-[85vh] max-h-[85vh] rounded-t-[2.5rem] bg-white/95 backdrop-blur-3xl shadow-2xl border-t border-white/60 transition-transform duration-300
                    lg:relative lg:inset-auto lg:z-40 lg:max-h-none lg:h-[calc(100vh-2rem)] lg:w-100 xl:w-110 lg:m-4 lg:rounded-[2.5rem] lg:bg-white/40 lg:border lg:border-white/50 lg:shadow-2xl lg:translate-y-0
                    ${isMobileOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0 hidden lg:flex'}
                `}
            >
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-snack-200, #eed9c4) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="relative z-10 flex flex-col h-full text-cocoa-800 min-h-0">
                    <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 flex items-center justify-between border-b border-cocoa-100/60 shrink-0">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-cocoa-800 flex items-center gap-2">
                                Order Saat Ini
                                {totalItems > 0 && (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-snack-100 text-snack-700 font-bold">
                                        {totalItems} item
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>
                                <p className="text-xs font-medium text-cocoa-500">Walk-in Order</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {onCloseMobile && (
                                <button
                                    onClick={onCloseMobile}
                                    className="p-2 hover:bg-cocoa-100/60 rounded-xl transition-colors text-cocoa-400 hover:text-cocoa-700 lg:hidden"
                                    title="Tutup Keranjang"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <button
                                onClick={onClearCart}
                                className="p-2 hover:bg-danger-50 rounded-xl transition-colors text-cocoa-400 hover:text-danger-500"
                                title="Clear Cart"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 sm:px-5 lg:px-6 py-4 space-y-3 custom-scrollbar-light min-h-0">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-cocoa-400 space-y-4 py-12">
                                <div className="w-20 h-20 rounded-3xl bg-white/40 border border-white/50 flex items-center justify-center shadow-sm rotate-3">
                                    <ShoppingBag size={32} className="opacity-50" />
                                </div>
                                <p className="font-medium text-sm">Keranjang Kosong</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="group relative flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-white/60 hover:bg-white/80 hover:border-snack-100 transition-all duration-200 shadow-sm">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-snack-50/60 flex items-center justify-center text-xl shrink-0 border border-snack-100/50 text-snack-600">
                                        {item.category === 'Minuman' ? '🥤' : '🍔'}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-bold text-cocoa-800 truncate text-sm">{item.name}</h4>
                                            <div className="text-right shrink-0">
                                                <span className="font-mono text-cocoa-800 font-bold text-sm tracking-wide">
                                                    {formatRupiah((item.price * item.qty) - item.discount).replace(",00", "")}
                                                </span>
                                                {item.discount > 0 && (
                                                    <div className="text-[10px] font-mono text-cocoa-400 line-through">
                                                        {formatRupiah(item.price * item.qty).replace(",00", "")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-cocoa-400 text-xs font-mono">@{formatRupiah(item.price).replace(",00", "")}</p>
                                            <span className="text-[10px] text-cocoa-500 font-mono px-1 border border-cocoa-200 rounded bg-cocoa-50">{item.sku}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-cocoa-200 shadow-sm">
                                                <button
                                                    onClick={() => item.qty > 1 ? onUpdateQty(item.id, -1) : onRemoveFromCart(item.id)}
                                                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-md hover:bg-cocoa-100/60 text-cocoa-500 flex items-center justify-center transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-7 sm:w-6 text-center text-xs font-bold font-mono text-cocoa-700">{item.qty}</span>
                                                <button
                                                    onClick={() => onUpdateQty(item.id, 1)}
                                                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-md hover:bg-snack-50 text-snack-600 flex items-center justify-center transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 lg:p-6 border-t border-white/50 relative overflow-hidden shrink-0">
                        <div className="space-y-2 mb-4 sm:mb-6 relative z-10">
                            <div className="flex justify-between text-cocoa-500 text-xs font-medium">
                                <span>Subtotal</span>
                                <span className="font-mono text-cocoa-800 font-bold">{formatRupiah(subtotal)}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-leaf-600 text-xs font-bold">
                                    <span>Discount</span>
                                    <span className="font-mono">-{formatRupiah(totalDiscount)}</span>
                                </div>
                            )}
                            <div className="h-px bg-cocoa-100/60 my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-cocoa-600 font-bold text-sm">Total Tagihan</span>
                                <span className="text-xl sm:text-3xl font-bold font-mono text-cocoa-900 tracking-tight">{formatRupiah(grandTotal).replace(",00", "")}</span>
                            </div>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            onClick={() => {
                                if (onCloseMobile) onCloseMobile();
                                onCheckout();
                            }}
                            className="group relative w-full overflow-hidden bg-[#3d281b] hover:bg-[#2f1f15] text-white py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-cocoa-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Bayar Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
