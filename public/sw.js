/**
 * Kill-switch Service Worker.
 *
 * Springs clone bundles call `navigator.serviceWorker.register("/sw.js")`.
 * This file must exist so registration succeeds, then immediately:
 *  1) skip waiting / claim clients
 *  2) delete Cache Storage entries
 *  3) unregister itself
 *
 * It never intercepts fetch — no offline cache, no request hijacking.
 */
/* eslint-disable no-restricted-globals */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (_) {
        /* ignore */
      }

      try {
        await self.clients.claim();
      } catch (_) {
        /* ignore */
      }

      try {
        await self.registration.unregister();
      } catch (_) {
        /* ignore */
      }
    })(),
  );
});

/* Explicitly do not handle fetch — fall through to network. */
