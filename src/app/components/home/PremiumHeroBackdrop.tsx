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
import { useConfig } from '../../context/ConfigContext';

export function PremiumHeroBackdrop({ children, className, pageKey = 'home' }: Props) {
  const { config: globalConfig } = useConfig();
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
        if (active && globalConfig) {
          setConfig(globalConfig);
          return;
        }
        const fetchedGlobal = await api.getConfig();
        if (active && fetchedGlobal) {
          setConfig(fetchedGlobal);
        }
      } catch {
        // fallback
      }
    })();
    return () => {
      active = false;
    };
  }, [pageKey, globalConfig]);

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
    full: 'min-h-[640px] lg:min-h-[760px] xl:min-h-screen',
    standard: 'min-h-[520px] sm:min-h-[580px] lg:min-h-[680px]',
    compact: 'min-h-[380px] sm:min-h-[420px] lg:min-h-[480px]',
    custom: '',
  }[sizeMode] || 'min-h-[520px] sm:min-h-[580px] lg:min-h-[680px]';

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
        contain: 'layout paint',
        filter: blurIntensity > 0 || brightness !== 1.0 ? `brightness(${brightness})` : undefined,
        minHeight: sizeMode === 'custom' && customHeight ? `${customHeight}px` : undefined,
      }}
    >
      {/* ──── Gradient Canvas Fill ──── */}
      {bgType === 'gradient' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#12151f] via-[#0e1118] to-[#080a10]" />
          {/* Consolidated GPU-accelerated ambient glow layer */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,109,78,0.22),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(56,189,248,0.1),transparent_40%),radial-gradient(circle_at_15%_75%,rgba(99,102,241,0.08),transparent_40%)] blur-2xl will-change-transform"
            aria-hidden="true"
          />
        </>
      )}

      {/* ──── Image Fill (Optimized WebP, high fetch priority, instant LCP) ──── */}
      {bgType === 'image' && bgUrl && (
        <div
          className="absolute inset-0 w-full h-[120%] pointer-events-none overflow-hidden will-change-transform"
          style={{
            transform: enableParallax ? `translate3d(0, ${parallaxShift}px, 0)` : undefined,
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
            width={1920}
            height={1080}
            style={{ aspectRatio: '16/9' }}
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(255,255,255,0.05),transparent_55%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,17,24,0.3)_0%,transparent_50%,rgba(8,10,16,0.95)_100%)]" aria-hidden="true" />

      <div className={cn('relative z-10', textAlignClass)}>
        {children}
      </div>
    </div>
  );
}
