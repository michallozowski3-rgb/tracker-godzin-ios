const CACHE_NAME = 'tracker-v3';
const ASSETS = ['/', '/index.html', '/manifest.json', '/sw.js'];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    caches.match(ev.request).then(cached => {
      const network = fetch(ev.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE_NAME).then(c => c.put(ev.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
