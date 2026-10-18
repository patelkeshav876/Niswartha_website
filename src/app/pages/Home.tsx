import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Button } from '../components/ui/button';
import { Heart, ArrowRight, Users, Calendar, Gift } from 'lucide-react';
import { mockAshrams, mockNeeds, mockEvents } from '../data/mock';
import { useNavigate } from 'react-router';
import { motion, useInView } from 'motion/react';
import { useUser } from '../context/UserContext';
import { useConfig } from '../context/ConfigContext';
import { api } from '../lib/api';
import { Ashram, type Event as EventType, Need } from '../types';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';

// Lazily imported below-the-fold components to reduce initial parse & execution time
const QuickActions = lazy(() => import('../components/home/QuickActions'));
const UrgentNeedsSection = lazy(() => import('../components/home/UrgentNeedsSection'));
const UpcomingEventsSection = lazy(() => import('../components/home/UpcomingEventsSection'));
const ContactCtaSection = lazy(() => import('../components/home/ContactCtaSection'));

/* ───── Unified Stat Counters Component ───── */
// Single RAF loop batches all counter updates into one render cycle,
// eliminating React 18 concurrent micro-task flooding and the 344ms reconciliation block.
interface StatItem {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
}

function UnifiedStatCounters({ stats }: { stats: StatItem[] }) {
  const [counts, setCounts] = useState<number[]>(() => stats.map(() => 0));
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-5% 0px' });
  const hasAnimated = useRef(false);
  const targetsRef = useRef(stats.map((s) => s.target));
  targetsRef.current = stats.map((s) => s.target);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    // Delay counter ignition to 1100ms so hero entrance animation finishes and settles
    let frameId: number;
    const timeout = setTimeout(() => {
      const duration = 1400;
      const start = performance.now();
      const targets = targetsRef.current;
      let lastUpdate = 0;

      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        // Throttle state updates to ~20fps (every 48ms) to keep main thread completely free
        if (now - lastUpdate >= 48 || progress === 1) {
          lastUpdate = now;
          setCounts(targets.map((t) => Math.round(eased * t)));
        }

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        }
      };

      frameId = requestAnimationFrame(step);
    }, 1100);

    return () => {
      clearTimeout(timeout);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [inView]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      style={{ contain: 'layout paint' }}
      className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12 lg:gap-16"
    >
      {stats.map((stat, i) => (
        <div key={stat.label} className="text-center will-change-transform">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            {stat.icon}
          </div>
          <p className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
            <span className="tabular-nums">
              {stat.prefix || ''}
              {counts[i].toLocaleString()}
              {stat.suffix || ''}
            </span>
          </p>
          <p className="mt-1 text-sm text-white/50">{stat.label}</p>
        </div>
      ))}
    </motion.div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { config } = useConfig();
  const [ashram, setAshram] = useState<Ashram>(mockAshrams[0]);
  const [needs, setNeeds] = useState<Need[]>(mockNeeds);
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>(() =>
    mockEvents.slice(0, 3),
  );

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [needsData, ashramsData, eventsData] = await Promise.all([
          api.getNeeds(),
          api.getAshrams(),
          api.getEvents(),
        ]);
        if (!active) return;
        if (needsData.length > 0) setNeeds(needsData);
        if (ashramsData.length > 0) setAshram(ashramsData[0]);
        if (eventsData && Array.isArray(eventsData)) {
          const sorted = [...eventsData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          setUpcomingEvents(sorted.slice(0, 3));
        }
      } catch {
        // Keep mock data
      }
    };
    // Defer API calls slightly so initial frame & LCP paint settle cleanly
    const timer = setTimeout(() => {
      void loadData();
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const urgentNeeds = needs.filter((n) => n.urgency === 'high');
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ════════════ HERO SECTION ════════════ */}
      <PremiumHeroBackdrop pageKey="home" className="min-h-[560px] sm:min-h-[620px] lg:min-h-[700px]">
        <div className="section-container relative flex min-h-[560px] sm:min-h-[620px] lg:min-h-[700px] flex-col items-center justify-center py-16 lg:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-sm ring-1 ring-primary/40">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(167,243,208,0.8)]" />
              Verified NGO · Since 1946
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl"
          >
            Empowering Every Child
            <span className="block text-primary/90"> With Hope and Education</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="mx-auto mt-6 max-w-2xl text-base text-white/60 leading-relaxed sm:text-lg"
          >
            {ashram.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_14px_40px_-6px_rgba(15,109,78,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_18px_50px_-6px_rgba(15,109,78,0.6)]"
              onClick={() => navigate(`/donate/${ashram.id}`)}
            >
              <Heart className="mr-2 h-5 w-5" /> Support Our Mission
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30"
              onClick={() =>
                mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Explore <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Unified Count-up Stats (Single RAF, Batched State, Zero Scripting Lag) */}
          <UnifiedStatCounters
            stats={[
              { target: 50, suffix: '+', label: 'Children Helped', icon: <Users className="h-6 w-6 text-emerald-300" /> },
              { target: 1500, suffix: '+', label: 'Items Donated', icon: <Heart className="h-6 w-6 text-rose-300" /> },
              { target: needs.length, label: 'Active Needs', icon: <Gift className="h-6 w-6 text-amber-300" /> },
              { target: upcomingEvents.length, label: 'Upcoming Events', icon: <Calendar className="h-6 w-6 text-sky-300" /> },
            ]}
          />
        </div>
      </PremiumHeroBackdrop>

      {/* ════════════ MAIN CONTENT ════════════ */}
      <main ref={mainRef} className="flex-1">
        {/* ──── Quick Actions ──── */}
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '0 160px' } as React.CSSProperties}>
          <Suspense fallback={<div className="section-container py-16 lg:py-20 min-h-[140px] sm:min-h-[160px]" />}>
            <QuickActions ashramId={ashram.id} />
          </Suspense>
        </div>

        {/* ──── Urgent Needs ──── */}
        {urgentNeeds.length > 0 && (
          <div style={{ contentVisibility: 'auto', containIntrinsicSize: '0 420px' } as React.CSSProperties}>
            <Suspense fallback={<div className="bg-muted/30 py-16 lg:py-20 min-h-[380px]" />}>
              <UrgentNeedsSection urgentNeeds={urgentNeeds} />
            </Suspense>
          </div>
        )}

        {/* ──── Upcoming Events ──── */}
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '0 450px' } as React.CSSProperties}>
          <Suspense fallback={<div className="section-container py-16 lg:py-20 min-h-[450px]" />}>
            <UpcomingEventsSection upcomingEvents={upcomingEvents} />
          </Suspense>
        </div>

        {/* ──── Contact / CTA Band ──── */}
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '0 480px' } as React.CSSProperties}>
          <Suspense fallback={<div className="bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.04] py-12 lg:py-20 min-h-[480px]" />}>
            <ContactCtaSection ashram={ashram} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
