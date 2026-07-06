import { MessageCircle, Send } from 'lucide-react';

import { whatsappUrl } from '../constants';

export function BlackCtaSection() {
    return (
        <section className="px-4 pb-4 pt-3 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-[1848px] rounded-[1.75rem] bg-[#2b1a10] px-5 py-6 text-white shadow-[0_24px_48px_-30px_rgba(43,26,16,0.55)] sm:px-7 sm:py-7 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
                    <div>
                        <h2 className="max-w-[30rem] font-display text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.55rem]">
                            Dapatkan Update & Promo Spesial dari Cahaya Rasa!
                        </h2>
                        <p className="mt-4 max-w-[29rem] text-[0.98rem] leading-7 text-[#ddc7b0] sm:text-[1rem]">
                            Jangan lewatkan promo menarik, produk terbaru, dan penawaran eksklusif untuk camilan favorit Anda.
                        </p>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="flex min-h-[3.4rem] flex-col overflow-hidden rounded-[1.6rem] bg-white sm:flex-row sm:rounded-full">
                            <input
                                type="email"
                                placeholder="Masukkan email Anda"
                                className="min-h-[3.25rem] w-full px-5 text-sm text-[#3a2117] outline-none placeholder:text-[#b69877]"
                            />
                            <button type="button" className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-[#f59a21] px-6 text-sm font-semibold text-white">
                                Langganan
                                <Send size={15} strokeWidth={1.9} />
                            </button>
                        </div>
                        <div className="border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                            <p className="max-w-[18rem] text-sm leading-7 text-[#ddc7b0]">
                                Atau pesan langsung via WhatsApp untuk order & tanya produk.
                            </p>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-white sm:w-auto"
                            >
                                <MessageCircle size={17} strokeWidth={1.9} />
                                Chat WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
