import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

interface Ad {
  id: string;
  _id?: string;
  title: string;
  bannerUrl: string;
  targetUrl: string;
  placement: string;
  bannerHeight?: number;
  aspectRatio?: string;
  popupDelay?: number;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

export function AdPopupModal() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout | null = null;

    const checkPopup = async () => {
      try {
        const list = await api.getAdvertisements();
        if (!active || !Array.isArray(list)) return;

        const now = Date.now();
        const matches = list.filter((a: any) => {
          if (a.enabled === false) return false;
          const p = String(a.placement || '').toLowerCase().trim();
          const isPopup =
            p === 'all' ||
            p === 'all_slots' ||
            p === 'popup' ||
            p === 'popup_center' ||
            p === 'popup_bottom_left' ||
            p === 'popup_bottom_right';
          if (!isPopup) return false;

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
          // Find first unshown ad in this session
          const unshown = matches.find((m) => !sessionStorage.getItem(`popup_ad_shown_${m.id || m._id}`));
          const chosen = unshown || matches[0];
          const adKey = `popup_ad_shown_${chosen.id || chosen._id}`;

          if (!sessionStorage.getItem(adKey)) {
            setAd(chosen);
            const delaySec = Math.max(1, Number(chosen.popupDelay) || 2);

            timer = setTimeout(() => {
              if (active) {
                setOpen(true);
                sessionStorage.setItem(adKey, 'true');
                void api.trackAdView(chosen.id || chosen._id || '');
              }
            }, delaySec * 1000);
          }
        }
      } catch {
        // ignore
      }
    };

    void checkPopup();

    const handleSync = () => { void checkPopup(); };
    window.addEventListener('ad_campaign_updated', handleSync);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener('ad_campaign_updated', handleSync);
    };
  }, []);

  if (!ad || !open) return null;

  const handleClick = () => {
    void api.trackAdClick(ad.id || ad._id || '');
    setOpen(false);
  };

  const isCornerLeft = ad.placement === 'popup_bottom_left';
  const isCornerRight = ad.placement === 'popup_bottom_right';
  const isCorner = isCornerLeft || isCornerRight;

  // Render Corner Floating Pop-Up Card
  if (isCorner) {
    return (
      <div
        className={`fixed z-50 bottom-6 ${
          isCornerLeft ? 'left-6' : 'right-6'
        } w-80 sm:w-96 bg-white border border-zinc-200/90 shadow-2xl rounded-3xl overflow-hidden animate-fade-up`}
      >
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden">
            <img src={ad.bannerUrl} alt={ad.title} className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 text-[8px] font-bold uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Sponsored
            </span>
          </div>

          <div className="p-4 space-y-3">
            <h4 className="text-sm font-bold font-serif text-zinc-900 leading-snug line-clamp-2">{ad.title}</h4>
            <a
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="block w-full"
            >
              <Button className="w-full rounded-full h-9 text-xs font-bold gap-1.5 shadow">
                Learn More <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render Center Screen Pop-Up Modal
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden bg-white border-0 shadow-2xl animate-fade-up">
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden">
            <img src={ad.bannerUrl} alt={ad.title} className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Sponsored Announcement
            </span>
          </div>

          <div className="p-6 text-center space-y-4">
            <h3 className="text-xl font-bold font-serif text-zinc-900 leading-snug">{ad.title}</h3>
            <a
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="block w-full"
            >
              <Button className="w-full rounded-full h-12 text-sm font-bold gap-2 shadow-lg shadow-primary/20">
                Learn More <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
