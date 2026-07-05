import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    Zap, User, Lock, ArrowRight, Eye, EyeOff,
    LayoutGrid, ShieldCheck, AlertCircle, Check, Download
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PosLoginFormProps {
    className?: string;
    showMobileBrand?: boolean;
    title?: string;
    subtitle?: string;
    role?: 'KASIR' | 'ADMIN';
}

export function PosLoginForm({
    className = '',
    showMobileBrand = true,
    title = 'Selamat Datang',
    subtitle = 'Silakan masuk untuk memulai shift Anda.',
    role = 'KASIR',
}: PosLoginFormProps) {
    const [loginMethod, setLoginMethod] = useState('CREDENTIALS');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallPromptEvent(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setInstallPromptEvent(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallApp = async () => {
        if (!installPromptEvent || isInstalling) {
            return;
        }

        setIsInstalling(true);

        try {
            await installPromptEvent.prompt();
            const choiceResult = await installPromptEvent.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setInstallPromptEvent(null);
            }
        } finally {
            setIsInstalling(false);
        }
    };

    const handleLogin = async (e?: React.SyntheticEvent) => {
        e?.preventDefault();
        setIsLoading(true);
        setError('');

        if (loginMethod === 'CREDENTIALS' && (!username || !password)) {
            setIsLoading(false);
            setError('Username dan kata sandi wajib diisi.');
            return;
        }

        if (loginMethod === 'PIN' && pin.length < 6) {
            setIsLoading(false);
            setError('PIN harus 6 digit.');
            return;
        }

        try {
            const response = await axios.post('/login', {
                role,
                login_method: loginMethod,
                username,
                password,
                pin,
            });

            const redirect = response.data?.redirect || (role === 'ADMIN' ? '/admin' : '/kasir');
            router.visit(redirect);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Login gagal. Silakan coba lagi.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinInput = (digit: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + digit);
        }
    };

    const handlePinDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className={`max-w-md mx-auto w-full ${className}`}>
            <div className="text-center mb-6 md:mb-8">
                {showMobileBrand && (
                    <div className="lg:hidden flex justify-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md">
                            <Zap size={20} fill="currentColor" />
                        </div>
                    </div>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{title}</h2>
                <p className="text-sm md:text-base text-slate-500">{subtitle}</p>

                {installPromptEvent && (
                    <button
                        type="button"
                        onClick={handleInstallApp}
                        disabled={isInstalling}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
                    >
                        <Download size={16} />
                        {isInstalling ? 'Menyiapkan instalasi...' : 'Install App'}
                    </button>
                )}
            </div>

            <div className="flex p-1 bg-white/50 border border-white/60 rounded-xl md:rounded-2xl mb-6 relative">
                <button
                    type="button"
                    onClick={() => setLoginMethod('CREDENTIALS')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg md:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${loginMethod === 'CREDENTIALS'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <User size={16} /> Username
                </button>
                <button
                    type="button"
                    onClick={() => setLoginMethod('PIN')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg md:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${loginMethod === 'PIN'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <LayoutGrid size={16} /> Quick PIN
                </button>
            </div>

            {error && (
                <div className="mb-5 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {loginMethod === 'CREDENTIALS' && (
                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ID Pengguna</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukan ID..."
                                className="w-full bg-white/60 border border-white/60 focus:bg-white rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-300 transition-all text-slate-800 placeholder:text-slate-400 font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kata Sandi</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/60 border border-white/60 focus:bg-white rounded-xl py-3.5 pl-11 pr-11 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-300 transition-all text-slate-800 placeholder:text-slate-400 font-medium font-mono text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:to-indigo-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-indigo-300/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group mt-2"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                Masuk Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {loginMethod === 'PIN' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col items-center">
                    <div className="mb-6 flex gap-2 justify-center">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${i < pin.length
                                    ? 'bg-indigo-600 border-indigo-600 scale-110'
                                    : 'bg-white/50 border-slate-300'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                type="button"
                                key={num}
                                onClick={() => handlePinInput(num.toString())}
                                className="h-12 w-full bg-white/60 hover:bg-white rounded-xl border border-white/60 shadow-sm text-lg md:text-xl font-bold text-slate-700 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95 active:bg-indigo-50"
                            >
                                {num}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={pin.length < 6 || isLoading}
                            className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center"
                            title="Masuk"
                        >
                            {isLoading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <Check size={24} strokeWidth={3} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handlePinInput('0')}
                            className="h-12 w-full bg-white/60 hover:bg-white rounded-xl border border-white/60 shadow-sm text-lg md:text-xl font-bold text-slate-700 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95 active:bg-indigo-50"
                        >
                            0
                        </button>

                        <button
                            type="button"
                            onClick={handlePinDelete}
                            className="h-12 w-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all active:scale-95 font-bold text-sm tracking-wide border border-rose-100"
                        >
                            DEL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PosLoginPage() {
    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] relative flex items-center justify-center p-4 font-sans overflow-y-auto text-slate-800">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200 rounded-full blur-[120px] opacity-40 animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>

            <div className="w-full max-w-5xl md:min-h-[600px] bg-white/30 backdrop-blur-2xl border border-white/50 rounded-3xl md:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
                <div className="w-full lg:w-1/2 hidden lg:flex flex-col relative bg-white/20 border-r border-white/30 p-12 justify-between">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-300/50">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="font-bold text-2xl text-slate-800 tracking-tight">POS System</span>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="w-full aspect-[4/3] bg-white/30 rounded-3xl border border-white/40 shadow-sm backdrop-blur-sm flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute w-24 h-24 bg-rose-300 rounded-full blur-2xl top-10 left-10 opacity-60 group-hover:translate-x-2 transition-transform duration-700"></div>
                            <div className="absolute w-32 h-32 bg-indigo-300 rounded-full blur-2xl bottom-10 right-10 opacity-60 group-hover:-translate-x-2 transition-transform duration-700"></div>

                            <div className="text-center p-6 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20">
                                <ShieldCheck size={48} className="mx-auto text-indigo-600 mb-4 drop-shadow-sm" />
                                <h3 className="font-bold text-lg text-slate-800">Aman & Terintegrasi</h3>
                                <p className="text-slate-500 text-sm mt-1">Sistem Point of Sale untuk operasional toko yang terpusat.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-slate-500 font-medium">
                        &copy; 2026 PayTo. v2.0.1
                    </div>
                </div>

                <div className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white/40 relative">
                    <PosLoginForm />
                </div>
            </div>
        </div>
    );
}
