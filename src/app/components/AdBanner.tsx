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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await api.getAdvertisements();
        if (!active || !Array.isArray(list)) return;

        const now = new Date();
        const matches = list.filter((a: any) => {
          if (!a.enabled) return false;
          const isSlotMatch = a.placement === 'all' || a.placement === 'all_slots' || a.placement === placement;
          if (!isSlotMatch) return false;
          const start = a.startDate ? new Date(a.startDate) : new Date(0);
          const end = a.endDate ? new Date(a.endDate) : new Date(Date.now() + 365 * 86400000);
          return start <= now && end >= now;
        });

        if (matches.length > 0) {
          // Select random active campaign if multiple match the same slot
          const chosen = matches[Math.floor(Math.random() * matches.length)];
          setAd(chosen);

          // Track ad view/impression
          void api.trackAdView(chosen.id || chosen._id);
        } else {
          setAd(null);
        }
      } catch {
        setAd(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [placement]);

  if (!ad) return null;

  const handleClick = () => {
    void api.trackAdClick(ad.id);
  };

  const bannerHeightStyle = ad.bannerHeight ? `${ad.bannerHeight}px` : undefined;

  return (
    <div className="w-full my-4 flex justify-center">
      <div className="w-full overflow-hidden rounded-2xl border border-zinc-200/50 shadow-sm bg-white p-1 animate-fade-up">
        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block group"
        >
          <div
            className="relative w-full rounded-xl overflow-hidden bg-zinc-50"
            style={{
              height: bannerHeightStyle,
              aspectRatio: !bannerHeightStyle && ad.aspectRatio && ad.aspectRatio !== 'auto' ? ad.aspectRatio : undefined,
            }}
          >
            <img
              src={ad.bannerUrl}
              alt={ad.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {/* Subtle Sponsor badge */}
            <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full select-none tracking-wider uppercase">
              Sponsored
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
