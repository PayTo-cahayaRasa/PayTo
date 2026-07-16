/**
 * User menu dropdown for profile, settings, and logout.
 */

import React from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import type { AdminProfile } from '../types';

type UserMenuProps = {
    profile: AdminProfile;
    onNavigateProfile: () => void;
    onNavigateSettings: () => void;
    onLogout: () => void;
};

export default function UserMenu({ profile, onNavigateProfile, onNavigateSettings, onLogout }: UserMenuProps) {
    return (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(16rem,calc(100vw-1rem))] rounded-2xl border border-[#eadfcf] bg-[#fffaf3] p-2 shadow-[0_30px_48px_-34px_rgba(58,33,23,0.34)] animate-in slide-in-from-top-2 duration-200">
            <div className="mb-1 rounded-xl border border-[#eadfcf] bg-[#f8f2e7] px-4 py-3">
                <p className="break-words text-sm font-semibold text-[#2f241c]">{profile.name || 'Supervisor'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-[#375c3f]"></span>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#806049]">{profile.role || 'SUPERVISOR'}</p>
                </div>
            </div>
            <button
                onClick={onNavigateProfile}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#6f5948] transition-colors hover:bg-white hover:text-[#2f241c]"
            >
                <User size={16} /> Profil Saya
            </button>
            <button
                onClick={onNavigateSettings}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#6f5948] transition-colors hover:bg-white hover:text-[#2f241c]"
            >
                <Settings size={16} /> Pengaturan
            </button>
            <div className="my-1 h-px bg-[#eadfcf]"></div>
            <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#9d4f40] transition-colors hover:bg-[#fff1ea]"
            >
                <LogOut size={16} /> Logout
            </button>
        </div>
    );
}
