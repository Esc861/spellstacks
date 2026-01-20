// Spellstacks Service Worker - minimal, no caching
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
    // Clear any old caches
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(fetch(e.request));
});
