const CACHE_NAME = 'padaria-lamim-dashboard-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './supabase-config.js',
  './favicon.ico',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usar Promise.allSettled para garantir que a instalação não falhe se um único asset falhar ao carregar.
      return Promise.allSettled(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`Falha ao cachear asset: ${asset}`, err);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
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

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  // Para navegações, responder com rede-primeiro e fallback para cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match('./index.html').then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match('./').then((cachedResponseDir) => {
            if (cachedResponseDir) return cachedResponseDir;
            return new Response(
              "Sem conexão com a internet.",
              { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
            );
          });
        });
      })
    );
    return;
  }

  // Para outros recursos estáticos, usar stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        }
        return networkResponse;
      }).catch((err) => {
        if (cachedResponse) return cachedResponse;
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// --- WEB PUSH NOTIFICATIONS ---
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Novo Pedido!', body: event.data.text() };
    }
  }

  const title = data.title || 'Novo Pedido Recebido!';
  const options = {
    body: data.body || 'Toque para gerenciar o novo pedido da Padaria Lamim.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
    data: {
      url: data.url || './index.html'
    },
    actions: [
      { action: 'open', title: 'Abrir Painel' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  let targetUrl = './index.html';
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
