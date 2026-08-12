/**
 * Sidebar navigation item with active styling.
 */

import React from 'react';

type SidebarItemProps = {
    icon: React.ElementType;
    label: string;
    id: string;
    isActive: boolean;
    onClick: () => void;
};

export default function SidebarItem({ icon: Icon, label, id, isActive, onClick }: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`group flex w-full min-w-0 items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${isActive
                ? 'bg-[var(--color-leaf-600)] text-white shadow-[0_20px_36px_-26px_rgba(55,92,63,0.72)]'
                : 'text-[#6f5948] hover:bg-white/70 hover:text-[var(--color-cocoa-900)]'
                }`}
            data-tab-id={id}
        >
            <Icon size={20} className={isActive ? 'stroke-[2.5px]' : ''} />
            <span className="min-w-0 flex-1 font-medium text-sm truncate text-left">{label}</span>
            {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-[#f8ead6]"></div>}
        </button>
    );
}
