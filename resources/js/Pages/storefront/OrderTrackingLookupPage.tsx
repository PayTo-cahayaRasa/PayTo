import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import type { BusinessProfile } from './types';
import { PublicFooter } from './components/PublicFooter';
import { PublicHeader, SkipLink, usePublicCart } from '.';
import { PublicFrame } from '.';

export default function OrderTrackingLookupPage({ business }: { business: BusinessProfile }) {
    const form = useForm({ customer_name: '', tracking_number: '' });
    const { cartItems, clearCart, decreaseCartItem, addToCart } = usePublicCart([]);
    const fieldBaseClass = 'mt-2 min-h-12 w-full rounded-2xl border border-[#ded0bf] bg-white px-4 text-[0.98rem] text-[#3a2117] shadow-[0_1px_0_rgba(58,33,23,0.03)] outline-none transition duration-200 placeholder:text-[#ad9a87] focus:border-[#9b5c22] focus:ring-4 focus:ring-[#ef921e]/12 motion-reduce:transition-none';

    function submit(event: FormEvent): void {
        event.preventDefault();
        form.post('/lacak-pesanan');
    }

    const errorMessages = Object.values(form.errors);

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

            <main className="order-tracking-page px-4 pb-6 pt-4 text-[#3a2117] sm:px-5 lg:px-8 lg:pb-8 lg:pt-5">
                <div className="mx-auto max-w-3xl">
                    <header className="mt-8 max-w-2xl sm:mt-10">
                        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#a5764e]">Status pesanan</p>
                        <h1 className="mt-4 font-display text-[2.65rem] font-semibold leading-[0.92] tracking-[-0.06em] text-[#3a2117] sm:text-[3.6rem] lg:text-[4.8rem]">
                            Lacak pesanan
                        </h1>
                        <p className="mt-4 max-w-xl text-[1.02rem] leading-8 text-[#7d6047] sm:text-[1.05rem]">
                            Masukkan nama pemesan dan nomor resi untuk melihat status pesanan Anda.
                        </p>
                    </header>

                    <section className="mt-8 sm:mt-10">
                        <form onSubmit={submit} className="space-y-5">
                            {errorMessages.length > 0 && <div className="rounded-[1.25rem] border border-[#f1c6c6] bg-[#fff6f6] px-4 py-4 text-sm text-[#9b2c2c]">
                                <p className="font-semibold">Periksa kembali data yang Anda masukkan.</p>
                                <ul className="mt-2 space-y-1.5">
                                    {errorMessages.map((error) => <li key={error} className="leading-6">{error}</li>)}
                                </ul>
                            </div>}

                            <label className="block text-sm font-semibold text-[#3a2117]">
                                Nama pemesan
                                <input
                                    value={form.data.customer_name}
                                    onChange={event => form.setData('customer_name', event.target.value)}
                                    required
                                    maxLength={255}
                                    autoComplete="name"
                                    className={fieldBaseClass}
                                    placeholder="Masukkan nama sesuai pesanan"
                                />
                            </label>

                            <label className="block text-sm font-semibold text-[#3a2117]">
                                Nomor resi
                                <input
                                    value={form.data.tracking_number}
                                    onChange={event => form.setData('tracking_number', event.target.value)}
                                    required
                                    maxLength={100}
                                    autoComplete="off"
                                    className={`${fieldBaseClass} uppercase tracking-[0.12em]`}
                                    placeholder="Masukkan nomor resi"
                                />
                            </label>

                            <button
                                disabled={form.processing}
                                className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#3a2117] px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(58,33,23,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#4a2a1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c22] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-45 motion-reduce:transition-none"
                            >
                                {form.processing ? 'Mencari…' : 'Lihat status pesanan'}
                            </button>

                            <p className="pt-2 text-center text-xs leading-6 text-[#8b6a52]">
                                Setelah dikirim, sistem akan menampilkan detail status pesanan yang tersimpan di toko.
                            </p>
                        </form>
                    </section>
                </div>
            </main>
            <PublicFooter business={business} />
        </PublicFrame>
    </>;
}
