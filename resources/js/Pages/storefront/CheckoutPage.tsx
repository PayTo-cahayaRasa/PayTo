import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { publicCartStorageKey } from './constants';
import { formatRupiah } from './data/publicCatalogData';
import type { PublicCatalogProduct } from './data/publicCatalogData';
import { parsePublicCart, resolvePublicCart } from './hooks/publicCartState';
import type { BusinessProfile, PublicCartEntry } from './types';

type Destination = { id: string; label: string };
type Quote = { courier_code: string; courier_name: string; service: string; cost: number; etd: string | null };
type CheckoutErrors = Record<string, string[]>;
type CheckoutPageProps = { business: BusinessProfile; couriers: string[]; products: PublicCatalogProduct[] };

export default function CheckoutPage({ business, couriers, products }: CheckoutPageProps) {
    const [entries] = useState<PublicCartEntry[]>(() => parsePublicCart(window.localStorage.getItem(publicCartStorageKey)));
    const cartItems = useMemo(() => resolvePublicCart(entries, products), [entries, products]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [fulfillmentMethod, setFulfillmentMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [customerNote, setCustomerNote] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [destinationQuery, setDestinationQuery] = useState('');
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [destination, setDestination] = useState<Destination | null>(null);
    const [courier, setCourier] = useState(couriers[0] ?? 'jne');
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [errors, setErrors] = useState<CheckoutErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [idempotencyKey, setIdempotencyKey] = useState(() => window.crypto.randomUUID());
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (item.product.finalPrice ?? item.product.price) * item.quantity, 0), [cartItems]);
    const grandTotal = subtotal + (quote?.cost ?? 0);

    useEffect(() => {
        if (fulfillmentMethod !== 'DELIVERY' || destinationQuery.trim().length < 3 || destination?.label === destinationQuery) {
            setDestinations([]);
            return;
        }
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const response = await fetch(`/api/storefront/destinations?q=${encodeURIComponent(destinationQuery.trim())}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
                const body = await response.json();
                setDestinations(response.ok ? body.data : []);
                if (!response.ok) setErrors(body.errors ?? { destination: ['Tujuan tidak ditemukan.'] });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') setErrors({ destination: ['Pencarian tujuan gagal.'] });
            }
        }, 400);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [destination, destinationQuery, fulfillmentMethod]);

    async function loadQuotes(): Promise<void> {
        if (!destination) return;
        setShippingLoading(true);
        setErrors({});
        setQuote(null);
        const response = await fetch('/api/storefront/shipping-quote', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '' },
            body: JSON.stringify({ destination_id: destination.id, courier, items: entries.map((entry) => ({ product_id: entry.productId, quantity: entry.quantity })) }),
        });
        const body = await response.json();
        setQuotes(response.ok ? body.data : []);
        if (!response.ok) setErrors(body.errors ?? { shipping: ['Tarif pengiriman gagal dimuat.'] });
        setShippingLoading(false);
    }

    async function submit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        const response = await fetch('/checkout', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '' },
            body: JSON.stringify({
                idempotency_key: idempotencyKey,
                customer_name: customerName,
                customer_phone: customerPhone.replace(/\D/g, ''),
                fulfillment_method: fulfillmentMethod,
                shipping_address: fulfillmentMethod === 'DELIVERY' ? shippingAddress : null,
                destination_id: fulfillmentMethod === 'DELIVERY' ? destination?.id : null,
                destination_label: fulfillmentMethod === 'DELIVERY' ? destination?.label : null,
                shipping_courier_code: fulfillmentMethod === 'DELIVERY' ? quote?.courier_code : null,
                shipping_service: fulfillmentMethod === 'DELIVERY' ? quote?.service : null,
                payment_method: paymentMethod,
                customer_note: customerNote || null,
                items: entries.map((entry) => ({ product_id: entry.productId, quantity: entry.quantity })),
            }),
        });
        const body = await response.json();
        if (!response.ok) {
            setErrors(body.errors ?? { checkout: [body.message ?? 'Pesanan gagal dibuat.'] });
            setSubmitting(false);
            return;
        }
        setIdempotencyKey(window.crypto.randomUUID());
        window.localStorage.removeItem(publicCartStorageKey);
        router.visit(body.success_url);
    }

    const deliveryIncomplete = fulfillmentMethod === 'DELIVERY' && (!shippingAddress || !destination || !quote);

    return <>
        <Head title={`Checkout - ${business.name}`} />
        <main className="min-h-screen bg-[#fffaf3] px-4 py-8 font-sans text-[#3a2117] sm:px-6">
            <div className="mx-auto max-w-5xl">
                <Link href="/katalog" className="text-sm font-semibold text-[#8d5f3b]">← Kembali ke katalog</Link>
                <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_22rem]">
                    <form onSubmit={submit} className="space-y-5">
                        <div><p className="text-sm font-bold uppercase tracking-widest text-[#a5764e]">Guest checkout</p><h1 className="mt-2 font-display text-4xl font-semibold">Selesaikan Pesanan</h1><p className="mt-2 text-sm text-[#806049]">Pilih ambil di toko atau pengiriman dengan tarif RajaOngkir.</p></div>
                        <div className="grid grid-cols-2 gap-3">
                            {(['PICKUP', 'DELIVERY'] as const).map((method) => <button key={method} type="button" onClick={() => { setFulfillmentMethod(method); setQuote(null); if (method === 'DELIVERY' && paymentMethod === 'PAY_AT_STORE') setPaymentMethod('BANK_TRANSFER'); }} className={`min-h-12 rounded-2xl border font-bold ${fulfillmentMethod === method ? 'border-[#3a2117] bg-[#3a2117] text-white' : 'border-[#dfcfbb] bg-white'}`}>{method === 'PICKUP' ? 'Ambil di Toko' : 'Dikirim'}</button>)}
                        </div>
                        <label className="block text-sm font-semibold">Nama pelanggan<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[#dfcfbb] bg-white px-4" required maxLength={255} /></label>
                        <label className="block text-sm font-semibold">Nomor WhatsApp<input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[#dfcfbb] bg-white px-4" required inputMode="numeric" placeholder="081234567890" /></label>
                        {fulfillmentMethod === 'DELIVERY' && <div className="space-y-4 border-t border-[#eadfcf] pt-5">
                            <label className="block text-sm font-semibold">Alamat lengkap<textarea value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-[#dfcfbb] bg-white p-4" required /></label>
                            <label className="block text-sm font-semibold">Kecamatan tujuan<input value={destinationQuery} onChange={(event) => { setDestinationQuery(event.target.value); setDestination(null); setQuote(null); }} className="mt-2 min-h-12 w-full rounded-2xl border border-[#dfcfbb] bg-white px-4" placeholder="Cari minimal 3 karakter" /></label>
                            {destinations.length > 0 && <div className="divide-y rounded-2xl border border-[#dfcfbb] bg-white">{destinations.map((item) => <button key={item.id} type="button" onClick={() => { setDestination(item); setDestinationQuery(item.label); setDestinations([]); }} className="block w-full px-4 py-3 text-left text-sm hover:bg-[#fff3df]">{item.label}</button>)}</div>}
                            <div className="flex gap-3"><select value={courier} onChange={(event) => setCourier(event.target.value)} className="min-h-12 flex-1 rounded-2xl border border-[#dfcfbb] bg-white px-4">{couriers.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}</select><button type="button" disabled={!destination || shippingLoading} onClick={loadQuotes} className="rounded-2xl bg-[#ef921e] px-5 font-bold text-white disabled:opacity-45">{shippingLoading ? 'Memuat…' : 'Cek Ongkir'}</button></div>
                            {quotes.length > 0 && <div className="grid gap-2">{quotes.map((item) => <button key={`${item.courier_code}-${item.service}`} type="button" onClick={() => setQuote(item)} className={`flex justify-between rounded-2xl border p-4 text-left ${quote?.service === item.service ? 'border-[#3a2117] bg-[#fff3df]' : 'border-[#dfcfbb] bg-white'}`}><span><strong>{item.courier_name} {item.service}</strong><small className="block text-[#806049]">Estimasi {item.etd ?? '-'}</small></span><strong>{formatRupiah(item.cost)}</strong></button>)}</div>}
                        </div>}
                        <label className="block text-sm font-semibold">Metode pembayaran<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[#dfcfbb] bg-white px-4"><option value="BANK_TRANSFER">Transfer Bank</option><option value="QRIS_MANUAL">QRIS Manual</option>{fulfillmentMethod === 'PICKUP' && <option value="PAY_AT_STORE">Bayar di Toko</option>}</select></label>
                        <label className="block text-sm font-semibold">Catatan (opsional)<textarea value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-[#dfcfbb] bg-white p-4" maxLength={1000} /></label>
                        {Object.values(errors).flat().map((error) => <p key={error} className="text-sm font-semibold text-red-700">{error}</p>)}
                        <button disabled={submitting || entries.length === 0 || deliveryIncomplete} className="min-h-12 w-full rounded-full bg-[#3a2117] px-6 font-bold text-white disabled:opacity-45">{submitting ? 'Membuat pesanan…' : 'Buat Pesanan Web'}</button>
                    </form>
                    <aside className="border-l border-[#eadfcf] pl-0 lg:pl-7"><h2 className="font-display text-2xl font-semibold">Ringkasan pesanan</h2><div className="mt-4 divide-y divide-[#eadfcf]">{cartItems.map((item) => <div key={item.product.id} className="py-3 text-sm"><div className="flex justify-between gap-4"><span>{item.product.name} × {item.quantity}</span><strong>{formatRupiah((item.product.finalPrice ?? item.product.price) * item.quantity)}</strong></div></div>)}</div>{fulfillmentMethod === 'DELIVERY' && <div className="mt-3 flex justify-between text-sm"><span>Ongkir</span><strong>{quote ? formatRupiah(quote.cost) : '-'}</strong></div>}<div className="mt-4 flex justify-between border-t border-[#3a2117] pt-4 text-lg"><strong>Total</strong><strong>{formatRupiah(grandTotal)}</strong></div>{entries.length === 0 && <p className="mt-4 text-sm text-red-700">Keranjang kosong. Tambahkan produk dari katalog.</p>}</aside>
                </div>
            </div>
        </main>
    </>;
}
