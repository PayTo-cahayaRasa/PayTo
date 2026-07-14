/**
 * Admin sidebar with primary navigation and logout action.
 */

import React from 'react';
import { router } from '@inertiajs/react';
import { LayoutDashboard, Package, Printer, ShieldCheck, Users, Settings, ShoppingBag, LogOut, ShoppingCart } from 'lucide-react';
import type { AdminTab } from '../types';
import SidebarItem from './SidebarItem';

type SidebarProps = {
    activeTab: AdminTab;
    onChangeTab: (tab: AdminTab) => void;
    onLogout: () => void;
};

export default function Sidebar({ activeTab, onChangeTab, onLogout }: SidebarProps) {
    return (
        <aside className="w-[calc(100vw-1.5rem)] max-w-72 h-[calc(100vh-1.5rem)] my-3 ml-3 flex flex-col bg-white/40 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl shadow-indigo-100/20 p-4 z-20 sm:w-[calc(100vw-2rem)] sm:h-[calc(100vh-2rem)] sm:m-4 sm:rounded-[2.5rem] sm:p-6 lg:w-64 lg:max-w-64">
            <div className="flex items-center gap-3 px-1 sm:px-2 mb-8 sm:mb-10">
                <div className="w-10 h-10 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <LayoutDashboard size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-base sm:text-lg leading-tight">Admin<span className="text-indigo-600">Panel</span></h1>
                    <p className="text-[10px] text-slate-500 font-medium">Supervisor Access</p>
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
                <SidebarItem
                    icon={Printer}
                    label="Receipt Settings"
                    id="RECEIPT"
                    isActive={activeTab === 'RECEIPT'}
                    onClick={() => onChangeTab('RECEIPT')}
                />
                <SidebarItem
                    icon={ShieldCheck}
                    label="Approval Logs"
                    id="APPROVALS"
                    isActive={activeTab === 'APPROVALS'}
                    onClick={() => onChangeTab('APPROVALS')}
                />
                <div className="pt-4 pb-2">
                    <div className="h-px bg-slate-200/50 mx-4"></div>
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
                className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors mt-auto font-medium text-sm shrink-0"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </aside>
    );
}
