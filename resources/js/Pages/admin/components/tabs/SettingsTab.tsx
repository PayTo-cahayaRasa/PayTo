/**
 * Pengaturan Toko tab - Business settings integration
 */

import React, { useState, useEffect } from 'react';
import { Save, Settings, Globe, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

type BusinessSettings = {
    business: {
        name: string;
        address: string;
        whatsapp_number: string;
        operating_hours: string;
    };
    catalog: {
        enabled: boolean;
        whatsapp_enabled: boolean;
        whatsapp_message_template: string;
    };
};

type ValidationErrors = {
    [key: string]: string[];
};

export default function SettingsTab() {
    const [settings, setSettings] = useState<BusinessSettings>({
        business: {
            name: '',
            address: '',
            whatsapp_number: '',
            operating_hours: '',
        },
        catalog: {
            enabled: true,
            whatsapp_enabled: true,
            whatsapp_message_template: '',
        },
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [errorMessage, setErrorMessage] = useState('');

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/business-settings');
            setSettings(response.data.data);
        } catch (error: any) {
            console.error('Failed to load settings:', error);
            setErrorMessage('Gagal memuat pengaturan. Silakan refresh halaman.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setErrors({});
            setErrorMessage('');
            setSaveStatus('idle');

            await axios.put('/api/admin/business-settings', settings);

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error: any) {
            setSaveStatus('error');

            if (error.response?.status === 422) {
                // Validation errors
                setErrors(error.response.data.errors || {});
                setErrorMessage('Periksa kembali data yang Anda masukkan.');
            } else {
                // Server error
                setErrorMessage(
                    error.response?.data?.message || 'Gagal menyimpan pengaturan. Silakan coba lagi.'
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const getFieldError = (field: string): string | null => {
        return errors[field]?.[0] || null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Status Messages */}
            {saveStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm text-green-900">Berhasil disimpan!</p>
                        <p className="text-xs text-green-700 mt-1">Pengaturan toko berhasil diperbarui.</p>
                    </div>
                </div>
            )}

            {saveStatus === 'error' && errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm text-red-900">Gagal menyimpan</p>
                        <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profil Toko */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-slate-400" /> Profil Toko
                    </h3>

                    <div className="space-y-4">
                        {/* Nama Toko */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Nama Toko *
                            </label>
                            <input
                                type="text"
                                value={settings.business.name}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, name: e.target.value },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none ${
                                    getFieldError('business.name')
                                        ? 'border-red-300 bg-red-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: Toko Maju Jaya"
                            />
                            {getFieldError('business.name') && (
                                <p className="text-xs text-red-600 mt-1">{getFieldError('business.name')}</p>
                            )}
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Alamat Toko *
                            </label>
                            <textarea
                                value={settings.business.address}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, address: e.target.value },
                                    })
                                }
                                rows={3}
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none resize-none ${
                                    getFieldError('business.address')
                                        ? 'border-red-300 bg-red-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: Jl. Merdeka No. 123, Jakarta"
                            />
                            {getFieldError('business.address') && (
                                <p className="text-xs text-red-600 mt-1">{getFieldError('business.address')}</p>
                            )}
                        </div>

                        {/* Nomor WhatsApp */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Nomor WhatsApp
                            </label>
                            <input
                                type="text"
                                value={settings.business.whatsapp_number}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, whatsapp_number: e.target.value },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none ${
                                    getFieldError('business.whatsapp_number')
                                        ? 'border-red-300 bg-red-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: 6281234567890"
                            />
                            <p className="text-[10px] text-slate-400 mt-2">
                                Format: 8-15 digit angka, tanpa +, spasi, atau tanda hubung
                            </p>
                            {getFieldError('business.whatsapp_number') && (
                                <p className="text-xs text-red-600 mt-1">
                                    {getFieldError('business.whatsapp_number')}
                                </p>
                            )}
                        </div>

                        {/* Jam Operasional */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Jam Operasional *
                            </label>
                            <input
                                type="text"
                                value={settings.business.operating_hours}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, operating_hours: e.target.value },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none ${
                                    getFieldError('business.operating_hours')
                                        ? 'border-red-300 bg-red-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: Senin-Sabtu 08.00-20.00 WIB"
                            />
                            {getFieldError('business.operating_hours') && (
                                <p className="text-xs text-red-600 mt-1">
                                    {getFieldError('business.operating_hours')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pengaturan Katalog */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-slate-400" /> Katalog & WhatsApp
                    </h3>

                    <div className="space-y-4">
                        {/* Aktifkan Katalog */}
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/50">
                            <div>
                                <div className="font-bold text-sm text-slate-700">Aktifkan Katalog</div>
                                <div className="text-xs text-slate-500">Tampilkan katalog produk</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.catalog.enabled}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        catalog: { ...settings.catalog, enabled: e.target.checked },
                                    })
                                }
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {/* WhatsApp Enabled */}
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/50">
                            <div>
                                <div className="font-bold text-sm text-slate-700">WhatsApp di Katalog</div>
                                <div className="text-xs text-slate-500">Tampilkan tombol WhatsApp</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.catalog.whatsapp_enabled}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        catalog: { ...settings.catalog, whatsapp_enabled: e.target.checked },
                                    })
                                }
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {/* Template WhatsApp */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Template Pesan WhatsApp *
                            </label>
                            <textarea
                                value={settings.catalog.whatsapp_message_template}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        catalog: { ...settings.catalog, whatsapp_message_template: e.target.value },
                                    })
                                }
                                rows={4}
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none resize-none ${
                                    getFieldError('catalog.whatsapp_message_template')
                                        ? 'border-red-300 bg-red-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}."
                            />
                            <p className="text-[10px] text-slate-400 mt-2">
                                Placeholder: {'{product_name}'}, {'{price}'}, {'{qty}'}
                            </p>
                            {getFieldError('catalog.whatsapp_message_template') && (
                                <p className="text-xs text-red-600 mt-1">
                                    {getFieldError('catalog.whatsapp_message_template')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center sm:justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-300 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                    {saving ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
