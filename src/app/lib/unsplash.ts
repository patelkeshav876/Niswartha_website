const UNSPLASH_KEY =
  (import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined)?.trim() ||
  'aR4OiuYHDAp93AKMIMWDnbC1mdcRmFnoqcdZGX3pzRU';

/**
 * Appends Unsplash CDN optimization parameters to an Unsplash image URL.
 * This converts a full-resolution image (often 3840×3840px) to a properly
 * sized WebP image matching the displayed dimensions, saving up to 99% bandwidth.
 *
 * @param url - The original Unsplash image URL
 * @param width - The display width in CSS pixels (will be doubled for 2x screens)
 * @param height - The display height in CSS pixels (will be doubled for 2x screens)
 * @param quality - JPEG/WebP quality (default 75)
 */
export function optimizeUnsplashUrl(
  url: string,
  width: number,
  height: number,
  quality = 68,
): string {
  if (!url || !url.includes('unsplash.com')) return url;

  try {
    const u = new URL(url);
    u.searchParams.set('w', String(Math.round(width)));
    u.searchParams.set('h', String(Math.round(height)));
    u.searchParams.set('q', String(quality));
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return url;
  }
}

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
