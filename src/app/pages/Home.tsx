import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Users,
  Calendar,
  TrendingUp,
  Facebook,
  Gift,
  Sparkles,
} from 'lucide-react';
import { mockAshrams, mockNeeds, mockEvents } from '../data/mock';
import { Link, useNavigate } from 'react-router';
import { motion, useInView } from 'motion/react';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { Ashram, type Event as EventType, Need } from '../types';
import { ScrollReveal } from '../components/ScrollReveal';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';

/* ───── Count-Up Hook ───── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

/* ───── Stat Counter Component ───── */
function StatCounter({
  value,
  label,
  prefix = '',
  suffix = '',
  icon,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {icon}
      </div>
      <p className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
        <span ref={ref}>
          {prefix}
          {count.toLocaleString()}
          {suffix}
        </span>
      </p>
      <p className="mt-1 text-sm text-white/50">{label}</p>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [ashram, setAshram] = useState<Ashram>(mockAshrams[0]);
  const [needs, setNeeds] = useState<Need[]>(mockNeeds);
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>(() =>
    mockEvents.slice(0, 3),
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [needsData, ashramsData, eventsData] = await Promise.all([
        api.getNeeds(),
        api.getAshrams(),
        api.getEvents(),
      ]);
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

  const getFirstName = (name: string) => name.split(' ')[0];

  const urgentNeeds = needs.filter((n) => n.urgency === 'high');
  const mainRef = useRef<HTMLElement | null>(null);

  const heroImage =
    ashram.imageUrl ||
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ════════════ HERO SECTION ════════════ */}
      <PremiumHeroBackdrop className="min-h-[85vh] lg:min-h-[90vh]">
        <div className="section-container relative flex min-h-[85vh] lg:min-h-[90vh] flex-col items-center justify-center py-20 text-center">
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
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl"
          >
            Empowering Every Child
            <span className="block text-primary/90"> With Hope & Education</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
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
              <Heart className="mr-2 h-5 w-5" /> Donate Now
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

          {/* Count-up Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12 lg:gap-16"
          >
            <StatCounter value={50} suffix="+" label="Children Helped" icon={<Users className="h-6 w-6 text-emerald-300" />} />
            <StatCounter value={120} prefix="₹" suffix="K" label="Donations Raised" icon={<Heart className="h-6 w-6 text-rose-300" />} />
            <StatCounter value={needs.length} label="Active Needs" icon={<Gift className="h-6 w-6 text-amber-300" />} />
            <StatCounter value={upcomingEvents.length} label="Upcoming Events" icon={<Calendar className="h-6 w-6 text-sky-300" />} />
          </motion.div>
        </div>
      </PremiumHeroBackdrop>

      {/* ════════════ MAIN CONTENT ════════════ */}
      <main ref={mainRef} className="flex-1">

        {/* ──── Quick Actions ──── */}
        <section className="section-container py-16 lg:py-20">
          <ScrollReveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  tint: 'bg-gradient-to-b from-primary/12 to-primary/5 ring-1 ring-primary/15',
                  iconBg: 'text-primary',
                  title: 'Donate Now',
                  subtitle: 'Support our children with a contribution',
                  icon: <Heart className="h-7 w-7" />,
                  onClick: () => navigate(`/donate/${ashram.id}`),
                },
                {
                  tint: 'bg-gradient-to-b from-blue-500/12 to-blue-500/5 ring-1 ring-blue-500/15',
                  iconBg: 'text-blue-600',
                  title: 'About Us',
                  subtitle: 'Our story, mission & impact',
                  icon: <Users className="h-7 w-7" />,
                  onClick: () => navigate('/about'),
                },
                {
                  tint: 'bg-gradient-to-b from-orange-500/12 to-orange-500/5 ring-1 ring-orange-500/15',
                  iconBg: 'text-orange-600',
                  title: 'Visit Us',
                  subtitle: 'Book a visit to our campus',
                  icon: <Calendar className="h-7 w-7" />,
                  onClick: () => navigate(`/visit-book/${ashram.id}`),
                },
              ].map((action, idx) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer border-0 bg-card/95 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] rounded-2xl ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-16px_rgba(15,23,42,0.2)] active:scale-[0.98]"
                    onClick={action.onClick}
                    onKeyDown={(e) => { if (e.key === 'Enter') action.onClick(); }}
                  >
                    <CardContent className="flex items-center gap-5 p-6 lg:p-8">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${action.tint} shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)]`}>
                        <span className={action.iconBg}>{action.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold lg:text-lg">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                      </div>
                      <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground/40" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ──── Urgent Needs ──── */}
        {urgentNeeds.length > 0 && (
          <section className="bg-muted/30 py-16 lg:py-20">
            <div className="section-container">
              <ScrollReveal>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Urgent</span>
                    </div>
                    <h2 className="text-2xl font-bold lg:text-3xl">Help Us Reach Our Goals</h2>
                    <p className="mt-1 text-muted-foreground">These needs require immediate attention</p>
                  </div>
                  <Link to="/needs">
                    <Button variant="ghost" className="group text-primary">
                      View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {urgentNeeds.slice(0, 3).map((need, i) => (
                  <motion.div
                    key={need.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <Card
                      className="card-hover cursor-pointer overflow-hidden border-0 bg-card shadow-[0_8px_30px_-10px_rgba(15,23,42,0.1)] rounded-2xl ring-1 ring-border/50"
                      onClick={() => navigate(`/donate-flow/${need.ashramId}/${need.id}`)}
                    >
                      <CardContent className="p-5 lg:p-6">
                        <div className="flex gap-4">
                          <img
                            src={need.imageUrl}
                            alt={need.title}
                            className="h-20 w-20 shrink-0 rounded-xl object-cover shadow-inner ring-1 ring-black/5 lg:h-24 lg:w-24"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-start justify-between">
                              <h3 className="line-clamp-1 text-sm font-bold lg:text-base">{need.title}</h3>
                              <Badge variant="destructive" className="ml-2 text-[10px]">
                                Urgent
                              </Badge>
                            </div>
                            <Badge variant="secondary" className="mb-3 text-[10px]">
                              {need.category}
                            </Badge>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  ₹{need.quantityFulfilled.toLocaleString()} / ₹
                                  {need.quantityRequired.toLocaleString()}
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
                                <div
                                  className="h-full rounded-full bg-primary shadow-sm transition-all"
                                  style={{
                                    width: `${(need.quantityFulfilled / need.quantityRequired) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ──── Upcoming Events ──── */}
        <section className="section-container py-16 lg:py-20">
          <ScrollReveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Upcoming</span>
                </div>
                <h2 className="text-2xl font-bold lg:text-3xl">Community Events</h2>
                <p className="mt-1 text-muted-foreground">Join us and make lasting memories</p>
              </div>
              <Link to="/events">
                <Button variant="ghost" className="group text-primary">
                  View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card
                  className="card-hover cursor-pointer overflow-hidden border-0 bg-card shadow-[0_8px_30px_-10px_rgba(15,23,42,0.1)] rounded-2xl ring-1 ring-border/50"
                  onClick={() => navigate('/events')}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <div className="rounded-lg bg-background/90 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm">
                        <span className="block text-[10px] font-bold uppercase text-primary">
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="block text-lg font-bold leading-none text-foreground">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-foreground">{event.title}</h3>
                    <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString()} • {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ──── Contact / CTA Band ──── */}
        <section className="bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.04] py-16 lg:py-20">
          <div className="section-container">
            <ScrollReveal>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="text-2xl font-bold lg:text-3xl">Get in Touch</h2>
                  <p className="mt-2 text-muted-foreground">
                    Reach out to us for visits, volunteering, or any inquiries.
                  </p>
                  <div className="mt-6 space-y-3">
                    {[
                      { icon: Phone, content: ashram.contact.phone, href: `tel:${ashram.contact.phone}` },
                      { icon: Mail, content: ashram.contact.email, href: `mailto:${ashram.contact.email}` },
                      { icon: MapPin, content: ashram.location },
                      ...(ashram.facebookUrl
                        ? [{ icon: Facebook, content: 'Follow us on Facebook', href: ashram.facebookUrl }]
                        : []),
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-xl bg-card/80 px-4 py-3 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
                      >
                        <item.icon className="h-5 w-5 shrink-0 text-primary" />
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href?.startsWith('http') ? '_blank' : undefined}
                            rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-sm text-muted-foreground transition-colors hover:text-primary"
                          >
                            {item.content}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.content}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Donate CTA Card */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/15 rounded-2xl">
                  <CardContent className="p-8 text-center text-white lg:p-10">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-80" />
                    <h3 className="text-2xl font-bold mb-3 lg:text-3xl">Support Our Cause</h3>
                    <p className="text-sm text-white/85 mb-6 leading-relaxed max-w-md mx-auto">
                      Your generous contribution helps us provide better care, education, and opportunities to our children.
                    </p>
                    <Button
                      size="lg"
                      className="h-14 w-full max-w-xs rounded-full bg-white text-primary font-semibold hover:bg-white/90 shadow-lg"
                      onClick={() => navigate(`/donate/${ashram.id}`)}
                    >
                      Donate Now <Heart className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}
