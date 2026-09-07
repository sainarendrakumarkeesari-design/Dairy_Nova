/* ==========================================================================
   DAIRY NOVA - Progressive Web App Service Worker
   Enables offline caching and instant loading on mobile devices
   ========================================================================== */

const CACHE_NAME = 'dairy-nova-v2.5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './testing.html',
  './farmer-auth.html',
  './manifest.json',
  './css/style.css',
  './css/components.css',
  './js/app.js',
  './js/audio.js',
  './js/charts.js',
  './js/database.js',
  './js/pricing.js',
  './js/sensors.js',
  './assets/logo.svg',
  './assets/heritage-dairy-bg.jpg',
  './assets/pasture-heritage-bg.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.warn('Cache pre-fetch partial failure, continuing:', err);
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
  // Navigation fallback & cache-first for assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
