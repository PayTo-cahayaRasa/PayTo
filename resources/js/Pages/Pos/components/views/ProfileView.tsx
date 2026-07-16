import { Banknote, Clock } from 'lucide-react';

type ProfileViewProps = {
    profile?: {
        displayName?: string;
        role?: string;
        employeeId?: string | null;
        isActive?: boolean;
        totalToday?: number;
        transactionsToday?: number;
        shiftStart?: string | null;
        shiftEnd?: string | null;
        shiftDuration?: string | null;
        target?: number;
        progressPercent?: number;
    };
};

const isShiftInformationVisible = false;

export default function ProfileView({ profile = {} }: ProfileViewProps) {
    const totalToday = profile.totalToday ?? 0;
    const target = profile.target ?? 100000;
    const progress = profile.progressPercent ?? 0;

    return (
        <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar-light animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-4xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName ?? 'Kasir')}`} alt={profile.displayName ?? 'Kasir'} className="w-full h-full rounded-full object-cover bg-slate-100" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{profile.displayName ?? 'Kasir'}</h2>
                            <p className="text-slate-500 font-medium">{profile.role ?? 'Kasir'} • ID: {profile.employeeId ?? '—'}</p>
                            <div className="flex gap-2 mt-3">
                                <span className={`px-3 py-1 ${profile.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'} text-xs font-bold rounded-lg border flex items-center gap-1`}>
                                    <div className={`w-2 h-2 rounded-full ${profile.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    {profile.isActive ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-4xl p-6 shadow-sm flex flex-col justify-center gap-4">
                    <div className="flex justify-between items-center">
                        <div className="text-slate-500 text-sm font-medium">Total Penjualan Hari Ini</div>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Banknote size={18} /></div>
                    </div>
                    <div className="text-3xl font-mono font-bold text-slate-800">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalToday)}</div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Target: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(target)}</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                {isShiftInformationVisible && (<div className="md:col-span-2 bg-white/40 backdrop-blur-md border border-white/60 rounded-4xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" /> Informasi Shift
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                            <div className="text-xs text-slate-500 mb-1">Jam Masuk</div>
                            <div className="font-bold text-lg text-slate-800">{profile.shiftStart ?? '—'}</div>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                            <div className="text-xs text-slate-500 mb-1">Jam Keluar</div>
                            <div className="font-bold text-lg text-slate-800">{profile.shiftEnd ?? '—'}</div>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                            <div className="text-xs text-slate-500 mb-1">Durasi Kerja</div>
                            <div className="font-bold text-lg text-slate-800">{profile.shiftDuration ?? '—'}</div>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                            <div className="text-xs text-slate-500 mb-1">Transaksi</div>
                            <div className="font-bold text-lg text-slate-800">{profile.transactionsToday ?? 0} Struk</div>
                        </div>
                    </div>
                </div>)}
            </div>
        </div>
    );
}
