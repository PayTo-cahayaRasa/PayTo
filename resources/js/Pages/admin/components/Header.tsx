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
        <header className="relative z-30 px-3 pt-3 pb-3 sm:px-6 sm:pt-5 sm:pb-6 lg:px-8">
            <div className="rounded-2xl sm:rounded-[1.75rem] border border-[var(--color-cream-200)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(250,243,233,0.92))] px-3.5 py-3.5 sm:px-5 sm:py-5 shadow-[0_28px_56px_-42px_rgba(58,33,23,0.34)]">
                <div className="flex items-start justify-between gap-2.5 sm:gap-4">
                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 sm:items-center">
                        <button
                            onClick={onToggleSidebar}
                            aria-label="Toggle sidebar"
                            aria-expanded={isSidebarOpen}
                            className="h-10 w-10 shrink-0 rounded-xl border border-[#e3d5c3] bg-white/85 transition hover:bg-white lg:hidden flex items-center justify-center"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8e6847]">
                                Area supervisor
                            </p>
                            <h2 className="break-words text-lg sm:text-2xl lg:text-[2rem] font-semibold tracking-[-0.04em] text-[var(--color-cocoa-900)] leading-tight">
                                {headerTitleMap[activeTab]}
                            </h2>
                            <p className="mt-0.5 sm:mt-1 break-words text-xs sm:text-sm text-[var(--color-cocoa-500)] line-clamp-2 sm:line-clamp-none">
                                {headerSubtitleMap[activeTab]}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={onToggleNotifications}
                                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3d5c3] bg-white/85 text-[#6f5948] shadow-[0_16px_26px_-24px_rgba(58,33,23,0.42)] transition-all hover:bg-white"
                            >
                                <Bell size={18} />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border border-white bg-[#c87153] animate-pulse"></span>
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
                                className="h-10 w-10 cursor-pointer rounded-full bg-[#f4e7d4] p-0.5 shadow-[0_18px_28px_-22px_rgba(58,33,23,0.34)] transition-all hover:ring-2 hover:ring-[#e4d0b7]"
                            >
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Supervisor" className="h-full w-full rounded-full bg-white object-cover" alt="Admin" />
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
