import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Ad {
  id: string;
  title: string;
  bannerUrl: string;
  targetUrl: string;
  placement: 'home_top' | 'home_bottom' | 'explore_sidebar' | 'about_bottom';
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
          if (!a.enabled || a.placement !== placement) return false;
          const start = new Date(a.startDate);
          const end = new Date(a.endDate);
          return start <= now && end >= now;
        });

        if (matches.length > 0) {
          // Select random active campaign if multiple match the same slot
          const chosen = matches[Math.floor(Math.random() * matches.length)];
          setAd(chosen);

          // Track ad view/impression
          void api.trackAdView(chosen.id);
        }
      } catch {
        // fail silently
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

  return (
    <div className="w-full my-4 overflow-hidden rounded-2xl border border-zinc-200/50 shadow-sm bg-white p-1 animate-fade-up">
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block group"
      >
        <div className="relative aspect-[3/1] md:aspect-[5/1] w-full rounded-xl overflow-hidden bg-zinc-50">
          <img
            src={ad.bannerUrl}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {/* Subtle Sponsor badge */}
          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full select-none tracking-wider uppercase">
            Sponsored
          </span>
        </div>
      </a>
    </div>
  );
}
