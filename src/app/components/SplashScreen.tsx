import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

interface SplashScreenProps {
  onFinish?: () => void;
}

type SplashSlide = {
  id: string;
  badge: string;
  badgeDot: string;
  title: string;
  metaLine1: string;
  metaLine2: string;
  image: string;
  headline: string;
  subline: string;
};

const slides: SplashSlide[] = [
  {
    id: 'donate',
    badge: 'Live',
    badgeDot: 'bg-emerald-400',
    title: 'Donate',
    metaLine1: 'Instant impact for children & care',
    metaLine2: 'Deaf & Dumb Industrial Institute, Nagpur',
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
    headline: 'Give with confidence',
    subline: 'Track every rupee toward food, education, and shelter.',
  },
  {
    id: 'needs',
    badge: 'Open',
    badgeDot: 'bg-lime-400',
    title: 'Active Needs',
    metaLine1: '12 requests · Updated today',
    metaLine2: 'Prioritized by urgency',
    image:
      'https://images.unsplash.com/photo-1623863568368-69e4cbe6cc0b?auto=format&fit=crop&w=900&q=80',
    headline: 'See what communities need',
    subline: 'Choose items, medical kits, or seasonal drives in seconds.',
  },
  {
    id: 'events',
    badge: 'Upcoming',
    badgeDot: 'bg-sky-400',
    title: 'Community Events',
    metaLine1: 'Workshops · Visits · Fundraisers',
    metaLine2: 'Book your spot on the calendar',
    image:
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80',
    headline: 'Join the next gathering',
    subline: 'Volunteer days and celebrations that keep support growing.',
  },
];

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [pressed, setPressed] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    const children = el.querySelectorAll<HTMLElement>('[data-splash-card]');
    children.forEach((child, i) => {
      const mid = child.offsetLeft + child.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const second = el.querySelector<HTMLElement>('[data-splash-card="1"]');
    if (second) {
      requestAnimationFrame(() => {
        el.scrollLeft = second.offsetLeft - (el.clientWidth - second.offsetWidth) / 2;
      });
    }
  }, []);

  const handleContinue = () => {
    if (pressed) return;
    setPressed(true);
    setTimeout(() => onFinish?.(), 80);
  };

  const current = slides[active] ?? slides[1];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: pressed ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#0a0a0c]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(255,255,255,0.08),transparent_50%),radial-gradient(circle_at_80%_100%,rgba(99,102,241,0.06),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#121214_0%,#0a0a0c_45%,#050506_100%)]" />

      <div className="relative flex flex-1 flex-col min-h-0 pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="px-6 text-center shrink-0"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
            Orphanage Connect
          </p>
        </motion.div>

        {/* Carousel — center card in focus, sides dimmed */}
        <div className="relative flex-1 min-h-0 flex items-center py-6">
          <div
            ref={scrollerRef}
            onScroll={updateActiveFromScroll}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {slides.map((slide, i) => {
              const isActive = i === active;
              return (
                <div
                  key={slide.id}
                  data-splash-card={i}
                  className="flex h-full min-h-[min(52vh,420px)] w-[100vw] shrink-0 snap-center items-center justify-center px-[10vw] sm:px-[12vw]"
                >
                  <motion.div
                    layout
                    animate={{
                      scale: isActive ? 1 : 0.88,
                      opacity: isActive ? 1 : 0.42,
                      filter: isActive ? 'blur(0px)' : 'blur(1.5px)',
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    className="relative w-full max-w-[300px] overflow-hidden rounded-[28px] bg-zinc-900 shadow-[0_40px_100px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.08]"
                  >
                    <div className="relative aspect-[4/5] max-h-[min(48vh,400px)] flex flex-col">
                      <div className="relative h-[48%] shrink-0 overflow-hidden">
                        <img
                          src={slide.image}
                          alt=""
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent" />
                        <div
                          className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md ring-1 ring-white/15`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${slide.badgeDot} shadow-[0_0_10px_currentColor]`}
                          />
                          {slide.badge}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col bg-gradient-to-b from-zinc-900 to-black px-4 pb-5 pt-3">
                        <div className="mb-3 flex -space-x-2">
                          {[0, 1, 2].map((j) => (
                            <div
                              key={j}
                              className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-white/25 to-white/5 ring-1 ring-white/10"
                              style={{
                                backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))`,
                              }}
                            />
                          ))}
                        </div>
                        <h2 className="font-serif text-[26px] font-semibold leading-tight tracking-tight text-white">
                          {slide.title}
                        </h2>
                        <p className="mt-2 text-[13px] leading-snug text-white/55">
                          {slide.metaLine1}
                        </p>
                        <p className="mt-1 text-[12px] text-white/40">{slide.metaLine2}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 px-6 pb-2">
          <div className="mx-auto flex max-w-md justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  const el = scrollerRef.current;
                  const card = el?.querySelector<HTMLElement>(`[data-splash-card="${i}"]`);
                  if (el && card) {
                    el.scrollTo({
                      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
                      behavior: 'smooth',
                    });
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="shrink-0 space-y-3 px-6 pb-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-[22px] font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                {current.headline}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-white/45">
                {current.subline}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="pt-2">
            <Button
              type="button"
              onClick={handleContinue}
              className="h-[52px] w-full max-w-md rounded-full bg-white px-8 text-[15px] font-semibold text-black shadow-[0_16px_40px_rgba(255,255,255,0.12)] hover:bg-white/95"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
