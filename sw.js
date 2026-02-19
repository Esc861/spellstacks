// Spellstacks Service Worker
const CACHE = 'spellstacks-v41';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/letters.js',
    '/js/dictionary.js',
    '/js/game.js',
    '/data/words.txt',
    '/manifest.json',
    '/logo-sm.png',
    '/logo-sm.webp',
    '/logo-sm@2x.png',
    '/logo-sm@2x.webp',
    '/logo-md.png',
    '/logo-md.webp',
    '/logo-md@2x.png',
    '/logo-md@2x.webp',
    '/icons/icon-192.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Update cache with fresh response
                const clone = response.clone();
                caches.open(CACHE).then(cache => cache.put(e.request, clone));
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
