import { ChevronRight, Heart, Leaf, Medal, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';

import { storefrontShopHref } from '../constants';
import type { HeroSectionProps } from '../types';

function HeroLandscape() {
    return (
        <svg aria-hidden="true" viewBox="0 0 1200 340" className="h-full w-full opacity-60" fill="none">
            <path
                d="M0 272C82 243 148 211 238 210C343 208 400 273 494 275C589 276 661 215 759 212C876 208 984 275 1200 248V340H0V272Z"
                fill="#efd9ae"
                opacity="0.58"
            />
            <path
                d="M0 300C102 265 171 244 273 247C361 250 437 304 514 301C617 297 694 235 798 236C922 238 1047 308 1200 286V340H0V300Z"
                fill="#e8cb96"
                opacity="0.38"
            />
            <path d="M48 304 156 197 248 304" stroke="#ddb97e" strokeWidth="4" strokeLinejoin="round" opacity="0.52" />
            <path d="M160 304 217 246 286 304" stroke="#ddb97e" strokeWidth="4" strokeLinejoin="round" opacity="0.48" />
            <path d="M776 304v-66l43-33 45 33v66" stroke="#d8b272" strokeWidth="4" strokeLinejoin="round" opacity="0.5" />
            <path d="M848 304v-84l56-41 60 41v84" stroke="#cfaa6a" strokeWidth="4" strokeLinejoin="round" opacity="0.54" />
            <path d="M948 304v-70l46-35 50 35v70" stroke="#cfaa6a" strokeWidth="4" strokeLinejoin="round" opacity="0.4" />
            <path d="M865 179v-26l38-27 41 27v26" stroke="#cfaa6a" strokeWidth="4" strokeLinejoin="round" opacity="0.42" />
            <path d="M790 233v-18l28-22 28 22v18" stroke="#d8b272" strokeWidth="4" strokeLinejoin="round" opacity="0.42" />
        </svg>
    );
}

function HeroClouds() {
    return (
        <svg aria-hidden="true" viewBox="0 0 220 90" className="absolute left-[40%] top-14 h-14 w-32 opacity-30 sm:left-[42%] sm:top-17 sm:h-20 sm:w-48 sm:opacity-40" fill="none">
            <path
                d="M27 60c0-13 10-23 23-23 5 0 9 1 13 4 4-10 14-17 26-17 15 0 28 11 30 25 3-2 7-3 11-3 12 0 22 10 22 22H27v-8Z"
                fill="#efd9ae"
            />
        </svg>
    );
}

function Sparkle({ className }: { className: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 2v20M2 12h20" stroke="#f2b649" strokeWidth="1.8" strokeLinecap="round" />
            <path d="m4.8 4.8 14.4 14.4M19.2 4.8 4.8 19.2" stroke="#f2b649" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        </svg>
    );
}

function LeafBranch({ className, mirrored = false }: { className: string; mirrored?: boolean }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 90 220"
            className={`${className} ${mirrored ? '-scale-x-100' : ''}`}
            fill="none"
        >
            <path d="M25 205C35 146 48 90 76 26" stroke="#d9ab67" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M33 170c18-2 26-12 32-27-18 1-27 10-32 27Z" fill="#e5be79" />
            <path d="M44 136c18-2 26-12 31-28-18 2-27 11-31 28Z" fill="#e1b26a" />
            <path d="M54 98c16-2 23-11 28-25-16 2-24 10-28 25Z" fill="#d7a25a" />
            <path d="M22 145c13 2 22 9 27 22-15-1-23-8-27-22Z" fill="#ecc788" />
            <path d="M15 110c12 2 20 8 25 20-14-1-21-8-25-20Z" fill="#eac17f" />
        </svg>
    );
}

function ChipOrnament({ className }: { className: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 40 40" className={className} fill="none">
            <path
                d="M20 4C11 4 5 10 5 19c0 10 7 17 16 17 8 0 14-6 14-14 0-10-6-18-15-18Z"
                fill="#f5b842"
                stroke="#d48c1b"
                strokeWidth="1.5"
            />
            <path d="M12 14c3-2 8-3 12-1M10 22c4-1 10-1 15 2M16 28c3 1 7 1 10-1" stroke="#e09b26" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <circle cx="15" cy="12" r="1" fill="#b86e09" opacity="0.5" />
            <circle cx="24" cy="18" r="1.2" fill="#b86e09" opacity="0.5" />
            <circle cx="18" cy="25" r="1" fill="#b86e09" opacity="0.5" />
        </svg>
    );
}

