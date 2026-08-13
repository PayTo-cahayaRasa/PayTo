/**
 * Pengaturan Toko tab - Business settings integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Save, Settings, Globe, AlertCircle, CheckCircle, Loader2, Landmark, QrCode, UploadCloud } from 'lucide-react';
import axios from 'axios';

type BusinessSettings = {
    business: {
        name: string;
        tagline?: string;
        address: string;
        whatsapp_number: string;
        operating_hours: string;
        shopee_url?: string;
        instagram_url?: string;
        tiktok_url?: string;
    };
    catalog: {
        enabled: boolean;
        whatsapp_enabled: boolean;
        whatsapp_message_template: string;
    };
    online_order: {
        shipping: {
            origin: string;
            packaging_weight_grams: number;
            couriers: string[];
        };
        payment: {
            bank_name: string;
            bank_account_number: string;
            bank_account_name: string;
            qris_image_url: string;
            qris_image_path: string;
            instructions: string;
        };
    };
};

type ValidationErrors = {
    [key: string]: string[];
};

export default function SettingsTab() {
    const [settings, setSettings] = useState<BusinessSettings>({
        business: {
            name: '',
            tagline: '',
            address: '',
            whatsapp_number: '',
            operating_hours: '',
            shopee_url: '',
            instagram_url: '',
            tiktok_url: '',
        },
        catalog: {
            enabled: true,
            whatsapp_enabled: true,
            whatsapp_message_template: '',
        },
        online_order: {
            shipping: {
                origin: '',
                packaging_weight_grams: 0,
                couriers: ['jne', 'jnt', 'sicepat'],
            },
            payment: {
                bank_name: '',
                bank_account_number: '',
                bank_account_name: '',
                qris_image_url: '',
                qris_image_path: '',
                instructions: 'Lakukan pembayaran sesuai total pesanan, lalu kirim bukti pembayaran melalui WhatsApp.',
            },
        },
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [errorMessage, setErrorMessage] = useState('');
    const [isUploadingQris, setIsUploadingQris] = useState(false);
    const qrisImageInputRef = useRef<HTMLInputElement | null>(null);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/business-settings');
            setSettings({
                business: response.data.data.business,
                catalog: response.data.data.catalog,
                online_order: response.data.data.online_order,
            });
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

            const payload = {
                business: {
                    ...settings.business,
                    whatsapp_number: settings.business.whatsapp_number.replace(/\D/g, ''),
                },
                catalog: settings.catalog,
                online_order: settings.online_order,
            };

            const response = await axios.put('/api/admin/business-settings', payload);

            setSettings({
                business: response.data.data.business,
                catalog: response.data.data.catalog,
                online_order: response.data.data.online_order,
            });

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

    const handleQrisImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const qrisImage = event.target.files?.[0];
        if (!qrisImage) {
            return;
        }

        const payload = new FormData();
        payload.append('qris_image', qrisImage);

        try {
            setIsUploadingQris(true);
            setErrorMessage('');
            const response = await axios.post('/api/admin/business-settings/qris-image', payload);
            const uploadedPayment = response.data.data.online_order.payment;
            setSettings((current) => ({
                ...current,
                online_order: {
                    ...current.online_order,
                    payment: {
                        ...current.online_order.payment,
                        qris_image_url: uploadedPayment.qris_image_url,
                        qris_image_path: uploadedPayment.qris_image_path,
                    },
                },
            }));
        } catch (error: any) {
            setSaveStatus('error');
            setErrorMessage(error.response?.data?.message || 'Gagal mengunggah gambar QRIS.');
        } finally {
            setIsUploadingQris(false);
            event.target.value = '';
        }
    };

    const getFieldError = (field: string): string | null => {
        return errors[field]?.[0] || null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-snack-600" />
            </div>
        );
    }

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Status Messages */}
            {saveStatus === 'success' && (
                <div role="status" className="fixed right-4 top-4 z-50 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-lg sm:right-6 sm:top-6">
                    <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" />
                    <p className="text-sm font-bold text-green-900">Berhasil disimpan!</p>
                </div>
            )}

            {saveStatus === 'error' && errorMessage && (
                <div className="bg-danger-50 border border-danger-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-danger-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm text-danger-900">Gagal menyimpan</p>
                        <p className="text-xs text-danger-700 mt-1">{errorMessage}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Profil Toko */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl sm:rounded-4xl p-4 sm:p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-cocoa-800 mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-cocoa-400" /> Profil Toko
                    </h3>

                    <div className="space-y-4">
                        {/* Nama Toko */}
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
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
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none ${
                                    getFieldError('business.name')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: Toko Maju Jaya"
                            />
                            {getFieldError('business.name') && (
                                <p className="text-xs text-danger-600 mt-1">{getFieldError('business.name')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
                                Tagline
                            </label>
                            <input
                                type="text"
                                value={settings.business.tagline || ''}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, tagline: e.target.value },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none ${
                                    getFieldError('business.tagline')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: Oleh-Oleh Malang"
                            />
                            {getFieldError('business.tagline') && (
                                <p className="text-xs text-danger-600 mt-1">{getFieldError('business.tagline')}</p>
                            )}
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
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
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none resize-none ${
                                    getFieldError('business.address')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: Jl. Merdeka No. 123, Jakarta"
                            />
                            {getFieldError('business.address') && (
                                <p className="text-xs text-danger-600 mt-1">{getFieldError('business.address')}</p>
                            )}
                        </div>

                        {/* Nomor WhatsApp */}
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
                                Nomor WhatsApp
                            </label>
                            <input
                                type="text"
                                value={settings.business.whatsapp_number}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, whatsapp_number: e.target.value.replace(/\D/g, '') },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none ${
                                    getFieldError('business.whatsapp_number')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: 6281234567890"
                            />
                            <p className="text-[10px] text-cocoa-400 mt-2">
                                Format: 8-15 digit angka, tanpa +, spasi, atau tanda hubung
                            </p>
                            {getFieldError('business.whatsapp_number') && (
                                <p className="text-xs text-danger-600 mt-1">
                                    {getFieldError('business.whatsapp_number')}
                                </p>
                            )}
                        </div>

                        {/* Jam Operasional */}
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
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
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none ${
                                    getFieldError('business.operating_hours')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Contoh: Senin-Sabtu 08.00-20.00 WIB"
                            />
                            {getFieldError('business.operating_hours') && (
                                <p className="text-xs text-danger-600 mt-1">
                                    {getFieldError('business.operating_hours')}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
                                Link Shopee
                            </label>
                            <input
                                type="url"
                                value={settings.business.shopee_url || ''}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, shopee_url: e.target.value },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none ${
                                    getFieldError('business.shopee_url')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="https://shopee.co.id/nama-toko"
                            />
                            {getFieldError('business.shopee_url') && (
                                <p className="text-xs text-danger-600 mt-1">{getFieldError('business.shopee_url')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
                                Link Instagram
                            </label>
                            <input
                                type="url"
                                value={settings.business.instagram_url || ''}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, instagram_url: e.target.value },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none ${
                                    getFieldError('business.instagram_url')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="https://www.instagram.com/cahayarasamalang/"
                            />
                            {getFieldError('business.instagram_url') && (
                                <p className="text-xs text-danger-600 mt-1">{getFieldError('business.instagram_url')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
                                Link TikTok
                            </label>
                            <input
                                type="url"
                                value={settings.business.tiktok_url || ''}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        business: { ...settings.business, tiktok_url: e.target.value },
                                    })
                                }
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none ${
                                    getFieldError('business.tiktok_url')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="https://www.tiktok.com/@cahayarasa_28"
                            />
                            {getFieldError('business.tiktok_url') && (
                                <p className="text-xs text-danger-600 mt-1">{getFieldError('business.tiktok_url')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pengaturan Katalog */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-4xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-cocoa-800 mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-cocoa-400" /> Katalog & WhatsApp
                    </h3>

                    <div className="space-y-4">
                        {/* Aktifkan Katalog */}
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/50">
                            <div>
                                <div className="font-bold text-sm text-cocoa-700">Aktifkan Katalog</div>
                                <div className="text-xs text-cocoa-500">Tampilkan katalog produk</div>
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
                                className="w-5 h-5 text-snack-600 rounded focus:ring-2 focus:ring-snack-200"
                            />
                        </div>

                        {/* WhatsApp Enabled */}
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/50">
                            <div>
                                <div className="font-bold text-sm text-cocoa-700">WhatsApp di Katalog</div>
                                <div className="text-xs text-cocoa-500">Tampilkan tombol WhatsApp</div>
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
                                className="w-5 h-5 text-snack-600 rounded focus:ring-2 focus:ring-snack-200"
                            />
                        </div>

                        {/* Template WhatsApp */}
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">
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
                                className={`w-full p-4 bg-white/60 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-snack-200 outline-none resize-none ${
                                    getFieldError('catalog.whatsapp_message_template')
                                        ? 'border-danger-300 bg-danger-50/50'
                                        : 'border-white/60'
                                }`}
                                placeholder="Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}."
                            />
                            <p className="text-[10px] text-cocoa-400 mt-2">
                                Placeholder: {'{product_name}'}, {'{price}'}, {'{qty}'}
                            </p>
                            {getFieldError('catalog.whatsapp_message_template') && (
                                <p className="text-xs text-danger-600 mt-1">
                                    {getFieldError('catalog.whatsapp_message_template')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-4xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-cocoa-800 mb-2 flex items-center gap-2">
                        <Landmark size={20} className="text-cocoa-400" /> Pembayaran Pesanan Online
                    </h3>
                    <p className="mb-6 text-sm text-cocoa-500">Informasi ini akan ditampilkan saat pelanggan memilih transfer bank atau QRIS.</p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">Nama Bank</label>
                            <input
                                type="text"
                                value={settings.online_order.payment.bank_name}
                                onChange={(event) => setSettings({
                                    ...settings,
                                    online_order: {
                                        ...settings.online_order,
                                        payment: { ...settings.online_order.payment, bank_name: event.target.value },
                                    },
                                })}
                                placeholder="Contoh: BCA"
                                className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-snack-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">Nomor Rekening</label>
                            <input
                                type="text"
                                value={settings.online_order.payment.bank_account_number}
                                onChange={(event) => setSettings({
                                    ...settings,
                                    online_order: {
                                        ...settings.online_order,
                                        payment: { ...settings.online_order.payment, bank_account_number: event.target.value },
                                    },
                                })}
                                placeholder="Contoh: 1234567890"
                                className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-snack-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">Atas Nama</label>
                            <input
                                type="text"
                                value={settings.online_order.payment.bank_account_name}
                                onChange={(event) => setSettings({
                                    ...settings,
                                    online_order: {
                                        ...settings.online_order,
                                        payment: { ...settings.online_order.payment, bank_account_name: event.target.value },
                                    },
                                })}
                                placeholder="Contoh: Cahaya Rasa"
                                className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-snack-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div>
                            <label className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">Instruksi Pembayaran</label>
                            <textarea
                                rows={5}
                                value={settings.online_order.payment.instructions}
                                onChange={(event) => setSettings({
                                    ...settings,
                                    online_order: {
                                        ...settings.online_order,
                                        payment: { ...settings.online_order.payment, instructions: event.target.value },
                                    },
                                })}
                                className="w-full resize-none p-4 bg-white/60 border border-white/60 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-snack-200 outline-none"
                            />
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-cocoa-500 uppercase tracking-wider mb-2">QRIS</span>
                            <label className="flex h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cocoa-300 bg-white/60 text-cocoa-400 transition-colors hover:border-snack-400 hover:bg-snack-50 hover:text-snack-500">
                                {settings.online_order.payment.qris_image_url ? (
                                    <img src={settings.online_order.payment.qris_image_url} alt="QRIS toko" className="h-full w-full object-contain p-3" />
                                ) : (
                                    <>
                                        <QrCode size={32} className="mb-2" />
                                        <span className="text-xs font-bold">Upload QRIS</span>
                                    </>
                                )}
                                <input
                                    ref={qrisImageInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={handleQrisImageChange}
                                />
                            </label>
                            <p className="mt-2 flex items-center gap-1 text-[11px] text-cocoa-400">
                                {isUploadingQris ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                                {isUploadingQris ? 'Mengunggah QRIS...' : 'JPG, PNG, atau WEBP, maks. 4 MB.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center sm:justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 px-8 py-4 bg-cocoa-800 text-white rounded-2xl font-bold shadow-xl shadow-cocoa-300 hover:bg-cocoa-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
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
