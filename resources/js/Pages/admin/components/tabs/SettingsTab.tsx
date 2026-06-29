/**
 * App settings tab for general preferences and system controls.
 */

import React from 'react';
import { Save, Settings, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';

type SettingsTabProps = {
    storeName: string;
    onChangeStoreName: (value: string) => void;
    discountLimit: number;
    onChangeDiscountLimit: (value: number) => void;
    allowNegativeStock: boolean;
    onToggleAllowNegativeStock: () => void;
};

export default function SettingsTab({
    storeName,
    onChangeStoreName,
    discountLimit,
    onChangeDiscountLimit,
    allowNegativeStock,
    onToggleAllowNegativeStock,
}: SettingsTabProps) {
    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm h-fit">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <Settings size={20} className="text-slate-400" /> Umum
                </h3>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Toko</label>
                        <input
                            type="text"
                            value={storeName}
                            onChange={(e) => onChangeStoreName(e.target.value)}
                            className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Batas Diskon Kasir (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={discountLimit}
                                onChange={(e) => onChangeDiscountLimit(Number(e.target.value))}
                                className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Diskon di atas nilai ini membutuhkan Approval Supervisor.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm h-fit">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-slate-400" /> Kontrol Sistem
                </h3>

                <div className="space-y-4">
                    <div className="flex flex-col gap-3 p-4 bg-white/50 rounded-2xl border border-white/50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-700">Izinkan Stok Negatif</div>
                            <div className="text-xs text-slate-500">Transaksi tetap jalan meski stok 0</div>
                        </div>
                        <button
                            onClick={onToggleAllowNegativeStock}
                            className={`self-start text-2xl transition-colors sm:self-auto ${allowNegativeStock ? 'text-indigo-600' : 'text-slate-300'}`}
                        >
                            {allowNegativeStock ? <ToggleRight size={40} fill="currentColor" /> : <ToggleLeft size={40} />}
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 p-4 bg-white/50 rounded-2xl border border-white/50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-700">Mode Debug / Dev</div>
                            <div className="text-xs text-slate-500">Menampilkan log error detail</div>
                        </div>
                        <button className="self-start text-2xl text-slate-300 sm:self-auto">
                            <ToggleLeft size={40} />
                        </button>
                    </div>

                </div>
            </div>

            <div className="md:col-span-2 flex justify-center sm:justify-end">
                <button className="flex w-full items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-300 hover:bg-slate-900 transition-all sm:w-auto">
                    <Save size={20} /> Simpan Perubahan
                </button>
            </div>
        </div>
    );
}
