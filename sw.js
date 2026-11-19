// Service worker: guarda la "carcasa" de la app para que abra al instante y se pueda instalar.
// Los datos (mensajes) siempre van por la red: nunca se guardan aquí.
const VERSION = 'equipo-v1';
const CARCASA = ['./', 'index.html', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png', 'icono-maskable-512.png', 'apple-touch-icon.png', 'favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CARCASA))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // API, Drive, etc.: directo a la red
  // Primero la red (para tener siempre la última versión); si no hay conexión, la copia guardada.
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(k => k.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
