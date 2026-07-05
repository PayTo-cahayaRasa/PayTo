/**
 * Mock data for the admin dashboard UI.
 */

import type {
    Notification,
    AdminProfile,
} from './types';

export const NOTIFICATIONS_DATA: Notification[] = [
    { id: 1, title: "Stok Kritis", message: "Croissant Butter & Red Velvet sisa sedikit.", type: 'ALERT', time: "Baru saja", read: false },
    { id: 2, title: "Permintaan Approval", message: "Budi S. meminta void transaksi #INV-2050.", type: 'INFO', time: "10 menit lalu", read: false },
    { id: 3, title: "Transaksi Berhasil", message: "24 transaksi terbaru berhasil dicatat.", type: 'SUCCESS', time: "1 jam lalu", read: true },
];

export const ADMIN_PROFILE: AdminProfile = {
    name: "Siti Aminah",
    role: "SUPERVISOR",
    id: "SPV-001",
    email: "siti.aminah@tokokopi.com",
    phone: "+62 812 3456 7890",
    joinDate: "12 Januari 2024",
    lastLogin: "Hari ini, 08:00 WIB",
};
