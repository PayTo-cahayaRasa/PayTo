import { Facebook, Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';

import { businessWhatsappUrl, marketplaceItems } from '../constants';
import type { PublicFooterProps } from '../types';
import { BrandMark } from './BrandMark';

export function PublicFooter({ business }: PublicFooterProps) {
    const whatsappHref = businessWhatsappUrl(business);

    return (
        <footer id="kontak" className="scroll-mt-24 px-4 pb-8 pt-2 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-462 px-3 py-4 sm:px-0">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.12fr_0.8fr_0.8fr_1fr]">
                    <div>
                        <BrandMark business={business} />
                        <p className="mt-4 max-w-xs text-sm leading-7 text-[#6d5948]">
                            Camilan khas Malang. Dibuat dengan bahan pilihan dan resep untuk rasa terbaik.
                        </p>
                        <div className="mt-5 flex items-center gap-3">
                            {[
                                { Icon: Instagram, href: business.instagram_url ?? '#footer' },
                                { Icon: Facebook, href: '#footer' },
                                { Icon: MessageCircle, href: whatsappHref ?? '#footer' },
                                { Icon: Mail, href: '#footer' },
                            ].map(({ Icon, href }, index) => (
                                <a
                                    key={index}
                                    href={href}
                                    target={href.startsWith('http') ? '_blank' : undefined}
                                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfcf] text-[#3a2117]"
                                >
                                    <Icon size={15} strokeWidth={1.8} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Bantuan</h3>
                        <div className="mt-4 grid gap-3 text-sm text-[#6d5948]">
                            <a href="#footer">Cara Belanja</a>
                            <a href="#footer">Pengiriman</a>
                            <a href="#footer">Pembayaran</a>
                            <a href="#footer">Retur & Refund</a>
                            <a href="#footer">FAQ</a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Marketplace</h3>
                        <div className="mt-4 grid gap-3 text-sm text-[#6d5948]">
                            {marketplaceItems.map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <span className={`h-3 w-3 rounded-full ${item.dot}`} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Kontak</h3>
                        <div className="mt-4 grid gap-4 text-sm leading-7 text-[#6d5948]">
                            <div className="flex items-start gap-3">
                                <MessageCircle size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <span>{business.whatsapp_number || '-'}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <span>hello@cahayarasa.id</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <span>{business.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-[#eadfcf] pt-5 text-xs text-[#836b58] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <p>&copy; 2025 {business.name}. All Rights Reserved.</p>
                        <span className="text-[#b69877]">&middot;</span>
                        <span className="text-[10px] text-[#a08568]">Powered by PayTo POS</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <a href="#footer">Syarat & Ketentuan</a>
                        <a href="#footer">Kebijakan Privasi</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
