import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import type { BusinessProfile } from './types';

export default function OrderTrackingLookupPage({ business }: { business: BusinessProfile }) {
    const form = useForm({ customer_name: '', tracking_number: '' });

    function submit(event: FormEvent): void {
        event.preventDefault();
        form.post('/lacak-pesanan');
    }

    return <>
        <Head title={`Lacak Pesanan - ${business.name}`} />
        <main className="min-h-screen bg-[#fffaf3] px-4 py-10 text-[#3a2117] sm:px-6">
            <div className="mx-auto max-w-xl">
                <Link href="/katalog" className="text-sm font-semibold text-[#8d5f3b]">← Kembali ke katalog</Link>
                <p className="mt-8 text-sm font-bold uppercase tracking-widest text-[#a5764e]">Status pesanan</p>
                <h1 className="mt-2 font-display text-4xl font-semibold">Lacak Pesanan</h1>
                <p className="mt-3 leading-7 text-[#806049]">Masukkan nama pemesan dan nomor resi untuk melihat status pesanan Anda.</p>
                <div className="mt-5 border-y border-[#dfcfbb] py-4 text-sm font-semibold text-[#7a5d47]">
                    Halaman ini menampilkan <strong>status pesanan dari toko</strong>, bukan pelacakan lokasi paket secara real-time. Untuk lokasi paket, gunakan nomor resi di situs resmi kurir.
                </div>
                <form onSubmit={submit} className="mt-7 space-y-5">
                    <label className="block text-sm font-semibold">Nama pemesan
                        <input value={form.data.customer_name} onChange={event => form.setData('customer_name', event.target.value)} required maxLength={255} autoComplete="name" className="mt-2 min-h-12 w-full rounded-2xl border border-[#dfcfbb] bg-white px-4" />
                    </label>
                    <label className="block text-sm font-semibold">Nomor resi
                        <input value={form.data.tracking_number} onChange={event => form.setData('tracking_number', event.target.value)} required maxLength={100} autoComplete="off" className="mt-2 min-h-12 w-full rounded-2xl border border-[#dfcfbb] bg-white px-4 uppercase" />
                    </label>
                    {Object.values(form.errors).map(error => <p key={error} className="text-sm font-semibold text-red-700">{error}</p>)}
                    <button disabled={form.processing} className="min-h-12 w-full rounded-full bg-[#3a2117] px-6 font-bold text-white disabled:opacity-45">{form.processing ? 'Mencari…' : 'Lihat Status Pesanan'}</button>
                </form>
            </div>
        </main>
    </>;
}
