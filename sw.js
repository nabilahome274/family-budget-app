// Minimal service worker — enables "Add to Home Screen" install prompt
// and caches the app shell so the form still opens even with a weak connection.
// (Form submission itself still needs internet, since it talks to Google Sheets.)

const CACHE_NAME = 'family-budget-v2';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first for the Apps Script API calls; cache-first for app shell files.
  if (event.request.url.includes('script.google.com')) {
    return; // let it go straight to network, don't intercept API calls
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
