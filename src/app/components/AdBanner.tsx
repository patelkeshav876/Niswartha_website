import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Ad {
  id: string;
  title: string;
  bannerUrl: string;
  targetUrl: string;
  placement: 'home_top' | 'home_bottom' | 'explore_sidebar' | 'about_bottom';
  bannerHeight?: number;
  aspectRatio?: string;
  customWidth?: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
}

interface Props {
  placement: 'home_top' | 'home_bottom' | 'explore_sidebar' | 'about_bottom';
}

export function AdBanner({ placement }: Props) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadBanner = async () => {
      try {
        const list = await api.getAdvertisements();
        if (!active || !Array.isArray(list)) return;

        const now = Date.now();
        const matches = list.filter((a: any) => {
          if (a.enabled === false) return false;
          const p = String(a.placement || '').toLowerCase().trim();
          const targetP = String(placement || '').toLowerCase().trim();
          const isSlotMatch = p === 'all' || p === 'all_slots' || p === targetP;
          if (!isSlotMatch) return false;

          // Safe day-boundary checking
          if (a.startDate) {
            const s = new Date(a.startDate).setHours(0, 0, 0, 0);
            if (!isNaN(s) && s > now) return false;
          }
          if (a.endDate) {
            const e = new Date(a.endDate).setHours(23, 59, 59, 999);
            if (!isNaN(e) && e < now) return false;
          }
          return true;
        });

        if (matches.length > 0) {
          const chosen = matches[Math.floor(Math.random() * matches.length)];
          setAd(chosen);
          setImgError(false);
          void api.trackAdView(chosen.id || chosen._id);
        } else {
          setAd(null);
        }
      } catch {
        setAd(null);
      }
    };

    void loadBanner();

    const handleSync = () => { void loadBanner(); };
    window.addEventListener('storage', handleSync);
    window.addEventListener('ad_campaign_updated', handleSync);
    return () => {
      active = false;
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ad_campaign_updated', handleSync);
    };
  }, [placement]);

  if (!ad) return null;

  const handleClick = () => {
    void api.trackAdClick(ad.id);
  };

  const bannerHeightStyle = ad.bannerHeight ? `${ad.bannerHeight}px` : '180px';

  return (
    <div className="w-full my-4 flex justify-center">
      <div className="w-full overflow-hidden rounded-2xl border border-zinc-200/80 shadow-sm bg-white p-1 animate-fade-up">
        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block group"
        >
          <div
            className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-zinc-900 via-primary/90 to-zinc-900 flex items-center justify-center"
            style={{
              height: bannerHeightStyle,
              minHeight: '120px',
              aspectRatio: ad.aspectRatio && ad.aspectRatio !== 'auto' ? ad.aspectRatio : undefined,
            }}
          >
            {ad.bannerUrl && !imgError ? (
              <img
                src={ad.bannerUrl}
                alt={ad.title}
                loading="eager"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="p-6 text-center text-white space-y-2 max-w-lg">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
                  Featured Sponsor
                </span>
                <h4 className="font-serif font-bold text-lg sm:text-2xl drop-shadow">{ad.title}</h4>
                <p className="text-xs text-white/90 font-medium">Click to learn more ↗</p>
              </div>
            )}
            {/* Subtle Sponsor badge */}
            <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full select-none tracking-wider uppercase shadow-xs">
              Sponsored
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
