// Client-side Browser Media Cache utility using CacheStorage API

const CACHE_NAME = 'niswartha-media-cache-v1';

export async function precacheMediaUrls(urls: string[]) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    urls.forEach(async (url) => {
      if (!url || !url.startsWith('http')) return;
      try {
        const match = await cache.match(url);
        if (!match) {
          fetch(url, { mode: 'cors' })
            .then((res) => {
              if (res.ok) cache.put(url, res);
            })
            .catch(() => {});
        }
      } catch {
        // Ignore cors or cache errors
      }
    });
  } catch {
    // Ignore cache opening errors
  }
}

export function initMediaCache() {
  // Obsolete precache routine disabled to avoid 403s and conserve mobile bandwidth
}
