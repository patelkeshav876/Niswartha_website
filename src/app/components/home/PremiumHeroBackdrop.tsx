import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';

type Props = {
  children: ReactNode;
  className?: string;
  pageKey?: string;
};

/**
 * Premium Dynamic Hero Backdrop supporting configurable page background images,
 * video backgrounds, mobile fallback images, backdrop blur, brightness adjustments,
 * overlay opacity, text alignment, and parallax scrolling.
 */
export function PremiumHeroBackdrop({ children, className, pageKey = 'home' }: Props) {
  const [config, setConfig] = useState<any>(null);
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

  const bgType = config?.bgType || config?.heroBgType || 'gradient';
  const bgUrl = config?.bgUrl || config?.heroBgUrl || '';
  const bgVideoUrl = config?.bgVideoUrl || (bgType === 'video' ? bgUrl : '');
  const mobileFallbackUrl = config?.mobileFallbackUrl || bgUrl || '';
  const overlayOpacity = config?.overlayOpacity !== undefined ? Number(config.overlayOpacity) : (config?.heroOverlayOpacity !== undefined ? Number(config.heroOverlayOpacity) : 0.55);
  const blurIntensity = config?.blurIntensity !== undefined ? Number(config.blurIntensity) : 0;
  const brightness = config?.brightness !== undefined ? Number(config.brightness) : 1.0;
  const textAlign = config?.textAlign || 'center';
  const autoPlayVideo = config?.autoPlayVideo !== undefined ? Boolean(config.autoPlayVideo) : true;
  const loopVideo = config?.loopVideo !== undefined ? Boolean(config.loopVideo) : true;
  
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
      {/* ──── Gradient Fill ──── */}
      {bgType === 'gradient' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#12151f] via-[#0e1118] to-[#080a10]" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute top-1/3 -right-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" aria-hidden />
        </>
      )}

      {/* ──── Image Fill ──── */}
      {bgType === 'image' && bgUrl && (
        <div
          className="absolute inset-0 w-full h-[120%] pointer-events-none"
          style={{
            transform: `translateY(${parallaxShift}px) translateZ(0)`,
            filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : undefined,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <img src={bgUrl} className={cn('w-full h-full object-center', fitClass)} alt="" loading="eager" />
        </div>
      )}

      {/* ──── Video Fill ──── */}
      {bgType === 'video' && bgVideoUrl && (
        <>
          {/* Desktop/Tablet Video */}
          <video
            src={bgVideoUrl}
            autoPlay={autoPlayVideo}
            loop={loopVideo}
            muted
            playsInline
            className={cn('hidden md:block absolute inset-0 w-full h-[120%] pointer-events-none', fitClass)}
            style={{
              transform: `translateY(${parallaxShift}px) translateZ(0)`,
              filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : undefined,
              transition: 'transform 0.1s ease-out',
            }}
          />
          {/* Mobile Fallback Image */}
          <div
            className="md:hidden absolute inset-0 w-full h-full pointer-events-none"
            style={{
              filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : undefined,
            }}
          >
            {mobileFallbackUrl ? (
              <img src={mobileFallbackUrl} className={cn('w-full h-full', fitClass)} alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#12151f] via-[#0e1118] to-[#080a10]" />
            )}
          </div>
        </>
      )}

      {/* Opacity Overlay */}
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

      <div className={cn('relative z-10', textAlignClass)}>
        {children}
      </div>
    </div>
  );
}
