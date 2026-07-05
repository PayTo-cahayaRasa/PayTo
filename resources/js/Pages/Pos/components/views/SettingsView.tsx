import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Printer } from 'lucide-react';

export default function SettingsView() {
    const [printerName, setPrinterName] = useState('');
    const [printerStatus, setPrinterStatus] = useState<'connected' | 'not_connected'>('not_connected');
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadSettings() {
            try {
                const res = await axios.get('/api/pos/settings');
                if (!mounted) return;
                const data = res.data?.data || {};
                setPrinterName(data.printer?.name ?? '');
                setPrinterStatus(data.printer?.status ?? 'not_connected');
            } catch (e) {
                // silent
            }
        }

        loadSettings();

        return () => {
            mounted = false;
        };
    }, []);

    const handleSavePrinter = async () => {
        if (!printerName.trim()) return;
        setIsSaving(true);
        try {
            const res = await axios.post('/api/pos/settings/printer', {
                name: printerName.trim(),
            });
            setPrinterStatus(res.data?.data?.status ?? 'connected');
        } catch (e) {
            // silent
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestPrint = async () => {
        setIsTesting(true);
        try {
            await axios.post('/api/pos/settings/printer/test');
        } catch (e) {
            // silent
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar-light animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-6">
                <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Perangkat Keras</h3>
                    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-4xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-white/40 flex items-center justify-between hover:bg-white/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Printer size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Printer Thermal</div>
                                    <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${printerStatus === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        {printerStatus === 'connected' ? `Terhubung (${printerName || 'Printer Default'})` : 'Belum terhubung'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleTestPrint}
                                disabled={isTesting || printerStatus !== 'connected'}
                                className="px-4 py-2 bg-white text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                            >
                                {isTesting ? 'Testing...' : 'Test Print'}
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hubungkan Printer</div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <input
                                    type="text"
                                    value={printerName}
                                    onChange={(e) => setPrinterName(e.target.value)}
                                    placeholder="Contoh: Epson TM-T82"
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                                />
                                <button
                                    onClick={handleSavePrinter}
                                    disabled={isSaving || !printerName.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-center pt-4 pb-8">
                    <div className="text-xs font-bold text-slate-400">PayTo v1.0.1</div>
                </div>
            </div>
        </div>
    );
}
