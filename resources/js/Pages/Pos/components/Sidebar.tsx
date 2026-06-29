import React from 'react';
import { Clock, LayoutGrid, LogOut, Settings, Star, User } from 'lucide-react';

type SidebarProps = {
    activeView: 'menu' | 'history' | 'favorites' | 'profile' | 'settings';
    showUserMenu: boolean;
    onToggleUserMenu: () => void;
    onNavigate: (view: SidebarProps['activeView']) => void;
    onLogout: () => void;
    userMenuRef: React.RefObject<HTMLDivElement | null>;
};

export default function Sidebar({
    activeView,
    showUserMenu,
    onToggleUserMenu,
    onNavigate,
    onLogout,
    userMenuRef,
}: SidebarProps) {
    return (
        <nav className="w-20 my-4 ml-4 flex flex-col items-center py-6 gap-8 z-30 relative bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-100/20 rounded-[2.5rem]">
            <div className="w-10 h-10 bg-linear-to-tr from-indigo-300 to-violet-200 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-300/50">
                <img src="../storage/logs-removed.png" alt="PayTo Logo" />
            </div>

            <div className="flex flex-col gap-6 w-full px-2 items-center">
                <button
                    onClick={() => onNavigate('menu')}
                    className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeView === 'menu'
                        ? 'bg-white shadow-md text-indigo-600 scale-105'
                        : 'text-slate-400 hover:bg-white/60 hover:text-slate-600'
                        }`}
                >
                    <LayoutGrid size={22} />
                    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Menu</span>
                </button>

                <button
                    onClick={() => onNavigate('history')}
                    className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeView === 'history'
                        ? 'bg-white shadow-md text-indigo-600 scale-105'
                        : 'text-slate-400 hover:bg-white/60 hover:text-slate-600'
                        }`}
                >
                    <Clock size={22} />
                    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Riwayat</span>
                </button>

                <button
                    onClick={() => onNavigate('favorites')}
                    className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeView === 'favorites'
                        ? 'bg-white shadow-md text-indigo-600 scale-105'
                        : 'text-slate-400 hover:bg-white/60 hover:text-slate-600'
                        }`}
                >
                    <Star size={22} fill={activeView === 'favorites' ? 'currentColor' : 'none'} />
                    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Favorit</span>
                </button>
            </div>

            <div className="mt-auto flex flex-col gap-4 mb-2 items-center">
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={onToggleUserMenu}
                        className={`w-10 h-10 rounded-full bg-linear-to-tr from-indigo-100 to-purple-100 p-0.5 shadow-md overflow-hidden hover:ring-2 hover:ring-indigo-200 transition-all ${activeView === 'profile' ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" alt="User" className="w-full h-full bg-white object-cover" />
                    </button>

                    {showUserMenu && (
                        <div className="absolute bottom-12 left-0 w-[min(16rem,calc(100vw-2rem))] bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 animate-in slide-in-from-left-2 duration-200 sm:bottom-0 sm:left-full sm:ml-3 sm:w-64">

                            <button
                                onClick={() => onNavigate('profile')}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-colors text-left"
                            >
                                <User size={16} /> Profil Saya
                            </button>
                            <button
                                onClick={() => onNavigate('settings')}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-colors text-left"
                            >
                                <Settings size={16} /> Pengaturan
                            </button>
                            <div className="h-px bg-slate-200/50 my-1"></div>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left font-medium group"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Keluar / Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