function HeroDecorBackdrop() {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(254,238,200,0.6),transparent_45%),linear-gradient(180deg,#fffaf3_0%,#fdf3e5_65%,#f7e7cc_100%)]" />
            <div className="absolute -right-20 -top-20 h-140 w-140 rounded-full bg-[radial-gradient(circle,rgba(245,180,60,0.15)_0%,rgba(245,180,60,0.05)_45%,transparent_70%)] blur-xl" />
            <div className="absolute -left-20 top-10 h-100 w-100 rounded-full bg-[radial-gradient(circle,rgba(245,180,60,0.12)_0%,transparent_65%)] blur-xl" />

            <ChipOrnament className="absolute left-[8%] top-[12%] h-10 w-10 rotate-12 opacity-40 sm:h-14 sm:w-14" />
            <ChipOrnament className="absolute left-[35%] top-[8%] h-8 w-8 -rotate-45 opacity-30 sm:h-10 sm:w-10" />
            <ChipOrnament className="absolute left-[22%] bottom-[25%] h-9 w-9 rotate-45 opacity-35 sm:h-12 sm:w-12" />
            <ChipOrnament className="absolute right-[12%] top-[15%] h-11 w-11 -rotate-12 opacity-35 sm:h-16 sm:w-16" />
            <ChipOrnament className="absolute right-[28%] bottom-[18%] h-8 w-8 rotate-30 opacity-30 sm:h-10 sm:w-10" />
            <Sparkle className="absolute left-[15%] top-[25%] h-6 w-6 opacity-50" />
            <Sparkle className="absolute left-[45%] top-[18%] h-5 w-5 opacity-40" />
            <Sparkle className="absolute right-[20%] bottom-[30%] h-7 w-7 opacity-50" />

            <div className="absolute inset-x-0 -bottom-14 h-80 opacity-90">
                <HeroLandscape />
            </div>
            <div className="absolute inset-y-0 left-0 w-32 bg-[linear-gradient(90deg,#fef8ef_0%,rgba(254,248,239,0.78)_36%,rgba(244,248,239,0)_100%)] sm:w-40 lg:w-52" />
            <div className="absolute inset-y-0 right-0 w-32 bg-[linear-gradient(270deg,#f8ebd5_0%,rgba(248,235,213,0.78)_36%,rgba(248,235,213,0)_100%)] sm:w-40 lg:w-52" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,250,243,0.96)_0%,rgba(255,250,243,0.55)_55%,rgba(255,250,243,0)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(247,231,204,0)_0%,rgba(250,239,221,0.68)_45%,#fbf3e7_78%,#fdf6ec_100%)]" />
            <div className="absolute inset-x-[10%] bottom-22 h-24 rounded-[50%] bg-[radial-gradient(circle,rgba(229,198,145,0.18)_0%,rgba(229,198,145,0.08)_42%,transparent_76%)] blur-2xl" />
        </div>
    );
}

function HeroBadgeArtwork() {
    return (
        <div className="relative mx-auto h-66 w-66 sm:h-80 sm:w-[20rem] lg:h-104 lg:w-104">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#fff5d6_0%,rgba(253,235,180,0.85)_40%,rgba(245,190,90,0.35)_70%,transparent_100%)] blur-sm" />
            <div className="absolute inset-2 rounded-full border border-dashed border-[#e5a942]/60 sm:inset-3 lg:inset-4" />
            <div className="absolute inset-[1.2rem] rounded-full border border-dotted border-[#d48c1b]/40 sm:inset-[1.6rem] lg:inset-8" />

            <div className="absolute -left-2 top-16 sm:left-[0.2rem] sm:top-22 lg:left-2 lg:top-28">
                <LeafBranch className="h-28 w-14 sm:h-36 sm:w-18 lg:h-48 lg:w-24" />
            </div>
            <div className="absolute -right-2 top-8 sm:right-[0.2rem] sm:top-12 lg:right-2 lg:top-16">
                <LeafBranch className="h-32 w-16 sm:h-40 sm:w-20 lg:h-52 lg:w-26" mirrored />
            </div>

            <ChipOrnament className="absolute -left-[0.8rem] top-6 h-8 w-8 -rotate-12 sm:left-2 sm:top-8 sm:h-10 sm:w-10 lg:left-4 lg:top-10 lg:h-12 lg:w-12" />
            <ChipOrnament className="absolute -right-[0.6rem] bottom-12 h-7 w-7 rotate-45 sm:right-[0.8rem] sm:bottom-16 sm:h-9 sm:w-9 lg:right-6 lg:bottom-20 lg:h-11 lg:w-11" />
            <ChipOrnament className="absolute left-8 bottom-4 h-6 w-6 rotate-12 sm:left-12 sm:bottom-6 sm:h-8 sm:w-8 lg:left-16 lg:bottom-8 lg:h-10 lg:w-10" />
            <Sparkle className="absolute left-[1.8rem] top-[4.2rem] h-6 w-6 sm:left-[2.2rem] sm:top-[5.4rem] sm:h-7 sm:w-7 lg:left-[3.1rem] lg:top-[6.9rem] lg:h-9 lg:w-9" />
            <Sparkle className="absolute right-12 top-[5.2rem] h-5 w-5 sm:right-[3.8rem] sm:top-[6.7rem] sm:h-6 sm:w-6 lg:right-[4.9rem] lg:top-[8.7rem] lg:h-7 lg:w-7" />
            <Sparkle className="absolute left-[5.9rem] bottom-[2.3rem] h-4 w-4 sm:left-[7.4rem] sm:bottom-12 sm:h-5 sm:w-5 lg:left-[9.7rem] lg:bottom-[4.7rem] lg:h-6 lg:w-6" />

            <div className="absolute inset-[2.2rem] flex items-center justify-center rounded-full border-4 border-[#3a2117] bg-[radial-gradient(circle_at_35%_35%,#fff3b3_0%,#fcd84b_45%,#f4b81a_100%)] p-3 shadow-[0_28px_60px_-24px_rgba(58,33,23,0.48)] sm:inset-[2.8rem] sm:p-4 lg:inset-[3.6rem] lg:border-[6px] lg:p-6">
                <div className="absolute inset-[0.4rem] rounded-full border-[1.5px] border-[#3a2117]/80 sm:inset-[0.6rem] lg:inset-3 lg:border-2" />
                <img
                    src="/images/logo-removed.png"
                    alt="Cahaya Rasa Logo"
                    className="relative z-10 h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(58,33,23,0.25)] transition-transform duration-300 hover:scale-105"
                />
            </div>
        </div>
    );
}

