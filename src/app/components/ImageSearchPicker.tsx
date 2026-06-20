import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

type UnsplashPhoto = {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
  };
};

type UnsplashSearchResponse = {
  results?: UnsplashPhoto[];
};

const UNSPLASH_KEY = (import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined)?.trim() ?? '';

export type ImageSearchPickerProps = {
  value: string;
  onChange: (url: string) => void;
  searchQuery?: string;
};

export function ImageSearchPicker({ value, onChange, searchQuery }: ImageSearchPickerProps) {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const hasKey = UNSPLASH_KEY.length > 0;

  useEffect(() => {
    // If no key, we can't search, but we should let the user know
    if (!hasKey) {
      setResults([]);
      setFetchError(false);
      setLoading(false);
      return;
    }

    const effective = searchText.trim() || (searchQuery?.trim() ?? '');
    if (!effective) {
      setResults([]);
      setFetchError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(false);

    const timer = window.setTimeout(async () => {
      try {
        const url = `https://api.unsplash.com/search/photos?client_id=${encodeURIComponent(UNSPLASH_KEY)}&per_page=9&query=${encodeURIComponent(effective)}`;
        const res = await fetch(url);
        
        if (res.status === 401) {
          throw new Error('Unauthorized: Invalid Unsplash API Key');
        }
        
        if (!res.ok) throw new Error('Unsplash request failed');
        
        const json = (await res.json()) as UnsplashSearchResponse;
        setResults(Array.isArray(json.results) ? json.results : []);
      } catch (err: any) {
        console.error('Unsplash Error:', err);
        setFetchError(true);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [hasKey, searchText, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-search">Search Unsplash Images</Label>
        <div className="relative">
          <Input
            id="image-search"
            placeholder={hasKey ? "Search high-quality photos..." : "API key required for search"}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={cn("rounded-xl pr-10", !hasKey && "bg-muted cursor-not-allowed")}
            disabled={!hasKey}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        {!hasKey && (
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/50">
            ⚠ VITE_UNSPLASH_ACCESS_KEY is missing in your .env file
          </p>
        )}
      </div>

      <div className="relative min-h-[120px]">
        {!loading && fetchError && (
          <div className="text-center py-4 px-3 bg-destructive/5 rounded-xl border border-destructive/10">
            <p className="text-xs text-destructive font-medium">
              API Error: {searchText || searchQuery ? "Could not fetch images. Please check your API key in .env" : "Paste a URL manually below."}
            </p>
          </div>
        )}

        {!loading && !fetchError && results.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {results.map((photo) => {
              const selected = value === photo.urls.regular;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onChange(photo.urls.regular)}
                  className={cn(
                    'relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all duration-300',
                    selected
                      ? 'border-primary ring-4 ring-primary/10 scale-95 shadow-lg'
                      : 'border-transparent hover:border-primary/30 hover:scale-[1.02]',
                  )}
                >
                  <img
                    src={photo.urls.thumb}
                    alt="Unsplash"
                    className="h-full w-full object-cover"
                  />
                  {selected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-xl animate-in zoom-in duration-300">
                        <Check className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
        
        {!loading && hasKey && results.length === 0 && (searchText || searchQuery) && !fetchError && (
          <p className="text-xs text-center text-muted-foreground py-8 italic">
            No images found for "{searchText || searchQuery}"
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-url-manual">Direct Image URL</Label>
        <Input
          id="image-url-manual"
          placeholder="https://images.unsplash.com/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl bg-muted/30 focus:bg-background transition-colors"
        />
        {value && (
          <div className="mt-3 relative rounded-2xl overflow-hidden border shadow-sm group">
            <img
              src={value}
              alt="Preview"
              className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="bg-white/90 text-black text-[10px] font-black uppercase px-2 py-1 rounded-md">Live Preview</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
