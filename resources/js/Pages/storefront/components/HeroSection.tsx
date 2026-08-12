import { ChevronRight, Heart, Leaf, Medal, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { storefrontShopHref } from '../constants';
import type { HeroSectionProps } from '../types';

function HeroLandscape() {
    return (
        <svg aria-hidden="true" viewBox="0 0 1200 340" className="h-full w-full" fill="none">
            <path d="M0 258C112 214 199 208 302 240C394 269 457 282 548 246C659 202 757 198 871 238C981 277 1070 274 1200 225V340H0V258Z" fill="#f1dfbd" opacity="0.68" />
            <path d="M0 292C122 252 218 246 321 274C425 303 508 303 608 265C727 220 824 233 926 273C1024 311 1107 303 1200 278V340H0V292Z" fill="#e8cb96" opacity="0.48" />
            <path d="M0 318C143 288 255 288 379 312C523 339 659 305 760 286C909 258 1031 321 1200 300V340H0V318Z" fill="#dfbb7d" opacity="0.25" />

            <g stroke="#cfa464" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 296 122 196l106 100M88 296l79-73 74 73M184 296l54-48 58 48" strokeWidth="3" opacity="0.5" />
                <path d="m58 268 64-64 29 29M113 205l17-18 69 70" strokeWidth="1.5" opacity="0.34" />
                <path d="M695 302h402" strokeWidth="2" opacity="0.34" />

                <path d="M742 301v-54l45-32 45 32v54M730 247h115l-58-40-57 40Z" strokeWidth="3" opacity="0.58" />
                <path d="M848 301v-75l59-42 60 42v75M833 226h149l-75-52-74 52Z" strokeWidth="3.5" opacity="0.64" />
                <path d="M970 301v-58l47-35 49 35v58M958 243h120l-61-44-59 44Z" strokeWidth="3" opacity="0.5" />
                <path d="M874 183v-24l33-24 35 24v24M865 159h84l-42-31-42 31Z" strokeWidth="2.5" opacity="0.48" />

                <path d="M682 303c8-41 17-66 35-96M702 263c-20-4-31-15-37-32 22 2 34 13 37 32ZM708 242c18-5 29-17 34-35-20 3-31 15-34 35Z" strokeWidth="2.5" opacity="0.46" />
                <path d="M1105 304c-3-35 4-62 21-88M1116 252c-17-3-27-13-32-28 19 2 29 12 32 28ZM1121 239c16-5 25-15 29-31-18 4-27 14-29 31Z" strokeWidth="2.5" opacity="0.42" />
            </g>

            <g fill="#d3a65e" opacity="0.36">
                <circle cx="648" cy="284" r="4" /><circle cx="672" cy="292" r="3" /><circle cx="1080" cy="280" r="4" />
            </g>
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
            <div className="absolute -right-20 -top-20 h-140 w-140 rounded-full bg-[radial-gradient(circle,rgba(245,180,60,0.2)_0%,rgba(245,180,60,0.08)_45%,transparent_70%)] blur-xl" />
            <div className="absolute -left-20 top-10 h-100 w-100 rounded-full bg-[radial-gradient(circle,rgba(245,180,60,0.12)_0%,transparent_65%)] blur-xl" />
            <div className="absolute -bottom-20 right-[5%] h-96 w-[62%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(239,190,96,0.24)_0%,rgba(239,190,96,0.1)_42%,transparent_72%)] blur-2xl" />
            <div className="absolute bottom-12 right-[7%] h-112 w-112 rounded-full border border-dashed border-[#dea43f]/25 sm:right-[10%] lg:right-[12%]" />
            <div className="absolute bottom-23 right-[11%] h-96 w-96 rounded-full border border-dotted border-[#d48c1b]/20 sm:right-[14%] lg:right-[16%]" />

            <ChipOrnament className="absolute left-[8%] top-[12%] h-10 w-10 rotate-12 opacity-40 sm:h-14 sm:w-14" />
            <ChipOrnament className="absolute left-[35%] top-[8%] h-8 w-8 -rotate-45 opacity-30 sm:h-10 sm:w-10" />
            <ChipOrnament className="absolute left-[22%] bottom-[25%] h-9 w-9 rotate-45 opacity-35 sm:h-12 sm:w-12" />
            <ChipOrnament className="absolute right-[12%] top-[15%] h-11 w-11 -rotate-12 opacity-35 sm:h-16 sm:w-16" />
            <ChipOrnament className="absolute right-[28%] bottom-[18%] h-8 w-8 rotate-30 opacity-30 sm:h-10 sm:w-10" />
            <Sparkle className="absolute left-[15%] top-[25%] h-6 w-6 opacity-50" />
            <Sparkle className="absolute left-[45%] top-[18%] h-5 w-5 opacity-40" />
            <Sparkle className="absolute right-[20%] bottom-[30%] h-7 w-7 opacity-50" />

            <div className="absolute inset-x-0 -bottom-2 h-96 opacity-95 sm:h-104 lg:-bottom-4 lg:h-112">
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

type HeroProductPhotoProps = {
    alt: string;
    className: string;
    imageClassName?: string;
    isPriority?: boolean;
    src: string;
};

function HeroProductPhoto({ alt, className, imageClassName = '', isPriority = false, src }: HeroProductPhotoProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`absolute ${className}`}>
            <div className={`hero-product-float h-full w-full ${imageClassName}`}>
                <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] border border-white/75 bg-[#fff8eb]/70 p-1.5 shadow-[0_24px_42px_-22px_rgba(94,53,22,0.5)] backdrop-blur-[2px] sm:p-2">
                    {!isLoaded && (
                        <div aria-hidden="true" className="absolute inset-1.5 z-10 grid animate-pulse place-items-center rounded-[1.4rem] bg-[#ecd6ae] sm:inset-2">
                            <span className="h-2 w-2/3 rounded-full bg-white/65" />
                        </div>
                    )}
                    <img
                        src={src}
                        alt={alt}
                        width={1086}
                        height={1448}
                        loading={isPriority ? 'eager' : 'lazy'}
                        fetchPriority={isPriority ? 'high' : 'auto'}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setIsLoaded(true)}
                        className={`relative h-full w-full rounded-[1.4rem] object-contain transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                </div>
            </div>
        </div>
    );
}

function HeroProductShowcase() {
    return (
        <div className="relative mx-auto h-78 w-full max-w-92 sm:h-104 sm:max-w-130 lg:h-118 lg:max-w-142">
            <div className="absolute left-[14%] top-[5%] h-[82%] w-[74%] rounded-[48%] bg-[radial-gradient(circle_at_48%_44%,rgba(255,246,211,0.98)_0%,rgba(250,211,112,0.62)_42%,rgba(235,154,47,0.15)_68%,transparent_74%)] blur-sm" />
            <div className="absolute left-[18%] top-[11%] h-[70%] w-[64%] rotate-[-9deg] rounded-[48%] border border-dashed border-[#d89d35]/45" />
            <div className="absolute left-[22%] top-[16%] h-[62%] w-[57%] rotate-12 rounded-[48%] border border-[#f0bd5c]/35" />
            <svg aria-hidden="true" viewBox="0 0 500 390" className="absolute inset-0 h-full w-full opacity-55">
                <path d="M48 244C128 80 338 39 455 169" stroke="#d89d35" strokeWidth="2" strokeDasharray="4 10" strokeLinecap="round" />
                <path d="M82 302C213 379 398 324 447 211" stroke="#efb84f" strokeWidth="1.5" strokeLinecap="round" opacity="0.72" />
            </svg>

            <HeroProductPhoto
                src="/products/singkong.webp"
                alt="Kemasan keripik singkong Cahaya Rasa"
                className="left-0 top-8 z-[1] hidden h-42 w-31 -rotate-8 sm:block lg:left-1 lg:top-12 lg:h-49 lg:w-37"
                imageClassName="hero-product-float-delayed"
            />
            <HeroProductPhoto
                src="/products/rempeyek.webp"
                alt="Kemasan rempeyek Cahaya Rasa"
                className="bottom-4 left-[3%] z-[3] hidden h-38 w-28 rotate-5 sm:block lg:bottom-2 lg:left-[7%] lg:h-44 lg:w-33"
                imageClassName="hero-product-float-slow"
            />
            <HeroProductPhoto
                src="/products/pisang.webp"
                alt="Kemasan keripik pisang Cahaya Rasa"
                className="bottom-0 right-[3%] z-[4] hidden h-35 w-26 -rotate-5 lg:block"
                imageClassName="hero-product-float-delayed"
            />
            <HeroProductPhoto
                src="/products/pisangMadu.webp"
                alt="Kemasan keripik pisang madu Cahaya Rasa"
                className="right-0 top-5 z-[2] h-54 w-40 rotate-4 sm:right-[2%] sm:top-6 sm:h-70 sm:w-52 lg:right-0 lg:top-7 lg:h-80 lg:w-60"
                isPriority
            />

            <LeafBranch className="absolute -left-1 bottom-7 z-[2] h-29 w-15 opacity-65 sm:left-[17%] sm:bottom-8 sm:h-38 sm:w-19 lg:left-[20%] lg:h-44 lg:w-22" />
            <Sparkle className="absolute left-[10%] top-[13%] z-[5] h-6 w-6 sm:left-[26%] sm:top-[9%] sm:h-8 sm:w-8" />
            <Sparkle className="absolute bottom-[8%] right-[28%] z-[5] h-5 w-5 sm:h-7 sm:w-7" />
            <ChipOrnament className="absolute right-[8%] top-[4%] z-[5] h-8 w-8 rotate-18 sm:right-[11%] sm:h-10 sm:w-10" />
            <ChipOrnament className="absolute bottom-[4%] left-[31%] z-[5] h-7 w-7 -rotate-25 sm:h-9 sm:w-9" />

            <div className="absolute left-[43%] top-[53%] z-[6] flex h-43 w-43 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[var(--color-cocoa-800)] bg-[radial-gradient(circle_at_35%_35%,#fff3b3_0%,#fcd84b_45%,#f4b81a_100%)] p-3 shadow-[0_28px_60px_-24px_rgba(58,33,23,0.58)] sm:left-[48%] sm:top-[51%] sm:h-54 sm:w-54 sm:border-[5px] sm:p-4 lg:h-61 lg:w-61 lg:border-[6px] lg:p-5">
                <div className="absolute inset-2 rounded-full border-[1.5px] border-[var(--color-cocoa-800)]/80 sm:inset-2.5 lg:inset-3 lg:border-2" />
                <img
                    src="/images/logo-removed.png"
                    alt="Logo Cahaya Rasa"
                    width={500}
                    height={500}
                    loading="eager"
                    className="relative h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(58,33,23,0.25)]"
                />
            </div>
        </div>
    );
}

function FeatureItem({ title, subtitle, icon }: { title: string; subtitle: string; icon: ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-cocoa-800)] sm:h-7 sm:w-7">
                {icon}
            </span>
            <div>
                <p className="text-[0.95rem] font-semibold leading-5 text-[var(--color-cocoa-800)] sm:text-[0.98rem]">{title}</p>
                <p className="text-[0.95rem] font-medium leading-5 text-[var(--color-cocoa-800)] sm:text-[0.98rem]">{subtitle}</p>
            </div>
        </div>
    );
}

export function HeroSection({ business }: HeroSectionProps) {
    return (
        <section className="relative -mt-24 overflow-hidden pb-30 pt-29 sm:-mt-26 sm:pb-38 sm:pt-32 lg:pb-48">
            <div className="relative mx-auto max-w-462 px-5 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-8 lg:px-12 lg:pb-24">
                <HeroDecorBackdrop />
                <HeroClouds />
                <div className="relative z-10 grid items-start gap-8 lg:grid-cols-[0.54fr_0.46fr]">
                    <div className="max-w-132 pt-1 sm:pt-2">
                        <h1 className="mt-4 font-display text-[2.8rem] font-semibold leading-[0.88] tracking-[-0.06em] text-[var(--color-cocoa-800)] sm:mt-5 sm:text-[3.6rem] lg:text-[4.5rem]">
                            Renyahnya
                            <br />
                            Cahaya Rasa
                        </h1>
                        <p className="mt-4 max-w-120 text-[0.95rem] leading-7 text-[#725442] sm:mt-5 sm:text-[1.05rem] sm:leading-8">
                            Camilan khas Malang yang dibuat dari bahan pilihan dan resep rumahan untuk rasa renyah, gurih, dan selalu bikin ingin kembali.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
                            <a
                                href={storefrontShopHref}
                                className="inline-flex min-h-[3.2rem] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-snack-500)] px-6 text-sm font-semibold text-white shadow-[0_22px_36px_-26px_rgba(245,154,33,0.65)] transition hover:-translate-y-0.5 hover:bg-[#e08913] sm:w-auto"
                            >
                                <ShoppingCart size={16} strokeWidth={1.9} />
                                Belanja Sekarang
                            </a>
                            <a
                                href={storefrontShopHref}
                                className="inline-flex min-h-[3.2rem] w-full items-center justify-center gap-2 rounded-full border border-[#e5d7c5] bg-white/80 px-6 text-sm font-semibold text-[var(--color-cocoa-800)] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                            >
                                Lihat Produk
                                <ChevronRight size={16} strokeWidth={1.9} />
                            </a>
                        </div>
                        <div className="mt-7 grid gap-4 text-[var(--color-cocoa-800)] sm:mt-8 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start">
                            <FeatureItem title="Bahan Pilihan" subtitle="Berkualitas" icon={<Medal size={18} strokeWidth={1.8} />} />
                            <div className="hidden h-10 w-px bg-[var(--color-cream-200)] sm:block" />
                            <FeatureItem title="Tanpa Pengawet" subtitle="& Pewarna Buatan" icon={<Leaf size={18} strokeWidth={1.8} />} />
                            <div className="hidden h-10 w-px bg-[var(--color-cream-200)] sm:block" />
                            <FeatureItem title="Dibuat Dengan Hati" subtitle="Rasa Rumahan" icon={<Heart size={18} strokeWidth={1.8} />} />
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center pt-2 lg:justify-end">
                        <HeroProductShowcase />
                    </div>
                </div>
            </div>
        </section>
    );
}
