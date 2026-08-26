/**
 * AETHERIA | Offline Service Worker (Network-First with Offline Cache Fallback)
 */

const CACHE_NAME = 'aetheria-v3.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './assets/palettes.js',
  './assets/LDR_LLL1_0.png',
  './js/original/fluidCore.js',
  './js/extensions/particleFx.js',
  './js/extensions/audioEngine.js',
  './js/extensions/customCursor.js',
  './js/extensions/swarmEngine.js',
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
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
