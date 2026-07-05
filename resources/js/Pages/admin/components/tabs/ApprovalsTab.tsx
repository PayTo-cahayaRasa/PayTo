/**
 * Approvals log tab for supervisor actions.
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import UniversalModal from '../../../../Components/UniversalModal';
import type { ApprovalLog } from '../../types';

const statusStyles: Record<ApprovalLog['status'], { badge: string; text: string }> = {
    PENDING: { badge: 'bg-amber-100 border-amber-200', text: 'text-amber-700' },
    APPROVED: { badge: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-700' },
    REJECTED: { badge: 'bg-rose-100 border-rose-200', text: 'text-rose-700' },
};

const actionStyles: Record<ApprovalLog['action'], string> = {
    DISCOUNT_OVERRIDE: 'bg-amber-100 text-amber-600',
    PRICE_OVERRIDE: 'bg-indigo-100 text-indigo-600',
    VOID: 'bg-rose-100 text-rose-600',
    REFUND: 'bg-cyan-100 text-cyan-700',
};

const actionLabels: Record<ApprovalLog['action'], string> = {
    DISCOUNT_OVERRIDE: 'Diskon Override',
    PRICE_OVERRIDE: 'Harga Override',
    VOID: 'Void Transaksi',
    REFUND: 'Refund',
};

export default function ApprovalsTab() {
    const [logs, setLogs] = useState<ApprovalLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [rejectTarget, setRejectTarget] = useState<ApprovalLog | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState<string | null>(null);

    const sortedLogs = useMemo(() => logs, [logs]);

    const fetchApprovals = async () => {
        try {
            const response = await axios.get('/api/admin/approvals');
            setLogs(response.data?.data ?? []);
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage('Gagal memuat data approval.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleApprove = async (log: ApprovalLog) => {
        if (actionLoadingId) {
            return;
        }

        setActionLoadingId(log.id);
        try {
            await axios.post(`/api/admin/approvals/${log.id}/approve`, {
                confirmed: true,
            });
            await fetchApprovals();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message ?? 'Gagal menyetujui approval.')
                : 'Gagal menyetujui approval.';

            setErrorMessage(message);

            if (axios.isAxiosError(error) && error.response?.status === 422) {
                await fetchApprovals();
            }
        } finally {
            setActionLoadingId(null);
        }
    };

    const openRejectModal = (log: ApprovalLog) => {
        setRejectTarget(log);
        setRejectReason('');
        setRejectError(null);
    };

    const handleReject = async () => {
        if (!rejectTarget) {
            return;
        }

        if (rejectReason.trim().length < 5) {
            setRejectError('Alasan penolakan minimal 5 karakter.');
            return;
        }

        setActionLoadingId(rejectTarget.id);
        try {
            await axios.post(`/api/admin/approvals/${rejectTarget.id}/reject`, {
                reason: rejectReason.trim(),
            });
            setRejectTarget(null);
            await fetchApprovals();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message ?? 'Gagal menolak approval.')
                : 'Gagal menolak approval.';

            setRejectError(message);

            if (axios.isAxiosError(error) && error.response?.status === 422) {
                await fetchApprovals();
            }
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            {errorMessage && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 text-sm text-slate-500">
                    Memuat approval supervisor...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {sortedLogs.length === 0 && (
                        <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 text-sm text-slate-500">
                            Belum ada permintaan approval.
                        </div>
                    )}

                    {sortedLogs.map(log => {
                        const statusStyle = statusStyles[log.status];
                        const actionStyle = actionStyles[log.action];
                        const isProcessing = actionLoadingId === log.id;

                        return (
                            <div key={log.id} className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex flex-col gap-3 shadow-sm sm:flex-row sm:items-start">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${actionStyle}`}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <h4 className="font-bold text-slate-800 wrap-break-word">{actionLabels[log.action]}</h4>
                                        <span className="text-xs font-mono text-slate-400">{log.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 wrap-break-word">
                                        Kasir: <span className="font-medium text-slate-800">{log.cashier}</span> •
                                        Alasan: <span className="italic">"{log.reason}"</span>
                                    </p>
                                    {(log.saleInvoice || log.itemsCount || log.total) && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                                            {log.saleInvoice && (
                                                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
                                                    {log.saleInvoice}
                                                </span>
                                            )}
                                            {log.itemsCount !== null && log.itemsCount !== undefined && (
                                                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
                                                    {log.itemsCount} item
                                                </span>
                                            )}
                                            {log.total !== null && log.total !== undefined && (
                                                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
                                                    Rp {new Intl.NumberFormat('id-ID').format(log.total)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {log.approver && log.status !== 'PENDING' && (
                                        <p className="mt-2 text-xs text-slate-500">
                                            Disetujui oleh {log.approver}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${statusStyle.badge} ${statusStyle.text}`}>
                                        {log.status}
                                    </span>
                                    {log.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(log)}
                                                disabled={isProcessing}
                                                className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                            >
                                                <CheckCircle size={14} />
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openRejectModal(log)}
                                                disabled={isProcessing}
                                                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                                            >
                                                <XCircle size={14} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <UniversalModal
                isOpen={Boolean(rejectTarget)}
                title="Tolak Approval"
                description="Masukkan alasan penolakan untuk permintaan ini."
                tone="danger"
                confirmLabel="Tolak Approval"
                cancelLabel="Batal"
                onClose={() => setRejectTarget(null)}
                onConfirm={handleReject}
                isConfirmDisabled={rejectReason.trim().length < 5}
                isLoading={Boolean(actionLoadingId)}
            >
                <div className="space-y-3">
                    {rejectError && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                            {rejectError}
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alasan Penolakan</label>
                        <textarea
                            value={rejectReason}
                            onChange={(event) => setRejectReason(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                            rows={3}
                            placeholder="Tuliskan alasan penolakan"
                        />
                    </div>
                </div>
            </UniversalModal>
        </div>
    );
}
