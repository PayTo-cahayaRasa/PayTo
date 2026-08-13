import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import NotificationToast from './NotificationToast';
import { NOTIFICATION_DURATION, type Notification, type NotificationInput, type NotificationType } from './types';

type NotificationContextValue = {
    notify: (input: NotificationInput) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function logDevelopmentError(context: string, error: unknown): void {
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
    }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const nextId = useRef(0);
    const timeouts = useRef(new Map<number, number>());
    const dismiss = useCallback((id: number) => {
        const timeout = timeouts.current.get(id);
        if (timeout !== undefined) {
            window.clearTimeout(timeout);
            timeouts.current.delete(id);
        }
        setNotifications((items) => items.filter((item) => item.id !== id));
    }, []);
    const notify = useCallback(({ message, type = 'info' }: NotificationInput) => {
        const id = nextId.current++;
        setNotifications((items) => [...items, { id, message, type }]);
        timeouts.current.set(id, window.setTimeout(() => dismiss(id), NOTIFICATION_DURATION));
    }, [dismiss]);

    useEffect(() => () => {
        timeouts.current.forEach((timeout) => window.clearTimeout(timeout));
    }, []);

    const withType = useCallback((type: NotificationType) => (message: string) => notify({ message, type }), [notify]);
    const context = { notify, success: withType('success'), error: withType('error'), info: withType('info') };

    return (
        <NotificationContext.Provider value={context}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 sm:right-6 sm:top-6">
                {notifications.map((notification) => <div key={notification.id} className="pointer-events-auto"><NotificationToast notification={notification} onDismiss={dismiss} /></div>)}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification(): NotificationContextValue {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider.');
    }
    return context;
}
