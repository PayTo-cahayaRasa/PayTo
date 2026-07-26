import React, { useEffect, useState } from 'react';
import { Banknote, CreditCard, Printer, X, ChevronDown, ChevronUp, Delete } from 'lucide-react';

import type { SaleSource } from '../types';

type PaymentModalProps = {
    isOpen: boolean;
    paymentMethod: 'CASH' | 'EWALLET';
    onPaymentMethodChange: (method: 'CASH' | 'EWALLET') => void;
    cashReceived: string;
    onCashReceivedChange: (value: string) => void;
    source: SaleSource;
    onSourceChange: (source: SaleSource) => void;
    customerName: string;
    onCustomerNameChange: (value: string) => void;
    customerPhone: string;
    onCustomerPhoneChange: (value: string) => void;
    validationError: string | null;
    onClose: () => void;
    onCheckout: () => void;
    quickCashAmounts: number[];
    discountTotal: number;
    totalDue: number;
    subtotal: number;
    change: number;
    formatRupiah: (num: number) => string;
};

export default function PaymentModal({
    isOpen,
    paymentMethod,
    onPaymentMethodChange,
    cashReceived,
    onCashReceivedChange,
    source,
    onSourceChange,
    customerName,
    onCustomerNameChange,
    customerPhone,
    onCustomerPhoneChange,
    validationError,
    onClose,
    onCheckout,
    quickCashAmounts,
    discountTotal,
    totalDue,
    subtotal,
    change,
    formatRupiah,
}: PaymentModalProps) {
    if (!isOpen) return null;

    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showDetails, setShowDetails] = useState(false); // Toggle detail harga di mobile

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
            return;
        }

        const coarsePointer = window.matchMedia('(pointer: coarse)');
        const noHover = window.matchMedia('(hover: none)');

        const updateDeviceType = () => {
            const hasTouch = (navigator.maxTouchPoints || 0) > 0;
            setIsTouchDevice((coarsePointer.matches && noHover.matches) || hasTouch);
        };

        updateDeviceType();

        coarsePointer.addEventListener('change', updateDeviceType);
        noHover.addEventListener('change', updateDeviceType);

        return () => {
            coarsePointer.removeEventListener('change', updateDeviceType);
            noHover.removeEventListener('change', updateDeviceType);
        };
    }, []);

    // Deteksi ukuran layar untuk layout mobile vs desktop
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNumpadInput = (value: string) => {
        if (value === 'clear') {
            onCashReceivedChange('');
            return;
        }
        if (value === 'backspace') {
            onCashReceivedChange(cashReceived.slice(0, -1));
            return;
        }
        // Validasi max length agar tidak overflow layout
        if (cashReceived.length > 12) return;

        const nextValue = `${cashReceived}${value}`.replace(/^0+(?=\d)/, '');
        onCashReceivedChange(nextValue);
    };

    // Komponen Numpad (Reusable)
    const NumpadGrid = () => (
        <div className="grid grid-cols-3 gap-3 h-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                    key={digit}
                    onClick={() => handleNumpadInput(digit)}
                    className="flex items-center justify-center py-4 md:py-3 bg-white rounded-xl border border-slate-200 font-mono text-xl md:text-lg font-bold text-slate-700 hover:border-indigo-500 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                >
                    {digit}
                </button>
            ))}
            <button
                onClick={() => handleNumpadInput('clear')}
                className="flex items-center justify-center py-4 md:py-3 bg-rose-50 rounded-xl border border-rose-100 font-bold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all"
            >
                C
            </button>
            <button
                onClick={() => handleNumpadInput('0')}
                className="flex items-center justify-center py-4 md:py-3 bg-white rounded-xl border border-slate-200 font-mono text-xl md:text-lg font-bold text-slate-700 hover:border-indigo-500 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
                0
            </button>
            <button
                onClick={() => handleNumpadInput('backspace')}
                className="flex items-center justify-center py-4 md:py-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
            >
                <Delete size={20} />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            {/* Overlay Background */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Main Modal Container */}
            <div className="relative bg-slate-50 md:bg-white/80 md:backdrop-blur-2xl w-full md:max-w-5xl h-dvh md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in md:zoom-in-95 slide-in-from-bottom-10 duration-300 ring-1 ring-white/60">

                {/* --- MOBILE HEADER & TABS --- */}
                <div className="md:hidden bg-white p-4 pb-2 border-b border-slate-200 sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-800">Pembayaran</h3>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                            <X size={20} />
                        </button>
                    </div>
                    {/* Segmented Control for Mobile */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {[
                            { id: 'CASH', label: 'Tunai', icon: Banknote },
                            { id: 'EWALLET', label: 'QRIS', icon: CreditCard },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => onPaymentMethodChange(m.id as 'CASH' | 'EWALLET')}
                                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${paymentMethod === m.id
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <m.icon size={16} /> {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- DESKTOP SIDEBAR --- */}
                <div className="hidden md:flex w-72 bg-slate-50/50 p-6 flex-col gap-3 relative border-r border-slate-200/50">
                    <h3 className="font-bold text-xl mb-4 text-slate-800">Payment</h3>
                    {[
                        { id: 'CASH', label: 'Tunai', icon: Banknote, desc: 'Uang fisik' },
                        { id: 'EWALLET', label: 'QRIS', icon: CreditCard, desc: 'Scan code' },
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => onPaymentMethodChange(m.id as 'CASH' | 'EWALLET')}
                            className={`p-4 rounded-2xl flex items-center gap-4 transition-all border text-left group relative overflow-hidden ${paymentMethod === m.id
                                ? 'bg-slate-900 text-white shadow-lg border-transparent'
                                : 'bg-white border-slate-200/60 text-slate-500 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                                }`}
                        >
                            <div className={`p-2.5 rounded-xl ${paymentMethod === m.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
                                <m.icon size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-sm">{m.label}</div>
                                <div className={`text-xs ${paymentMethod === m.id ? 'text-white/60' : 'text-slate-400'}`}>{m.desc}</div>
                            </div>
                        </button>
                    ))}
                    <button onClick={onClose} className="mt-auto py-4 font-bold text-xs bg-red-50 text-red-500 border border-red-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider">
                        Batalkan
                    </button>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 flex flex-col h-full bg-slate-50 md:bg-transparent overflow-hidden">
                    {/* Summary Header (Collapsible on Mobile) */}
                    <div className="bg-white md:bg-transparent py-3 px-5 md:py-4 md:px-7 shadow-sm md:shadow-none z-10">
                        <div className="text-left md:text-center w-full">
                            <div className="flex items-center justify-between md:justify-center w-full">
                                {/* Mobile Only: Show Details Toggle */}
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="md:hidden p-2 text-slate-400"
                                >
                                    {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Details */}
                        <div className={`${showDetails || !isMobile ? 'block' : 'hidden'} mt-3 md:mt-4 animate-in slide-in-from-top-2`}>
                            <div className="space-y-2 rounded-2xl bg-slate-50 md:bg-white/60 border border-slate-100 md:border-white/60 p-4 text-xs text-slate-500">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-mono font-bold text-slate-700">{formatRupiah(subtotal)}</span>
                                </div>

                                {discountTotal > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-semibold">
                                        <span>Diskon</span>
                                        <span className="font-mono">-{formatRupiah(discountTotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Total Pembayaran</span>
                                    <span className="font-mono text-[20px] font-bold text-slate-900">{formatRupiah(totalDue).replace(",00", "")}</span>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-4">
                        <div className="max-w-md mx-auto h-full flex flex-col">
                            <div className="mb-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'WALK_IN', label: 'Walk-in' },
                                        { id: 'WHATSAPP', label: 'WhatsApp' },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => onSourceChange(option.id as SaleSource)}
                                            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${source === option.id
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                {source === 'WHATSAPP' && (
                                    <div className="grid gap-2">
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(event) => onCustomerNameChange(event.target.value)}
                                            placeholder="Nama pelanggan"
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                        />
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={customerPhone}
                                            onChange={(event) => onCustomerPhoneChange(event.target.value.replace(/\D/g, ''))}
                                            placeholder="Nomor WhatsApp pelanggan"
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                )}

                                {validationError && (
                                    <p className="text-xs font-semibold text-rose-600">{validationError}</p>
                                )}
                            </div>

                            {paymentMethod === 'CASH' && (
                                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">

                                    {/* Input Display Area */}
                                    <div className="shrink-0 space-y-3">
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">Rp</span>
                                            <input
                                                type={isTouchDevice ? "text" : "number"}
                                                inputMode={isTouchDevice ? "none" : "numeric"}
                                                autoFocus={!isTouchDevice}
                                                readOnly={isTouchDevice}
                                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 md:py-5 pl-14 pr-4 text-2xl md:text-3xl font-mono font-bold shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                                                placeholder="0"
                                                value={cashReceived ? parseInt(cashReceived).toLocaleString('id-ID') : ''} // Format while typing
                                                onChange={(e) => {
                                                    if (!isTouchDevice) onCashReceivedChange(e.target.value.replace(/\./g, ''));
                                                }}
                                            />
                                        </div>

                                        {/* Quick Amount Chips - Horizontal Scroll on Mobile */}
                                        <div className="flex md:grid md:grid-cols-4 gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                            {quickCashAmounts.map((amt) => (
                                                <button
                                                    key={amt}
                                                    onClick={() => onCashReceivedChange(amt.toString())}
                                                    className="shrink-0 px-4 py-2 md:py-3 bg-white rounded-xl border border-slate-200 font-mono font-bold text-slate-600 text-xs md:text-sm whitespace-nowrap hover:border-indigo-500 hover:text-indigo-600 active:scale-95 transition-all shadow-sm"
                                                >
                                                    {amt / 1000}k
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => onCashReceivedChange(totalDue.toString())}
                                                className="shrink-0 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs md:text-sm rounded-xl border border-indigo-100 hover:bg-indigo-100 whitespace-nowrap transition-colors"
                                            >
                                                Uang Pas
                                            </button>
                                        </div>
                                    </div>

                                    {/* Numpad & Change Info Layout */}
                                    {isTouchDevice && (
                                        <div className="mt-4">
                                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Numpad</div>
                                            <div className="max-h-70">
                                                <NumpadGrid />
                                            </div>
                                        </div>
                                    )}

                                    {/* Change Display & Pay Button */}
                                    <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 md:bg-transparent pb-safe-area">
                                        <div className="flex justify-between items-center mb-4 px-1">
                                            <span className="font-bold text-slate-500 text-sm">Kembalian</span>
                                            <span className={`text-2xl font-mono font-bold ${change < 0 ? 'text-slate-300' : 'text-emerald-500'}`}>
                                                {change >= 0 ? formatRupiah(change).replace(",00", "") : '-'}
                                            </span>
                                        </div>

                                        <button
                                            disabled={!cashReceived || Number(cashReceived) < totalDue}
                                            onClick={onCheckout}
                                            className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-300/50 disabled:opacity-50 disabled:shadow-none hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Printer size={20} /> Cetak Struk
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'EWALLET' && (
                                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                                    <div className="mt-3 mx-auto w-full max-w-64 aspect-square rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center relative overflow-hidden group">
                                        {/* Placeholder for QR Code Image */}
                                        <div className="w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-500 text-xs font-bold ring-4 ring-slate-50">QR CODE</div>
                                    </div>

                                    <div className="mt-auto py-4">
                                        <button
                                            onClick={onCheckout}
                                            className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-300/50 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Printer size={20} /> Konfirmasi Pembayaran
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
