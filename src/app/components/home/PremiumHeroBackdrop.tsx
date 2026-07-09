import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Premium Hero Backdrop supporting dynamic color gradients, cover images,
 * looping background videos, opacity overlays, and hardware-accelerated parallax shifts.
 */
export function PremiumHeroBackdrop({ children, className }: Props) {
  const [config, setConfig] = useState<any>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const c = await api.getConfig();
        if (active) setConfig(c);
      } catch {
        // fallback
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Performance-optimized native scroll handler for parallax scrolling
  useEffect(() => {
    if (!config?.heroParallax || config.heroBgType === 'gradient') return;
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [config]);

  const bgType = config?.heroBgType || 'gradient';
  const bgUrl = config?.heroBgUrl || '';
  const overlayOpacity = config?.heroOverlayOpacity !== undefined ? Number(config.heroOverlayOpacity) : 0.55;
  const parallaxShift = config?.heroParallax ? scrollY * 0.45 : 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden text-white bg-[#0e1118]',
        className
      )}
    >
      {/* ──── Backdrops ──── */}
      {bgType === 'gradient' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#12151f] via-[#0e1118] to-[#080a10]" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute top-1/3 -right-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" aria-hidden />
        </>
      )}

      {bgType === 'image' && bgUrl && (
        <div 
          className="absolute inset-0 w-full h-[120%] pointer-events-none"
          style={{ 
            transform: `translateY(${parallaxShift}px) translateZ(0)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <img src={bgUrl} className="w-full h-full object-cover object-center" alt="" />
        </div>
      )}

      {bgType === 'video' && bgUrl && (
        <video
          src={bgUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-[120%] object-cover pointer-events-none"
          style={{ 
            transform: `translateY(${parallaxShift}px) translateZ(0)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
      )}

      {/* Opacity Overlay to maintain high contrast for readable text */}
      {bgType !== 'gradient' && (
        <div 
          className="absolute inset-0 bg-black pointer-events-none" 
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Ambient Grid Shaders */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(255,255,255,0.06),transparent_55%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,17,24,0.3)_0%,transparent_50%,rgba(8,10,16,0.95)_100%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" aria-hidden />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
