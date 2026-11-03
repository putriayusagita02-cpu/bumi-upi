// Bumi Upi Service Worker
const CACHE_NAME = 'bumi-upi-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/brand/Logo_bumi_upi.svg',
  '/brand/tegel-pattern.svg',
  '/brand/illustrations.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback offline message if needed
        return caches.match('/');
      });
    })
  );
});
