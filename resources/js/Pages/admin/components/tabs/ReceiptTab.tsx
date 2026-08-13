/**
 * Receipt template editor with live preview.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Settings } from 'lucide-react';

export default function ReceiptTab() {
    const [receiptHeader, setReceiptHeader] = useState('');
    const [receiptFooter, setReceiptFooter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        const fetchSettings = async () => {
            try {
                const response = await axios.get('/api/admin/receipt-settings');
                if (!isActive) {
                    return;
                }
                const data = response.data?.data ?? {};
                setReceiptHeader(data.header ?? '');
                setReceiptFooter(data.footer ?? '');
            } catch (error) {
                if (!isActive) {
                    return;
                }
                setErrorMessage('Gagal memuat pengaturan struk.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchSettings();

        return () => {
            isActive = false;
        };
    }, []);

    const handleSave = async () => {
        if (isSaving) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await axios.put('/api/admin/receipt-settings', {
                header: receiptHeader,
                footer: receiptFooter,
            });
            const data = response.data?.data ?? {};
            setReceiptHeader(data.header ?? receiptHeader);
            setReceiptFooter(data.footer ?? receiptFooter);
            setSuccessMessage('Pengaturan struk berhasil disimpan.');
        } catch (error) {
            setErrorMessage('Gagal menyimpan pengaturan struk.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                {errorMessage ? (
                    <div className="bg-danger-50 text-danger-600 border border-danger-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                        {errorMessage}
                    </div>
                ) : null}
                {successMessage ? (
                    <div className="bg-leaf-50 text-leaf-600 border border-leaf-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                        {successMessage}
                    </div>
                ) : null}

                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl sm:rounded-4xl p-4 sm:p-6 shadow-sm">
                    <h3 className="font-bold text-cocoa-800 mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-cocoa-400" /> Konfigurasi Template
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">Header Struk</label>
                            <textarea
                                rows={4}
                                value={receiptHeader}
                                onChange={(e) => setReceiptHeader(e.target.value)}
                                className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-snack-200 outline-none"
                                placeholder="Nama Toko, Alamat, Telp..."
                            />
                            <p className="text-[10px] text-cocoa-400 mt-1">*Mendukung placeholder: {'{store_name}'}, {'{date}'}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">Footer Struk</label>
                            <textarea
                                rows={3}
                                value={receiptFooter}
                                onChange={(e) => setReceiptFooter(e.target.value)}
                                className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-snack-200 outline-none"
                                placeholder="Ucapan terima kasih, info wifi, sosmed..."
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-cocoa-800 text-white rounded-2xl font-bold shadow-lg shadow-cocoa-300 hover:bg-cocoa-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Template'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="w-full max-w-90 bg-white p-6 rounded-none shadow-2xl relative font-mono text-xs text-cocoa-800 border-t-8 border-cocoa-200">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCA0IiB3aWR0aD0iMjAiIGhlaWdodD0iNCI+PHBhdGggZD0iTTAgNGw1LTRsNSA0bDUtNGw1IDR2LTRoLTIweiIgZmlsbD0iI2UzZTNiOCIvPjwvc3ZnPg==')] opacity-50"></div>

                    <div className="text-center mb-4 whitespace-pre-wrap leading-tight wrap-break-word">
                        {receiptHeader}
                    </div>

                    <div className="border-b border-dashed border-cocoa-300 my-2"></div>
                    <div className="flex justify-between mb-1"><span>20/01/2026</span><span>14:30</span></div>
                    <div className="flex justify-between mb-2"><span>Inv: #INV-001</span><span>Kasir: Budi</span></div>
                    <div className="border-b border-dashed border-cocoa-300 my-2"></div>

                    <div className="space-y-1 mb-2">
                        <div className="flex justify-between font-bold"><span>Kopi Susu Aren</span><span>18.000</span></div>
                        <div className="text-cocoa-500">1 x 18.000</div>

                        <div className="flex justify-between font-bold mt-2"><span>Croissant</span><span>22.000</span></div>
                        <div className="text-cocoa-500">1 x 22.000</div>
                    </div>

                    <div className="border-b border-dashed border-cocoa-300 my-2"></div>
                    <div className="flex justify-between"><span>Subtotal</span><span>40.000</span></div>
                    <div className="flex justify-between"><span>Tax (10%)</span><span>4.000</span></div>
                    <div className="flex justify-between text-lg font-bold mt-2"><span>TOTAL</span><span>44.000</span></div>
                    <div className="border-b border-dashed border-cocoa-300 my-2"></div>

                    <div className="text-center mt-4 whitespace-pre-wrap leading-tight text-cocoa-600 wrap-break-word">
                        {receiptFooter}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCA0IiB3aWR0aD0iMjAiIGhlaWdodD0iNCI+PHBhdGggZD0iTTAgMGw1IDRsNS00bDUgNHY0aC0yMHoiIGZpbGw9IiNlM2UzYjgiLz48L3N2Zz4=')] opacity-50 rotate-180"></div>
                </div>
            </div>
        </div>
    );
}
