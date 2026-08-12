import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, PackageSearch, Search, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

import type { BusinessProfile } from './types';
import { PublicFooter, PublicFrame, PublicHeader, SkipLink, usePublicCart } from '.';

const fieldClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#ded0bf] bg-white px-4 text-[0.95rem] text-[var(--color-cocoa-800)] outline-none transition-colors placeholder:text-[#ad9a87] focus:border-[var(--color-caramel-600)] focus:ring-4 focus:ring-[var(--color-snack-500)]/15 motion-reduce:transition-none';

export default function OrderTrackingLookupPage({ business }: { business: BusinessProfile }) {
    const form = useForm({ customer_name: '', order_reference: '' });
    const { cartItems, clearCart, decreaseCartItem, addToCart } = usePublicCart([]);
    const errorMessages = Object.values(form.errors);

    function submit(event: FormEvent): void {
        event.preventDefault();
        form.post('/lacak-pesanan', { preserveScroll: true });
    }

    return <>
        <Head title={`Lacak Pesanan - ${business.name}`} />
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
                <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--color-cream-300)] bg-[#fffdf9] shadow-[0_26px_70px_rgba(72,42,22,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative overflow-hidden bg-[var(--color-cocoa-800)] p-7 text-white sm:p-9 lg:p-11">
                        <div aria-hidden="true" className="absolute -right-20 -top-20 size-64 rounded-full border-[3rem] border-[var(--color-snack-500)]/12" />
                        <div className="relative">
                            <span className="grid size-12 place-items-center rounded-2xl bg-white/10"><PackageSearch aria-hidden="true" className="size-6 text-[#ffbd62]" /></span>
                            <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#ffbd62]">Status pesanan</p>
                            <h1 className="mt-3 max-w-sm font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl">Tahu posisi pesanan tanpa menunggu.</h1>
                            <p className="mt-5 max-w-md text-sm leading-7 text-[#ead8ca]">Cukup siapkan nama pemesan dan nomor pesanan atau resi. Status terbaru akan langsung ditampilkan.</p>

                            <ol className="mt-8 space-y-4 border-t border-white/15 pt-6 text-sm">
                                <li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-[var(--color-snack-500)] text-xs font-bold text-[var(--color-cocoa-800)]">1</span>Masukkan data pesanan</li>
                                <li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full border border-white/25 text-xs font-bold">2</span>Lihat status dan detail terbaru</li>
                            </ol>
                        </div>
                    </section>

                    <section aria-labelledby="tracking-form-heading" className="p-7 sm:p-9 lg:p-11">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-caramel-500)]">Lacak sekarang</p>
                        <h2 id="tracking-form-heading" className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">Temukan pesanan Anda</h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-cocoa-500)]">Gunakan data yang sama seperti saat checkout.</p>

                        <form onSubmit={submit} className="mt-7 space-y-5">
                            {errorMessages.length > 0 && <div role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                                <p className="font-bold">Pesanan belum ditemukan.</p>
                                <ul className="mt-1.5 list-disc space-y-1 pl-5">{errorMessages.map((error) => <li key={error}>{error}</li>)}</ul>
                            </div>}

                            <label htmlFor="tracking-customer-name" className="block text-sm font-semibold">
                                Nama pemesan
                                <input id="tracking-customer-name" name="customer_name" value={form.data.customer_name} onChange={(event) => form.setData('customer_name', event.target.value)} required maxLength={255} autoComplete="name" className={fieldClass} placeholder="Masukkan nama sesuai pesanan…" />
                            </label>

                            <label htmlFor="tracking-reference" className="block text-sm font-semibold">
                                Nomor pesanan atau resi
                                <input id="tracking-reference" name="order_reference" value={form.data.order_reference} onChange={(event) => form.setData('order_reference', event.target.value)} required maxLength={100} autoComplete="off" spellCheck={false} className={`${fieldClass} uppercase tracking-[0.08em]`} placeholder="Contoh: WEB-202607-000001…" />
                            </label>

                            <button disabled={form.processing} className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-snack-500)] px-6 text-sm font-bold text-[var(--color-cocoa-800)] shadow-[0_14px_30px_rgba(239,146,30,0.22)] transition-colors hover:bg-[#ffad42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-caramel-600)] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none">
                                {form.processing ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <Search aria-hidden="true" className="size-4" />}
                                {form.processing ? 'Mencari pesanan…' : 'Lihat status pesanan'}
                            </button>
                        </form>

                        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-[#f8f1e8] px-4 py-3 text-xs leading-5 text-[var(--color-cocoa-500)]">
                            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-caramel-600)]" />
                            Data hanya digunakan untuk menemukan pesanan Anda.
                        </div>
                        <Link href="/katalog" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#8d5f3b] hover:text-[var(--color-cocoa-800)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-caramel-600)]">Kembali ke katalog <ArrowRight aria-hidden="true" className="size-4" /></Link>
                    </section>
                </div>
            </main>
            <PublicFooter business={business} />
        </PublicFrame>
    </>;
}
