import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type Item = { id: number; product_name_snapshot: string; quantity: number; line_total: string };
type Order = {
    id: number; order_number: string; customer_name: string; customer_phone: string; fulfillment_method: string;
    shipping_address?: string | null; destination_label?: string | null; shipping_courier_name?: string | null;
    shipping_service?: string | null; shipping_etd?: string | null; grand_total: string; subtotal: string;
    discount_total: string; shipping_cost: string; payment_method: string; status: string; tracking_number?: string | null;
    created_at: string; items: Item[];
};

const money = (value: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));

export default function OnlineOrdersPage({ role }: { role: 'CASHIER' | 'SUPERVISOR' }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selected, setSelected] = useState<Order | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingWhatsAppUrl, setShippingWhatsAppUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    async function loadOrders(): Promise<void> {
        try {
            const response = await axios.get('/api/online-orders');
            setOrders(response.data.data.data ?? []);
        } catch { setError('Pesanan online gagal dimuat.'); } finally { setLoading(false); }
    }

    async function openOrder(order: Order): Promise<void> {
        const response = await axios.get(`/api/online-orders/${order.id}`);
        setSelected(response.data.data);
        setTrackingNumber(response.data.data.tracking_number ?? '');
        setShippingWhatsAppUrl(response.data.shipping_whatsapp_url ?? null);
    }

    async function act(path: string, payload?: object): Promise<void> {
        if (!selected) return;
        setError('');
        try {
            const response = payload
                ? await axios.patch(`/api/online-orders/${selected.id}/${path}`, payload)
                : await axios.post(`/api/online-orders/${selected.id}/${path}`);
            const updated = response.data.data as Order;
            setSelected(updated);
            setOrders(current => current.map(order => order.id === updated.id ? updated : order));
            setShippingWhatsAppUrl(response.data.shipping_whatsapp_url ?? null);
        } catch (requestError) {
            setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message ?? 'Aksi gagal diproses.' : 'Aksi gagal diproses.');
        }
    }

    useEffect(() => { void loadOrders(); }, []);

    return <>
        <Head title="Pesanan Online" />
        <main className="min-h-screen bg-slate-100 p-4 text-slate-800 sm:p-7">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6 flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-indigo-600">Operasional</p><h1 className="text-3xl font-bold">Pesanan Online</h1></div><Link href={role === 'SUPERVISOR' ? '/admin' : '/kasir'} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold">Kembali</Link></header>
                {error && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
                    <section className="overflow-x-auto border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left"><tr><th className="p-3">Order</th><th className="p-3">Pelanggan</th><th className="p-3">Fulfillment</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead><tbody>{orders.map(order => <tr key={order.id} onClick={() => void openOrder(order)} className="cursor-pointer border-t hover:bg-indigo-50"><td className="p-3 font-bold">{order.order_number}<small className="block font-normal text-slate-500">{new Date(order.created_at).toLocaleString('id-ID')}</small></td><td className="p-3">{order.customer_name}<small className="block text-slate-500">{order.customer_phone}</small></td><td className="p-3">{order.fulfillment_method}<small className="block text-slate-500">{order.shipping_courier_name} {order.shipping_service}</small></td><td className="p-3 font-bold">{money(order.grand_total)}</td><td className="p-3">{order.status.replaceAll('_', ' ')}</td></tr>)}</tbody></table>{loading && <p className="p-5">Memuat…</p>}{!loading && orders.length === 0 && <p className="p-5">Belum ada pesanan online.</p>}</section>
                    <aside className="border border-slate-200 bg-white p-5">{selected ? <div className="space-y-5"><div><h2 className="text-xl font-bold">{selected.order_number}</h2><p>{selected.customer_name} · {selected.customer_phone}</p><p className="text-sm text-slate-500">{selected.shipping_address || 'Pickup di toko'} {selected.destination_label}</p></div><div className="divide-y">{selected.items.map(item => <div key={item.id} className="flex justify-between py-2 text-sm"><span>{item.product_name_snapshot} × {item.quantity}</span><b>{money(item.line_total)}</b></div>)}</div><dl className="space-y-2 border-y py-4 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{money(selected.subtotal)}</dd></div><div className="flex justify-between"><dt>Diskon</dt><dd>-{money(selected.discount_total)}</dd></div><div className="flex justify-between"><dt>Ongkir</dt><dd>{money(selected.shipping_cost)}</dd></div><div className="flex justify-between text-lg font-bold"><dt>Total</dt><dd>{money(selected.grand_total)}</dd></div></dl>{['MENUNGGU_PEMBAYARAN', 'PEMBAYARAN_DIPERIKSA'].includes(selected.status) && <button onClick={() => void act('confirm-payment')} className="w-full bg-emerald-600 px-4 py-3 font-bold text-white">Konfirmasi Pembayaran</button>}{selected.status === 'DIPROSES' && selected.fulfillment_method === 'DELIVERY' && <div className="space-y-2"><input value={trackingNumber} onChange={event => setTrackingNumber(event.target.value)} placeholder="Nomor resi" className="w-full border p-3"/><button onClick={() => void act('status', { status: 'DIKIRIM', tracking_number: trackingNumber })} className="w-full bg-indigo-600 px-4 py-3 font-bold text-white">Simpan Resi & Kirim</button></div>}{(selected.status === 'DIPROSES' && selected.fulfillment_method === 'PICKUP') || selected.status === 'DIKIRIM' ? <button onClick={() => void act('status', { status: 'SELESAI' })} className="w-full bg-slate-800 px-4 py-3 font-bold text-white">Tandai Selesai</button> : null}{role === 'SUPERVISOR' && !['SELESAI', 'DIBATALKAN'].includes(selected.status) && <button onClick={() => void act('status', { status: 'DIBATALKAN' })} className="w-full border border-red-300 px-4 py-3 font-bold text-red-700">Batalkan Pesanan</button>}{shippingWhatsAppUrl && <a href={shippingWhatsAppUrl} target="_blank" rel="noreferrer" className="block bg-green-600 px-4 py-3 text-center font-bold text-white">Beritahu via WhatsApp</a>}</div> : <p className="text-slate-500">Pilih pesanan untuk melihat detail dan tindakan.</p>}</aside>
                </div>
            </div>
        </main>
    </>;
}
