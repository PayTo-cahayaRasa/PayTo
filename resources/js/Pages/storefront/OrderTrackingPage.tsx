import { Head, Link } from '@inertiajs/react';

import { getCheckoutWhatsappUrl } from './constants';
import { formatRupiah } from './data/publicCatalogData';
import type { BusinessProfile } from './types';

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

export default function OrderTrackingPage({ business, order }: { business: BusinessProfile; order: TrackingOrder }) {
    const whatsappUrl = getCheckoutWhatsappUrl(business, `Halo ${business.name}, saya ingin menanyakan pesanan ${order.order_number}.`);

    return (
        <>
            <Head title={`Pesanan ${order.order_number}`} />
            <main className="min-h-screen bg-[#fffaf3] px-4 py-8 text-[#3a2117] sm:px-6">
                <div className="mx-auto max-w-4xl">
                    <Link href="/katalog" className="text-sm font-semibold text-[#8d5f3b]">← Kembali ke katalog</Link>
                    <header className="mt-6 border-b border-[#dfcfbb] pb-6">
                        <p className="text-sm font-bold uppercase tracking-widest text-[#a5764e]">Status pesanan</p>
                        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div><h1 className="font-display text-4xl font-semibold">{order.order_number}</h1><p className="mt-2 text-[#806049]">Atas nama {order.customer_name}</p></div>
                            <span className="w-fit rounded-full bg-[#3a2117] px-4 py-2 text-sm font-bold text-white">{order.status.replaceAll('_', ' ')}</span>
                        </div>
                    </header>
                    <div className="grid gap-8 py-7 lg:grid-cols-[1fr_20rem]">
                        <section>
                            <h2 className="text-xl font-bold">Item pesanan</h2>
                            <div className="mt-3 divide-y divide-[#eadfcf]">
                                {order.items.map((item) => <div key={item.product_name_snapshot} className="flex justify-between gap-4 py-4">
                                    <span>{item.product_name_snapshot} × {item.quantity}</span><strong>{formatRupiah(Number(item.line_total))}</strong>
                                </div>)}
                            </div>
                            {order.tracking_number && <div className="mt-6 border-t border-[#dfcfbb] pt-5"><p className="text-sm text-[#806049]">Nomor resi</p><p className="mt-1 text-xl font-bold">{order.tracking_number}</p><p className="text-sm">{order.shipping_courier_name} {order.shipping_service}</p></div>}
                        </section>
                        <aside className="border-l border-[#eadfcf] pl-0 lg:pl-7">
                            <h2 className="text-xl font-bold">Ringkasan</h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatRupiah(Number(order.subtotal))}</dd></div>
                                <div className="flex justify-between"><dt>Diskon</dt><dd>-{formatRupiah(Number(order.discount_total))}</dd></div>
                                <div className="flex justify-between"><dt>Ongkir</dt><dd>{formatRupiah(Number(order.shipping_cost))}</dd></div>
                                <div className="flex justify-between border-t border-[#3a2117] pt-3 text-lg font-bold"><dt>Total</dt><dd>{formatRupiah(Number(order.grand_total))}</dd></div>
                            </dl>
                            <p className="mt-5 text-sm text-[#806049]">Pembayaran: {order.payment_method.replaceAll('_', ' ')}</p>
                            <p className="mt-2 text-xs text-[#806049]">Terakhir diperbarui {new Date(order.updated_at).toLocaleString('id-ID')}</p>
                        </aside>
                    </div>
                    {whatsappUrl ? (
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full bg-[#168c45] px-6 text-sm font-bold text-white">Hubungi Toko via WhatsApp</a>
                    ) : null}
                </div>
            </main>
        </>
    );
}
