import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

type FeaturedChipsSectionProps = {
    onExplore: () => void;
};

const highlights = [
    'Renyah di setiap gigitan',
    'Dibuat dari bahan pilihan',
    'Cocok untuk camilan dan oleh-oleh',
];

function FeaturedImage({ alt, className, src }: { alt: string; className: string; src: string }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <>
            {!isLoaded && (
                <span aria-hidden="true" className="absolute inset-0 z-10 grid animate-pulse place-items-center bg-[#dfbd81]">
                    <span className="h-2 w-2/3 rounded-full bg-white/65" />
                </span>
            )}
            <img
                src={src}
                alt={alt}
                width={1086}
                height={1448}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsLoaded(true)}
                className={`relative transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            />
        </>
    );
}

export function FeaturedChipsSection({ onExplore }: FeaturedChipsSectionProps) {
    return (
        <section
            aria-labelledby="featured-chips-title"
            className="relative z-20 -mt-36 px-4 pb-36 sm:-mt-44 sm:px-5 sm:pb-44 lg:-mt-54 lg:px-8 lg:pb-54"
        >
            <div className="relative mx-auto max-w-462 overflow-hidden rounded-[2.25rem] border border-[#ecd9bc] bg-[#f7e6c8] shadow-[0_28px_70px_-46px_rgba(80,42,19,0.5)]">
                <div className="pointer-events-none absolute -right-24 -top-28 h-90 w-90 rounded-full bg-[radial-gradient(circle,rgba(242,171,51,0.26)_0%,rgba(242,171,51,0.08)_48%,transparent_70%)] blur-2xl" />
                <div className="pointer-events-none absolute -bottom-32 left-[24%] h-80 w-80 rounded-full border border-dashed border-[#c88a2b]/20 max-md:hidden" />

                <div className="relative grid items-center gap-9 p-5 sm:p-8 md:grid-cols-[1.04fr_0.96fr] md:gap-10 lg:p-12">
                    <div className="relative order-1 min-h-94 sm:min-h-112 md:min-h-126">
                        <div className="absolute inset-4 rounded-[45%] bg-[radial-gradient(circle,rgba(255,221,140,0.8)_0%,rgba(236,164,48,0.24)_54%,transparent_72%)] blur-xl" />
                        <div className="absolute bottom-8 left-3 right-12 top-6 rotate-[-2deg] overflow-hidden rounded-[2rem] border border-white/70 bg-[#e9c793] shadow-[0_30px_58px_-34px_rgba(75,39,18,0.62)] sm:bottom-10 sm:left-5 sm:right-18 sm:top-8">
                            <FeaturedImage
                                src="/products/pisang.webp"
                                alt="Keripik pisang Cahaya Rasa tersaji bersama kemasannya"
                                className="h-full w-full object-cover object-[50%_22%]"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),transparent_38%,rgba(92,48,19,0.1))]" />
                        </div>

                        <div className="absolute bottom-0 left-0 h-30 w-40 -rotate-6 overflow-hidden rounded-[45%_55%_48%_52%/54%_46%_54%_46%] border-4 border-[#fff8ea] bg-[#e5b85f] shadow-[0_22px_38px_-21px_rgba(75,39,18,0.68)] sm:h-38 sm:w-52">
                            <FeaturedImage
                                src="/products/singkong.webp"
                                alt="Mangkuk berisi keripik singkong Cahaya Rasa"
                                className="h-full w-full scale-[1.65] object-cover object-[4%_73%]"
                            />
                        </div>

                        <div className="absolute right-0 top-3 h-44 w-32 rotate-5 overflow-hidden rounded-[1.45rem] border-4 border-[#fff8ea] bg-[#fff4db] p-1.5 shadow-[0_25px_46px_-25px_rgba(75,39,18,0.62)] sm:top-14 sm:h-64 sm:w-47">
                            <FeaturedImage
                                src="/products/pisangMadu.webp"
                                alt="Kemasan keripik pisang madu Cahaya Rasa"
                                className="h-full w-full rounded-[1rem] object-contain"
                            />
                        </div>

                        <svg aria-hidden="true" viewBox="0 0 90 90" className="absolute right-[27%] top-0 h-13 w-13 text-[#d78d23] sm:h-16 sm:w-16">
                            <path d="M45 8v74M8 45h74M19 19l52 52M71 19 19 71" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="45" cy="45" r="11" fill="#f7e6c8" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="order-2 max-w-137 md:pl-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ad641c]">Produk Unggulan</p>
                        <h2
                            id="featured-chips-title"
                            className="mt-4 text-balance font-display text-[2.35rem] font-semibold leading-[0.96] tracking-[-0.055em] text-[#3a2117] sm:text-[3rem] lg:text-[3.45rem]"
                        >
                            Keripik Renyah yang Bikin Sulit Berhenti
                        </h2>
                        <p className="mt-5 max-w-128 text-[0.95rem] leading-7 text-[#725442] sm:text-base sm:leading-8">
                            Dibuat dari bahan pilihan dengan resep rumahan, keripik Cahaya Rasa memiliki tekstur renyah dan pilihan rasa yang cocok untuk teman santai maupun oleh-oleh khas Malang.
                        </p>

                        <ul className="mt-6 grid gap-3.5">
                            {highlights.map((highlight) => (
                                <li key={highlight} className="flex items-center gap-3 text-sm font-semibold text-[#4b2d20] sm:text-[0.95rem]">
                                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f0bd59] text-[#4a2919] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                                        <Check size={15} strokeWidth={2.2} aria-hidden="true" />
                                    </span>
                                    {highlight}
                                </li>
                            ))}
                        </ul>

                        <p className="mt-6 border-l-2 border-[#d99b3a] pl-4 text-sm leading-6 text-[#876348]">
                            Salah satu pilihan unggulan, melengkapi beragam camilan khas Cahaya Rasa.
                        </p>

                        <a
                            href="#shop-products"
                            onClick={onExplore}
                            className="mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#3a2117] px-6 text-sm font-semibold text-white shadow-[0_20px_34px_-24px_rgba(58,33,23,0.68)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#4b2d20] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9b5c22] active:translate-y-px sm:w-auto"
                        >
                            Lihat Koleksi Keripik
                            <ArrowRight size={17} strokeWidth={1.9} aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
