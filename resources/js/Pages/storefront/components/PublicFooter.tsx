import { Link } from '@inertiajs/react';
import { Instagram, MapPin, MessageCircle, Music2, Phone, Store } from 'lucide-react';

import { businessWhatsappUrl, storefrontShopHref } from '../constants';
import type { PublicFooterProps } from '../types';
import { BrandMark } from './BrandMark';

export function PublicFooter({ business }: PublicFooterProps) {
    const whatsappHref = businessWhatsappUrl(business);
    const whatsappDisplay = formatWhatsAppNumber(business.whatsapp_number);
    const marketplaces = [
        { Icon: Store, href: business.shopee_url ?? '', label: 'Shopee' },
        { Icon: Instagram, href: business.instagram_url ?? '', label: 'Instagram' },
        { Icon: Music2, href: business.tiktok_url ?? '', label: 'TikTok' },
    ].filter(({ href }) => Boolean(href));

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
                                ...marketplaces,
                                { Icon: MessageCircle, href: whatsappHref ?? '#footer', label: 'WhatsApp' },
                            ].filter(({ href }) => href !== '#footer').map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
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
                            <Link href={storefrontShopHref}>Belanja Produk</Link>
                            <Link href="/lacak-pesanan">Lacak Pesanan</Link>
                            {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer">Hubungi via WhatsApp</a> : null}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Marketplace</h3>
                        <div className="mt-4 grid gap-3 text-sm text-[#6d5948]">
                            {marketplaces.map(({ Icon, href, label }) => (
                                <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                                    <Icon size={16} strokeWidth={1.8} className="text-[#3a2117]" />
                                    <span>{label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#3a2117]">Kontak</h3>
                        <div className="mt-4 grid gap-4 text-sm leading-7 text-[#6d5948]">
                            <div className="flex items-start gap-3">
                                <Phone size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <a href={`tel:+${business.whatsapp_number.replace(/\D/g, '')}`}>{whatsappDisplay}</a>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} strokeWidth={1.8} className="mt-1 text-[#3a2117]" />
                                <span>{business.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-[#eadfcf] pt-5 text-xs text-[#836b58]">
                    <div className="flex items-center gap-2">
                        <p>&copy; 2025 {business.name}. All Rights Reserved.</p>
                        <span className="text-[#b69877]">&middot;</span>
                        <span className="text-[10px] text-[#a08568]">Powered by PayTo POS</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function formatWhatsAppNumber(number: string | null | undefined): string {
    const digits = (number ?? '').replace(/\D/g, '');

    if (!digits) {
        return '-';
    }

    if (digits.startsWith('62') && digits.length === 13) {
        const localPart = digits.slice(2);
        return `+62 ${localPart.slice(0, 3)}-${localPart.slice(3, 7)}-${localPart.slice(7)}`;
    }

    if (digits.startsWith('62')) {
        return `+${digits}`;
    }

    return `+${digits}`;
}
