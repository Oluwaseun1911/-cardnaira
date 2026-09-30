const CACHE = "cardnaira-v1"
const OFFLINE_URLS = ["/", "/icon-192.png", "/icon-512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS)))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (request.mode === "navigate" || request.url.includes("/_next/static/"))) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  )
})
