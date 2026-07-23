/**
 * Products tab with list and add/edit modal.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Edit, Minus, Package, Plus, Save, Settings, Trash2, UploadCloud, X } from 'lucide-react';
import type { Product } from '../../types';
import ProductImageCropper from '../products/ProductImageCropper';

type ProductFormState = {
    name: string;
    description: string;
    sku: string;
    uom: string;
    weight_grams: string;
    price: string;
    stock: string;
    discount: string;
    is_active: boolean;
};

type StockAction = 'ADD' | 'SUBTRACT' | 'SET';

const defaultFormState: ProductFormState = {
    name: '',
    description: '',
    sku: '',
    uom: 'pcs',
    weight_grams: '',
    price: '0',
    stock: '0',
    discount: '0',
    is_active: true,
};

const formatStockProductLabel = (product: Product) => `${product.name} (${product.sku ?? 'Tanpa SKU'})`;
const normalizeSearchValue = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default function ProductsTab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [productImageToCrop, setProductImageToCrop] = useState<File | null>(null);
    const [productImageError, setProductImageError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockAction, setStockAction] = useState<StockAction>('ADD');
    const [selectedStockProductId, setSelectedStockProductId] = useState<number | ''>('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockProductKeyword, setStockProductKeyword] = useState('');
    const [debouncedStockProductKeyword, setDebouncedStockProductKeyword] = useState('');
    const [showStockProductDropdown, setShowStockProductDropdown] = useState(false);
    const [stockError, setStockError] = useState<string | null>(null);
    const [stockSuccess, setStockSuccess] = useState<string | null>(null);
    const [stockSubmitting, setStockSubmitting] = useState(false);
    const stockProductDropdownRef = useRef<HTMLDivElement | null>(null);
    const productImageInputRef = useRef<HTMLInputElement | null>(null);

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }), []);

    const selectedStockProduct = useMemo(
        () => products.find((item) => item.id === selectedStockProductId) ?? null,
        [products, selectedStockProductId]
    );

    const filteredStockProducts = useMemo(() => {
        const keyword = normalizeSearchValue(debouncedStockProductKeyword);
        if (!keyword) {
            return products.slice(0, 30);
        }

        return products.filter((product) => {
            const searchableText = normalizeSearchValue(
                `${product.name} ${product.sku ?? ''} ${product.barcode ?? ''} ${product.uom ?? ''}`
            );
            return searchableText.includes(keyword);
        }).slice(0, 30);
    }, [products, debouncedStockProductKeyword]);

    const isStockSearchDebouncing = stockProductKeyword.trim().toLowerCase() !== debouncedStockProductKeyword.trim().toLowerCase();

    const stockPreview = useMemo(() => {
        if (!selectedStockProduct) {
            return null;
        }

        const quantity = Number(stockQuantity);
        if (Number.isNaN(quantity) || quantity < 0) {
            return null;
        }

        if (stockAction === 'ADD') {
            return selectedStockProduct.stock + quantity;
        }

        if (stockAction === 'SUBTRACT') {
            return selectedStockProduct.stock - quantity;
        }

        return quantity;
    }, [selectedStockProduct, stockAction, stockQuantity]);

    useEffect(() => {
        let isActive = true;

        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/admin/products');
                if (!isActive) {
                    return;
                }
                setProducts(response.data?.data ?? []);
            } catch (error) {
                if (!isActive) {
                    return;
                }
                setErrorMessage('Gagal memuat data produk.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => () => {
        if (productImagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(productImagePreview);
        }
    }, [productImagePreview]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedStockProductKeyword(stockProductKeyword);
        }, 300);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [stockProductKeyword]);

    useEffect(() => {
        if (!showStockModal || selectedStockProductId === '') {
            return;
        }

        const selectedStillExists = products.some((item) => item.id === selectedStockProductId);
        if (!selectedStillExists) {
            setSelectedStockProductId('');
            setStockProductKeyword('');
            setDebouncedStockProductKeyword('');
        }
    }, [showStockModal, products, selectedStockProductId]);

    useEffect(() => {
        if (!showStockModal || !showStockProductDropdown) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            if (stockProductDropdownRef.current && !stockProductDropdownRef.current.contains(targetNode)) {
                setShowStockProductDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showStockModal, showStockProductDropdown]);

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setFormState(defaultFormState);
        setProductImageFile(null);
        setProductImagePreview(null);
        setProductImageError(null);
        setShowProductModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setFormState({
            name: product.name,
            description: product.description ?? '',
            sku: product.sku ?? '',
            uom: product.uom ?? 'pcs',
            weight_grams: product.weight_grams?.toString() ?? '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            discount: product.discount.toString(),
            is_active: product.is_active,
        });
        setProductImageFile(null);
        setProductImagePreview(product.image_url ?? null);
        setProductImageError(null);
        setShowProductModal(true);
    };

    const handleCloseModal = () => {
        if (isSubmitting) {
            return;
        }
        setShowProductModal(false);
    };

    const resetStockForm = () => {
        setStockAction('ADD');
        setSelectedStockProductId('');
        setStockQuantity('');
        setStockProductKeyword('');
        setDebouncedStockProductKeyword('');
        setShowStockProductDropdown(false);
        setStockError(null);
        setStockSuccess(null);
    };

    const handleOpenStockModal = () => {
        setStockError(null);
        setStockSuccess(null);
        setStockAction('ADD');
        setStockQuantity('');
        setStockProductKeyword('');
        setDebouncedStockProductKeyword('');
        setShowStockProductDropdown(false);
        setSelectedStockProductId('');
        setShowStockModal(true);
    };

    const handleCloseStockModal = () => {
        if (stockSubmitting) {
            return;
        }
        setShowStockModal(false);
        resetStockForm();
    };

    const handleStockProductKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStockProductKeyword(event.target.value);
        setSelectedStockProductId('');
        setShowStockProductDropdown(true);
        setStockError(null);
        setStockSuccess(null);
    };

    const handleSelectStockProduct = (product: Product) => {
        const nextLabel = formatStockProductLabel(product);
        setSelectedStockProductId(product.id);
        setStockProductKeyword(nextLabel);
        setDebouncedStockProductKeyword(nextLabel);
        setShowStockProductDropdown(false);
        setStockError(null);
        setStockSuccess(null);
    };

    const handleChange = (field: keyof ProductFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = field === 'is_active' ? (event.target as HTMLInputElement).checked : event.target.value;
        setFormState(state => ({
            ...state,
            [field]: value,
        }));
    };

    const handleProductImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const image = event.target.files?.[0];
        event.target.value = '';
        if (!image) {
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
            setProductImageError('Foto produk harus berformat JPG, PNG, atau WEBP.');
            return;
        }

        if (image.size > 10 * 1024 * 1024) {
            setProductImageError('Ukuran foto sebelum crop maksimal 10 MB.');
            return;
        }

        setProductImageError(null);
        setProductImageToCrop(image);
    };

    const handleApplyProductImage = (image: File) => {
        setProductImageFile(image);
        setProductImagePreview(URL.createObjectURL(image));
        setProductImageError(null);
        setProductImageToCrop(null);
    };

    const handleSave = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        const payload = new FormData();
        payload.append('name', formState.name.trim());
        payload.append('description', formState.description.trim());
        payload.append('sku', formState.sku.trim());
        payload.append('uom', formState.uom.trim() || 'pcs');
        payload.append('weight_grams', formState.weight_grams);
        payload.append('price', String(Number(formState.price) || 0));
        payload.append('stock', String(Number(formState.stock) || 0));
        payload.append('discount', String(Number(formState.discount) || 0));
        payload.append('is_active', formState.is_active ? '1' : '0');
        if (productImageFile) {
            payload.append('image', productImageFile);
        }

        try {
            if (editingProduct) {
                payload.append('_method', 'PUT');
                const response = await axios.post(`/api/admin/products/${editingProduct.id}`, payload);
                const updated = response.data?.data;
                setProducts(items => items.map(item => (item.id === updated.id ? updated : item)));
            } else {
                const response = await axios.post('/api/admin/products', payload);
                const created = response.data?.data;
                setProducts(items => [created, ...items]);
            }

            setShowProductModal(false);
            setProductImageFile(null);
            setProductImagePreview(null);
        } catch (error) {
            setErrorMessage('Gagal menyimpan data produk.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!productToDelete || isDeleting) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage(null);
        try {
            await axios.delete(`/api/admin/products/${productToDelete.id}`);
            setProducts(items => items.filter(item => item.id !== productToDelete.id));
            setProductToDelete(null);
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message : null;
            setErrorMessage(message || 'Gagal menghapus produk.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveStock = async () => {
        if (stockSubmitting) {
            return;
        }

        if (!selectedStockProduct) {
            setStockError('Pilih produk terlebih dahulu.');
            return;
        }

        const quantity = Number(stockQuantity);
        const needsPositiveAmount = stockAction === 'ADD' || stockAction === 'SUBTRACT';

        if (Number.isNaN(quantity) || (needsPositiveAmount && quantity <= 0) || (!needsPositiveAmount && quantity < 0)) {
            setStockError(
                needsPositiveAmount
                    ? 'Jumlah perubahan stok wajib lebih dari 0.'
                    : 'Nilai stok tidak valid.'
            );
            return;
        }

        let nextStock = quantity;
        if (stockAction === 'ADD') {
            nextStock = selectedStockProduct.stock + quantity;
        } else if (stockAction === 'SUBTRACT') {
            nextStock = selectedStockProduct.stock - quantity;
            if (nextStock < 0) {
                setStockError('Stok tidak boleh kurang dari 0.');
                return;
            }
        }

        setStockSubmitting(true);
        setStockError(null);
        setStockSuccess(null);

        try {
            const response = await axios.put(`/api/admin/products/${selectedStockProduct.id}`, {
                stock: nextStock,
            });
            const updated = response.data?.data;
            if (updated) {
                setProducts((items) => items.map((item) => (item.id === updated.id ? updated : item)));
                setStockSuccess(`Stok ${updated.name} berhasil diperbarui.`);
            }
            setStockQuantity('');
        } catch (error) {
            setStockError('Gagal memperbarui stok.');
        } finally {
            setStockSubmitting(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            {errorMessage ? (
                <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                    {errorMessage}
                </div>
            ) : null}
            <div className="flex flex-col gap-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-4xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Master Data Barang</h3>
                    <p className="text-xs text-slate-500">Kelola stok, harga, dan diskon produk.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                        type="button"
                        onClick={handleOpenStockModal}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all sm:w-auto"
                    >
                        <Package size={18} /> Kelola Stok
                    </button>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all sm:w-auto"
                    >
                        <Plus size={18} /> Tambah Barang
                    </button>
                </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-4xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-180 text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200/50">
                            <tr>
                                <th className="px-6 py-4">Produk Info</th>
                                <th className="px-6 py-4">Harga Dasar</th>
                                <th className="px-6 py-4">Diskon</th>
                                <th className="px-6 py-4">Stok (Pcs)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="h-4 bg-slate-200 rounded w-1/5 ml-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : (products.length ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="h-full w-full object-contain p-1" />
                                                    ) : (
                                                        <span className="text-[10px]">IMG</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-800 wrap-break-word">{product.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono wrap-break-word">
                                                        {product.sku ?? 'Tanpa SKU'} • {product.uom}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-slate-700">
                                                {currencyFormatter.format(product.price_after_discount)}
                                            </div>
                                            {product.discount > 0 && (
                                                <div className="text-[10px] font-mono text-slate-400 line-through">
                                                    {currencyFormatter.format(product.price)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.discount > 0 ? (
                                                <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded-lg text-xs font-bold border border-rose-200">
                                                    {product.discount}% OFF
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${product.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg w-fit border ${product.status === 'ACTIVE'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                                {product.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditProduct(product)}
                                                    className="inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:scale-95 transition-all"
                                                    aria-label={`Edit produk ${product.name}`}
                                                    title="Edit produk"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setProductToDelete(product)}
                                                    className="inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-lg text-rose-500 hover:bg-rose-50 hover:border-rose-200 active:scale-95 transition-all"
                                                    aria-label={`Hapus produk ${product.name}`}
                                                    title="Hapus produk"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-6 text-center text-sm text-slate-400">
                                        Belum ada produk.
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {productToDelete && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-product-title"
                    onKeyDown={(event) => {
                        if (event.key === 'Escape' && !isDeleting) {
                            setProductToDelete(null);
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-4xl border border-white/70 bg-white shadow-2xl">
                        <div className="p-7 sm:p-8">
                            <div className="flex size-14 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
                                <Trash2 size={24} />
                            </div>
                            <h3 id="delete-product-title" className="mt-5 text-xl font-bold text-slate-900">Hapus produk?</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                <strong className="text-slate-700">{productToDelete.name}</strong> akan dihapus dari katalog dan POS. Riwayat transaksi tetap tersimpan.
                            </p>
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                autoFocus
                                disabled={isDeleting}
                                onClick={() => setProductToDelete(null)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 size={17} /> {isDeleting ? 'Menghapus...' : 'Hapus Produk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showStockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">Kelola Stok Barang</h3>
                                <p className="text-sm text-slate-500">Tambah, kurangi, atau set stok langsung dari header.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseStockModal}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar-light space-y-5">
                            {stockError && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                                    {stockError}
                                </div>
                            )}
                            {stockSuccess && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
                                    {stockSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Cari & Pilih Produk
                                </label>
                                <div ref={stockProductDropdownRef} className="relative">
                                    <input
                                        type="text"
                                        value={stockProductKeyword}
                                        onChange={handleStockProductKeywordChange}
                                        onFocus={() => setShowStockProductDropdown(true)}
                                        placeholder="Ketik nama, SKU, barcode, atau satuan produk"
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    />

                                    {showStockProductDropdown && (
                                        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                            <div className="max-h-64 overflow-y-auto py-1">
                                                {filteredStockProducts.length === 0 ? (
                                                    <div className="px-4 py-3 text-sm text-slate-400">
                                                        Produk tidak ditemukan.
                                                    </div>
                                                ) : (
                                                    filteredStockProducts.map((product) => {
                                                        const isSelected = selectedStockProductId === product.id;
                                                        return (
                                                            <button
                                                                key={product.id}
                                                                type="button"
                                                                onClick={() => handleSelectStockProduct(product)}
                                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <div className="font-semibold text-slate-700 truncate">{product.name}</div>
                                                                        <div className="text-xs text-slate-400 font-mono truncate">
                                                                            {product.sku ?? 'Tanpa SKU'}
                                                                            {product.barcode ? ` • ${product.barcode}` : ''}
                                                                            {` • stok ${product.stock}`}
                                                                        </div>
                                                                    </div>
                                                                    {isSelected ? (
                                                                        <span className="shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                                                                            Dipilih
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className={selectedStockProduct ? 'text-slate-600' : 'text-slate-400'}>
                                        {selectedStockProduct ? `Produk terpilih: ${selectedStockProduct.name}` : 'Belum ada produk dipilih.'}
                                    </span>
                                    {isStockSearchDebouncing ? (
                                        <span className="text-slate-400">Mencari...</span>
                                    ) : null}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Aksi Stok
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStockAction('ADD')}
                                        className={`rounded-xl px-3 py-2.5 text-xs font-bold border transition-colors ${stockAction === 'ADD'
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        Tambah
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStockAction('SUBTRACT')}
                                        className={`rounded-xl px-3 py-2.5 text-xs font-bold border transition-colors ${stockAction === 'SUBTRACT'
                                            ? 'bg-amber-500 text-white border-amber-500'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        Kurangi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStockAction('SET')}
                                        className={`rounded-xl px-3 py-2.5 text-xs font-bold border transition-colors ${stockAction === 'SET'
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        Set Nilai
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {stockAction === 'SET' ? 'Nilai Stok Baru' : 'Jumlah Perubahan'}
                                </label>
                                <div className="relative">
                                    {stockAction === 'SUBTRACT' && (
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">
                                            <Minus size={16} />
                                        </span>
                                    )}
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.001"
                                        value={stockQuantity}
                                        onChange={(event) => {
                                            setStockQuantity(event.target.value);
                                            setStockError(null);
                                            setStockSuccess(null);
                                        }}
                                        placeholder="0"
                                        className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-2 ${stockAction === 'ADD' ? 'focus:ring-emerald-200' : stockAction === 'SUBTRACT' ? 'focus:ring-amber-200' : 'focus:ring-indigo-200'} ${stockAction === 'SUBTRACT' ? 'pl-10' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Stok saat ini</span>
                                    <span className="font-mono font-bold text-slate-700">
                                        {selectedStockProduct ? selectedStockProduct.stock : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Aksi</span>
                                    <span className="font-semibold text-slate-700">
                                        {stockAction === 'ADD' ? 'Tambah stok' : stockAction === 'SUBTRACT' ? 'Kurangi stok' : 'Set stok'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Preview stok akhir</span>
                                    <span className={`font-mono font-bold ${stockPreview !== null && stockPreview >= 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {stockPreview !== null && stockPreview >= 0 ? stockPreview : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCloseStockModal}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveStock}
                                disabled={stockSubmitting || !selectedStockProduct}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Save size={18} /> {stockSubmitting ? 'Menyimpan...' : 'Simpan Stok'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">
                                    {editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}
                                </h3>
                                <p className="text-sm text-slate-500">Lengkapi informasi produk di bawah ini.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar-light space-y-6">
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => productImageInputRef.current?.click()}
                                    aria-label={productImagePreview ? 'Ganti dan crop foto produk' : 'Upload dan crop foto produk'}
                                    className="relative flex size-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500"
                                >
                                    {productImagePreview ? (
                                        <img src={productImagePreview} alt="Preview produk" className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <>
                                            <UploadCloud size={32} className="mb-2" />
                                            <span className="text-xs font-bold">Upload Foto</span>
                                        </>
                                    )}
                                </button>
                                <input
                                    ref={productImageInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleProductImageChange}
                                />
                            </div>
                            <p className="-mt-4 text-center text-xs text-slate-400">JPG, PNG, atau WEBP • Rasio vertikal/horizontal terdeteksi otomatis</p>
                            {productImageError ? (
                                <p className="-mt-3 text-center text-xs font-semibold text-rose-600">{productImageError}</p>
                            ) : null}

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Produk</label>
                                    <input
                                        type="text"
                                        value={formState.name}
                                        onChange={handleChange('name')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="Contoh: Kopi Susu Gula Aren"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label htmlFor="product-description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi Produk</label>
                                        <span className="text-[10px] font-semibold text-slate-400">Opsional</span>
                                    </div>
                                    <textarea
                                        id="product-description"
                                        value={formState.description}
                                        onChange={handleChange('description')}
                                        rows={4}
                                        maxLength={2000}
                                        className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition-all focus:ring-2 focus:ring-indigo-200"
                                        placeholder="Tulis deskripsi singkat produk"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SKU / Kode Barang</label>
                                    <input
                                        type="text"
                                        value={formState.sku}
                                        onChange={handleChange('sku')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="BV-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Satuan (UOM)</label>
                                    <input
                                        type="text"
                                        value={formState.uom}
                                        onChange={handleChange('uom')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="pcs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Harga Jual (Rp)</label>
                                    <input
                                        type="number"
                                        value={formState.price}
                                        onChange={handleChange('price')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Berat Produk (gram)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formState.weight_grams}
                                        onChange={handleChange('weight_grams')}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-indigo-200"
                                        placeholder="Contoh: 250"
                                    />
                                    <p className="mt-2 text-xs text-slate-400">Wajib untuk pesanan kirim ke alamat.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stok Awal</label>
                                    <input
                                        type="number"
                                        value={formState.stock}
                                        onChange={handleChange('stock')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Produk</label>
                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={formState.is_active}
                                                onChange={handleChange('is_active')}
                                                className="size-4 accent-indigo-600"
                                            />
                                            Aktif
                                        </label>
                                        <span className="text-xs text-slate-400">Nonaktif jika stok tidak dijual</span>
                                    </div>
                                </div>

                                <div className="sm:col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                                            <Settings size={14} /> Pengaturan Diskon
                                        </label>
                                        <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-100">Opsional</span>
                                    </div>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                value={formState.discount}
                                                onChange={handleChange('discount')}
                                                className="w-full p-3 bg-white border border-indigo-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-300 outline-none text-center"
                                                placeholder="0"
                                            />
                                        </div>
                                        <span className="font-bold text-indigo-800">%</span>
                                        <div className="text-xs text-indigo-600 leading-tight sm:w-1/2">
                                            Diskon ini akan langsung memotong harga jual saat transaksi di kasir.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Save size={18} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {productImageToCrop ? (
                <ProductImageCropper
                    file={productImageToCrop}
                    onApply={handleApplyProductImage}
                    onCancel={() => setProductImageToCrop(null)}
                />
            ) : null}
        </div>
    );
}
