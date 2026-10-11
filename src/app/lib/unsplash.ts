const UNSPLASH_KEY =
  (import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined)?.trim() ||
  'aR4OiuYHDAp93AKMIMWDnbC1mdcRmFnoqcdZGX3pzRU';

/**
 * Silently fetches a high-quality relevant image from Unsplash in the background
 * based on the provided title/query.
 * Returns null if network fails, rate-limited, or no results found.
 */
export async function fetchAutoImage(query: string): Promise<string | null> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return null;

  try {
    const url = `https://api.unsplash.com/search/photos?client_id=${encodeURIComponent(
      UNSPLASH_KEY
    )}&per_page=1&orientation=landscape&query=${encodeURIComponent(clean)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data?.results) && data.results.length > 0 && data.results[0]?.urls?.regular) {
      return data.results[0].urls.regular;
    }
  } catch (err) {
    // Fail silently so the UI gracefully falls back to curated theme images
    console.debug('Background photo auto-match failed, using local match:', err);
  }

  return null;
}
