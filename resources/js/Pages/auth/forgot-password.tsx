import React, { FormEvent, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function ForgotPassword({ mode = 'password' }: { mode?: 'password' | 'pin' }) {
    const isPin = mode === 'pin';
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

    return <main className="flex min-h-screen items-center justify-center bg-[#fff8ef] px-6"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl"><h1 className="text-3xl font-semibold text-[#2f241c]">{isPin ? 'Lupa PIN?' : 'Lupa password?'}</h1><p className="mt-2 text-sm text-[#806049]">Masukkan email akun untuk menerima tautan reset {isPin ? 'PIN' : 'password'}.</p>{message && <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-6 w-full rounded-2xl border border-[#dfcfbb] px-4 py-3" placeholder="email@contoh.com" /><button disabled={loading} className="mt-4 w-full rounded-2xl bg-[#3d281b] py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Mengirim...' : 'Kirim tautan reset'}</button><Link href={isPin ? '/lupa-password' : '/lupa-pin'} className="mt-4 block text-center text-sm font-semibold text-[#6d4c36]">{isPin ? 'Lupa password?' : 'Lupa PIN?'}</Link><Link href="/login" className="mt-3 block text-center text-sm font-semibold text-[#6d4c36]">Kembali ke login</Link></form></main>;
}
