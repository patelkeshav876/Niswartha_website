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
  if (typeof window === 'undefined') return;

  const defaultMediaToCache = [
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600',
    'https://lottie.host/81a91c10-0988-42fa-986c-0e78fbcf19d4/6uVNm3L66h.lottie',
  ];

  precacheMediaUrls(defaultMediaToCache);
}
