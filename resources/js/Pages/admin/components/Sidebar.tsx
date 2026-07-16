/**
 * Admin sidebar with primary navigation and logout action.
 */

import React from 'react';
import { router } from '@inertiajs/react';
import { LayoutDashboard, Package, Users, Settings, ShoppingBag, LogOut, ShoppingCart } from 'lucide-react';
import type { AdminTab } from '../types';
import SidebarItem from './SidebarItem';

type SidebarProps = {
    activeTab: AdminTab;
    onChangeTab: (tab: AdminTab) => void;
    onLogout: () => void;
};

export default function Sidebar({ activeTab, onChangeTab, onLogout }: SidebarProps) {
    return (
        <aside className="z-20 my-3 ml-3 flex h-[calc(100vh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-72 flex-col rounded-[2rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.97),rgba(247,240,229,0.95))] p-4 shadow-[0_32px_62px_-38px_rgba(58,33,23,0.3)] sm:m-4 sm:h-[calc(100vh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-[2.5rem] sm:p-6 lg:w-72 lg:max-w-72">
            <div className="flex items-center gap-3 px-1 sm:px-2 mb-8 sm:mb-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3d281b] text-white shadow-[0_18px_34px_-24px_rgba(61,40,27,0.78)]">
                    <LayoutDashboard size={20} />
                </div>
                <div>
                    <h1 className="text-base font-semibold leading-tight tracking-[-0.03em] text-[#2f241c] sm:text-lg">
                        Supervisor Panel
                    </h1>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8e6847]">Cahaya Rasa control</p>
                </div>
            </div>

            <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto custom-scrollbar-light pr-1 sm:pr-2">
                <SidebarItem
                    icon={LayoutDashboard}
                    label="Dashboard"
                    id="DASHBOARD"
                    isActive={activeTab === 'DASHBOARD'}
                    onClick={() => onChangeTab('DASHBOARD')}
                />
                <SidebarItem
                    icon={ShoppingBag}
                    label="Manajemen Barang"
                    id="PRODUCTS"
                    isActive={activeTab === 'PRODUCTS'}
                    onClick={() => onChangeTab('PRODUCTS')}
                />
                <SidebarItem icon={ShoppingCart} label="Pesanan Online" id="ONLINE_ORDERS" isActive={false} onClick={() => router.visit('/pesanan-online')} />
                <SidebarItem
                    icon={Package}
                    label="Smart Inventory"
                    id="INVENTORY"
                    isActive={activeTab === 'INVENTORY'}
                    onClick={() => onChangeTab('INVENTORY')}
                />
                <div className="pt-4 pb-2">
                    <div className="mx-4 h-px bg-[#e3d5c3]"></div>
                </div>
                <SidebarItem
                    icon={Users}
                    label="Staff Management"
                    id="USERS"
                    isActive={activeTab === 'USERS'}
                    onClick={() => onChangeTab('USERS')}
                />
                <SidebarItem
                    icon={Settings}
                    label="App Settings"
                    id="SETTINGS"
                    isActive={activeTab === 'SETTINGS'}
                    onClick={() => onChangeTab('SETTINGS')}
                />
            </nav>

            <button
                onClick={onLogout}
                className="mt-auto flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#9d4f40] transition-colors hover:bg-[#fff1ea]"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </aside>
    );
}
