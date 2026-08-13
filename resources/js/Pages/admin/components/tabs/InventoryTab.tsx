/**
 * Smart inventory recommendations table.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import type { InventoryRecommendation } from '../../types';

export default function InventoryTab() {
    const [items, setItems] = useState<InventoryRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        const fetchRecommendations = async () => {
            try {
                const response = await axios.get('/api/admin/inventory/recommendations');
                if (!isActive) {
                    return;
                }
                setItems(response.data?.data ?? []);
            } catch (error) {
                if (!isActive) {
                    return;
                }
                setErrorMessage('Gagal memuat rekomendasi stok.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchRecommendations();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            {errorMessage ? (
                <div className="bg-danger-50 text-danger-600 border border-danger-200 rounded-2xl px-4 py-3 text-sm font-semibold mb-4">
                    {errorMessage}
                </div>
            ) : null}

            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl sm:rounded-4xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-white/50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-cocoa-800">Rekomendasi Pembelian (Restock)</h3>
                        <p className="text-xs text-cocoa-500">Dihitung otomatis: (Avg Sales 7 Hari × Lead Time) + Safety Stock</p>
                    </div>
                    <button className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-snack-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-snack-200 hover:bg-snack-700 transition-all sm:w-auto">
                        <FileText size={16} /> Export PDF
                    </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-cocoa-50/50 text-cocoa-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Produk</th>
                                <th className="px-6 py-4">Avg Sales (7d)</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4">Reorder Point</th>
                                <th className="px-6 py-4">Saran Order</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cocoa-100">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-cocoa-200 rounded w-1/2"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-cocoa-200 rounded w-1/3"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-cocoa-200 rounded w-1/4"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-cocoa-200 rounded w-1/4"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-cocoa-200 rounded w-1/4"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-cocoa-200 rounded w-1/5"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : (items.length ? (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-cocoa-800 wrap-break-word">{item.productName}</div>
                                            <div className="text-xs text-cocoa-400 font-mono wrap-break-word">{item.sku ?? 'Tanpa SKU'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-cocoa-600">{item.avgSales7d.toFixed(1)} /hari</td>
                                        <td className="px-6 py-4 font-bold text-cocoa-800">{item.stock}</td>
                                        <td className="px-6 py-4 text-cocoa-500">{item.reorderPoint}</td>
                                        <td className="px-6 py-4">
                                            {item.suggestedQty > 0 ? (
                                                <span className="font-bold text-snack-600 bg-snack-50 px-3 py-1 rounded-lg border border-snack-100">
                                                    +{item.suggestedQty}
                                                </span>
                                            ) : (
                                                <span className="text-cocoa-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.status === 'CRITICAL' && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-danger-600 bg-danger-50 px-2 py-1 rounded-full w-fit">
                                                    <AlertTriangle size={12} /> CRITICAL
                                                </span>
                                            )}
                                            {item.status === 'WARNING' && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-snack-600 bg-snack-50 px-2 py-1 rounded-full w-fit">
                                                    <AlertTriangle size={12} /> LOW
                                                </span>
                                            )}
                                            {item.status === 'SAFE' && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-leaf-600 bg-leaf-50 px-2 py-1 rounded-full w-fit">
                                                    <CheckCircle size={12} /> SAFE
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-cocoa-400">
                                        Tidak ada rekomendasi restock saat ini.
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List View */}
                <div className="block md:hidden divide-y divide-cocoa-100">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="p-4 space-y-3 animate-pulse">
                                <div className="h-4 bg-cocoa-200 rounded w-2/3"></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-10 bg-cocoa-100 rounded-xl"></div>
                                    <div className="h-10 bg-cocoa-100 rounded-xl"></div>
                                </div>
                            </div>
                        ))
                    ) : items.length ? (
                        items.map((item) => (
                            <div key={item.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-bold text-cocoa-800 text-sm break-words">{item.productName}</h4>
                                        <p className="text-xs text-cocoa-400 font-mono">{item.sku ?? 'Tanpa SKU'}</p>
                                    </div>
                                    {item.status === 'CRITICAL' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full shrink-0">
                                            <AlertTriangle size={11} /> CRITICAL
                                        </span>
                                    )}
                                    {item.status === 'WARNING' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-snack-600 bg-snack-50 px-2 py-0.5 rounded-full shrink-0">
                                            <AlertTriangle size={11} /> LOW
                                        </span>
                                    )}
                                    {item.status === 'SAFE' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded-full shrink-0">
                                            <CheckCircle size={11} /> SAFE
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white/60 p-2.5 rounded-xl border border-white/60">
                                        <span className="text-cocoa-400 text-[10px] uppercase font-bold tracking-wider block">Stok Saat Ini</span>
                                        <span className="font-bold text-cocoa-800 text-sm">{item.stock}</span>
                                    </div>
                                    <div className="bg-white/60 p-2.5 rounded-xl border border-white/60">
                                        <span className="text-cocoa-400 text-[10px] uppercase font-bold tracking-wider block">Avg Sales (7d)</span>
                                        <span className="font-mono font-medium text-cocoa-700">{item.avgSales7d.toFixed(1)} /hari</span>
                                    </div>
                                    <div className="bg-white/60 p-2.5 rounded-xl border border-white/60">
                                        <span className="text-cocoa-400 text-[10px] uppercase font-bold tracking-wider block">Reorder Point</span>
                                        <span className="font-medium text-cocoa-700">{item.reorderPoint}</span>
                                    </div>
                                    <div className="bg-white/60 p-2.5 rounded-xl border border-white/60">
                                        <span className="text-cocoa-400 text-[10px] uppercase font-bold tracking-wider block">Saran Order</span>
                                        {item.suggestedQty > 0 ? (
                                            <span className="font-bold text-snack-600">+{item.suggestedQty}</span>
                                        ) : (
                                            <span className="text-cocoa-400">-</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-xs sm:text-sm text-cocoa-400">
                            Tidak ada rekomendasi restock saat ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
