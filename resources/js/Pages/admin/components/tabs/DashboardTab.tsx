/**
 * Dashboard tab with stats, chart, and activity list.
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import StatCard from '../StatCard';

type WeeklyTrendPoint = {
    date: string;
    total: number;
};

type LowStockItem = {
    id: number;
    name: string;
    sku: string | null;
    stock: number | null;
    safety_stock: number | null;
    reorder_point: number | null;
};

type RecentActivity = {
    id: number;
    title: string;
    amount: number;
    method: string;
    cashier: string;
    time: string;
};

type DashboardPayload = {
    today_sales_total: number;
    today_transactions: number;
    low_stock: {
        total: number;
        items: LowStockItem[];
    };
    weekly_sales_trend: WeeklyTrendPoint[];
    recent_activities: RecentActivity[];
};

const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function DashboardTab() {
    const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        const fetchDashboard = async () => {
            try {
                const response = await axios.get('/api/admin/dashboard');
                if (!isActive) {
                    return;
                }

                setDashboard(response.data?.data ?? null);
            } catch (error) {
                if (!isActive) {
                    return;
                }

                setErrorMessage('Gagal memuat data dashboard.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchDashboard();

        return () => {
            isActive = false;
        };
    }, []);

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }), []);

    const weeklyTrend = dashboard?.weekly_sales_trend ?? [];
    const maxTrend = weeklyTrend.reduce((max, point) => Math.max(max, point.total), 0);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {errorMessage ? (
                <div className="rounded-2xl border border-[#efc9bf] bg-[#fff3ee] px-4 py-3 text-sm font-semibold text-[#a44b39]">
                    {errorMessage}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard
                    title="Total Penjualan Hari Ini"
                    value={currencyFormatter.format(dashboard?.today_sales_total ?? 0)}
                    subtext="Diperbarui otomatis"
                />
                <StatCard
                    title="Total Transaksi Hari Ini"
                    value={(dashboard?.today_transactions ?? 0).toString()}
                    subtext="Transaksi selesai"
                />
                <StatCard
                    title="Butuh Restock"
                    value={`${dashboard?.low_stock?.total ?? 0} Item`}
                    subtext="Stok di bawah batas aman"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="min-h-[300px] rounded-[2rem] border border-[var(--color-cream-200)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(249,243,234,0.92))] p-6 shadow-[0_24px_44px_-36px_rgba(58,33,23,0.28)] lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">Ringkasan mingguan</p>
                            <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[var(--color-cocoa-900)]">Trend Penjualan (7 Hari)</h3>
                        </div>
                        <span className="rounded-full bg-[#edf5ee] px-3 py-1 text-xs font-semibold text-[var(--color-leaf-600)]">Real-time</span>
                    </div>

                    <div className="flex h-48 items-end justify-between gap-4 px-4">
                        {isLoading ? (
                            Array.from({ length: 7 }).map((_, index) => (
                                <div key={index} className="w-full rounded-t-xl bg-[#efe5d8] animate-pulse">
                                    <div className="h-10"></div>
                                </div>
                            ))
                        ) : weeklyTrend.length ? (
                            weeklyTrend.map((point) => {
                                const height = maxTrend > 0 ? Math.round((point.total / maxTrend) * 100) : 0;

                                return (
                                    <div key={point.date} className="group relative w-full rounded-t-xl bg-[#f1e6d7]">
                                        <div
                                            style={{ height: `${height}%` }}
                                            className="absolute bottom-0 w-full rounded-t-xl bg-[var(--color-leaf-600)] transition-all group-hover:bg-[#2f4d35]"
                                        ></div>
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#8d6b4e] opacity-0 transition group-hover:opacity-100">
                                            {currencyFormatter.format(point.total)}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-[1.5rem] border border-dashed border-[var(--color-cream-300)] bg-[#fffdf9] px-4 py-5 text-sm text-[var(--color-cocoa-500)]">
                                Belum ada data penjualan minggu ini.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex justify-between px-2 text-xs font-medium text-[#9b7a5c]">
                        {weeklyTrend.length
                            ? weeklyTrend.map((point) => {
                                const dayIndex = new Date(point.date).getDay();
                                return <span key={point.date}>{dayLabels[dayIndex]}</span>;
                            })
                            : dayLabels.map((label) => <span key={label}>{label}</span>)}
                    </div>
                </section>

                <section className="rounded-[2rem] border border-[var(--color-cream-200)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(249,243,234,0.92))] p-6 shadow-[0_24px_44px_-36px_rgba(58,33,23,0.28)] lg:col-span-1">
                    <h3 className="mb-4 text-xl font-semibold tracking-[-0.03em] text-[var(--color-cocoa-900)]">Aktivitas Terkini</h3>
                    <div className="space-y-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex items-start gap-3 animate-pulse">
                                    <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-[#efe5d8]"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-3/4 rounded bg-[#efe5d8]"></div>
                                        <div className="h-2 w-2/3 rounded bg-[#efe5d8]"></div>
                                    </div>
                                </div>
                            ))
                        ) : dashboard?.recent_activities?.length ? (
                            dashboard.recent_activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf5ee] text-[var(--color-leaf-600)]">
                                        <CheckCircle size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--color-cocoa-900)]">{activity.title}</p>
                                        <p className="text-xs text-[var(--color-cocoa-500)]">
                                            {currencyFormatter.format(activity.amount)} | {activity.method} | {activity.cashier}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-[#a3886c]">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-[1.6rem] border border-dashed border-[var(--color-cream-300)] bg-[#fffdf9] px-4 py-5 text-sm text-[var(--color-cocoa-500)]">
                                Belum ada aktivitas terbaru. Riwayat transaksi dan approval akan muncul di sini setelah operasional berjalan.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <section className="rounded-[2rem] border border-[var(--color-cream-200)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(249,243,234,0.92))] p-6 shadow-[0_24px_44px_-36px_rgba(58,33,23,0.28)]">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">Kontrol stok</p>
                        <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[var(--color-cocoa-900)]">Stok Hampir Habis</h3>
                    </div>
                    <span className="text-xs text-[#8d6b4e]">Top {dashboard?.low_stock?.items?.length ?? 0}</span>
                </div>

                <div className="space-y-3">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 animate-pulse">
                                <div className="h-3 w-1/2 rounded bg-[#efe5d8]"></div>
                                <div className="h-3 w-1/4 rounded bg-[#efe5d8]"></div>
                            </div>
                        ))
                    ) : dashboard?.low_stock?.items?.length ? (
                        dashboard.low_stock.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#f0e4d5] bg-white/75 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-[var(--color-cocoa-900)]">{item.name}</p>
                                    <p className="text-xs text-[#8d6b4e]">{item.sku ?? 'Tanpa SKU'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-[var(--color-danger-500)]">{item.stock ?? 0}</p>
                                    <p className="text-[10px] text-[#a3886c]">stok tersedia</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-[1.6rem] border border-dashed border-[#d8cdbd] bg-[#fffdf9] px-4 py-5 text-sm text-[var(--color-cocoa-500)]">
                            Semua stok aman saat ini. Daftar prioritas restock akan muncul otomatis saat barang mendekati batas aman.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
