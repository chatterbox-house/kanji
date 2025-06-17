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

// Install event: cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve from cache or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).catch(() => {
          // If network also fails, you can return a fallback page
          // For now, it will just throw a network error
          console.error('Fetch failed and no cache match for:', event.request.url);
          // Example: return caches.match('offline.html'); if you have an offline page
        });
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