function FeatureItem({ title, subtitle, icon }: { title: string; subtitle: string; icon: ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-[#3a2117] sm:h-7 sm:w-7">
                {icon}
            </span>
            <div>
                <p className="text-[0.95rem] font-semibold leading-5 text-[#3a2117] sm:text-[0.98rem]">{title}</p>
                <p className="text-[0.95rem] font-medium leading-5 text-[#3a2117] sm:text-[0.98rem]">{subtitle}</p>
            </div>
        </div>
    );
}

export function HeroSection({ business }: HeroSectionProps) {
    return (
        <section className="overflow-x-clip px-4 pb-3 pt-5 sm:px-5 lg:px-8">
            <div className="relative mx-auto max-w-462 overflow-hidden rounded-[2.5rem] px-5 pb-10 pt-6 shadow-[0_30px_65px_-46px_rgba(58,33,23,0.22)] sm:px-8 sm:pb-14 sm:pt-8 lg:overflow-visible lg:px-12 lg:pb-16">
                <HeroDecorBackdrop />
                <HeroClouds />
                <div className="relative z-10 grid items-start gap-8 lg:grid-cols-[0.54fr_0.46fr]">
                    <div className="max-w-132 pt-1 sm:pt-2">
                        <h1 className="mt-4 whitespace-pre-line font-display text-[2.8rem] font-semibold leading-[0.88] tracking-[-0.06em] text-[#3a2117] sm:mt-5 sm:text-[3.6rem] lg:text-[4.5rem]">
                            Buatan Tumpang,\nRasa Malang
                        </h1>
                        <p className="mt-4 max-w-120 text-[0.95rem] leading-7 text-[#725442] sm:mt-5 sm:text-[1.05rem] sm:leading-8">
                            {business.name} menghadirkan camilan dan oleh-oleh rumahan dari Malang: renyah, praktis, dan siap dipesan untuk keluarga maupun buah tangan.
                        </p>
                        {(business.address || business.operating_hours) && (
                            <p className="mt-3 max-w-120 text-sm font-semibold leading-6 text-[#725442]">
                                {[business.address, business.operating_hours].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
                            <a
                                href={storefrontShopHref}
                                className="inline-flex min-h-[3.2rem] w-full items-center justify-center gap-2 rounded-full bg-[#f59a21] px-6 text-sm font-semibold text-white shadow-[0_22px_36px_-26px_rgba(245,154,33,0.65)] transition hover:-translate-y-0.5 hover:bg-[#e08913] sm:w-auto"
                            >
                                <ShoppingCart size={16} strokeWidth={1.9} />
                                Belanja Sekarang
                            </a>
                            <a
                                href={storefrontShopHref}
                                className="inline-flex min-h-[3.2rem] w-full items-center justify-center gap-2 rounded-full border border-[#e5d7c5] bg-white/80 px-6 text-sm font-semibold text-[#3a2117] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                            >
                                Lihat Produk
                                <ChevronRight size={16} strokeWidth={1.9} />
                            </a>
                        </div>
                        <div className="mt-7 grid gap-4 text-[#3a2117] sm:mt-8 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start">
                            <FeatureItem title="Bahan Pilihan" subtitle="Berkualitas" icon={<Medal size={18} strokeWidth={1.8} />} />
                            <div className="hidden h-10 w-px bg-[#eadfcf] sm:block" />
                            <FeatureItem title="Tanpa Pengawet" subtitle="& Pewarna Buatan" icon={<Leaf size={18} strokeWidth={1.8} />} />
                            <div className="hidden h-10 w-px bg-[#eadfcf] sm:block" />
                            <FeatureItem title="Dibuat Dengan Hati" subtitle="Rasa Rumahan" icon={<Heart size={18} strokeWidth={1.8} />} />
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center pt-2 lg:justify-end">
                        <HeroBadgeArtwork />
                    </div>
                </div>
            </div>
        </section>
    );
}
