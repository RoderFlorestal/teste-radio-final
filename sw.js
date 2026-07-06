const CACHE_NAME = 'radio-r14-v1';
const urlsToCache = [
  './',
  './index.html'
];

// Instala e faz cache do app
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Serve do cache quando offline, atualiza quando online
self.addEventListener('fetch', function(event) {
  // Não intercepta chamadas ao Google Sheets (envio de dados)
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response; // Serve do cache
      }
      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200) {
          return response;
        }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});
