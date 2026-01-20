// Spellstacks Service Worker
const CACHE = 'spellstacks-v7';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/letters.js',
    '/js/dictionary.js',
    '/js/game.js',
    '/data/words.txt',
    '/manifest.json',
    '/icons/icon.svg'
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
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
