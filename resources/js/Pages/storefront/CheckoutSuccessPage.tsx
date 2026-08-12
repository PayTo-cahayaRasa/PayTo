import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

import { formatRupiah } from './data/publicCatalogData';
import type { BusinessProfile } from './types';

type PaymentSettings = {
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    qris_image_url: string;
    instructions: string;
};

type SuccessOrder = { order_number: string; grand_total: string; payment_method: string };

export default function CheckoutSuccessPage({ business, order, payment, payment_whatsapp_url: paymentWhatsAppUrl, tracking_url: trackingUrl }: {
    business: BusinessProfile;
    order: SuccessOrder;
    payment: PaymentSettings;
    payment_whatsapp_url: string | null;
    tracking_url: string;
}) {
    const [copied, setCopied] = useState(false);
    const isBankTransfer = order.payment_method === 'BANK_TRANSFER';
    const isQris = order.payment_method === 'QRIS_MANUAL';

    async function copyPayment(): Promise<void> {
        const details = isBankTransfer
            ? `${payment.bank_name} ${payment.bank_account_number} a.n. ${payment.bank_account_name}`
            : `${order.order_number} - ${formatRupiah(Number(order.grand_total))}`;
        await navigator.clipboard.writeText(details);
        setCopied(true);
    }

    return <>
        <Head title={`Pesanan berhasil - ${business.name}`} />
        <main className="min-h-screen bg-[#fffaf3] px-4 py-10 text-[var(--color-cocoa-800)] sm:px-6">
            <div className="mx-auto max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-widest text-[#168c45]">Pesanan berhasil dibuat</p>
                <h1 className="mt-2 font-display text-4xl font-semibold">{order.order_number}</h1>
                <p className="mt-3 text-[var(--color-cocoa-500)]">Simpan nomor pesanan ini dan selesaikan pembayaran sesuai instruksi.</p>

                <section className="mt-8 border-y border-[var(--color-cream-300)] py-7">
                    <div className="flex items-end justify-between gap-4"><span>Total pembayaran</span><strong className="text-2xl">{formatRupiah(Number(order.grand_total))}</strong></div>
                    {isBankTransfer && <div className="mt-6 space-y-1"><p className="text-sm text-[var(--color-cocoa-500)]">Transfer bank</p><p className="text-xl font-bold">{payment.bank_name || 'Rekening belum dikonfigurasi'}</p><p>{payment.bank_account_number} {payment.bank_account_name && `a.n. ${payment.bank_account_name}`}</p></div>}
                    {isQris && <div className="mt-6"><p className="mb-3 font-bold">Pindai QRIS</p>{payment.qris_image_url ? <img src={payment.qris_image_url} alt="Kode QRIS pembayaran toko" className="max-h-80 max-w-full border border-[var(--color-cream-300)] bg-white p-3" /> : <p className="text-[var(--color-cocoa-500)]">Gambar QRIS belum dikonfigurasi. Hubungi toko melalui WhatsApp.</p>}</div>}
                    {order.payment_method === 'PAY_AT_STORE' && <p className="mt-6 font-semibold">Bayar di toko saat mengambil pesanan.</p>}
                    <p className="mt-5 text-sm text-[var(--color-cocoa-500)]">{payment.instructions}</p>
                    {order.payment_method !== 'PAY_AT_STORE' && <button type="button" onClick={copyPayment} className="mt-5 min-h-11 rounded-full border border-[var(--color-cocoa-800)] px-5 text-sm font-bold">{copied ? 'Informasi tersalin' : 'Salin informasi pembayaran'}</button>}
                </section>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    {paymentWhatsAppUrl && order.payment_method !== 'PAY_AT_STORE' && <a href={paymentWhatsAppUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#168c45] px-6 text-center text-sm font-bold text-white">Saya Sudah Bayar — Konfirmasi WhatsApp</a>}
                    <a href={trackingUrl} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cocoa-800)] px-6 text-sm font-bold text-white">Lacak Pesanan</a>
                    <Link href="/katalog" className="inline-flex min-h-12 items-center justify-center px-4 text-sm font-bold">Kembali ke katalog</Link>
                </div>
            </div>
        </main>
    </>;
}
