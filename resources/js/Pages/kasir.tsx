import React, { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

import CartPanel from './Pos/components/CartPanel';
import HeaderBar from './Pos/components/HeaderBar';
import PaymentModal from './Pos/components/PaymentModal';
import Sidebar from './Pos/components/Sidebar';
import CatalogView from './Pos/components/views/CatalogView';
import FavoritesView from './Pos/components/views/FavoritesView';
import HistoryView from './Pos/components/views/HistoryView';
import ProfileView from './Pos/components/views/ProfileView';
import SettingsView from './Pos/components/views/SettingsView';
import UniversalModal from '../Components/UniversalModal';
// import { CATEGORIES, QUICK_CASH_AMOUNTS } from './Pos/data';
import type { CartItem, Product, TransactionHistory } from './Pos/types';
import { Box, Coffee, LayoutGrid, Utensils } from 'lucide-react';

export const CATEGORIES = [
    { id: 'All', label: 'All Items', icon: LayoutGrid },
    { id: 'Minuman', label: 'Drinks', icon: Coffee },
    { id: 'Makanan', label: 'Foods', icon: Utensils },
    { id: 'Dessert', label: 'Desserts', icon: Box },
];

export const QUICK_CASH_AMOUNTS = [20000, 50000, 100000];

export default function PosInterface() {
    // authentication and role will be validated by the backend header/profile controller

    // State Management
    const [activeView, setActiveView] = useState<'menu' | 'history' | 'favorites' | 'profile' | 'settings'>('menu');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileSidebarMode, setIsMobileSidebarMode] = useState(false);
    const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [lastPaymentSummary, setLastPaymentSummary] = useState<{
        method: 'CASH' | 'EWALLET';
        invoiceNo?: string | null;
        total: number;
        paidTotal: number;
        change: number;
    } | null>(null);
    const [approvalReason, setApprovalReason] = useState("");
    const [supervisorPin, setSupervisorPin] = useState("");
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundTarget, setRefundTarget] = useState<TransactionHistory | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [refundQuantities, setRefundQuantities] = useState<Record<string, string>>({});
    const [refundError, setRefundError] = useState<string | null>(null);
    const [refundSubmitting, setRefundSubmitting] = useState(false);
    const [refundSuccess, setRefundSuccess] = useState<{ message: string; total: number } | null>(null);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'EWALLET'>('CASH');
    const [cashReceived, setCashReceived] = useState<string>("");

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia('(max-width: 1023px)');

        const handleSidebarMode = (event: MediaQueryList | MediaQueryListEvent) => {
            const mobileMode = event.matches;
            setIsMobileSidebarMode(mobileMode);
            setIsSidebarOpen(!mobileMode);
        };

        handleSidebarMode(mediaQuery);
        mediaQuery.addEventListener('change', handleSidebarMode);

        return () => {
            mediaQuery.removeEventListener('change', handleSidebarMode);
        };
    }, []);

    const { products: serverProducts = [], history: serverHistory = [], profile: serverProfile = {} } = usePage().props as any;

    const [productsData, setProductsData] = useState<any[]>(Array.isArray(serverProducts) ? serverProducts : []);
    const [historyData, setHistoryData] = useState<any[]>(Array.isArray(serverHistory) ? serverHistory : []);
    const [profileData, setProfileData] = useState<any>(serverProfile || {});
    const [displayName, setDisplayName] = useState<string>('');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyMeta, setHistoryMeta] = useState({
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1,
    });
    const [historyFilters, setHistoryFilters] = useState({
        startDate: '',
        endDate: '',
    });

    // --- Computed ---
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const totalDiscount = cart.reduce((acc, item) => acc + item.discount, 0);
    const grandTotal = subtotal - totalDiscount;
    const taxTotal = (subtotal - totalDiscount) * 0.11;
    const totalDue = grandTotal + taxTotal;
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

    const hasRefundSelection = refundTarget
        ? refundTarget.itemsDetail.some(item => Number(refundQuantities[item.id] || 0) > 0)
        : false;
    const canSubmitRefund = Boolean(
        refundTarget
        && hasRefundSelection
        && refundReason.trim().length >= 10
    );

    const change = paymentMethod === 'CASH' && cashReceived
        ? Number(cashReceived) - totalDue
        : 0;

    // --- Handlers ---
    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => {
                    if (p.id !== product.id) return p;
                    const nextQty = p.qty + 1;
                    const discountAmount = (p.price * nextQty * p.discountPercent) / 100;
                    return {
                        ...p,
                        qty: nextQty,
                        discount: discountAmount,
                    };
                });
            }
            const discountPercent = Number(product.discount ?? 0);
            const discountAmount = (product.price * 1 * discountPercent) / 100;
            return [
                ...prev,
                {
                    ...product,
                    qty: 1,
                    discountPercent,
                    discount: discountAmount,
                },
            ];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                const discountAmount = (item.price * newQty * item.discountPercent) / 100;
                return {
                    ...item,
                    qty: newQty,
                    discount: discountAmount,
                };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            return;
        }

        if (paymentMethod === 'CASH' && (!cashReceived || Number(cashReceived) < totalDue)) {
            return;
        }

        const checkoutPayload = {
            payment_method: paymentMethod,
            cash_received: paymentMethod === 'CASH' ? Number(cashReceived) : undefined,
            items: cart.map((item) => ({
                product_id: item.id,
                qty: item.qty,
                discount_amount: item.discount,
            })),
        };

        setCheckoutError(null);

        try {
            const response = await axios.post('/api/pos/checkout', checkoutPayload);

            const responseStatus = (response?.data?.status || response?.data?.data?.status || response?.data?.payment?.status || '').toString().toLowerCase();
            const isPaymentConfirmed = ['confirmed', 'success', 'paid', 'settlement'].includes(responseStatus);
            const responseTotals = response?.data?.totals || {};
            const invoiceNo = response?.data?.invoice_no || response?.data?.invoiceNo || null;

            setShowPaymentModal(false);
            setCart([]);
            setCashReceived("");

            if (isPaymentConfirmed) {
                setLastPaymentSummary({
                    method: paymentMethod,
                    invoiceNo,
                    total: Number(responseTotals?.grand_total ?? totalDue),
                    paidTotal: Number(responseTotals?.paid_total ?? totalDue),
                    change: Number(responseTotals?.change_total ?? change),
                });
                setShowPaymentSuccessModal(true);
            }
        } catch (e: unknown) {
            const isNetworkError = axios.isAxiosError(e) && !e.response;
            const responseMessage = axios.isAxiosError(e)
                ? e.response?.data?.message
                : null;

            setCheckoutError(
                isNetworkError
                    ? 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba checkout kembali.'
                    : responseMessage || 'Checkout gagal diproses. Periksa data transaksi lalu coba kembali.',
            );
        }
    };

    const refreshHistory = async () => {
        try {
            const res = await axios.get('/api/pos/history', {
                params: {
                    page: historyPage,
                    per_page: historyMeta.perPage,
                    start_date: historyFilters.startDate || undefined,
                    end_date: historyFilters.endDate || undefined,
                },
            });
            setHistoryData(res.data.data || []);
            const meta = res.data.meta || {};
            setHistoryMeta({
                currentPage: Number(meta.current_page ?? historyPage),
                perPage: Number(meta.per_page ?? historyMeta.perPage),
                total: Number(meta.total ?? 0),
                lastPage: Number(meta.last_page ?? 1),
            });
        } catch (e) {
            // silent
        }
    };

    const openRefundModal = (tx: TransactionHistory) => {
        const initialQuantities = tx.itemsDetail.reduce<Record<string, string>>((acc, item) => {
            acc[item.id] = '';
            return acc;
        }, {});

        setRefundTarget(tx);
        setRefundQuantities(initialQuantities);
        setRefundReason('');
        setRefundError(null);
        setShowRefundModal(true);
    };

    const submitRefund = async () => {
        if (!refundTarget) return;

        const items = refundTarget.itemsDetail
            .map(item => ({
                sale_item_id: Number(item.id),
                qty: Number(refundQuantities[item.id] || 0),
                maxQty: item.refundableQty,
            }))
            .filter(item => item.qty > 0);

        if (items.length === 0) {
            setRefundError('Pilih minimal satu item untuk refund.');
            return;
        }

        if (!refundReason.trim()) {
            setRefundError('Alasan refund wajib diisi.');
            return;
        }

        setRefundSubmitting(true);
        setRefundError(null);

        try {
            const response = await axios.post('/api/pos/refunds', {
                sale_id: refundTarget.saleId,
                reason: refundReason.trim(),
                items: items.map(item => ({
                    sale_item_id: item.sale_item_id,
                    qty: item.qty,
                })),
            });

            const message = response?.data?.message || 'Refund berhasil diproses.';
            const totalAmount = Number(response?.data?.data?.total_amount ?? 0);

            setShowRefundModal(false);
            setRefundSuccess({ message, total: totalAmount });
            await refreshHistory();
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || 'Refund gagal diproses.';
            setRefundError(errorMessage);
        } finally {
            setRefundSubmitting(false);
        }
    };

    const handleLogout = () => {
        setShowUserMenu(false);
        setShowLogoutModal(true);
    }

    const confirmLogout = async () => {
        try {
            await axios.post('/api/pos/logout');
        } catch (e) {
            // silent
        }
        localStorage.removeItem('pos_logged_in');
        localStorage.removeItem('pos_role');
        window.location.assign('/login');
    };

    const navigateTo = (view: typeof activeView) => {
        setActiveView(view);
        setShowUserMenu(false);

        const shouldCollapseSidebar = isMobileSidebarMode;

        if (shouldCollapseSidebar) {
            setIsSidebarOpen(false);
        }
    }

    // --- Render Helpers ---
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    // If server props are empty, fetch via API once on mount
    useEffect(() => {
        let mounted = true;

        async function fetchIfEmpty() {
            try {
                // Fetch header first to get authenticated user info and role
                const headerRes = await axios.get('/api/pos/profile');
                const header = headerRes.data?.data || {};
                if (!mounted) return;
                setDisplayName(header.display_name || header.displayName || '');
                const role = (header.role || '').toString().toUpperCase();
                if (role !== 'KASIR' && role !== 'CASHIER') {
                    router.visit('/login');
                    return;
                }

                if ((!productsData || productsData.length === 0)) {
                    const res = await axios.get('/api/pos/products');
                    if (!mounted) return;
                    setProductsData(res.data.data || []);
                }

                if ((!historyData || historyData.length === 0)) {
                    const res = await axios.get('/api/pos/history', {
                        params: {
                            page: historyPage,
                            per_page: historyMeta.perPage,
                            start_date: historyFilters.startDate || undefined,
                            end_date: historyFilters.endDate || undefined,
                        },
                    });
                    if (!mounted) return;
                    setHistoryData(res.data.data || []);
                    const meta = res.data.meta || {};
                    setHistoryMeta({
                        currentPage: Number(meta.current_page ?? historyPage),
                        perPage: Number(meta.per_page ?? historyMeta.perPage),
                        total: Number(meta.total ?? 0),
                        lastPage: Number(meta.last_page ?? 1),
                    });
                }

                if ((!profileData || Object.keys(profileData).length === 0)) {
                    const res = await axios.get('/api/pos/profile');
                    if (!mounted) return;
                    setProfileData(res.data.data || {});
                }
            } catch (e) {
                // silent
            }
        }

        fetchIfEmpty();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        if (activeView === 'history') {
            refreshHistory();
        }

        return () => {
            mounted = false;
        };
    }, [activeView, historyPage, historyFilters.startDate, historyFilters.endDate]);

    // Use server-provided products (fallback to client-fetched)
    const PRODUCTS = productsData || [];
    const HISTORY = historyData || [];
    const PROFILE = profileData || {};

    // Filter products for Catalog
    const filteredProducts = PRODUCTS.filter((p: any) => {
        const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    // Filter products for Favorites
    const favoriteProducts = PRODUCTS.filter((p: any) => p.isFavorite);

    return (
        // Main Background
        <div className="min-h-screen lg:h-screen w-full bg-[#f3f4f6] relative flex flex-col lg:flex-row font-sans overflow-x-hidden lg:overflow-hidden text-slate-800 selection:bg-indigo-500 selection:text-white">

            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[120px] opacity-40 animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-blue-200 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
            <div className="absolute top-[20%] right-[40%] w-[25%] h-[25%] bg-indigo-200 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

            {/* 1. SIDEBAR (Navigation) */}
            <div
                className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:relative lg:z-30 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <Sidebar
                    activeView={activeView}
                    showUserMenu={showUserMenu}
                    onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
                    onNavigate={navigateTo}
                    onLogout={handleLogout}
                    userMenuRef={userMenuRef}
                />
            </div>

            {isMobileSidebarMode && isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Tutup sidebar"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                />
            )}

            {/* 2. DYNAMIC CONTENT AREA */}
            <div className="flex-1 flex flex-col relative min-w-0 lg:h-full py-3 lg:py-4 px-3 sm:px-4 lg:px-6 gap-4 lg:gap-6 z-10">

                {/* Header (Dynamic) */}
                <HeaderBar
                    activeView={activeView}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onBack={() => setActiveView('menu')}
                    onToggleSidebar={() => setIsSidebarOpen(state => !state)}
                    showSidebarToggle
                    searchInputRef={searchInputRef}
                    displayName={displayName || PROFILE.displayName || 'Kasir'}
                />

                {/* --- VIEW: CATALOG (MENU) --- */}
                {activeView === 'menu' && (
                    <CatalogView
                        categories={CATEGORIES}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        products={filteredProducts}
                        onAddToCart={addToCart}
                        formatRupiah={formatRupiah}
                    />
                )}

                {/* --- VIEW: HISTORY --- */}
                {activeView === 'history' && (
                    <HistoryView
                        history={HISTORY}
                        formatRupiah={formatRupiah}
                        startDate={historyFilters.startDate}
                        endDate={historyFilters.endDate}
                        onStartDateChange={(value) => {
                            setHistoryPage(1);
                            setHistoryFilters(prev => ({ ...prev, startDate: value }));
                        }}
                        onEndDateChange={(value) => {
                            setHistoryPage(1);
                            setHistoryFilters(prev => ({ ...prev, endDate: value }));
                        }}
                        onResetFilters={() => {
                            setHistoryPage(1);
                            setHistoryFilters({ startDate: '', endDate: '' });
                        }}
                        page={historyMeta.currentPage}
                        lastPage={historyMeta.lastPage}
                        onPageChange={(page) => setHistoryPage(page)}
                        onRequestRefund={openRefundModal}
                    />
                )}

                {/* --- VIEW: FAVORITES --- */}
                {activeView === 'favorites' && (
                    <FavoritesView favorites={favoriteProducts} onAddToCart={addToCart} formatRupiah={formatRupiah} />
                )}

                {/* --- VIEW: PROFILE --- */}
                {activeView === 'profile' && (
                    <ProfileView profile={PROFILE} />
                )}

                {/* --- VIEW: SETTINGS --- */}
                {activeView === 'settings' && (
                    <SettingsView />
                )}

            </div>

            {/* 3. CART PANEL (Unchanged Style) */}
            {activeView !== 'profile' && activeView !== 'settings' && (
                <CartPanel
                    cart={cart}
                    subtotal={subtotal}
                    totalDiscount={totalDiscount}
                    grandTotal={grandTotal}
                    onClearCart={() => setCart([])}
                    onUpdateQty={updateQty}
                    onRemoveFromCart={removeFromCart}
                    onOpenApprovalModal={() => setShowApprovalModal(true)}
                    onCheckout={() => setShowPaymentModal(true)}
                    formatRupiah={formatRupiah}
                />
            )}

            {/* --- PAYMENT MODAL (Modern Glass) --- */}
            <PaymentModal
                isOpen={showPaymentModal}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                cashReceived={cashReceived}
                onCashReceivedChange={setCashReceived}
                onClose={() => setShowPaymentModal(false)}
                onCheckout={handleCheckout}
                quickCashAmounts={QUICK_CASH_AMOUNTS}
                grandTotal={grandTotal}
                taxTotal={taxTotal}
                discountTotal={totalDiscount}
                totalDue={totalDue}
                subtotal={subtotal}
                change={change}
                formatRupiah={formatRupiah}
            />

            <UniversalModal
                isOpen={showLogoutModal}
                title="Keluar dari POS?"
                description="Anda akan keluar dari sesi kasir saat ini."
                tone="warning"
                confirmLabel="Ya, Keluar"
                cancelLabel="Batal"
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />

            <UniversalModal
                isOpen={showPaymentSuccessModal}
                title="Pembayaran Berhasil"
                description="Transaksi telah dikonfirmasi oleh sistem."
                tone="success"
                cancelLabel="Tutup"
                onClose={() => setShowPaymentSuccessModal(false)}
            >
                <div className="space-y-2">
                    {lastPaymentSummary?.invoiceNo && (
                        <div className="flex justify-between">
                            <span>Invoice</span>
                            <span className="font-mono font-bold text-slate-700">{lastPaymentSummary.invoiceNo}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Metode</span>
                        <span className="font-bold text-slate-700">{lastPaymentSummary?.method === 'CASH' ? 'Tunai' : 'QRIS'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-mono font-bold text-slate-700">{formatRupiah(lastPaymentSummary?.total ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Dibayar</span>
                        <span className="font-mono font-bold text-slate-700">{formatRupiah(lastPaymentSummary?.paidTotal ?? 0)}</span>
                    </div>
                    {lastPaymentSummary?.method === 'CASH' && (
                        <div className="flex justify-between">
                            <span>Kembalian</span>
                            <span className="font-mono font-bold text-emerald-600">
                                {lastPaymentSummary?.change >= 0 ? formatRupiah(lastPaymentSummary.change).replace(",00", "") : '-'}
                            </span>
                        </div>
                    )}
                </div>
            </UniversalModal>

            <UniversalModal
                isOpen={Boolean(checkoutError)}
                title="Checkout Gagal"
                description={checkoutError ?? undefined}
                tone="danger"
                cancelLabel="Tutup"
                onClose={() => setCheckoutError(null)}
            />

            <UniversalModal
                isOpen={showRefundModal}
                title={`Refund ${refundTarget?.invoiceNo ?? ''}`}
                description="Pilih item dan jumlah refund. Permintaan akan dikirim untuk approval supervisor."
                tone="warning"
                confirmLabel="Kirim Permintaan"
                cancelLabel="Batal"
                onClose={() => setShowRefundModal(false)}
                onConfirm={submitRefund}
                isConfirmDisabled={!canSubmitRefund}
                isLoading={refundSubmitting}
            >
                <div className="space-y-4">
                    {refundError && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                            {refundError}
                        </div>
                    )}
                    <div className="space-y-3">
                        {refundTarget?.itemsDetail.map((item) => (
                            <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/80 p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">
                                            Sisa {item.refundableQty} × {formatRupiah(item.refundUnitPrice).replace(',00', '')}
                                        </p>
                                    </div>
                                    <input
                                        type="number"
                                        min={0}
                                        max={item.refundableQty}
                                        step="0.001"
                                        value={refundQuantities[item.id] ?? ''}
                                        onChange={(event) => {
                                            const rawValue = event.target.value;
                                            const numeric = Number(rawValue);

                                            if (Number.isNaN(numeric)) {
                                                setRefundQuantities(prev => ({ ...prev, [item.id]: '' }));
                                                return;
                                            }

                                            const clamped = Math.max(0, Math.min(numeric, item.refundableQty));
                                            setRefundQuantities(prev => ({ ...prev, [item.id]: clamped ? clamped.toString() : '' }));
                                        }}
                                        className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                                        placeholder="0"
                                        disabled={item.refundableQty <= 0}
                                    />
                                </div>
                                {item.refundedQty > 0 && (
                                    <p className="text-[10px] text-amber-600">
                                        Sudah direfund: {item.refundedQty}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alasan Refund</label>
                            <textarea
                                value={refundReason}
                                onChange={(event) => setRefundReason(event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                                rows={3}
                                placeholder="Tuliskan alasan refund (min. 10 karakter)"
                            />
                        </div>
                    </div>
                </div>
            </UniversalModal>

            <UniversalModal
                isOpen={Boolean(refundSuccess)}
                title="Permintaan Refund Terkirim"
                description={refundSuccess?.message}
                tone="success"
                cancelLabel="Tutup"
                onClose={() => setRefundSuccess(null)}
            >
                <div className="flex items-center justify-between">
                    <span>Total refund</span>
                    <span className="font-mono font-bold text-emerald-600">
                        {formatRupiah(refundSuccess?.total ?? 0).replace(',00', '')}
                    </span>
                </div>
            </UniversalModal>
        </div>
    );
}
