import { MessageCircle, Send } from 'lucide-react';

import { businessWhatsappUrl } from '../constants';
import type { BusinessProfile } from '../types';

export function BlackCtaSection({ business }: { business: BusinessProfile }) {
    const whatsappUrl = businessWhatsappUrl(business);

    return (
        <section className="px-4 pb-4 pt-3 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-462 rounded-[1.75rem] bg-[#2b1a10] px-5 py-6 text-white shadow-[0_24px_48px_-30px_rgba(43,26,16,0.55)] sm:px-7 sm:py-7 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
                    <div>
                        <h2 className="max-w-120 font-display text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.55rem]">
                            Dapatkan Update & Promo Spesial dari {business.name}!
                        </h2>
                        <p className="mt-4 max-w-116 text-[0.98rem] leading-7 text-[#ddc7b0] sm:text-[1rem]">
                            Ikuti kabar produk terbaru, stok camilan favorit, dan promo oleh-oleh Malang langsung dari toko.
                        </p>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="flex min-h-[3.4rem] flex-col overflow-hidden rounded-[1.6rem] bg-white sm:flex-row sm:rounded-full">
                            <input
                                type="email"
                                placeholder="Masukkan email Anda"
                                className="min-h-13 w-full px-5 text-sm text-[#3a2117] outline-none placeholder:text-[#b69877]"
                            />
                            <button type="button" className="inline-flex min-h-13 items-center justify-center gap-2 bg-[#f59a21] px-6 text-sm font-semibold text-white">
                                Langganan
                                <Send size={15} strokeWidth={1.9} />
                            </button>
                        </div>
                        <div className="border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                            <p className="max-w-[18rem] text-sm leading-7 text-[#ddc7b0]">
                                Pesan camilan, tanya stok, atau konfirmasi alamat toko via WhatsApp.
                            </p>
                            {whatsappUrl ? (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-white sm:w-auto"
                                >
                                    <MessageCircle size={17} strokeWidth={1.9} />
                                    Chat WhatsApp
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
