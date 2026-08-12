import type { BusinessProfile } from '../types';

export function BrandMark({ business }: { business: BusinessProfile }) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <span className="truncate font-display text-[1.5rem] font-bold leading-none tracking-[-0.04em] text-[var(--color-cocoa-800)] sm:text-[2.1rem]">
                {business.name}
            </span>
            {business.tagline ? (
                <span className="hidden rounded-full border border-[#e8d7c3] bg-[#fff7ea] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#a37244] sm:inline-block">
                    {business.tagline}
                </span>
            ) : null}
        </div>
    );
}
