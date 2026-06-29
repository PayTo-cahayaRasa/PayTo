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

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');

    const [storeName, setStoreName] = useState("PayTo");
    const [discountLimit, setDiscountLimit] = useState(20);
    const [allowNegativeStock, setAllowNegativeStock] = useState(false);

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLargeScreen, setIsLargeScreen] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [adminProfile, setAdminProfile] = useState(ADMIN_PROFILE);

    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('pos_logged_in') === 'true';
        const role = localStorage.getItem('pos_role');
    }, []);

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
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        try {
            await axios.post('/api/pos/logout');
        } catch (error) {
            // silent
        }

        localStorage.removeItem('pos_logged_in');
        localStorage.removeItem('pos_role');
        window.location.assign('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(state => !state);
    };

    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] flex font-sans text-slate-800 overflow-x-hidden overflow-y-hidden relative selection:bg-indigo-500 selection:text-white">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
            <div className="absolute bottom-[0%] left-[0%] w-[30%] h-[30%] bg-blue-200 rounded-full blur-[100px] opacity-30"></div>

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
                    className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
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

                <div className="flex-1 min-w-0 overflow-y-auto px-4 pb-8 custom-scrollbar-light sm:px-6 lg:px-8">
                    {activeTab === 'DASHBOARD' && <DashboardTab />}
                    {activeTab === 'PROFILE' && <ProfileTab profile={adminProfile} />}
                    {activeTab === 'PRODUCTS' && <ProductsTab />}
                    {activeTab === 'INVENTORY' && <InventoryTab />}
                    {activeTab === 'RECEIPT' && <ReceiptTab />}
                    {activeTab === 'APPROVALS' && <ApprovalsTab />}
                    {activeTab === 'USERS' && <UsersTab />}
                    {activeTab === 'SETTINGS' && (
                        <SettingsTab
                            storeName={storeName}
                            onChangeStoreName={setStoreName}
                            discountLimit={discountLimit}
                            onChangeDiscountLimit={setDiscountLimit}
                            allowNegativeStock={allowNegativeStock}
                            onToggleAllowNegativeStock={() => setAllowNegativeStock(!allowNegativeStock)}
                        />
                    )}
                </div>
            </main>

            <UniversalModal
                isOpen={showLogoutModal}
                title="Keluar dari Admin?"
                description="Anda akan keluar dari dashboard admin."
                tone="warning"
                confirmLabel="Ya, Keluar"
                cancelLabel="Batal"
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />
        </div>
    );
}
