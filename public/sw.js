const CACHE_NAME = 'tv-hub-shell-v1'
const APP_SCOPE = '/tv-hub/'
const SHELL_URLS = [
  APP_SCOPE,
  `${APP_SCOPE}index.html`,
  `${APP_SCOPE}manifest.webmanifest`,
  `${APP_SCOPE}icon-192.svg`,
  `${APP_SCOPE}icon-512.svg`,
]
const SHELL_ASSET = /\.(?:css|js|mjs|svg|webmanifest|ico|png|jpg|jpeg|webp|woff2?)$/

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('tv-hub-shell-') && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_SCOPE)) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(`${APP_SCOPE}index.html`, copy))
          return response
        })
        .catch(() => caches.match(`${APP_SCOPE}index.html`).then((cached) => cached ?? Response.error())),
    )
    return
  }

  // Only cache first-party application assets, never arbitrary same-origin data/media.
  if (!SHELL_ASSET.test(url.pathname)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
