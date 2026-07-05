import React, { useState } from 'react';
import {
    Banknote,
    Clock,
    CreditCard,
    ShoppingBag,
    ChevronDown
} from 'lucide-react';

import type { TransactionHistory } from '../../types';

type HistoryViewProps = {
    history: TransactionHistory[];
    formatRupiah: (num: number) => string;
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onResetFilters: () => void;
    page: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    onRequestRefund: (tx: TransactionHistory) => void;
};

export default function HistoryView({
    history,
    formatRupiah,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onResetFilters,
    page,
    lastPage,
    onPageChange,
    onRequestRefund,
}: HistoryViewProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggle = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    return (
        <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar-light">
            <div className="flex flex-col gap-3">
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mulai</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                                className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sampai</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                                className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                        Reset Filter
                    </button>
                </div>
                {history.map((tx) => {
                    const isOpen = expandedId === tx.id;
                    const subtotalValue = tx.totalBeforeDiscount ?? 0;
                    const discountValue = tx.discountTotal ?? 0;
                    const totalAfterDiscountValue = tx.totalAfterDiscount ?? 0;
                    const taxAmount = tx.taxTotal ?? 0;
                    const totalValue = tx.total ?? 0;

                    return (
                        <div key={tx.id} className="group">
                            {/* CARD */}
                            <button
                                type="button"
                                onClick={() => toggle(tx.id)}
                                className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:shadow-md transition-all text-left"
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner
                                        ${tx.status === 'VOID'
                                                ? 'bg-rose-100 text-rose-500'
                                                : 'bg-emerald-100 text-emerald-600'
                                            }`}
                                    >
                                        {tx.paymentMethod === 'CASH'
                                            ? <Banknote size={20} />
                                            : <CreditCard size={20} />}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-slate-800 break-all">{tx.invoiceNo}</h4>
                                            {tx.status === 'VOID' && (
                                                <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">
                                                    VOID
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {tx.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ShoppingBag size={12} /> {tx.items} items
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                                    <div className="text-left sm:text-right min-w-0">
                                        <div className="font-mono font-bold text-lg text-slate-800">
                                            {formatRupiah(tx.total).replace(',00', '')}
                                        </div>

                                    </div>

                                    <ChevronDown
                                        size={18}
                                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </button>

                            {/* DETAIL */}
                            <div
                                className={`overflow-hidden transition-all duration-300
    ${isOpen ? 'max-h-175 opacity-100 mt-2' : 'max-h-0 opacity-0'}
    `}
                            >
                                <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-4 space-y-4">

                                    {/* INFO RINGKAS */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-400">Metode Pembayaran</p>
                                            <p className="font-semibold">{tx.paymentMethod}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">Status</p>
                                            <p className="font-semibold">{tx.status}</p>
                                        </div>
                                    </div>

                                    {/* LIST ITEM */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 mb-2">
                                            Detail Item ({tx.itemsDetail.length})
                                        </p>

                                        <div className="divide-y divide-slate-200/60">
                                            {tx.itemsDetail.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center py-2 text-sm"
                                                >
                                                    <div>
                                                        <p className="font-medium text-slate-800">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {item.qty} × {formatRupiah(item.price)}
                                                        </p>
                                                    </div>

                                                    <div className="font-mono font-semibold text-slate-700">
                                                        {formatRupiah(item.lineTotal).replace(',00', '')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* REFUND INFO */}
                                    {(tx.refundedTotal > 0 || tx.canRefund || tx.hasPendingRefundApproval) && (
                                        <div className="space-y-2 border-t border-slate-200/60 pt-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Total refund</span>
                                                <span className="font-mono font-semibold text-slate-700">
                                                    {formatRupiah(tx.refundedTotal).replace(',00', '')}
                                                </span>
                                            </div>
                                            {tx.hasPendingRefundApproval && (
                                                <div className="flex justify-between items-center text-amber-600">
                                                    <span>Menunggu approval</span>
                                                    <span className="font-mono font-semibold">
                                                        {formatRupiah(tx.pendingRefundTotal).replace(',00', '')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Sisa refund</span>
                                                <span className="font-mono font-semibold text-slate-700">
                                                    {formatRupiah(tx.refundableRemaining).replace(',00', '')}
                                                </span>
                                            </div>
                                            {tx.refundDeadline && !tx.canRefund && !tx.hasPendingRefundApproval && (
                                                <p className="text-xs text-amber-600">
                                                    Masa refund berakhir pada {tx.refundDeadline}.
                                                </p>
                                            )}
                                            {tx.hasPendingRefundApproval && (
                                                <p className="text-xs text-amber-600">
                                                    Refund menunggu persetujuan supervisor.
                                                </p>
                                            )}
                                            {tx.canRefund && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRequestRefund(tx)}
                                                    className="mt-2 inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                                                >
                                                    Refund
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* TOTAL */}
                                    <div className="space-y-2 border-t border-slate-200/60 pt-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Total sebelum diskon</span>
                                            <span className="font-mono font-semibold text-slate-700">
                                                {formatRupiah(subtotalValue).replace(',00', '')}
                                            </span>
                                        </div>
                                        {discountValue > 0 && (
                                            <div className="flex justify-between items-center text-emerald-600">
                                                <span>Diskon</span>
                                                <span className="font-mono font-semibold">
                                                    -{formatRupiah(discountValue).replace(',00', '')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-slate-500">
                                            <span>Pajak (11%)</span>
                                            <span className="font-mono font-semibold text-slate-700">
                                                {formatRupiah(taxAmount).replace(',00', '')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-600">Total setelah diskon</span>
                                            <span className="font-mono font-bold text-slate-800">
                                                {formatRupiah(totalAfterDiscountValue).replace(',00', '')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Total tagihan</span>
                                            <span className="font-mono font-semibold text-slate-900">
                                                {formatRupiah(totalValue).replace(',00', '')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200/50 mt-2 pt-4">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-xs font-bold text-slate-400">
                        Halaman {page} dari {Math.max(lastPage, 1)}
                    </span>
                    <button
                        type="button"
                        disabled={page >= lastPage}
                        onClick={() => onPageChange(page + 1)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
        </div>
    );
}
