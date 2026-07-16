/**
 * Dashboard KPI card for a single metric.
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type StatCardProps = {
    title: string;
    value: string;
    subtext: string;
    trend?: 'up' | 'down';
    trendVal?: string;
};

export default function StatCard({ title, value, subtext, trend, trendVal }: StatCardProps) {
    return (
        <div className="rounded-[2rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(249,243,234,0.92))] p-6 shadow-[0_24px_44px_-36px_rgba(58,33,23,0.28)] transition-all hover:-translate-y-px">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6847]">{title}</p>
                    <h3 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-[#2f241c]">{value}</h3>
                </div>
                {trend ? (
                    <div
                        className={`rounded-xl p-2 ${trend === 'up' ? 'bg-[#edf5ee] text-[#375c3f]' : 'bg-[#fff0ea] text-[#b76046]'}`}
                    >
                        {trend === 'up' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs">
                {trend && trendVal ? (
                    <span className={`font-semibold ${trend === 'up' ? 'text-[#375c3f]' : 'text-[#b76046]'}`}>
                        {trend === 'up' ? '+' : ''}{trendVal}
                    </span>
                ) : null}
                <span className="text-[#8d6b4e]">{subtext}</span>
            </div>
        </div>
    );
}
