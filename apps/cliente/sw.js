const CACHE_NAME = 'padaria-lamim-cliente-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './supabase-config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forçar ativação imediata do novo Service Worker
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(), // Tomar controle das abas ativas na hora
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (e) => {
  // Interceptar apenas requisições GET e esquemas http/https
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
    return;
  }

  // Ignorar requisições ao Supabase e provedores de mapas para garantir dados em tempo real
  if (
    e.request.url.includes('supabase.co') ||
    e.request.url.includes('nominatim.openstreetmap.org') ||
    e.request.url.includes('maps.google.com')
  ) {
    return;
  }

  // Evitar problemas com requisições only-if-cached que não sejam same-origin
  if (e.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // stale-while-revalidate: atualiza cache no background com clone do response
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      return fetch(e.request).then((networkResponse) => {
        // Se a resposta for válida, cachear para o futuro
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        }
        return networkResponse;
      }).catch((err) => {
        // Fallback em caso de falha de rede/offline
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
        throw err;
      });
    })
  );
});
