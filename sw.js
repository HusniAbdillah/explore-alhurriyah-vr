const CACHE_NAME = 'vt-alhurriyyah-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/css/font-awesome.css',
  '/js/jquery.js',
  '/js/imagedata.js',
  '/js/three.min.js',
  '/js/OrbitControls.js',
  '/images/PetaIPB.png',
  '/images/arrowdown.png',
  '/images/arrowleft.png',
  '/images/arrowright.png',
  '/images/arrowup.png',
  '/images/chevronforward.png',
  '/images/chevronleft.png',
  '/images/chevronright.png',
  '/images/chevrontilted.png',
  '/images/chevronup.png',
  '/images/default.png',
  '/images/tilted.png',
  '/images/white.png',
  '/images/whitetilted.png',
  '/panoramas/Titik_Utama.jpg',
  '/audios/Allison&VexentoBananaBreeze.mp3',
  '/audios/VexentoHome.mp3',
  '/audios/VexentoNoTurningBack.mp3'
];

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.error('Cache installation failed:', error);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        
        if (response) {
          return response;
        }

        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              if (event.request.url.includes('/panoramas/') || 
                  event.request.url.includes('/audios/') ||
                  event.request.url.includes('/images/')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(function() {
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
  }
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Virtual Tour Update', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
