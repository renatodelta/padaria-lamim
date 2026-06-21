const CACHE_NAME = 'padaria-lamim-cliente-cache-v6';
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
  // Apenas requisições GET
  if (e.request.method !== 'GET') {
    return;
  }

  const url = new URL(e.request.url);

  // Apenas interceptar requisições para a nossa própria origem (mesmo domínio)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Interceptar navegação principal ou arquivos estáticos listados nos ASSETS
  const isNavigation = e.request.mode === 'navigate';
  const isAsset = ASSETS.some(asset => {
    const assetPath = asset.startsWith('.') ? asset.slice(1) : asset;
    return url.pathname === assetPath || 
           (url.pathname === '/' && assetPath === '/index.html') || 
           url.pathname.endsWith(assetPath);
  });

  if (!isNavigation && !isAsset) {
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
      // Cria a promessa de busca na rede para atualizar o cache
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        }
        return networkResponse;
      }).catch((err) => {
        if (cachedResponse) return cachedResponse;
        
        // Se falhar rede e não estiver cacheado, retornar fallback
        if (isNavigation) {
          return caches.match('./index.html', { ignoreSearch: true }).then((res) => {
            if (res) return res;
            return caches.match('./', { ignoreSearch: true }).then((resDir) => {
              if (resDir) return resDir;
              return new Response(
                "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Offline</title><style>body{font-family:sans-serif;text-align:center;padding:50px;background:#fefae0;color:#1d1c0d}h1{color:#6d574b}p{color:#4f4540}</style></head><body><h1>Sem Conexão</h1><p>Conecte-se à internet para carregar o aplicativo.</p></body></html>",
                {
                  status: 503,
                  statusText: "Service Unavailable",
                  headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
                }
              );
            });
          });
        }
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
