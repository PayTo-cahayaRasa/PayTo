/**
 * Main admin page composed from smaller UI components.
 */

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import type { AdminTab } from './types';
import { ADMIN_PROFILE, NOTIFICATIONS_DATA } from './mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardTab from './components/tabs/DashboardTab';
import ProfileTab from './components/tabs/ProfileTab';
import ProductsTab from './components/tabs/ProductsTab';
import InventoryTab from './components/tabs/InventoryTab';
import ReceiptTab from './components/tabs/ReceiptTab';
import ApprovalsTab from './components/tabs/ApprovalsTab';
import UsersTab from './components/tabs/UsersTab';
import SettingsTab from './components/tabs/SettingsTab';
import UniversalModal from '../../Components/UniversalModal';
import { logDevelopmentError, NotificationProvider } from '../../Components/notifications/NotificationProvider';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLargeScreen, setIsLargeScreen] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);
    const [adminProfile, setAdminProfile] = useState(ADMIN_PROFILE);

    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleResize = () => {
            const wide = window.innerWidth >= 1024;
            setIsLargeScreen(wide);
            setIsSidebarOpen(wide);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/admin/profile');
                if (!isActive) {
                    return;
                }
                const payload = response.data?.data;
                if (payload) {
                    setAdminProfile(payload);
                }
            } catch (error) {
                logDevelopmentError('admin profile', error);
                // fallback to mock profile
            }
        };

        fetchProfile();

        return () => {
            isActive = false;
        };
    }, []);

    const handleLogout = () => {
        setShowUserMenu(false);
        setLogoutError(null);
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        setLogoutError(null);

        try {
            await axios.post('/logout');
        } catch (error) {
            logDevelopmentError('admin logout', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : null;

            setLogoutError(message ?? 'Logout gagal. Sesi Anda masih aktif, silakan coba lagi.');
            setIsLoggingOut(false);

            return;
        }

        window.location.assign('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(state => !state);
    };

    return (
        <NotificationProvider>
        <div className="relative flex min-h-screen w-full overflow-x-hidden overflow-y-hidden bg-[radial-gradient(circle_at_top_left,_rgba(248,236,217,0.84),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(219,233,223,0.7),_transparent_30%),linear-gradient(180deg,#f7f0e6_0%,#f2e9dd_100%)] font-sans text-[var(--color-cocoa-900)] selection:bg-[var(--color-leaf-600)] selection:text-white">
            <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(120,89,62,0.09)_0.8px,transparent_0.8px)] [background-size:18px_18px]"></div>
            <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#ede0cb] blur-3xl"></div>
            <div className="pointer-events-none absolute bottom-8 left-8 h-48 w-48 rounded-full bg-[#dce8dd] blur-3xl"></div>

            <div
                className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <Sidebar
                    activeTab={activeTab}
                    onChangeTab={setActiveTab}
                    onLogout={handleLogout}
                />
            </div>

            {!isLargeScreen && isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Tutup sidebar"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-20 bg-[var(--color-cocoa-900)]/28 backdrop-blur-[2px] lg:hidden"
                />
            )}

            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative z-10">
                <Header
                    activeTab={activeTab}
                    showNotifications={showNotifications}
                    onToggleNotifications={() => {
                        setShowNotifications((state) => !state);
                        setShowUserMenu(false);
                    }}
                    showUserMenu={showUserMenu}
                    onToggleUserMenu={() => {
                        setShowUserMenu((state) => !state);
                        setShowNotifications(false);
                    }}
                    notificationRef={notificationRef}
                    userMenuRef={userMenuRef}
                    notifications={NOTIFICATIONS_DATA}
                    profile={adminProfile}
                    onNavigateProfile={() => { setActiveTab('PROFILE'); setShowUserMenu(false); }}
                    onNavigateSettings={() => { setActiveTab('SETTINGS'); setShowUserMenu(false); }}
                    onLogout={handleLogout}
                    onToggleSidebar={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                />

                <div className="custom-scrollbar-light min-w-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8">
                    {activeTab === 'DASHBOARD' && <DashboardTab />}
                    {activeTab === 'PROFILE' && <ProfileTab profile={adminProfile} />}
                    {activeTab === 'PRODUCTS' && <ProductsTab />}
                    {activeTab === 'INVENTORY' && <InventoryTab />}
                    {activeTab === 'RECEIPT' && <ReceiptTab />}
                    {activeTab === 'APPROVALS' && <ApprovalsTab />}
                    {activeTab === 'USERS' && <UsersTab />}
                    {activeTab === 'SETTINGS' && <SettingsTab />}
                </div>
            </main>

            <UniversalModal
                isOpen={showLogoutModal}
                title="Keluar dari Admin?"
                description={logoutError ?? 'Anda akan keluar dari dashboard admin.'}
                tone={logoutError ? 'danger' : 'warning'}
                confirmLabel="Ya, Keluar"
                cancelLabel="Batal"
                isLoading={isLoggingOut}
                onClose={() => {
                    if (!isLoggingOut) {
                        setShowLogoutModal(false);
                    }
                }}
                onConfirm={confirmLogout}
            />
        </div>
        </NotificationProvider>
    );
}
