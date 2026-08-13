import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Banknote, CreditCard, Landmark, PackageCheck, PackageSearch, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import UniversalModal from '../../Components/UniversalModal';

type Item = {
    id: number;
    product_name_snapshot: string;
    quantity: number;
    line_total: string;
};

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    fulfillment_method: string;
    shipping_address?: string | null;
    destination_label?: string | null;
    shipping_courier_name?: string | null;
    shipping_service?: string | null;
    shipping_etd?: string | null;
    grand_total: string;
    subtotal: string;
    discount_total: string;
    shipping_cost: string;
    payment_method: string;
    status: string;
    tracking_number?: string | null;
    created_at: string;
    items: Item[];
};

const money = (value: string) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(Number(value));

function statusLabel(status: string): string {
    return status.replaceAll('_', ' ');
}

type OnlineOrdersPageProps = {
    role: 'CASHIER' | 'SUPERVISOR';
    embedded?: boolean;
};

type StorePaymentMethod = 'CASH' | 'QRIS_MANUAL' | 'BANK_TRANSFER';

type PaymentSettings = {
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    qris_image_url: string;
    instructions: string;
};

const emptyPaymentSettings: PaymentSettings = {
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    qris_image_url: '',
    instructions: '',
};

export default function OnlineOrdersPage({ role, embedded = false }: OnlineOrdersPageProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selected, setSelected] = useState<Order | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingWhatsAppUrl, setShippingWhatsAppUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [storePaymentMethod, setStorePaymentMethod] = useState<StorePaymentMethod>('CASH');
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(emptyPaymentSettings);

    async function loadOrders(): Promise<void> {
        try {
            const response = await axios.get('/api/online-orders');
            setOrders(response.data.data.data ?? []);
        } catch {
            setError('Pesanan online gagal dimuat.');
        } finally {
            setLoading(false);
        }
    }

    async function openOrder(order: Order): Promise<void> {
        const response = await axios.get(`/api/online-orders/${order.id}`);
        setSelected(response.data.data);
        setTrackingNumber(response.data.data.tracking_number ?? '');
        setShippingWhatsAppUrl(response.data.shipping_whatsapp_url ?? null);
        setPaymentSettings(response.data.payment ?? emptyPaymentSettings);
    }

    async function act(path: string, payload?: object, method: 'patch' | 'post' = payload ? 'patch' : 'post'): Promise<boolean> {
        if (!selected) {
            return false;
        }

        setError('');

        try {
            const response = method === 'patch'
                ? await axios.patch(`/api/online-orders/${selected.id}/${path}`, payload)
                : await axios.post(`/api/online-orders/${selected.id}/${path}`, payload);

            const updated = response.data.data as Order;
            setSelected(updated);
            setOrders((currentOrders) => currentOrders.map((order) => order.id === updated.id ? updated : order));
            setShippingWhatsAppUrl(response.data.shipping_whatsapp_url ?? null);
            return true;
        } catch (requestError) {
            setError(
                axios.isAxiosError(requestError)
                    ? requestError.response?.data?.message ?? 'Aksi gagal diproses.'
                    : 'Aksi gagal diproses.'
            );
            return false;
        }
    }

    function handlePaymentConfirmation(): void {
        if (selected?.fulfillment_method === 'PICKUP' && selected.payment_method === 'PAY_AT_STORE') {
            setStorePaymentMethod('CASH');
            setIsPaymentDialogOpen(true);

            return;
        }

        void act('confirm-payment');
    }

    async function confirmStorePayment(): Promise<void> {
        setIsConfirmingPayment(true);

        try {
            const confirmed = await act('confirm-payment', { payment_method: storePaymentMethod }, 'post');

            if (confirmed) {
                setIsPaymentDialogOpen(false);
            }
        } finally {
            setIsConfirmingPayment(false);
        }
    }

    const canConfirmStorePayment = storePaymentMethod === 'CASH'
        || (storePaymentMethod === 'QRIS_MANUAL' && Boolean(paymentSettings.qris_image_url))
        || (storePaymentMethod === 'BANK_TRANSFER' && Boolean(paymentSettings.bank_name && paymentSettings.bank_account_number));

    useEffect(() => {
        void loadOrders();
    }, []);

    return (
        <>
            {!embedded && <Head title="Pesanan Online" />}

            <main className={embedded ? 'flex-1 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar-light' : 'min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,_rgba(248,236,217,0.84),_transparent_24%),linear-gradient(180deg,#f7f0e6_0%,#f2e9dd_100%)] p-4 text-[#2f241c] sm:p-7'}>
                <div className={embedded ? 'space-y-4' : 'mx-auto max-w-7xl'}>
                    {!embedded && (<header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8e6847]">Operasional</p>
                            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#2f241c]">Pesanan Online</h1>
                            <p className="mt-2 max-w-[42rem] text-sm leading-6 text-[#806049]">
                                Pantau pesanan masuk, cek pembayaran, dan lanjutkan fulfillment tanpa keluar dari panel supervisor.
                            </p>
                        </div>

                        <Link
                            href={role === 'SUPERVISOR' ? '/admin' : '/kasir'}
                            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d9c8b2] bg-[#fffaf3] px-5 text-sm font-semibold text-[#3d281b] shadow-[0_18px_28px_-24px_rgba(58,33,23,0.34)] transition hover:bg-white"
                        >
                            Kembali
                        </Link>
                    </header>)}

                    {error ? (
                        <p className="mb-4 rounded-2xl border border-[#efc9bf] bg-[#fff3ee] p-3 text-sm font-semibold text-[#a44b39]">
                            {error}
                        </p>
                    ) : null}

                    <div className={`grid gap-4 sm:gap-6 ${orders.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_25rem]' : ''}`}>
                        <section className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(249,243,234,0.92))] shadow-[0_24px_44px_-36px_rgba(58,33,23,0.28)]">
                            {/* Table Header for Desktop */}
                            <div className="hidden md:block border-b border-[#efe3d4] px-5 py-4">
                                <div className="grid grid-cols-[1.3fr_1fr_1fr_0.9fr_0.9fr] gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">
                                    <span>Order</span>
                                    <span>Pelanggan</span>
                                    <span>Fulfillment</span>
                                    <span>Total</span>
                                    <span>Status</span>
                                </div>
                            </div>

                            {/* Mobile List Header */}
                            <div className="md:hidden border-b border-[#efe3d4] px-4 py-3 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">Daftar Pesanan ({orders.length})</span>
                            </div>

                            {/* Order Items */}
                            <div className="divide-y divide-[#f2e7d9]">
                                {orders.map((order) => (
                                    <button
                                        type="button"
                                        key={order.id}
                                        onClick={() => void openOrder(order)}
                                        className={`w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left transition ${
                                            selected?.id === order.id
                                                ? 'bg-[#f8f2e7]'
                                                : 'hover:bg-white/75'
                                        }`}
                                    >
                                        {/* Desktop Grid Layout */}
                                        <div className="hidden md:grid grid-cols-[1.3fr_1fr_1fr_0.9fr_0.9fr] gap-3 items-center">
                                            <div>
                                                <p className="text-sm font-semibold text-[#2f241c]">{order.order_number}</p>
                                                <p className="mt-1 text-xs text-[#8d6b4e]">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#2f241c]">{order.customer_name}</p>
                                                <p className="mt-1 text-xs text-[#8d6b4e]">{order.customer_phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#2f241c]">{order.fulfillment_method}</p>
                                                <p className="mt-1 text-xs text-[#8d6b4e]">{order.shipping_courier_name} {order.shipping_service}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-[#2f241c]">{money(order.grand_total)}</p>
                                            <div>
                                                <span className="inline-flex rounded-full bg-[#edf5ee] px-3 py-1 text-xs font-semibold text-[#375c3f]">
                                                    {statusLabel(order.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile Card Layout */}
                                        <div className="md:hidden flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-[#2f241c]">{order.order_number}</p>
                                                    <p className="text-[11px] text-[#8d6b4e]">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                                                </div>
                                                <span className="inline-flex rounded-full bg-[#edf5ee] px-2.5 py-0.5 text-[11px] font-semibold text-[#375c3f]">
                                                    {statusLabel(order.status)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end pt-1.5 border-t border-[#f2e7d9]/60 text-xs">
                                                <div>
                                                    <p className="font-semibold text-[#2f241c]">{order.customer_name} • <span className="font-normal text-[#8d6b4e]">{order.fulfillment_method}</span></p>
                                                    <p className="text-[11px] text-[#8d6b4e]">{order.customer_phone}</p>
                                                </div>
                                                <span className="text-sm font-bold font-mono text-[#2f241c]">{money(order.grand_total)}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="space-y-3 p-4 sm:p-5">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="h-16 rounded-2xl bg-[#efe5d8] animate-pulse"></div>
                                    ))}
                                </div>
                            ) : null}

                            {!loading && orders.length === 0 ? (
                                <div className="px-4 py-8 sm:px-5 sm:py-10">
                                    <div className="rounded-2xl sm:rounded-[1.8rem] border border-dashed border-[#dfcfbb] bg-[#fffdf9] px-4 py-6 sm:px-6 sm:py-8 text-center">
                                        <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#f5eadb] text-[#8e6847]">
                                            <PackageSearch size={22} />
                                        </div>
                                        <p className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold text-[#2f241c]">Belum ada pesanan online.</p>
                                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#806049]">
                                            Pesanan dari storefront akan muncul di sini untuk dipantau dan diproses.
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </section>

                        {orders.length > 0 && (
                            <aside className={`rounded-2xl sm:rounded-[2rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(249,243,234,0.92))] p-4 sm:p-5 shadow-[0_24px_44px_-36px_rgba(58,33,23,0.28)] ${selected ? 'block' : 'hidden lg:block'}`}>
                                {selected ? (
                                    <div className="space-y-4 sm:space-y-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">Detail pesanan</p>
                                                <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-[#2f241c]">{selected.order_number}</h2>
                                                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#6f5948]">{selected.customer_name} | {selected.customer_phone}</p>
                                                <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#806049]">
                                                    {selected.shipping_address || 'Pickup di toko'} {selected.destination_label}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelected(null)}
                                                className="lg:hidden px-3 py-1.5 rounded-xl border border-[#d9c8b2] bg-white text-xs font-bold text-[#806049] hover:bg-[#fffaf3]"
                                            >
                                                Tutup
                                            </button>
                                        </div>

                                    <div className="rounded-[1.5rem] border border-[#efe3d4] bg-white/75">
                                        {selected.items.map((item) => (
                                            <div key={item.id} className="flex justify-between gap-4 border-b border-[#f4eadf] px-4 py-3 last:border-b-0">
                                                <span className="text-sm text-[#2f241c]">{item.product_name_snapshot} x {item.quantity}</span>
                                                <b className="text-sm text-[#2f241c]">{money(item.line_total)}</b>
                                            </div>
                                        ))}
                                    </div>

                                    <dl className="space-y-2 rounded-[1.5rem] border border-[#efe3d4] bg-white/75 px-4 py-4 text-sm">
                                        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(selected.subtotal)}</dd></div>
                                        <div className="flex justify-between"><dt>Diskon</dt><dd>-{money(selected.discount_total)}</dd></div>
                                        <div className="flex justify-between"><dt>Ongkir</dt><dd>{money(selected.shipping_cost)}</dd></div>
                                        <div className="flex justify-between border-t border-[#eadfcf] pt-3 text-lg font-semibold text-[#2f241c]"><dt>Total</dt><dd>{money(selected.grand_total)}</dd></div>
                                    </dl>

                                    {['MENUNGGU_PEMBAYARAN', 'PEMBAYARAN_DIPERIKSA'].includes(selected.status) ? (
                                        <button
                                            onClick={handlePaymentConfirmation}
                                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#375c3f] px-4 py-3 font-semibold text-white shadow-[0_20px_32px_-24px_rgba(55,92,63,0.72)] transition hover:bg-[#2f4d35]"
                                        >
                                            <PackageCheck size={18} />
                                            Konfirmasi Pembayaran
                                        </button>
                                    ) : null}

                                    {selected.status === 'DIPROSES' && selected.fulfillment_method === 'DELIVERY' ? (
                                        <div className="space-y-3">
                                            <input
                                                value={trackingNumber}
                                                onChange={(event) => setTrackingNumber(event.target.value)}
                                                placeholder="Nomor resi"
                                                className="min-h-12 w-full rounded-2xl border border-[#dfcfbb] bg-[#fffdf9] px-4 text-sm text-[#2f241c] outline-none transition focus:border-[#c2ab8d] focus:ring-4 focus:ring-[#efe3d4]"
                                            />
                                            <button
                                                onClick={() => void act('status', { status: 'DIKIRIM', tracking_number: trackingNumber })}
                                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3d281b] px-4 py-3 font-semibold text-white shadow-[0_20px_32px_-24px_rgba(61,40,27,0.72)] transition hover:bg-[#4b3223]"
                                            >
                                                <Truck size={18} />
                                                Simpan Resi & Kirim
                                            </button>
                                        </div>
                                    ) : null}

                                    {(selected.status === 'DIPROSES' && selected.fulfillment_method === 'PICKUP') || selected.status === 'DIKIRIM' ? (
                                        <button
                                            onClick={() => void act('status', { status: 'SELESAI' })}
                                            className="min-h-12 w-full rounded-2xl border border-[#d6c4ae] bg-[#fffaf3] px-4 py-3 font-semibold text-[#3d281b] transition hover:bg-white"
                                        >
                                            Tandai Selesai
                                        </button>
                                    ) : null}

                                    {role === 'SUPERVISOR' && !['SELESAI', 'DIBATALKAN'].includes(selected.status) ? (
                                        <button
                                            onClick={() => void act('status', { status: 'DIBATALKAN' })}
                                            className="min-h-12 w-full rounded-2xl border border-[#efc9bf] bg-[#fff3ee] px-4 py-3 font-semibold text-[#a44b39] transition hover:bg-[#feeae2]"
                                        >
                                            Batalkan Pesanan
                                        </button>
                                    ) : null}

                                    {shippingWhatsAppUrl ? (
                                        <a
                                            href={shippingWhatsAppUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#5d8b62] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#4f7854]"
                                        >
                                            Beritahu via WhatsApp
                                        </a>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="rounded-[1.8rem] border border-dashed border-[#dfcfbb] bg-[#fffdf9] px-6 py-10 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5eadb] text-[#8e6847]">
                                        <PackageSearch size={24} />
                                    </div>
                                    <p className="mt-4 text-base font-semibold text-[#2f241c]">Pilih pesanan untuk melihat detail dan tindakan.</p>
                                    <p className="mt-2 text-sm leading-6 text-[#806049]">
                                        Detail pelanggan, item, dan aksi fulfillment akan tampil di panel ini.
                                    </p>
                                </div>
                            )}
                        </aside>)}
                    </div>
                </div>
            </main>

            <UniversalModal
                isOpen={isPaymentDialogOpen}
                title="Konfirmasi Pembayaran di Toko"
                description="Pilih metode yang digunakan pelanggan sebelum pesanan dikonfirmasi."
                tone="neutral"
                confirmLabel="Konfirmasi Pembayaran"
                cancelLabel="Batal"
                isLoading={isConfirmingPayment}
                isConfirmDisabled={!canConfirmStorePayment}
                onClose={() => setIsPaymentDialogOpen(false)}
                onConfirm={() => void confirmStorePayment()}
            >
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        { value: 'CASH', label: 'Cash', icon: Banknote },
                        { value: 'QRIS_MANUAL', label: 'QRIS', icon: CreditCard },
                        { value: 'BANK_TRANSFER', label: 'Transfer', icon: Landmark },
                    ].map(({ value, label, icon: Icon }) => {
                        const isSelected = storePaymentMethod === value;

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStorePaymentMethod(value as StorePaymentMethod)}
                                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${isSelected
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                                    }`}
                            >
                                <Icon size={20} />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {storePaymentMethod === 'QRIS_MANUAL' && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-center">
                        <p className="mb-3 text-sm font-bold text-slate-700">Pindai QRIS untuk membayar</p>
                        {paymentSettings.qris_image_url ? (
                            <img
                                src={paymentSettings.qris_image_url}
                                alt="Kode QRIS pembayaran toko"
                                className="mx-auto max-h-56 max-w-full rounded-xl border border-slate-200 bg-white p-2"
                            />
                        ) : (
                            <p className="text-sm leading-6 text-rose-600">Gambar QRIS belum dikonfigurasi. Konfirmasi belum dapat dilakukan.</p>
                        )}
                    </div>
                )}

                {storePaymentMethod === 'BANK_TRANSFER' && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Transfer ke rekening</p>
                        {paymentSettings.bank_name && paymentSettings.bank_account_number ? (
                            <div className="mt-2 space-y-1 text-slate-700">
                                <p className="text-lg font-bold">{paymentSettings.bank_name}</p>
                                <p className="font-mono text-base font-bold">{paymentSettings.bank_account_number}</p>
                                {paymentSettings.bank_account_name && <p className="text-sm">a.n. {paymentSettings.bank_account_name}</p>}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm leading-6 text-rose-600">Rekening transfer belum dikonfigurasi. Konfirmasi belum dapat dilakukan.</p>
                        )}
                    </div>
                )}

                {paymentSettings.instructions && storePaymentMethod !== 'CASH' && (
                    <p className="mt-4 text-xs leading-5 text-slate-500">{paymentSettings.instructions}</p>
                )}
            </UniversalModal>
        </>
    );
}
