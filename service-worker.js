const CACHE_NAME = 'nandomode-kanji-cache-v1';
const urlsToCache = [
  './',
  'index.html',
  'vocab.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP&family=MS+Gothic&family=Yu+Gothic&display=swap',
  // Real images for icons
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tori_Gate.svg/48px-Tori_Gate.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tori_Gate.svg/72px-Tori_Gate.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tori_Gate.svg/96px-Tori_Gate.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tori_Gate.svg/144px-Tori_Gate.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tori_Gate.svg/168px-Tori_Gate.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tori_Gate.svg/192px-Tori_Gate.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tori_Gate.svg/512px-Tori_Gate.svg.png'
];

// Install event: cache assets during installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache during install');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Cache addAll failed during install:', error);
      })
  );
});

// Fetch event: serve from cache or fetch from network, with specific handling for Google Fonts
self.addEventListener('fetch', event => {
  // Strategy for Google Fonts (Cache First, then Network and Cache)
  if (event.request.url.startsWith('https://fonts.googleapis.com/') ||
      event.request.url.startsWith('https://fonts.gstatic.com/')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('Service Worker: Serving Google Font from cache:', event.request.url);
            return cachedResponse; // Serve from cache if available
          }
          // If not in cache, fetch from network and add to cache
          return fetch(event.request)
            .then(networkResponse => {
              return caches.open(CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching Google Font from network:', event.request.url);
                cache.put(event.request, networkResponse.clone()); // Cache the response
                return networkResponse;
              });
            })
            .catch(error => {
              console.error('Service Worker: Google Font fetch failed:', event.request.url, error);
              // You could provide a fallback response here if desired
              // return new Response('Font not available offline', { status: 503 });
            });
        })
    );
    return; // Stop further processing for font requests
  }

  // Strategy for other assets (Cache First, then Network with fallback)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request)
          .catch(() => {
            console.error('Service Worker: Fetch failed and no cache match for:', event.request.url);
            // If network also fails, you can return a fallback page or a generic error response
            // Example: return caches.match('offline.html'); if you have an offline page
            // For now, it will just throw a network error which might appear as a broken page.
          });
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache version
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
