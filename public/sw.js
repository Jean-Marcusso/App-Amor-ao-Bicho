const CACHE_NAME = 'amor-ao-bicho-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/apple-touch-icon.png'
];

// Instalação do Service Worker e pré-cache dos assets estáticos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
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

// Interceptação de requisições: Network first para navegação, Stale-while-revalidate para recursos estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora requisições de outras origens ou de APIs do Firebase/Google
  if (
    request.method !== 'GET' ||
    !request.url.startsWith(self.location.origin) ||
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  // Para navegação HTML, usa Network First com fallback de Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Para assets, tenta Cache First e atualiza em background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
