self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Basic pass-through for PWA install requirement
  e.respondWith(
    fetch(e.request).catch(() => {
      return new Response("App is offline.");
    })
  );
});
