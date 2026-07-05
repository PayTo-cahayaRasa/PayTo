/**
 * Admin header with contextual title, notifications, and user menu.
 */

import React from 'react';
import { Bell, Menu } from 'lucide-react';
import type { AdminTab } from '../types';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';
import type { AdminProfile, Notification } from '../types';

type HeaderProps = {
    activeTab: AdminTab;
    showNotifications: boolean;
    onToggleNotifications: () => void;
    showUserMenu: boolean;
    onToggleUserMenu: () => void;
    notificationRef: React.RefObject<HTMLDivElement | null>;
    userMenuRef: React.RefObject<HTMLDivElement | null>;
    notifications: Notification[];
    profile: AdminProfile;
    onNavigateProfile: () => void;
    onNavigateSettings: () => void;
    onLogout: () => void;
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
};

const headerTitleMap: Record<AdminTab, string> = {
    DASHBOARD: 'Overview Hari Ini',
    INVENTORY: 'Smart Inventory Logic',
    RECEIPT: 'Template Struk',
    APPROVALS: 'Audit Log Supervisor',
    USERS: 'Manajemen Staf',
    SETTINGS: 'Pengaturan Aplikasi',
    PRODUCTS: 'Katalog & Stok Barang',
    PROFILE: 'Profil Admin',
};

const headerSubtitleMap: Record<AdminTab, string> = {
    DASHBOARD: 'Pantau performa toko secara real-time.',
    INVENTORY: 'Rekomendasi restock otomatis berdasarkan rata-rata penjualan 7 hari.',
    RECEIPT: 'Atur tampilan struk yang dicetak di kasir.',
    APPROVALS: 'Audit log approval untuk aksi sensitif.',
    USERS: 'Kelola akses login untuk Kasir dan Supervisor.',
    SETTINGS: 'Konfigurasi toko dan parameter sistem POS.',
    PRODUCTS: 'Kelola master produk, stok, harga, dan diskon.',
    PROFILE: 'Kelola informasi akun dan PIN keamanan Anda.',
};

export default function Header({
    activeTab,
    showNotifications,
    onToggleNotifications,
    showUserMenu,
    onToggleUserMenu,
    notificationRef,
    userMenuRef,
    notifications,
    profile,
    onNavigateProfile,
    onNavigateSettings,
    onLogout,
    onToggleSidebar,
    isSidebarOpen,
}: HeaderProps) {
    return (
        <header className="relative z-30 px-4 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 lg:px-8">
            <div className="rounded-[1.75rem] border border-white/60 bg-white/55 backdrop-blur-xl shadow-lg shadow-indigo-100/20 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 min-w-0 sm:items-center">
                        <button
                            onClick={onToggleSidebar}
                            aria-label="Toggle sidebar"
                            aria-expanded={isSidebarOpen}
                            className="lg:hidden w-10 h-10 rounded-xl border border-white/40 bg-white/70 backdrop-blur transition hover:bg-white"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-slate-800 break-words sm:text-2xl">
                                {headerTitleMap[activeTab]}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 break-words">
                                {headerSubtitleMap[activeTab]}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={onToggleNotifications}
                                className="w-10 h-10 bg-white/70 backdrop-blur-sm border border-white/70 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white transition-all shadow-sm relative"
                            >
                                <Bell size={18} />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <NotificationDropdown notifications={notifications} />
                            )}
                        </div>

                        <div className="relative" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={onToggleUserMenu}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-white p-0.5 shadow-md cursor-pointer hover:ring-2 hover:ring-indigo-200 transition-all"
                            >
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Supervisor" className="rounded-full bg-white w-full h-full" alt="Admin" />
                            </button>

                            {showUserMenu && (
                                <UserMenu
                                    profile={profile}
                                    onNavigateProfile={onNavigateProfile}
                                    onNavigateSettings={onNavigateSettings}
                                    onLogout={onLogout}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
