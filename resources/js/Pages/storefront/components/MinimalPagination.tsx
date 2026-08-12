import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { MinimalPaginationProps } from '../types';

export function MinimalPagination({ currentPage, totalPages, onPageChange }: MinimalPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-10 flex flex-col gap-4 border-t border-[#f0e4d4] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#8d6b4e] disabled:opacity-40"
            >
                <ChevronLeft size={16} strokeWidth={1.8} />
                Previous
            </button>
            <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                        <button
                            type="button"
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                page === currentPage ? 'bg-[var(--color-cocoa-800)] text-white' : 'text-[#8d6b4e]'
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#8d6b4e] disabled:opacity-40"
            >
                Next
                <ChevronRight size={16} strokeWidth={1.8} />
            </button>
        </div>
    );
}
