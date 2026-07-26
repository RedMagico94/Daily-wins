// Daily Wins service worker — offline-first app shell.
// Bump the version to force clients onto new assets.
const CACHE = 'daily-wins-v6';

const APP_SHELL = [
  './',
  'index.html',
  'app.js',
  'manifest.json',
  'icon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache Supabase API traffic — the app has its own offline queue.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Navigations: network first (fresh HTML when online), cache fallback offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // Everything else (own assets, fonts, supabase-js CDN):
  // stale-while-revalidate — instant from cache, refreshed in background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// ============================================
// EVENING REMINDER — push handling
// ============================================
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) { /* non-JSON push */ }

  const title = payload.title || 'Daily Wins';
  const options = {
    body: payload.body || 'Log tonight\'s wins before the day closes.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: payload.tag || 'daily-reminder',
    renotify: false,
    data: { url: payload.url || './' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Focus an existing window rather than opening a second copy.
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
