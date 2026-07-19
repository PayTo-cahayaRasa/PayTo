import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    ArrowRight,
    Check,
    Download,
    Eye,
    EyeOff,
    LayoutGrid,
    Lock,
    ShieldCheck,
    User,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PosLoginFormProps {
    className?: string;
    title?: string;
    subtitle?: string;
    role?: 'KASIR' | 'ADMIN';
}

export function PosLoginForm({
    className = '',
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
        <div className={`mx-auto w-full max-w-sm ${className}`}>
            <div className="mb-5">
                <div className="mb-3 flex justify-center lg:justify-start">
                    <span className="inline-flex rounded-full border border-[#dfcfbb] bg-[#fff8ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8e6847]">
                        {role === 'ADMIN' ? 'Supervisor access' : 'Akses kasir'}
                    </span>
                </div>

                <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#2f241c] md:text-4xl">
                    {title}
                </h2>
                <p className="mt-2 max-w-[38ch] text-sm leading-6 text-[#806049]">
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

            <div className="mb-4 grid grid-cols-2 rounded-[1.2rem] border border-[#e8d9c6] bg-[#fbf4ea] p-1">
                <button
                    type="button"
                    onClick={() => setLoginMethod('CREDENTIALS')}
                    className={`flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold transition-colors duration-300 ${
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
                    className={`flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold transition-colors duration-300 ${
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
                <form onSubmit={handleLogin} className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                                className="w-full rounded-2xl border border-[#dfcfbb] bg-[#fffdf9] py-3 pl-11 pr-4 text-sm font-medium text-[#2f241c] outline-none transition-colors placeholder:text-[#b69877] focus:border-[#c2ab8d] focus:ring-4 focus:ring-[#efe3d4]"
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
                                className="w-full rounded-2xl border border-[#dfcfbb] bg-[#fffdf9] py-3 pl-11 pr-11 text-sm font-medium text-[#2f241c] outline-none transition-colors placeholder:text-[#b69877] focus:border-[#c2ab8d] focus:ring-4 focus:ring-[#efe3d4]"
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
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className="group mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3d281b] py-3 text-sm font-semibold text-white shadow-[0_22px_38px_-24px_rgba(61,40,27,0.9)] transition-colors hover:bg-[#4b3223] disabled:opacity-50 disabled:shadow-none"
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

                    <div className="mb-4 flex justify-center gap-2">
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

                    <div className="grid w-full max-w-[220px] grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                            <button
                                type="button"
                                key={number}
                                onClick={() => handlePinInput(number.toString())}
                                className="h-11 w-full rounded-xl border border-[#dfcfbb] bg-[#fffdf9] text-base font-semibold text-[#3d281b] shadow-[0_14px_26px_-24px_rgba(61,40,27,0.42)] transition-colors hover:border-[#cdb79a] hover:bg-white hover:text-[#375c3f]"
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={pin.length < 6 || isLoading}
                            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#375c3f] text-white shadow-[0_18px_32px_-24px_rgba(55,92,63,0.8)] transition-colors hover:bg-[#2f4d35] disabled:opacity-50 disabled:shadow-none"
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
                            className="h-11 w-full rounded-xl border border-[#dfcfbb] bg-[#fffdf9] text-base font-semibold text-[#3d281b] shadow-[0_14px_26px_-24px_rgba(61,40,27,0.42)] transition-colors hover:border-[#cdb79a] hover:bg-white hover:text-[#375c3f]"
                        >
                            0
                        </button>

                        <button
                            type="button"
                            onClick={handlePinDelete}
                            className="flex h-11 w-full items-center justify-center rounded-xl border border-[#efc9bf] bg-[#fff3ee] text-xs font-semibold tracking-wide text-[#a44b39] transition-colors hover:bg-[#feeae2]"
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
        <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(250,236,214,0.72),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(217,231,220,0.68),_transparent_26%),linear-gradient(180deg,#f7f0e6_0%,#f2e9dc_100%)] p-3 font-sans text-[#2f241c] lg:h-[100dvh] lg:overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(120,89,62,0.1)_0.7px,transparent_0.7px)] [background-size:18px_18px]"></div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/55 to-transparent"></div>

            <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#eadfcf] bg-[#fffaf3]/94 shadow-[0_38px_80px_-42px_rgba(58,33,23,0.42)] animate-in zoom-in-95 duration-500 lg:h-[min(680px,calc(100dvh-1.5rem))] lg:flex-row lg:rounded-[2.4rem]">
                <div className="hidden w-full overflow-y-auto border-r border-[#eadfcf] bg-[linear-gradient(180deg,rgba(245,234,216,0.76),rgba(236,220,196,0.9))] p-8 lg:flex lg:w-[42%] lg:flex-col lg:justify-center">
                    <div className="space-y-7">
                        <CahayaRasaBrand />

                        <div className="overflow-hidden rounded-[1.75rem] border border-[#dfcfbb] bg-[#fffaf3] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                            <div className="relative overflow-hidden p-6">
                                <div className="absolute inset-x-10 top-6 h-24 rounded-full bg-[#efe0c8] blur-3xl"></div>
                                <div className="absolute -bottom-8 left-6 h-32 w-32 rounded-full bg-[#d3dfd5] blur-3xl"></div>
                                <div className="absolute -right-6 bottom-2 h-36 w-36 rounded-full bg-[#ead4bf] blur-3xl"></div>

                                <div className="relative z-10 space-y-4 rounded-[1.5rem] border border-white/70 bg-white/70 p-5 shadow-[0_22px_48px_-36px_rgba(58,33,23,0.28)]">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ee] text-[#375c3f]">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#2f241c]">
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

                </div>

                <div className="flex w-full flex-1 flex-col justify-between overflow-y-auto bg-[linear-gradient(180deg,rgba(255,252,247,0.84),rgba(255,248,238,0.98))] p-6 sm:p-8 lg:p-8">
                    <div className="mb-6 flex items-center gap-3 lg:hidden">
                        <CahayaRasaBrand compact />
                    </div>

                    <div className="flex-1 content-center">
                        <PosLoginForm />
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4 text-xs text-[#8d6b4e]">
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

function CahayaRasaBrand({ compact = false }: { compact?: boolean }) {
    return (
        <div className="flex items-center gap-4">
            <img
                src="/images/logo-removed.png"
                alt="Logo Cahaya Rasa"
                width={compact ? 56 : 96}
                height={compact ? 56 : 96}
                className={`${compact ? 'size-14' : 'size-24'} shrink-0 object-contain drop-shadow-[0_12px_22px_rgba(58,33,23,0.16)]`}
            />
            <div className="min-w-0">
                <h1 className={`font-display font-semibold tracking-[-0.04em] text-[#3a2117] ${compact ? 'text-2xl' : 'text-4xl'}`}>
                    Cahaya Rasa
                </h1>
            </div>
        </div>
    );
}
