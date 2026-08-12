import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, Circle, Clock3, MapPin, MessageCircle, PackageCheck, ReceiptText, Store, Truck, X } from 'lucide-react';

import { getCheckoutWhatsappUrl } from './constants';
import { formatRupiah } from './data/publicCatalogData';
import type { BusinessProfile } from './types';
import { PublicFooter, PublicFrame, PublicHeader, SkipLink, usePublicCart } from '.';

type OrderItem = {
    product_name_snapshot: string;
    unit_price: string;
    quantity: number;
    line_total: string;
};

type TrackingOrder = {
    order_number: string;
    customer_name: string;
    fulfillment_method: 'DELIVERY' | 'PICKUP';
    shipping_courier_name?: string | null;
    shipping_service?: string | null;
    shipping_etd?: string | null;
    shipping_cost: string;
    subtotal: string;
    discount_total: string;
    grand_total: string;
    payment_method: string;
    status: string;
    tracking_number?: string | null;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
};

const statusLabels: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: 'Menunggu pembayaran',
    PEMBAYARAN_DIPERIKSA: 'Pembayaran diperiksa',
    DIPROSES: 'Sedang diproses',
    DIKIRIM: 'Dalam pengiriman',
    SELESAI: 'Pesanan selesai',
    DIBATALKAN: 'Pesanan dibatalkan',
};

const paymentLabels: Record<string, string> = {
    BANK_TRANSFER: 'Transfer bank',
    QRIS_MANUAL: 'QRIS',
    PAY_AT_STORE: 'Bayar di toko',
};

