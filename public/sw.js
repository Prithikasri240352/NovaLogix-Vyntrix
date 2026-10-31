// Service Worker for NoavaLogix PWA & Mobile Web Push Notifications
const CACHE_NAME = 'noavalogix-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
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
    }).then(() => self.clients.claim())
  );
});

// Cache-first for static assets, network-first for others
self.addEventListener('fetch', (event) => {
  // Let API requests bypass cache
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic' ||
          event.request.method !== 'GET'
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// REAL WEB PUSH EVENT HANDLER
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received in background:', event);
  let payload = {
    title: 'NoavaLogix — FDR Expiry Alert',
    body: 'An FDR milestone requires immediate review.',
    fdrId: '',
    url: '/',
    tag: 'noavalogix-alert-' + Date.now(),
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch (e) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.tag || ('noavalogix-' + (payload.fdrId || 'general')),
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url || (payload.fdrId ? `/?fdrId=${payload.fdrId}` : '/'),
      fdrId: payload.fdrId,
      timestamp: Date.now()
    },
    actions: [
      { action: 'view', title: '🔍 Inspect FDR' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options).then(() => {
      // Notify any open client windows
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            payload: payload
          });
        });
      });
    })
  );
});

// NOTIFICATION CLICK HANDLER: NAVIGATE TO SPECIFIC FDR
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  const fdrId = (event.notification.data && event.notification.data.fdrId) || '';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_NAVIGATE',
            url: targetUrl,
            fdrId: fdrId
          });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
