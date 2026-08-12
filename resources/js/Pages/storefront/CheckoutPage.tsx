import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronRight, LoaderCircle, MapPin, PackageCheck, ShieldCheck, Store, Truck, UserRound, WalletCards } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { publicCartStorageKey } from './constants';
import { formatRupiah } from './data/publicCatalogData';
import type { PublicCatalogProduct } from './data/publicCatalogData';
import { parsePublicCart, resolvePublicCart } from './hooks/publicCartState';
import type { BusinessProfile, PublicCartEntry } from './types';
import { PublicFooter, PublicFrame, PublicHeader, SkipLink, usePublicCart } from '.';

type Destination = { id: string; label: string };
type Quote = { courier_code: string; courier_name: string; service: string; cost: number; etd: string | null };
type CheckoutErrors = Record<string, string[]>;
type CheckoutPageProps = { business: BusinessProfile; couriers: string[]; products: PublicCatalogProduct[] };

const fieldClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#dfcfbb] bg-white px-4 text-[0.95rem] text-[#3a2117] outline-none transition-colors placeholder:text-[#a58e79] focus:border-[#9b5c22] focus:ring-4 focus:ring-[#ef921e]/15 motion-reduce:transition-none';

export default function CheckoutPage({ business, couriers, products }: CheckoutPageProps) {
    const [entries, setEntries] = useState<PublicCartEntry[]>([]);
    const cartItems = useMemo(() => resolvePublicCart(entries, products), [entries, products]);
    const { cartItems: headerCartItems, addToCart, decreaseCartItem, clearCart } = usePublicCart(products);
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
    const [idempotencyKey, setIdempotencyKey] = useState('');
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (item.product.finalPrice ?? item.product.price) * item.quantity, 0), [cartItems]);
    const grandTotal = subtotal + (quote?.cost ?? 0);
    const hasUnavailableItems = cartItems.some((item) => item.product.stock <= 0 || item.quantity > item.product.stock);
    const errorMessages = Object.values(errors).flat();

    useEffect(() => {
        setEntries(parsePublicCart(window.localStorage.getItem(publicCartStorageKey)));
        setIdempotencyKey(window.crypto.randomUUID());
    }, []);

    useEffect(() => {
        if (fulfillmentMethod !== 'DELIVERY' || destinationQuery.trim().length < 3 || destination?.label === destinationQuery) {
            setDestinations([]);
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const response = await fetch(`/api/storefront/destinations?q=${encodeURIComponent(destinationQuery.trim())}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                const body = await response.json();
                setDestinations(response.ok ? body.data : []);

                if (!response.ok) {
                    setErrors(body.errors ?? { destination: ['Tujuan tidak ditemukan.'] });
                }
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    setErrors({ destination: ['Pencarian tujuan gagal.'] });
                }
            }
        }, 400);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [destination, destinationQuery, fulfillmentMethod]);

    async function loadQuotes(): Promise<void> {
        if (!destination) {
            return;
        }

        setShippingLoading(true);
        setErrors({});
        setQuote(null);

        try {
            const response = await fetch('/api/storefront/shipping-quote', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({
                    destination_id: destination.id,
                    courier,
                    items: entries.map((entry) => ({ product_id: entry.productId, quantity: entry.quantity })),
                }),
            });
            const body = await response.json();
            setQuotes(response.ok ? body.data : []);

            if (!response.ok) {
                setErrors(body.errors ?? { shipping: ['Tarif pengiriman gagal dimuat.'] });
            }
        } catch {
            setQuotes([]);
            setErrors({ shipping: ['Tarif pengiriman gagal dimuat. Silakan coba lagi.'] });
        } finally {
            setShippingLoading(false);
        }
    }

    async function submit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const response = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
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
                return;
            }

            setIdempotencyKey(window.crypto.randomUUID());
            window.localStorage.removeItem(publicCartStorageKey);
            router.visit(body.success_url);
        } catch {
            setErrors({ checkout: ['Pesanan belum berhasil dibuat. Periksa koneksi lalu coba lagi.'] });
        } finally {
            setSubmitting(false);
        }
    }

    function changeFulfillment(method: 'PICKUP' | 'DELIVERY'): void {
        setFulfillmentMethod(method);
        setQuote(null);
        setQuotes([]);

        if (method === 'DELIVERY' && paymentMethod === 'PAY_AT_STORE') {
            setPaymentMethod('BANK_TRANSFER');
        }
    }

    const deliveryIncomplete = fulfillmentMethod === 'DELIVERY' && (!shippingAddress || !destination || !quote);
    const checkoutDisabled = submitting || entries.length === 0 || deliveryIncomplete || hasUnavailableItems;

    return <>
        <Head title={`Checkout - ${business.name}`} />
        <PublicFrame>
            <SkipLink />
            <PublicHeader
                business={business}
                cartItems={headerCartItems}
                onIncreaseCartItem={addToCart}
                onDecreaseCartItem={decreaseCartItem}
                onClearCart={clearCart}
            />

            <main id="main-content" className="px-4 pb-10 pt-5 font-sans text-[#3a2117] sm:px-5 lg:px-8 lg:pb-14">
                <div className="mx-auto max-w-6xl">
                    <nav aria-label="Tahapan checkout" className="flex items-center gap-2 text-xs font-semibold text-[#806049]">
                        <Link href="/katalog" className="rounded-md hover:text-[#3a2117] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5c22]">Keranjang</Link>
                        <ChevronRight aria-hidden="true" className="size-3.5" />
                        <span aria-current="step" className="text-[#3a2117]">Data pesanan</span>
                        <ChevronRight aria-hidden="true" className="size-3.5" />
                        <span>Selesai</span>
                    </nav>

                    <header className="mt-6 max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a2642f]">Checkout aman</p>
                        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Selesaikan pesanan</h1>
                        <p className="mt-3 text-sm leading-6 text-[#806049] sm:text-base">Isi data singkat di bawah. Ringkasan dan total pesanan selalu terlihat sebelum Anda mengonfirmasi.</p>
                    </header>

                    <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_23rem]">
                        <form id="checkout-form" onSubmit={submit} className="space-y-5">
                            {errorMessages.length > 0 && <div role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                                <p className="font-bold">Pesanan belum dapat diproses.</p>
                                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                                    {errorMessages.map((error) => <li key={error}>{error}</li>)}
                                </ul>
                            </div>}

                            <section aria-labelledby="contact-heading" className="rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-5 shadow-[0_16px_45px_rgba(72,42,22,0.06)] sm:p-6">
                                <SectionHeading icon={UserRound} step="01" id="contact-heading" title="Kontak pemesan" description="Kami menggunakan nomor ini untuk menghubungi Anda terkait pesanan." />
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <label htmlFor="customer-name" className="block text-sm font-semibold">
                                        Nama lengkap
                                        <input id="customer-name" name="customer_name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} className={fieldClass} required maxLength={255} autoComplete="name" placeholder="Masukkan nama Anda…" />
                                    </label>
                                    <label htmlFor="customer-phone" className="block text-sm font-semibold">
                                        Nomor WhatsApp
                                        <input id="customer-phone" name="customer_phone" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className={fieldClass} required inputMode="tel" autoComplete="tel" placeholder="Contoh: 081234567890…" />
                                    </label>
                                </div>
                            </section>

                            <section aria-labelledby="fulfillment-heading" className="rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-5 shadow-[0_16px_45px_rgba(72,42,22,0.06)] sm:p-6">
                                <SectionHeading icon={PackageCheck} step="02" id="fulfillment-heading" title="Cara menerima pesanan" description="Pilih opsi yang paling nyaman untuk Anda." />
                                <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <legend className="sr-only">Cara menerima pesanan</legend>
                                    <FulfillmentOption active={fulfillmentMethod === 'PICKUP'} icon={Store} label="Ambil di toko" detail="Tanpa biaya pengiriman" onSelect={() => changeFulfillment('PICKUP')} />
                                    <FulfillmentOption active={fulfillmentMethod === 'DELIVERY'} icon={Truck} label="Kirim ke alamat" detail="Ongkir dihitung otomatis" onSelect={() => changeFulfillment('DELIVERY')} />
                                </fieldset>

                                {fulfillmentMethod === 'DELIVERY' && <div className="mt-5 space-y-4 border-t border-[#eadfcf] pt-5">
                                    <label htmlFor="shipping-address" className="block text-sm font-semibold">
                                        Alamat lengkap
                                        <textarea id="shipping-address" name="shipping_address" value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} className={`${fieldClass} min-h-24 py-3`} required autoComplete="street-address" placeholder="Nama jalan, nomor rumah, RT/RW, dan patokan…" />
                                    </label>
                                    <div className="relative">
                                        <label htmlFor="destination" className="block text-sm font-semibold">
                                            Kecamatan tujuan
                                            <input id="destination" name="destination" value={destinationQuery} onChange={(event) => { setDestinationQuery(event.target.value); setDestination(null); setQuote(null); setQuotes([]); }} className={fieldClass} autoComplete="address-level3" placeholder="Ketik minimal 3 karakter…" />
                                        </label>
                                        {destinations.length > 0 && <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[#dfcfbb] bg-white p-1 shadow-xl">
                                            {destinations.map((item) => <button key={item.id} type="button" onClick={() => { setDestination(item); setDestinationQuery(item.label); setDestinations([]); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#fff3df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9b5c22]">{item.label}</button>)}
                                        </div>}
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                                        <label htmlFor="courier" className="block text-sm font-semibold">
                                            Kurir
                                            <select id="courier" name="courier" value={courier} onChange={(event) => { setCourier(event.target.value); setQuote(null); setQuotes([]); }} className={fieldClass}>
                                                {couriers.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
                                            </select>
                                        </label>
                                        <button type="button" disabled={!destination || shippingLoading} onClick={loadQuotes} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ef921e] px-5 text-sm font-bold text-white transition-colors hover:bg-[#dd8212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c22] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none">
                                            {shippingLoading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
                                            {shippingLoading ? 'Memuat ongkir…' : 'Cek ongkir'}
                                        </button>
                                    </div>
                                    {quotes.length > 0 && <fieldset className="space-y-2">
                                        <legend className="mb-2 text-sm font-semibold">Pilih layanan pengiriman</legend>
                                        {quotes.map((item) => {
                                            const selected = quote?.courier_code === item.courier_code && quote.service === item.service;
                                            return <label key={`${item.courier_code}-${item.service}`} className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${selected ? 'border-[#9b5c22] bg-[#fff3df]' : 'border-[#dfcfbb] bg-white hover:border-[#bd9c7c]'}`}>
                                                <input type="radio" name="shipping_quote" checked={selected} onChange={() => setQuote(item)} className="sr-only" />
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${selected ? 'border-[#3a2117] bg-[#3a2117]' : 'border-[#bda891]'}`}>{selected && <Check aria-hidden="true" className="size-3 text-white" />}</span>
                                                    <span><strong className="block text-sm">{item.courier_name} {item.service}</strong><small className="text-[#806049]">Estimasi {item.etd ?? 'belum tersedia'}</small></span>
                                                </span>
                                                <strong className="shrink-0 text-sm">{formatRupiah(item.cost)}</strong>
                                            </label>;
                                        })}
                                    </fieldset>}
                                </div>}
                            </section>

                            <section aria-labelledby="payment-heading" className="rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-5 shadow-[0_16px_45px_rgba(72,42,22,0.06)] sm:p-6">
                                <SectionHeading icon={WalletCards} step="03" id="payment-heading" title="Pembayaran & catatan" description="Pilih metode pembayaran, lalu tambahkan catatan bila diperlukan." />
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <label htmlFor="payment-method" className="block text-sm font-semibold">
                                        Metode pembayaran
                                        <select id="payment-method" name="payment_method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={fieldClass}>
                                            <option value="BANK_TRANSFER">Transfer bank</option>
                                            <option value="QRIS_MANUAL">QRIS</option>
                                            {fulfillmentMethod === 'PICKUP' && <option value="PAY_AT_STORE">Bayar di toko</option>}
                                        </select>
                                    </label>
                                    <label htmlFor="customer-note" className="block text-sm font-semibold">
                                        Catatan <span className="font-normal text-[#806049]">(opsional)</span>
                                        <textarea id="customer-note" name="customer_note" value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className={`${fieldClass} min-h-12 py-3`} maxLength={1000} placeholder="Contoh: jangan terlalu pedas…" />
                                    </label>
                                </div>
                            </section>
                        </form>

                        <aside aria-labelledby="order-summary-heading" className="rounded-3xl border border-[#dfcfbb] bg-[#fff8ed] p-5 shadow-[0_24px_55px_rgba(72,42,22,0.10)] lg:sticky lg:top-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a2642f]">Pesanan Anda</p>
                                    <h2 id="order-summary-heading" className="mt-1 font-display text-2xl font-semibold">Ringkasan</h2>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#806049]">{cartItems.length} produk</span>
                            </div>

                            <div className="mt-4 divide-y divide-[#ead8c2] border-y border-[#ead8c2]">
                                {cartItems.map((item) => <div key={item.product.id} className="flex items-start justify-between gap-4 py-3.5 text-sm">
                                    <div className="min-w-0">
                                        <p className="font-semibold leading-5">{item.product.name}</p>
                                        <p className="mt-1 text-xs text-[#806049]">{item.quantity} × {formatRupiah(item.product.finalPrice ?? item.product.price)}</p>
                                    </div>
                                    <strong className="shrink-0">{formatRupiah((item.product.finalPrice ?? item.product.price) * item.quantity)}</strong>
                                </div>)}
                                {entries.length === 0 && <div className="py-5 text-center text-sm text-[#806049]">
                                    <p>Keranjang Anda masih kosong.</p>
                                    <Link href="/katalog" className="mt-2 inline-block font-bold text-[#9b5c22] underline decoration-[#d9b58e] underline-offset-4">Pilih produk</Link>
                                </div>}
                            </div>

                            <dl className="mt-4 space-y-2.5 text-sm">
                                <div className="flex justify-between gap-4"><dt className="text-[#806049]">Subtotal</dt><dd className="font-semibold">{formatRupiah(subtotal)}</dd></div>
                                {fulfillmentMethod === 'DELIVERY' && <div className="flex justify-between gap-4"><dt className="text-[#806049]">Ongkir</dt><dd className="font-semibold">{quote ? formatRupiah(quote.cost) : 'Belum dipilih'}</dd></div>}
                                <div className="flex items-end justify-between gap-4 border-t border-[#3a2117] pt-4"><dt className="font-bold">Total</dt><dd className="font-display text-2xl font-semibold">{formatRupiah(grandTotal)}</dd></div>
                            </dl>

                            {hasUnavailableItems && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold leading-5 text-red-800">Stok salah satu produk tidak mencukupi. Perbarui jumlah dari katalog.</p>}

                            <button form="checkout-form" type="submit" disabled={checkoutDisabled} className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#3a2117] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(58,33,23,0.18)] transition-colors hover:bg-[#4c2a1d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9b5c22] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none">
                                {submitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <ShieldCheck aria-hidden="true" className="size-4" />}
                                {submitting ? 'Membuat pesanan…' : 'Konfirmasi pesanan'}
                            </button>
                            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#806049]"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />Pastikan data dan metode penerimaan sudah benar sebelum melanjutkan.</p>
                        </aside>
                    </div>
                </div>
            </main>
            <PublicFooter business={business} />
        </PublicFrame>
    </>;
}

type IconComponent = typeof UserRound;

function SectionHeading({ icon: Icon, step, id, title, description }: { icon: IconComponent; step: string; id: string; title: string; description: string }) {
    return <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0d8] text-[#a2642f]"><Icon aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#a2642f]">Langkah {step}</p>
            <h2 id={id} className="mt-0.5 text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-[#806049]">{description}</p>
        </div>
    </div>;
}

function FulfillmentOption({ active, icon: Icon, label, detail, onSelect }: { active: boolean; icon: IconComponent; label: string; detail: string; onSelect: () => void }) {
    return <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${active ? 'border-[#9b5c22] bg-[#fff3df]' : 'border-[#dfcfbb] bg-white hover:border-[#bd9c7c]'}`}>
        <input type="radio" name="fulfillment_method" checked={active} onChange={onSelect} className="sr-only" />
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-[#3a2117] text-white' : 'bg-[#f6eee4] text-[#806049]'}`}><Icon aria-hidden="true" className="size-5" /></span>
        <span className="min-w-0"><strong className="block text-sm">{label}</strong><small className="mt-0.5 block text-[#806049]">{detail}</small></span>
        {active && <Check aria-hidden="true" className="ml-auto size-4 shrink-0" />}
    </label>;
}
