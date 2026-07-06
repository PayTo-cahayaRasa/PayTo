import type { ReactNode } from 'react';

type HeaderIconButtonProps = {
    badge?: string;
    ariaLabel: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
};

export function HeaderIconButton({ badge, ariaLabel, children, className, onClick }: HeaderIconButtonProps) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
            className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#3a2117] transition duration-200 hover:-translate-y-px hover:text-[#f59a21] sm:h-11 sm:w-11 ${className ?? ''}`}
        >
            {badge ? (
                <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[#f59a21] px-1 text-[10px] font-semibold leading-4 text-white">
                    {badge}
                </span>
            ) : null}
            {children}
        </button>
    );
}
