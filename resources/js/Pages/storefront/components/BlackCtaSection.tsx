import { MessageCircle } from 'lucide-react';

import { businessWhatsappUrl } from '../constants';
import type { BusinessProfile } from '../types';

export function BlackCtaSection({ business }: { business: BusinessProfile }) {
    const whatsappUrl = businessWhatsappUrl(business);

    return (
        <section className="px-4 pb-4 pt-3 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-462 rounded-[1.75rem] bg-[#2b1a10] px-5 py-6 text-white shadow-[0_24px_48px_-30px_rgba(43,26,16,0.55)] sm:px-7 sm:py-7 lg:px-8">
                <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <h2 className="max-w-120 font-display text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.55rem]">
                            Pesan Camilan Favorit Anda
                        </h2>
                        <p className="mt-4 max-w-116 text-[0.98rem] leading-7 text-[#ddc7b0] sm:text-[1rem]">
                            Tanya stok, pilih produk, dan selesaikan pesanan langsung bersama tim {business.name} melalui WhatsApp.
                        </p>
                    </div>
                    <div className="lg:border-l lg:border-white/15 lg:pl-8">
                            {whatsappUrl ? (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1fbd59] sm:w-auto"
                                >
                                    <MessageCircle size={17} strokeWidth={1.9} />
                                    Chat WhatsApp
                                </a>
                            ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
