import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    ArrowRight,
    Check,
    Clock3,
    Download,
    Eye,
    EyeOff,
    LayoutGrid,
    Lock,
    ShieldCheck,
    Store,
    User,
    Zap,
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
    title = 'Masuk ke akun Anda',
    subtitle = 'Gunakan kredensial supervisor atau kasir untuk melanjutkan operasional hari ini.',
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

    const handleLogin = async (event?: React.SyntheticEvent) => {
        event?.preventDefault();
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
        } catch (requestError: unknown) {
            const message = axios.isAxiosError(requestError)
                ? requestError.response?.data?.message
                : null;

            setError(message ?? 'Login gagal. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinInput = (digit: string) => {
        if (pin.length < 6) {
            setPin((previousPin) => previousPin + digit);
        }
    };

    const handlePinDelete = () => {
        setPin((previousPin) => previousPin.slice(0, -1));
    };

    return (
        <div className={`mx-auto w-full max-w-md ${className}`}>
            <div className="mb-7">
                {showMobileBrand ? (
                    <div className="mb-4 flex justify-center lg:hidden">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3d281b] text-white shadow-[0_18px_34px_-24px_rgba(61,40,27,0.78)]">
                            <Zap size={20} fill="currentColor" />
                        </div>
                    </div>
                ) : null}

                <div className="mb-3 flex justify-center lg:justify-start">
                    <span className="inline-flex rounded-full border border-[#dfcfbb] bg-[#fff8ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8e6847]">
                        {role === 'ADMIN' ? 'Supervisor access' : 'Akses kasir'}
                    </span>
                </div>

                <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#2f241c] md:text-[2.65rem]">
                    {title}
                </h2>
                <p className="mt-2 max-w-[34ch] text-sm leading-6 text-[#806049] md:text-base">
                    {subtitle}
                </p>

                {installPromptEvent ? (
                    <button
                        type="button"
                        onClick={handleInstallApp}
                        disabled={isInstalling}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#dfcfbb] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-[#6d4c36] transition hover:bg-[#f7eddc] disabled:opacity-60"
                    >
                        <Download size={16} />
                        {isInstalling ? 'Menyiapkan instalasi...' : 'Install App'}
                    </button>
                ) : null}
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-[1.4rem] border border-[#e8d9c6] bg-[#fbf4ea] p-1.5">
                <button
                    type="button"
                    onClick={() => setLoginMethod('CREDENTIALS')}
                    className={`flex items-center justify-center gap-2 rounded-[1rem] py-3 text-sm font-semibold transition-all duration-300 ${
                        loginMethod === 'CREDENTIALS'
                            ? 'bg-white text-[#2f241c] shadow-[0_16px_28px_-22px_rgba(61,40,27,0.48)]'
                            : 'text-[#8d6b4e] hover:text-[#5f4330]'
                    }`}
                >
                    <User size={16} />
                    Username
                </button>
                <button
                    type="button"
                    onClick={() => setLoginMethod('PIN')}
                    className={`flex items-center justify-center gap-2 rounded-[1rem] py-3 text-sm font-semibold transition-all duration-300 ${
                        loginMethod === 'PIN'
                            ? 'bg-white text-[#2f241c] shadow-[0_16px_28px_-22px_rgba(61,40,27,0.48)]'
                            : 'text-[#8d6b4e] hover:text-[#5f4330]'
                    }`}
                >
                    <LayoutGrid size={16} />
                    Quick PIN
                </button>
            </div>

            {error ? (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#efc9bf] bg-[#fff3ee] p-3 text-sm font-medium text-[#a44b39] animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            ) : null}

            {loginMethod === 'CREDENTIALS' ? (
                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                        <label className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">
                            ID Pengguna
                        </label>
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c7d63] transition-colors group-focus-within:text-[#375c3f]">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Masukan ID..."
                                className="w-full rounded-2xl border border-[#dfcfbb] bg-[#fffdf9] py-3.5 pl-11 pr-4 text-sm font-medium text-[#2f241c] outline-none transition-all placeholder:text-[#b69877] focus:border-[#c2ab8d] focus:ring-4 focus:ring-[#efe3d4]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">
                            Kata Sandi
                        </label>
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c7d63] transition-colors group-focus-within:text-[#375c3f]">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Kata sandi Anda"
                                className="w-full rounded-2xl border border-[#dfcfbb] bg-[#fffdf9] py-3.5 pl-11 pr-11 text-sm font-medium text-[#2f241c] outline-none transition-all placeholder:text-[#b69877] focus:border-[#c2ab8d] focus:ring-4 focus:ring-[#efe3d4]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9c7d63] transition-colors hover:text-[#375c3f]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-1 text-sm">
                        <label className="flex items-center gap-2 text-[#806049]">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-[#d9c4ab] text-[#375c3f] focus:ring-[#e8d9c6]"
                            />
                            Ingat saya
                        </label>
                        <button type="button" className="font-medium text-[#375c3f] transition hover:text-[#2d4a34]">
                            Lupa kata sandi?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3d281b] py-3.5 text-base font-semibold text-white shadow-[0_22px_38px_-24px_rgba(61,40,27,0.9)] transition-all hover:bg-[#4b3223] active:translate-y-px active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
                    >
                        {isLoading ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        ) : (
                            <>
                                Masuk Sekarang
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="mb-2 text-center">
                        <p className="text-sm font-semibold text-[#2f241c]">Mode PIN untuk kasir</p>
                        <p className="mt-1 text-xs leading-5 text-[#806049]">
                            Gunakan PIN perangkat yang sudah terdaftar untuk masuk lebih cepat.
                        </p>
                    </div>

                    <div className="mb-6 flex justify-center gap-2">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className={`h-3 w-3 rounded-full border-2 transition-all duration-200 ${
                                    index < pin.length
                                        ? 'scale-110 border-[#375c3f] bg-[#375c3f]'
                                        : 'border-[#d8c5af] bg-[#fff8ef]'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="grid w-full max-w-[240px] grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                            <button
                                type="button"
                                key={number}
                                onClick={() => handlePinInput(number.toString())}
                                className="h-12 w-full rounded-2xl border border-[#dfcfbb] bg-[#fffdf9] text-lg font-semibold text-[#3d281b] shadow-[0_14px_26px_-24px_rgba(61,40,27,0.42)] transition-all hover:border-[#cdb79a] hover:bg-white hover:text-[#375c3f] active:scale-95"
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={pin.length < 6 || isLoading}
                            className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#375c3f] text-white shadow-[0_18px_32px_-24px_rgba(55,92,63,0.8)] transition-all hover:bg-[#2f4d35] active:scale-95 disabled:opacity-50 disabled:shadow-none"
                            title="Masuk"
                        >
                            {isLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                            ) : (
                                <Check size={24} strokeWidth={3} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handlePinInput('0')}
                            className="h-12 w-full rounded-2xl border border-[#dfcfbb] bg-[#fffdf9] text-lg font-semibold text-[#3d281b] shadow-[0_14px_26px_-24px_rgba(61,40,27,0.42)] transition-all hover:border-[#cdb79a] hover:bg-white hover:text-[#375c3f] active:scale-95"
                        >
                            0
                        </button>

                        <button
                            type="button"
                            onClick={handlePinDelete}
                            className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#efc9bf] bg-[#fff3ee] text-sm font-semibold tracking-wide text-[#a44b39] transition-all hover:bg-[#feeae2] active:scale-95"
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
        <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(250,236,214,0.72),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(217,231,220,0.68),_transparent_26%),linear-gradient(180deg,#f7f0e6_0%,#f2e9dc_100%)] p-4 font-sans text-[#2f241c]">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(120,89,62,0.1)_0.7px,transparent_0.7px)] [background-size:18px_18px]"></div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/55 to-transparent"></div>

            <div className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[2.2rem] border border-[#eadfcf] bg-[#fffaf3]/94 shadow-[0_38px_80px_-42px_rgba(58,33,23,0.42)] animate-in zoom-in-95 duration-500 lg:min-h-[720px] lg:flex-row lg:rounded-[2.8rem]">
                <div className="hidden w-full border-r border-[#eadfcf] bg-[linear-gradient(180deg,rgba(245,234,216,0.76),rgba(236,220,196,0.9))] p-12 lg:flex lg:w-[44%] lg:flex-col lg:justify-between">
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[#3d281b] text-white shadow-[0_24px_38px_-24px_rgba(61,40,27,0.88)]">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8e6847]">Cahaya Rasa</p>
                                <h1 className="mt-1 font-display text-4xl font-semibold tracking-[-0.05em] text-[#3a2117]">PayTo</h1>
                                <p className="mt-1 text-sm text-[#6d5948]">
                                    Point of sale untuk operasional toko yang rapi dan terpantau.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[2rem] border border-[#dfcfbb] bg-[#fffaf3] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                            <div className="relative min-h-[320px] overflow-hidden p-8">
                                <div className="absolute inset-x-10 top-6 h-24 rounded-full bg-[#efe0c8] blur-3xl"></div>
                                <div className="absolute -bottom-8 left-6 h-32 w-32 rounded-full bg-[#d3dfd5] blur-3xl"></div>
                                <div className="absolute -right-6 bottom-2 h-36 w-36 rounded-full bg-[#ead4bf] blur-3xl"></div>

                                <div className="relative z-10 max-w-[18rem] space-y-5 rounded-[1.75rem] border border-white/70 bg-white/70 p-6 shadow-[0_22px_48px_-36px_rgba(58,33,23,0.28)]">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff4ee] text-[#375c3f]">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#2f241c]">
                                            Masuk cepat, tetap terkendali
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-[#806049]">
                                            Supervisor dan kasir memakai alur yang sama, dengan validasi jelas dan akses yang tetap aman.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-[2rem] border border-[#d8c6af] bg-[#4a3224] p-6 text-white shadow-[0_26px_44px_-30px_rgba(58,33,23,0.72)]">
                        <div className="flex items-start gap-3">
                            <Store size={18} className="mt-0.5 text-[#f7d9ae]" />
                            <div>
                                <p className="text-sm font-semibold">Toko Cahaya Rasa</p>
                                <p className="mt-1 text-sm leading-6 text-[#ead9c5]">Jl. Kemang Raya No. 88, Jakarta Selatan</p>
                            </div>
                        </div>

                        <div className="h-px bg-white/12"></div>

                        <div className="flex items-start gap-3">
                            <Clock3 size={18} className="mt-0.5 text-[#cde2d2]" />
                            <div>
                                <p className="text-sm font-semibold">Jam operasional</p>
                                <p className="mt-1 text-sm leading-6 text-[#ead9c5]">07.00 - 21.00 WIB setiap hari</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-1 flex-col justify-between bg-[linear-gradient(180deg,rgba(255,252,247,0.84),rgba(255,248,238,0.98))] p-6 sm:p-8 lg:p-12">
                    <div className="mb-6 flex items-center gap-3 lg:hidden">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3d281b] text-white shadow-[0_18px_34px_-24px_rgba(61,40,27,0.78)]">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8e6847]">Cahaya Rasa</p>
                            <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-[#3a2117]">PayTo</h1>
                        </div>
                    </div>

                    <div className="flex-1 content-center">
                        <PosLoginForm />
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4 text-xs text-[#8d6b4e]">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#375c3f]" />
                            <span>Keamanan login tetap aktif dan semua aktivitas tercatat.</span>
                        </div>
                        <span>v2.4.1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