export default function OrderTrackingPage({ business, order }: { business: BusinessProfile; order: TrackingOrder }) {
    const { cartItems, clearCart, decreaseCartItem, addToCart } = usePublicCart([]);
    const whatsappUrl = getCheckoutWhatsappUrl(business, `Halo ${business.name}, saya ingin menanyakan pesanan ${order.order_number}.`);
    const isCancelled = order.status === 'DIBATALKAN';
    const steps = getTrackingSteps(order.fulfillment_method);
    const currentStep = getCurrentStep(order.status);
    const lastUpdated = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.updated_at));

    return <>
        <Head title={`Pesanan ${order.order_number} - ${business.name}`} />
        <PublicFrame>
            <SkipLink />
            <PublicHeader
                business={business}
                cartItems={cartItems}
                onIncreaseCartItem={addToCart}
                onDecreaseCartItem={decreaseCartItem}
                onClearCart={clearCart}
            />

            <main id="main-content" className="px-4 pb-10 pt-5 text-[var(--color-cocoa-800)] sm:px-5 lg:px-8 lg:pb-14">
                <div className="mx-auto max-w-6xl">
                    <Link href="/lacak-pesanan" className="inline-flex items-center gap-2 rounded-md text-sm font-bold text-[#8d5f3b] hover:text-[var(--color-cocoa-800)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-caramel-600)]">
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        Lacak pesanan lain
                    </Link>

                    <header className={`mt-5 overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_55px_rgba(72,42,22,0.13)] sm:p-8 ${isCancelled ? 'bg-[#793c35]' : 'bg-[var(--color-cocoa-800)]'}`}>
                        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffbd62]">Status pesanan</p>
                                <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">{statusLabels[order.status] ?? order.status.replaceAll('_', ' ')}</h1>
                                <p className="mt-3 text-sm text-[#ead8ca]">Pesanan <strong className="text-white">{order.order_number}</strong> Â· {order.customer_name}</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#f5e7dc]">
                                <Clock3 aria-hidden="true" className="size-4" />
                                Diperbarui {lastUpdated}
                            </div>
                        </div>
                    </header>

                    <section aria-labelledby="progress-heading" className="mt-5 rounded-3xl border border-[var(--color-cream-200)] bg-[#fffdf9] p-5 shadow-[0_16px_45px_rgba(72,42,22,0.06)] sm:p-7">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-caramel-500)]">Perjalanan pesanan</p>
                                <h2 id="progress-heading" className="mt-1 text-lg font-bold">{isCancelled ? 'Pesanan tidak dilanjutkan' : 'Progres terbaru'}</h2>
                            </div>
                            {order.fulfillment_method === 'DELIVERY' ? <Truck aria-hidden="true" className="size-6 text-[var(--color-caramel-500)]" /> : <Store aria-hidden="true" className="size-6 text-[var(--color-caramel-500)]" />}
                        </div>

                        {isCancelled ? <div className="mt-5 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-100"><X aria-hidden="true" className="size-4" /></span>
                            <p className="pt-1 leading-6">Pesanan ini dibatalkan. Hubungi toko jika Anda membutuhkan informasi lebih lanjut.</p>
                        </div> : <ol className="mt-6 grid gap-4 sm:grid-cols-4">
                            {steps.map((step, index) => {
                                const complete = index <= currentStep;
                                const active = index === currentStep;

                                return <li key={step} className="relative flex gap-3 sm:block">
                                    {index < steps.length - 1 && <span aria-hidden="true" className={`absolute left-4 top-8 h-[calc(100%+1rem)] w-px sm:left-8 sm:top-4 sm:h-px sm:w-[calc(100%-1rem)] ${index < currentStep ? 'bg-[var(--color-snack-500)]' : 'bg-[var(--color-cream-300)]'}`} />}
                                    <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 ${complete ? 'border-[var(--color-snack-500)] bg-[var(--color-snack-500)] text-[var(--color-cocoa-800)]' : 'border-[var(--color-cream-300)] bg-white text-[#a58e79]'}`}>
                                        {complete ? <Check aria-hidden="true" className="size-4" /> : <Circle aria-hidden="true" className="size-2 fill-current" />}
                                    </span>
                                    <div className="pb-3 sm:mt-3 sm:pb-0 sm:pr-3">
                                        <p className={`text-sm font-bold ${active ? 'text-[var(--color-cocoa-800)]' : complete ? 'text-[#70513d]' : 'text-[#9b8877]'}`}>{step}</p>
                                        {active && <p className="mt-1 text-xs text-[var(--color-cocoa-500)]">Status saat ini</p>}
                                    </div>
                                </li>;
                            })}
                        </ol>}
                    </section>

                    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                        <section aria-labelledby="items-heading" className="rounded-3xl border border-[var(--color-cream-200)] bg-[#fffdf9] p-5 shadow-[0_16px_45px_rgba(72,42,22,0.06)] sm:p-7">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-[#fff0d8] text-[var(--color-caramel-500)]"><ReceiptText aria-hidden="true" className="size-5" /></span>
                                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-caramel-500)]">Detail</p><h2 id="items-heading" className="text-lg font-bold">Item pesanan</h2></div>
                            </div>
                            <div className="mt-5 divide-y divide-[var(--color-cream-200)] border-y border-[var(--color-cream-200)]">
                                {order.items.map((item, index) => <div key={`${item.product_name_snapshot}-${index}`} className="flex items-start justify-between gap-4 py-4">
                                    <div><p className="text-sm font-semibold">{item.product_name_snapshot}</p><p className="mt-1 text-xs text-[var(--color-cocoa-500)]">{item.quantity} × {formatRupiah(Number(item.unit_price))}</p></div>
                                    <strong className="shrink-0 text-sm">{formatRupiah(Number(item.line_total))}</strong>
                                </div>)}
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <InfoCard icon={order.fulfillment_method === 'DELIVERY' ? Truck : Store} label="Penerimaan" value={order.fulfillment_method === 'DELIVERY' ? 'Dikirim ke alamat' : 'Ambil di toko'} />
                                <InfoCard icon={PackageCheck} label="Pembayaran" value={paymentLabels[order.payment_method] ?? order.payment_method.replaceAll('_', ' ')} />
                            </div>

                            {order.tracking_number && <div className="mt-5 rounded-2xl border border-[#efd3aa] bg-[#fff3df] p-4">
                                <div className="flex items-start gap-3">
                                    <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[var(--color-caramel-500)]" />
                                    <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-caramel-500)]">Nomor resi</p><p className="mt-1 break-all text-lg font-bold tracking-wide">{order.tracking_number}</p><p className="mt-1 text-sm text-[var(--color-cocoa-500)]">{order.shipping_courier_name} {order.shipping_service}{order.shipping_etd ? ` Â· Estimasi ${order.shipping_etd}` : ''}</p></div>
                                </div>
                            </div>}
                        </section>

                        <aside aria-labelledby="summary-heading" className="rounded-3xl border border-[var(--color-cream-300)] bg-[#fff8ed] p-5 shadow-[0_20px_50px_rgba(72,42,22,0.09)] lg:sticky lg:top-5">
                            <h2 id="summary-heading" className="font-display text-2xl font-semibold">Ringkasan biaya</h2>
                            <dl className="mt-5 space-y-3 text-sm">
                                <div className="flex justify-between gap-4"><dt className="text-[var(--color-cocoa-500)]">Subtotal</dt><dd className="font-semibold">{formatRupiah(Number(order.subtotal))}</dd></div>
                                {Number(order.discount_total) > 0 && <div className="flex justify-between gap-4"><dt className="text-[var(--color-cocoa-500)]">Diskon</dt><dd className="font-semibold text-[#168c45]">−{formatRupiah(Number(order.discount_total))}</dd></div>}
                                {order.fulfillment_method === 'DELIVERY' && <div className="flex justify-between gap-4"><dt className="text-[var(--color-cocoa-500)]">Ongkir</dt><dd className="font-semibold">{formatRupiah(Number(order.shipping_cost))}</dd></div>}
                                <div className="flex items-end justify-between gap-4 border-t border-[var(--color-cocoa-800)] pt-4"><dt className="font-bold">Total</dt><dd className="font-display text-2xl font-semibold">{formatRupiah(Number(order.grand_total))}</dd></div>
                            </dl>

                            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#168c45] px-5 text-sm font-bold text-white transition-colors hover:bg-[#11773a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0e6d35] motion-reduce:transition-none"><MessageCircle aria-hidden="true" className="size-4" />Butuh bantuan?</a>}
                            <p className="mt-3 text-center text-xs leading-5 text-[var(--color-cocoa-500)]">Sertakan nomor pesanan saat menghubungi toko.</p>
                        </aside>
                    </div>
                </div>
            </main>
            <PublicFooter business={business} />
        </PublicFrame>
    </>;
}

function getTrackingSteps(fulfillmentMethod: TrackingOrder['fulfillment_method']): string[] {
    return fulfillmentMethod === 'DELIVERY'
        ? ['Pesanan dibuat', 'Pembayaran', 'Diproses', 'Dikirim / selesai']
        : ['Pesanan dibuat', 'Pembayaran', 'Diproses', 'Selesai'];
}

function getCurrentStep(status: string): number {
    if (status === 'MENUNGGU_PEMBAYARAN') {
        return 0;
    }

    if (status === 'PEMBAYARAN_DIPERIKSA') {
        return 1;
    }

    if (status === 'DIPROSES') {
        return 2;
    }

    if (status === 'DIKIRIM' || status === 'SELESAI') {
        return 3;
    }

    return 0;
}

type IconComponent = typeof Store;

function InfoCard({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
    return <div className="flex items-start gap-3 rounded-2xl bg-[#f8f1e8] p-4">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[var(--color-caramel-500)]" />
        <div><p className="text-xs text-[var(--color-cocoa-500)]">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>
    </div>;
}
