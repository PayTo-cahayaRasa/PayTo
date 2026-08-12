import type { ReactNode } from 'react';

type HeaderIconButtonProps = {
    badge?: string;
    ariaLabel: string;
    children: ReactNode;
    className?: string;
    isActive?: boolean;
    onClick?: () => void;
};

export function HeaderIconButton({ badge, ariaLabel, children, className, isActive = false, onClick }: HeaderIconButtonProps) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            aria-expanded={isActive || undefined}
            onClick={onClick}
            title={ariaLabel}
            className={`group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[#3a2117] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c22] motion-reduce:transition-none ${
                isActive
                    ? 'bg-[#3a2117] text-white shadow-[0_14px_26px_-18px_rgba(58,33,23,0.7)]'
                    : 'hover:-translate-y-px hover:bg-[#f8ead6] hover:text-[#a65e16]'
            } ${className ?? ''}`}
        >
            {badge ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#fffaf3] bg-[#ef921e] px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                    {badge}
                </span>
            ) : null}
            <span className="transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">{children}</span>
        </button>
    );
}
