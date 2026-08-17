import React, { FormEvent, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole } from 'lucide-react';

export default function ForgotPassword({ mode = 'password' }: { mode?: 'password' | 'pin' }) {
    const isPin = mode === 'pin';
    const RecoveryIcon = isPin ? KeyRound : LockKeyhole;
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault(); setLoading(true); setError('');
        try { const response = await axios.post(isPin ? '/lupa-pin' : '/lupa-password', { email }); setMessage(response.data?.message ?? `Jika email terdaftar, tautan reset ${isPin ? 'PIN' : 'password'} telah dikirim.`); }
        catch (requestError: any) { setError(requestError.response?.data?.errors?.email?.[0] ?? 'Email tidak valid.'); }
        finally { setLoading(false); }
    };

    return <main className="flex min-h-screen items-center justify-center bg-[#fff8ef] px-6"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl"><div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#f7ead9] text-[#6d4c36]"><RecoveryIcon size={24} aria-hidden="true" /></div><h1 className="text-3xl font-semibold text-[#2f241c]">{isPin ? 'Lupa PIN?' : 'Lupa password?'}</h1><p className="mt-2 text-sm leading-6 text-[#806049]">Masukkan email akun untuk menerima tautan reset {isPin ? 'PIN' : 'password'}.</p>{message && <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="mt-6 block text-sm font-semibold text-[#4d3829]" htmlFor="reset-email">Email terdaftar</label><input id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#dfcfbb] px-4 py-3" placeholder="nama@email.com" /><button type="submit" disabled={loading} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3d281b] px-4 py-3 font-semibold text-white shadow-[0_16px_28px_-18px_rgba(61,40,27,0.8)] transition hover:bg-[#4b3223] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d281b] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Mengirim tautan...' : `Kirim tautan reset ${isPin ? 'PIN' : 'password'}`} {!loading && <ArrowRight size={18} aria-hidden="true" />}</button><div className="mt-5 grid gap-2 sm:grid-cols-2"><Link href={isPin ? '/lupa-password' : '/lupa-pin'} className="flex min-h-11 items-center justify-center rounded-xl border border-[#dfcfbb] px-3 text-center text-sm font-semibold text-[#6d4c36] transition hover:bg-[#fff8ef]">{isPin ? 'Reset password' : 'Reset PIN'}</Link><Link href="/login" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent px-3 text-center text-sm font-semibold text-[#6d4c36] transition hover:bg-[#fff8ef]"><ArrowLeft size={16} aria-hidden="true" /> Kembali ke login</Link></div></form></main>;
}
