const LEGACY_CACHE_PREFIX = 'payto-pwa-';

export async function cleanupLegacyPwa(): Promise<void> {
    if (typeof window === 'undefined') {
        return;
    }

    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();

        await Promise.all(
            registrations
                .filter((registration) => registration.scope.startsWith(window.location.origin))
                .map((registration) => registration.unregister()),
        );
    }

    if ('caches' in window) {
        const cacheNames = await window.caches.keys();

        await Promise.all(
            cacheNames
                .filter((cacheName) => cacheName.startsWith(LEGACY_CACHE_PREFIX))
                .map((cacheName) => window.caches.delete(cacheName)),
        );
    }
}
