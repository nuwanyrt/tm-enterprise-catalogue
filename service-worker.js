/* TM DISTRIBUTOR customer PWA: network-only by design. Private catalogue HTML,
   customer prices, order history and secret links are never written to CacheStorage. */
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Always use the network. Private catalogue responses explicitly bypass the
// browser HTTP cache as well; public icons may use their normal HTTP cache.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith('/go/')) {
    event.respondWith(fetch(new Request(event.request, { cache: 'no-store' })));
    return;
  }
  event.respondWith(fetch(event.request));
});
