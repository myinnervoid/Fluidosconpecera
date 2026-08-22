/**
 * AETHERIA | Offline Service Worker (Cache-First Strategy)
 */

const CACHE_NAME = 'aetheria-v1.1.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './assets/palettes.js',
  './assets/LDR_LLL1_0.png',
  './js/original/fluidCore.js',
  './js/extensions/customCursor.js',
  './js/extensions/symmetry.js',
  './js/extensions/fidgets.js',
  './js/extensions/sandMode.js',
  './js/extensions/ui.js',
  './js/main.js'
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
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
