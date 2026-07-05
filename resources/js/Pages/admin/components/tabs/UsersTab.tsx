/**
 * Staff management tab for supervisors.
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Edit, Lock, Plus, Save, Trash2, User, X } from 'lucide-react';
import UniversalModal from '../../../../Components/UniversalModal';
import type { StaffMember } from '../../types';

type StaffFormState = {
    name: string;
    username: string;
    role: 'CASHIER' | 'SUPERVISOR';
    is_active: boolean;
    password: string;
    pin: string;
};

const defaultFormState: StaffFormState = {
    name: '',
    username: '',
    role: 'CASHIER',
    is_active: true,
    password: '',
    pin: '',
};

const getRequestErrorMessage = (error: unknown, fallback: string): string => {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const validationErrors = error.response?.data?.errors as Record<string, string[]> | undefined;
    const firstValidationError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;

    return firstValidationError || error.response?.data?.message || fallback;
};

export default function UsersTab() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showResetPinModal, setShowResetPinModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [formState, setFormState] = useState<StaffFormState>(defaultFormState);
    const [pinValue, setPinValue] = useState('');
    const [currentCredential, setCurrentCredential] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const sortedStaff = useMemo(() => staff, [staff]);
    const isCredentialChange = Boolean(selectedStaff && (formState.password.trim() || formState.pin.trim()));

    useEffect(() => {
        let isActive = true;

        const fetchStaff = async () => {
            try {
                const response = await axios.get('/api/admin/staff');
                if (!isActive) {
                    return;
                }
                setStaff(response.data?.data ?? []);
            } catch (error) {
                if (!isActive) {
                    return;
                }
                setErrorMessage('Gagal memuat data staf.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchStaff();

        return () => {
            isActive = false;
        };
    }, []);

    const handleOpenCreate = () => {
        setSelectedStaff(null);
        setFormState(defaultFormState);
        setCurrentCredential('');
        setErrorMessage(null);
        setShowFormModal(true);
    };

    const handleOpenEdit = (user: StaffMember) => {
        setSelectedStaff(user);
        setFormState({
            name: user.name,
            username: user.username,
            role: user.role,
            is_active: user.is_active,
            password: '',
            pin: '',
        });
        setCurrentCredential('');
        setErrorMessage(null);
        setShowFormModal(true);
    };

    const handleOpenResetPin = (user: StaffMember) => {
        setSelectedStaff(user);
        setPinValue('');
        setCurrentCredential('');
        setErrorMessage(null);
        setShowResetPinModal(true);
    };

    const handleOpenDelete = (user: StaffMember) => {
        setSelectedStaff(user);
        setCurrentCredential('');
        setErrorMessage(null);
        setShowDeleteModal(true);
    };

    const handleChange = (field: keyof StaffFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = field === 'is_active' ? (event.target as HTMLInputElement).checked : event.target.value;
        setFormState(state => ({
            ...state,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        if (isSaving) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        const payload: Record<string, string | boolean> = {
            name: formState.name.trim(),
            username: formState.username.trim(),
            role: formState.role,
            is_active: formState.is_active,
        };

        if (formState.password.trim()) {
            payload.password = formState.password.trim();
        }

        if (formState.pin.trim()) {
            payload.pin = formState.pin.trim();
        }

        if (isCredentialChange) {
            payload.current_credential = currentCredential;
        }

        try {
            if (selectedStaff) {
                const response = await axios.put(`/api/admin/staff/${selectedStaff.id}`, payload);
                const updated = response.data?.data;
                setStaff(items => items.map(item => (item.id === updated.id ? updated : item)));
            } else {
                const response = await axios.post('/api/admin/staff', payload);
                const created = response.data?.data;
                setStaff(items => [created, ...items]);
            }

            setShowFormModal(false);
        } catch (error) {
            setErrorMessage(getRequestErrorMessage(error, 'Gagal menyimpan data staf.'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPin = async () => {
        if (!selectedStaff || isSaving) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const response = await axios.post(`/api/admin/staff/${selectedStaff.id}/reset-pin`, {
                pin: pinValue,
                current_credential: currentCredential,
            });
            const updated = response.data?.data;
            setStaff(items => items.map(item => (item.id === updated.id ? updated : item)));
            setShowResetPinModal(false);
        } catch (error) {
            setErrorMessage(getRequestErrorMessage(error, 'Gagal reset PIN staf.'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedStaff || isSaving) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            await axios.delete(`/api/admin/staff/${selectedStaff.id}`, {
                data: { current_credential: currentCredential },
            });
            setStaff(items => items.filter(item => item.id !== selectedStaff.id));
            setShowDeleteModal(false);
        } catch (error) {
            setErrorMessage(getRequestErrorMessage(error, 'Gagal menghapus staf.'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            {errorMessage ? (
                <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-semibold">
                    {errorMessage}
                </div>
            ) : null}

            <div className="flex flex-col gap-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-4xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Daftar Pengguna</h3>
                    <p className="text-xs text-slate-500">Kelola akses Kasir dan Supervisor.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all sm:w-auto"
                >
                    <Plus size={18} /> Tambah Staf Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-white/50 backdrop-blur-md border border-white/60 rounded-4xl p-6 shadow-sm animate-pulse">
                            <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ))
                ) : (sortedStaff.length ? (
                    sortedStaff.map(user => (
                        <div key={user.id} className="bg-white/50 backdrop-blur-md border border-white/60 rounded-4xl p-6 shadow-sm relative group hover:bg-white/70 transition-all min-w-0">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${user.role === 'SUPERVISOR' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    <User size={24} />
                                </div>
                                <div className={`px-3 py-1 text-[10px] font-bold rounded-full border ${user.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}>
                                    {user.status === 'ACTIVE' ? 'AKTIF' : 'NON-AKTIF'}
                                </div>
                            </div>

                            <h4 className="font-bold text-lg text-slate-800 wrap-break-word">{user.name}</h4>
                            <p className="text-sm text-slate-500 mb-4 wrap-break-word">@{user.username} • {user.role}</p>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
                                <CheckCircle size={12} /> Login Terakhir: {user.lastLogin}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleOpenResetPin(user)}
                                    className="flex-1 min-w-35 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-2"
                                >
                                    <Lock size={14} /> Reset PIN
                                </button>
                                <button
                                    onClick={() => handleOpenEdit(user)}
                                    className="shrink-0 py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleOpenDelete(user)}
                                    className="shrink-0 py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-slate-400">Belum ada staf.</div>
                ))}
            </div>

            {showFormModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">
                                    {selectedStaff ? 'Edit Staf' : 'Tambah Staf Baru'}
                                </h3>
                                <p className="text-sm text-slate-500">Lengkapi informasi staf di bawah ini.</p>
                            </div>
                            <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar-light space-y-6">
                            {errorMessage ? (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                                    {errorMessage}
                                </div>
                            ) : null}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Staf</label>
                                    <input
                                        type="text"
                                        value={formState.name}
                                        onChange={handleChange('name')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="Nama lengkap"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={formState.username}
                                        onChange={handleChange('username')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                                    <select
                                        value={formState.role}
                                        onChange={handleChange('role')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    >
                                        <option value="CASHIER">CASHIER</option>
                                        <option value="SUPERVISOR">SUPERVISOR</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={formState.password}
                                        onChange={handleChange('password')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="Min. 8 karakter, huruf besar, angka, simbol"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PIN</label>
                                    <input
                                        type="text"
                                        value={formState.pin}
                                        onChange={handleChange('pin')}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="6 digit"
                                    />
                                </div>

                                {isCredentialChange ? (
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Konfirmasi Supervisor
                                        </label>
                                        <input
                                            type="password"
                                            value={currentCredential}
                                            onChange={(event) => setCurrentCredential(event.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            placeholder="Password atau PIN Anda saat ini"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                ) : null}

                                <div className="sm:col-span-2 flex items-center gap-3">
                                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={formState.is_active}
                                            onChange={handleChange('is_active')}
                                            className="size-4 accent-indigo-600"
                                        />
                                        Aktif
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowFormModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || (isCredentialChange && !currentCredential.trim())}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {showResetPinModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">Reset PIN Staf</h3>
                                <p className="text-sm text-slate-500">Masukkan PIN baru untuk {selectedStaff?.name}.</p>
                            </div>
                            <button onClick={() => setShowResetPinModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            {errorMessage ? (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                                    {errorMessage}
                                </div>
                            ) : null}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">PIN Baru</label>
                                <input
                                    type="text"
                                    value={pinValue}
                                    onChange={(event) => setPinValue(event.target.value)}
                                    className="mt-2 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="6 digit yang tidak berulang atau berurutan"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Konfirmasi Supervisor</label>
                                <input
                                    type="password"
                                    value={currentCredential}
                                    onChange={(event) => setCurrentCredential(event.target.value)}
                                    className="mt-2 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="Password atau PIN Anda saat ini"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowResetPinModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleResetPin}
                                disabled={isSaving || pinValue.length !== 6 || !currentCredential.trim()}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Reset PIN'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <UniversalModal
                isOpen={showDeleteModal}
                title="Hapus staf?"
                description="Aksi ini akan menghapus akses staf secara permanen."
                tone="danger"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                isConfirmDisabled={isSaving || !currentCredential.trim()}
                isLoading={isSaving}
            >
                <div className="space-y-3">
                    {errorMessage ? (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                            {errorMessage}
                        </div>
                    ) : null}
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Konfirmasi Supervisor</label>
                    <input
                        type="password"
                        value={currentCredential}
                        onChange={(event) => setCurrentCredential(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        placeholder="Password atau PIN Anda saat ini"
                        autoComplete="current-password"
                    />
                </div>
            </UniversalModal>
        </div>
    );
}
