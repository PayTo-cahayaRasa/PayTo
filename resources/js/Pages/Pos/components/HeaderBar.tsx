import React from 'react';
import { ChevronLeft, Menu, Search } from 'lucide-react';

type HeaderBarProps = {
    activeView: 'menu' | 'history' | 'favorites' | 'profile' | 'settings';
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onBack: () => void;
    onToggleSidebar?: () => void;
    showSidebarToggle?: boolean;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    profile?: { displayName?: string };
    displayName?: string;
};

export default function HeaderBar({
    activeView,
    searchQuery,
    onSearchChange,
    onBack,
    onToggleSidebar,
    showSidebarToggle = false,
    searchInputRef,
    profile,
    displayName,
}: HeaderBarProps) {
    const name = profile?.displayName ?? displayName ?? 'Kasir';
    return (
        <header className="flex flex-col gap-3 shrink-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
                {showSidebarToggle && (
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="w-10 h-10 rounded-xl bg-white/50 hover:bg-white text-slate-500 flex items-center justify-center transition-all shadow-sm lg:hidden"
                        aria-label="Buka menu navigasi"
                    >
                        <Menu size={20} />
                    </button>
                )}

                {activeView !== 'menu' && (
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-white/50 hover:bg-white text-slate-500 flex items-center justify-center transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        {activeView === 'menu' && <>Hi, <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-violet-600">{name}</span></>}
                        {activeView === 'history' && "Riwayat Transaksi"}
                        {activeView === 'favorites' && "Menu Favorit"}
                        {activeView === 'profile' && "Profil Pengguna"}
                        {activeView === 'settings' && "Pengaturan Sistem"}
                    </h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        {activeView === 'menu' && "Siap melayani pesanan hari ini?"}
                        {activeView === 'history' && "Pantau semua aktivitas penjualan hari ini"}
                        {activeView === 'favorites' && "Akses cepat ke menu terlaris"}
                        {activeView === 'profile' && "Informasi shift dan kinerja Anda"}
                        {activeView === 'settings' && "Kelola perangkat kasir"}
                    </p>
                </div>
            </div>

            {activeView === 'menu' && (
                <div className="relative group z-20 w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Cari menu..."
                        className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 focus:border-indigo-300 focus:bg-white/80 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-400 text-slate-700 text-sm"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            )}
        </header>
    );
}
