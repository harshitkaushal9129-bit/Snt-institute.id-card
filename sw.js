// sw.js - SNT ID Card & Notification Hub
const CACHE_NAME = 'snt-id-v3';
const assets = [
  './',
  './index.html',
  './Notification.html', // Naya page cache mein add kiya
  './Logo (1).jpg',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install & Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Activate & Cleanup
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Logic
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// Push Notification Receive
self.addEventListener('push', event => {
    let data = { 
        title: 'SNT Admin Update', 
        body: 'Naya notice jaari kiya gaya hai!',
        url: './Notification.html' // Default URL set kiya
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data.title = payload.title || data.title;
            data.body = payload.body || data.body;
            data.url = payload.url || data.url;
            data.image = payload.image || null; // Agar Firebase se image aa rahi ho
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: './Logo (1).jpg',
        badge: './Logo (1).jpg',
        image: data.image, // Notification mein badi image dikhane ke liye
        vibrate: [300, 100, 300],
        tag: 'snt-notice-alert',
        renotify: true,
        data: { url: data.url }, // Yaha hum URL pass kar rahe hain
        actions: [
            { action: 'open', title: 'View Notice' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click - Yaha target change kiya gaya hai
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Notification.html open karne ka logic
    const targetUrl = new URL(event.notification.data.url, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Agar pehle se page khula hai toh focus karo
            for (let client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Agar nahi khula toh naya tab open karo
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
