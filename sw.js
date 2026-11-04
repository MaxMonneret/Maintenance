/* Service worker : met en cache l'interface pour un démarrage rapide et hors connexion.
   Les données (/api) et les photos passent toujours par le réseau. */
const VERSION = 'fs-v4-gh';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css', './css/print.css',
  './js/app.js', './js/api.js', './js/i18n.js', './js/ui.js', './js/backup.js',
  './js/views/login.js', './js/views/dashboard.js', './js/views/installed.js', './js/views/reports.js',
  './js/views/report-edit.js', './js/views/report-print.js', './js/views/hours.js', './js/views/settings.js',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return;
  // Réseau d'abord (pour toujours avoir la dernière version), cache en secours
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
