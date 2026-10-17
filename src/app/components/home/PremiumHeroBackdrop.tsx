import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { optimizeUnsplashUrl } from '../../lib/unsplash';

type Props = {
  children: ReactNode;
  className?: string;
  pageKey?: string;
};

/**
 * Instant cached config retriever so the background image exists at Frame 0 (0ms)
 * without waiting for an asynchronous network waterfall.
 */
function getInitialConfig(pageKey: string) {
  try {
    const saved = localStorage.getItem('hero_config_' + pageKey);
    if (saved) return JSON.parse(saved);
    const globalSaved = localStorage.getItem('site_config');
    if (globalSaved) {
      const parsed = JSON.parse(globalSaved);
      if (parsed) return parsed;
    }
  } catch {}

  if (pageKey === 'about') {
    return {
      bgType: 'gradient',
      overlayOpacity: 0.6,
    };
  }

  return {
    bgType: 'image',
    bgUrl: '/hero-bg.webp',
    overlayOpacity: 0.55,
  };
}

/**
 * Premium Dynamic Hero Backdrop supporting configurable page background images
 * and gradient fills, backdrop blur, brightness adjustments, overlay opacity,
 * text alignment, and parallax scrolling.
 * (Video backgrounds removed site-wide for instant performance).
 */
export function PremiumHeroBackdrop({ children, className, pageKey = 'home' }: Props) {
  const [config, setConfig] = useState<any>(() => getInitialConfig(pageKey));
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const pageConf = await api.getHeroConfig(pageKey);
        if (active && pageConf && pageConf.bgType) {
          setConfig(pageConf);
          return;
        }
        // Fallback to global config if page-specific config not found
        const globalConf = await api.getConfig();
        if (active && globalConf) {
          setConfig(globalConf);
        }
      } catch {
        // fallback
      }
    })();
    return () => {
      active = false;
    };
  }, [pageKey]);

  // Scroll handler for hardware-accelerated parallax shift
  useEffect(() => {
    if (!config?.heroParallax && !config?.parallax) return;
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [config]);

  // bgType is strictly 'gradient' or 'image'
  const rawBgType = config?.bgType || config?.heroBgType;
  const bgType = rawBgType === 'gradient' ? 'gradient' : (pageKey === 'about' ? 'gradient' : 'image');
  const rawBgUrl = config?.bgUrl || config?.heroBgUrl || (pageKey === 'about' ? '' : '/hero-bg.webp');
  const safeBgUrl = (rawBgUrl && rawBgUrl.startsWith('data:image/')) ? '/hero-bg.webp' : rawBgUrl;
  const bgUrl = safeBgUrl ? optimizeUnsplashUrl(safeBgUrl, 1200, 800, 75) : '';
  const overlayOpacity = config?.overlayOpacity !== undefined ? Number(config.overlayOpacity) : (config?.heroOverlayOpacity !== undefined ? Number(config.heroOverlayOpacity) : 0.55);
  const blurIntensity = config?.blurIntensity !== undefined ? Number(config.blurIntensity) : 0;
  const brightness = config?.brightness !== undefined ? Number(config.brightness) : 1.0;
  const textAlign = config?.textAlign || 'center';
  
  const enableParallax = config?.parallax || config?.heroParallax;
  const parallaxShift = enableParallax ? scrollY * 0.35 : 0;

  const textAlignClass = {
    left: 'text-left font-normal',
    center: 'text-center',
    right: 'text-right font-normal',
  }[textAlign] || 'text-center';

  const sizeMode = config?.sizeMode || 'standard';
  const customHeight = config?.customHeight ? Number(config.customHeight) : 550;
  const objectFit = config?.objectFit || 'cover';

  const sizeClass = {
    full: 'min-h-screen',
    standard: 'min-h-[75vh] lg:min-h-[85vh]',
    compact: 'min-h-[45vh] lg:min-h-[55vh]',
    custom: '',
  }[sizeMode] || 'min-h-[75vh] lg:min-h-[85vh]';

  const fitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
  }[objectFit] || 'object-cover';

  return (
    <div
      className={cn(
        'relative overflow-hidden text-white bg-[#0e1118] pt-20 lg:pt-24 pb-12 flex flex-col justify-center',
        sizeClass,
        className
      )}
      style={{
        filter: blurIntensity > 0 || brightness !== 1.0 ? `brightness(${brightness})` : undefined,
        minHeight: sizeMode === 'custom' && customHeight ? `${customHeight}px` : undefined,
      }}
    >
      {/* ──── Gradient Canvas Fill ──── */}
      {bgType === 'gradient' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#12151f] via-[#0e1118] to-[#080a10]" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute top-1/3 -right-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" aria-hidden />
        </>
      )}

      {/* ──── Image Fill (Optimized WebP, high fetch priority, instant LCP) ──── */}
      {bgType === 'image' && bgUrl && (
        <div
          className="absolute inset-0 w-full h-[120%] pointer-events-none overflow-hidden"
          style={{
            transform: enableParallax ? `translateY(${parallaxShift}px) translateZ(0)` : undefined,
            filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : undefined,
            transition: enableParallax ? 'transform 0.1s ease-out' : undefined,
          }}
        >
          <img
            src={bgUrl}
            className={cn('w-full h-full object-center animate-hero-zoom', fitClass)}
            alt="Niswartha Hero Background"
            loading="eager"
            // @ts-ignore
            fetchpriority="high"
            decoding="async"
            width={1200}
            height={800}
          />
        </div>
      )}

      {/* Opacity Overlay */}
      {bgType !== 'gradient' && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Ambient Grid Shaders & Depth Lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(255,255,255,0.06),transparent_55%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,17,24,0.3)_0%,transparent_50%,rgba(8,10,16,0.95)_100%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" aria-hidden />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className={cn('relative z-10', textAlignClass)}>
        {children}
      </div>
    </div>
  );
}
