// sw.js - SNT ID Card Generator
const CACHE_NAME = 'snt-id-v2'; // Version update kiya hai
const assets = [
  './',
  './index.html',
  './Logo (1).jpg',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install Service Worker & Cache Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(assets);
    })
  );
});

// Activate & Cleanup Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Logic (Offline Support)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Push Notification Logic
self.addEventListener('push', event => {
    let data = { title: 'SNT ID Hub', body: 'ID Card Generate Karne Ke Liye Click Karein!' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'SNT ID Hub', body: event.data.text() };
        }
    }

    const options = {
        body: data.body,
        icon: './Logo (1).jpg',
        badge: './Logo (1).jpg', // Ideal case mein ye transparent honi chahiye
        vibrate: [200, 100, 200],
        tag: 'snt-id-notif',
        renotify: true,
        data: { url: data.url || './index.html' },
        actions: [
            { action: 'open', title: 'Open Generator' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click Logic
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
