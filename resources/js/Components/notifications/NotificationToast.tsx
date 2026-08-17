import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { Notification } from './types';
import { NOTIFICATION_DURATION } from './types';

type NotificationToastProps = {
    notification: Notification;
    onDismiss: (id: number) => void;
};

const styles = {
    success: { icon: CheckCircle2, accent: 'bg-leaf-500', iconColor: 'text-leaf-600', surface: 'border-leaf-200 bg-[#f7fcf7]' },
    error: { icon: XCircle, accent: 'bg-danger-500', iconColor: 'text-danger-600', surface: 'border-danger-200 bg-[#fff8f6]' },
    info: { icon: Info, accent: 'bg-snack-500', iconColor: 'text-snack-600', surface: 'border-snack-200 bg-[#fffaf3]' },
} as const;

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
    const style = styles[notification.type];
    const Icon = style.icon;

    return (
        <div role={notification.type === 'error' ? 'alert' : 'status'} className={`relative overflow-hidden rounded-2xl border shadow-[0_20px_48px_-28px_rgba(58,33,23,0.45)] ${style.surface} animate-in slide-in-from-right-5 fade-in duration-300 motion-reduce:animate-none`}>
            <div className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
            <div className="flex items-start gap-3 px-4 py-3.5 pl-5">
                <Icon className={`mt-0.5 shrink-0 ${style.iconColor}`} size={20} aria-hidden="true" />
                <p className="min-w-0 flex-1 pr-1 text-sm font-semibold leading-5 text-cocoa-800">{notification.message}</p>
                <button type="button" aria-label="Tutup notifikasi" onClick={() => onDismiss(notification.id)} className="-mr-1 -mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-cocoa-500 transition-colors hover:bg-cocoa-100 hover:text-cocoa-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa-600">
                    <X size={16} aria-hidden="true" />
                </button>
            </div>
            <div className={`h-1 origin-left ${style.accent} notification-progress`} style={{ animationDuration: `${NOTIFICATION_DURATION}ms` }} />
        </div>
    );
}
