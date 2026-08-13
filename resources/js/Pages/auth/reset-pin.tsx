import React, { FormEvent, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';

export default function ResetPin({ token, email: initialEmail }: { token: string; email?: string }) {
    const [email, setEmail] = useState(initialEmail ?? '');
    const [pin, setPin] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const submit = async (event: FormEvent) => {
        event.preventDefault(); setLoading(true); setError('');
        try { await axios.post('/reset-pin', { token, email, pin, pin_confirmation: confirmation }); router.visit('/login'); }
        catch (requestError: any) { setError(requestError.response?.data?.errors?.email?.[0] ?? requestError.response?.data?.errors?.pin?.[0] ?? 'Reset PIN gagal.'); }
        finally { setLoading(false); }
    };
    return <main className="flex min-h-screen items-center justify-center bg-[#fff8ef] px-6"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl"><h1 className="text-3xl font-semibold text-[#2f241c]">Buat PIN baru</h1><p className="mt-2 text-sm text-[#806049]">PIN harus terdiri dari 6 digit angka.</p>{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-6 w-full rounded-2xl border border-[#dfcfbb] px-4 py-3" placeholder="Email" /><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))} className="mt-3 w-full rounded-2xl border border-[#dfcfbb] px-4 py-3" placeholder="PIN baru" /><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={confirmation} onChange={(event) => setConfirmation(event.target.value.replace(/\D/g, ''))} className="mt-3 w-full rounded-2xl border border-[#dfcfbb] px-4 py-3" placeholder="Konfirmasi PIN" /><button disabled={loading} className="mt-4 w-full rounded-2xl bg-[#3d281b] py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan PIN baru'}</button><Link href="/login" className="mt-5 block text-center text-sm font-semibold text-[#6d4c36]">Kembali ke login</Link></form></main>;
}
