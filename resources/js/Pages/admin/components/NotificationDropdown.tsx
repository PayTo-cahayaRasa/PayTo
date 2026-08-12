/**
 * Notifications dropdown panel for admin header.
 */

import React from 'react';
import { AlertTriangle, BellRing, CheckCircle } from 'lucide-react';
import type { Notification } from '../types';

type NotificationDropdownProps = {
    notifications: Notification[];
};

export default function NotificationDropdown({ notifications }: NotificationDropdownProps) {
    return (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-[1.6rem] border border-[var(--color-cream-200)] bg-[#fffaf3] p-2 shadow-[0_30px_48px_-34px_rgba(58,33,23,0.34)] animate-in slide-in-from-top-2 duration-200 sm:w-80">
            <div className="flex items-center justify-between border-b border-[#f0e4d5] px-4 py-2">
                <h4 className="text-sm font-semibold text-[var(--color-cocoa-900)]">Notifikasi</h4>
                <button className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-leaf-600)] hover:underline">Tandai Dibaca</button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto custom-scrollbar-light">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--color-cocoa-500)]">
                        Tidak ada notifikasi baru.
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className={`flex gap-3 border-b border-[#f6ecdf] p-3 transition-colors hover:bg-white ${!notif.read ? 'bg-[#f8f2e7]' : ''}`}>
                            <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notif.type === 'ALERT' ? 'bg-[#fff0ea] text-[var(--color-danger-500)]' :
                                notif.type === 'SUCCESS' ? 'bg-[#edf5ee] text-[var(--color-leaf-600)]' :
                                    'bg-[#f5eadb] text-[#8e6847]'
                                }`}>
                                {notif.type === 'ALERT' ? <AlertTriangle size={14} /> :
                                    notif.type === 'SUCCESS' ? <CheckCircle size={14} /> :
                                        <BellRing size={14} />}
                            </div>
                            <div className="min-w-0">
                                <p className="break-words text-xs font-semibold text-[var(--color-cocoa-900)]">{notif.title}</p>
                                <p className="my-0.5 break-words text-xs leading-snug text-[var(--color-cocoa-500)]">{notif.message}</p>
                                <p className="text-[10px] text-[#a3886c]">{notif.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <button className="w-full rounded-b-xl py-2 text-xs font-semibold text-[#6f5948] transition-colors hover:bg-[#f7eddc] hover:text-[var(--color-leaf-600)]">
                Lihat Semua Notifikasi
            </button>
        </div>
    );
}
