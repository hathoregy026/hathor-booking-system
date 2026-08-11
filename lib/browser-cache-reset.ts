/**
 * Client-only helpers to drop stale Service Workers and Cache Storage.
 * Safe to call on every public page load — never registers a caching SW.
 */

export async function unregisterServiceWorkers(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  } catch {
    /* ignore */
  }
}

export async function clearCacheStorage(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch {
    /* ignore */
  }
}

async function clearIndexedDatabases(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const anyIdb = indexedDB as IDBFactory & {
      databases?: () => Promise<Array<{ name?: string }>>;
    };
    if (typeof anyIdb.databases !== "function") return;
    const dbs = await anyIdb.databases();
    await Promise.all(
      dbs.map(
        (db) =>
          new Promise<void>((resolve) => {
            const name = db.name;
            if (!name) {
              resolve();
              return;
            }
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
            req.onblocked = () => resolve();
          }),
      ),
    );
  } catch {
    /* ignore */
  }
}

/** Unregister SWs + wipe Cache Storage + IndexedDB (HTTP disk cache is separate). */
export async function resetBrowserAppCaches(): Promise<void> {
  await Promise.all([
    unregisterServiceWorkers(),
    clearCacheStorage(),
    clearIndexedDatabases(),
  ]);
}

/**
 * Inline boot snippet for PublicLayout (runs before React hydrate).
 * Keep this string free of newlines that would break the script tag.
 */
export function getServiceWorkerKillBootScript(): string {
  return `(function(){try{if("serviceWorker"in navigator){navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister();}));}).catch(function(){});}if("caches"in window){caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k);}));}).catch(function(){});}if(indexedDB&&indexedDB.databases){indexedDB.databases().then(function(dbs){dbs.forEach(function(db){if(db&&db.name)try{indexedDB.deleteDatabase(db.name);}catch(e){}});}).catch(function(){});}}catch(e){}})();`;
}
