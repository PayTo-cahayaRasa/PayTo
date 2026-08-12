import type { PublicFrameProps } from '../types';

export function PublicFrame({ children }: PublicFrameProps) {
    return (
        <div className="min-h-dvh bg-[#fdf6ec] font-sans text-[#3a2117] selection:bg-[#f59a21] selection:text-white">
            <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_28%),linear-gradient(180deg,#fffaf3_0%,#fdf6ec_34%,#f9efdf_100%)]">
                {children}
            </div>
        </div>
    );
}
