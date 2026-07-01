import { flushCheckoutQueue } from './offlineQueue';
import { subscribePushNotifications } from './pushNotifications';

async function unregisterDevelopmentServiceWorkers(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(registrations.map((registration) => registration.unregister()));

    if (!('caches' in window)) {
        return;
    }

    const cacheKeys = await window.caches.keys();

    await Promise.all(
        cacheKeys
            .filter((cacheKey) => cacheKey.startsWith('payto-'))
            .map((cacheKey) => window.caches.delete(cacheKey)),
    );
}

export function initializePwa(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (import.meta.env.DEV || isLocalHost) {
        void unregisterDevelopmentServiceWorkers();
        return;
    }

    const register = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            await subscribePushNotifications(registration);
            await flushCheckoutQueue();

            window.addEventListener('online', () => {
                void flushCheckoutQueue();
            });
        } catch {
            // silent
        }
    };

    if (document.readyState === 'complete') {
        void register();
        return;
    }

    window.addEventListener('load', () => {
        void register();
    });
}
