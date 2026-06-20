import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { mockAshrams, mockEvents } from '../data/mock';
import { useNavigate, useLocation } from 'react-router';
import { Search, Calendar, MapPin, ArrowRight, Sparkles, Users } from 'lucide-react';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { api } from '../lib/api';
import type { Event as EventItem } from '../types';
import { ScrollReveal } from '../components/ScrollReveal';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { PremiumHeroBackdrop } from '../components/home/PremiumHeroBackdrop';

const SORT_OPTIONS = [
  { id: 'date_asc', label: 'Date (soonest first)' },
  { id: 'date_desc', label: 'Date (latest first)' },
  { id: 'popularity', label: 'Popularity (most registered)' },
  { id: 'availability', label: 'Most spots left' },
  { id: 'newest', label: 'Newly listed' },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]['id'];

const CATEGORIES = ['All', 'Fundraiser', 'Community', 'Workshop', 'Cultural'] as const;

const MOCK_EVENT_CATEGORY: Record<string, string> = {
  'event-1': 'Fundraiser',
  'event-2': 'Workshop',
  'event-3': 'Community',
  'event-4': 'Cultural',
  'event-5': 'Workshop',
  'event-6': 'Fundraiser',
};

const REGISTRATION_MOCK: Record<string, { reg: number; cap: number }> = {
  'event-1': { reg: 24, cap: 50 },
  'event-2': { reg: 12, cap: 30 },
  'event-3': { reg: 45, cap: 100 },
  'event-4': { reg: 8, cap: 40 },
  'event-5': { reg: 15, cap: 25 },
  'event-6': { reg: 30, cap: 60 },
};

function isPublicEvent(e: EventItem): boolean {
  return e.status === 'approved' || e.status === undefined || e.status === null;
}

function eventCategory(e: EventItem): string {
  return e.eventType || MOCK_EVENT_CATEGORY[e.id] || 'Community';
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseEventDay(dateStr: string): Date {
  return startOfDay(new Date(dateStr + 'T12:00:00'));
}

function createdSortKey(e: EventItem): number {
  if (e.createdAt) {
    const t = new Date(e.createdAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  let m = /^event-(\d+)$/.exec(e.id);
  if (m) return Number(m[1]);
  m = /^suggested-(\d+)$/.exec(e.id);
  if (m) return Number(m[1]);
  return 0;
}

function getRegistration(e: EventItem): { reg: number; cap: number } | null {
  const capRaw = e.capacity;
  const capNum = typeof capRaw === 'number' ? capRaw : Number(capRaw);
  if (Number.isFinite(capNum) && capNum > 0) {
    const fromMock = REGISTRATION_MOCK[e.id];
    const reg = fromMock?.reg ?? Math.min(Math.floor(capNum * 0.35), Math.max(0, capNum - 1));
    return { reg, cap: capNum };
  }
  if (REGISTRATION_MOCK[e.id]) return REGISTRATION_MOCK[e.id];
  return null;
}

function daysBadge(eventDate: string): { text: string; className: string } {
  const today = startOfDay(new Date());
  const ev = parseEventDay(eventDate);
  const diff = Math.round((ev.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: 'PASSED', className: 'bg-zinc-700 text-white' };
  if (diff === 0) return { text: 'TODAY', className: 'bg-destructive text-destructive-foreground' };
  if (diff === 1) return { text: 'TOMORROW', className: 'bg-orange-500 text-white' };
  if (diff <= 6) return { text: `${diff} DAYS`, className: 'bg-primary text-primary-foreground' };
  if (diff <= 13) return { text: `${Math.ceil(diff / 7)} WEEKS`, className: 'bg-muted text-muted-foreground' };
  return { text: `${diff} DAYS`, className: 'bg-muted text-muted-foreground' };
}

export function Events() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortId>('date_asc');
  const [list, setList] = useState<EventItem[]>(mockEvents);
  const [primaryAshramId, setPrimaryAshramId] = useState(() => mockAshrams[0]?.id ?? 'ashram-1');

  const loadEvents = useCallback(async () => {
    try {
      const [data, ashrams] = await Promise.all([
        api.getEvents(),
        api.getAshrams().catch(() => [] as { id: string }[]),
      ]);
      if (data && Array.isArray(data)) setList(data as EventItem[]);
      if (Array.isArray(ashrams) && ashrams[0]?.id) setPrimaryAshramId(ashrams[0].id);
    } catch {
      /* mock */
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents, location.key, location.pathname]);

  const publicEvents = useMemo(
    () => list.filter(isPublicEvent),
    [list],
  );

  const processed = useMemo(() => {
    let rows = publicEvents.filter((event) =>
      event.title.toLowerCase().includes(search.toLowerCase()),
    );

    rows = rows.filter((event) => {
      if (filter === 'All') return true;
      return eventCategory(event) === filter;
    });

    const byDateAsc = (a: EventItem, b: EventItem) =>
      parseEventDay(a.date).getTime() - parseEventDay(b.date).getTime();

    const fillRatio = (e: EventItem) => {
      const r = getRegistration(e);
      if (!r || r.cap <= 0) return 0;
      return r.reg / r.cap;
    };

    const spotsLeft = (e: EventItem) => {
      const r = getRegistration(e);
      if (!r || r.cap <= 0) return -1;
      return r.cap - r.reg;
    };

    if (sort === 'date_asc') {
      rows.sort(byDateAsc);
    } else if (sort === 'date_desc') {
      rows.sort((a, b) => -byDateAsc(a, b));
    } else if (sort === 'popularity') {
      rows.sort((a, b) => {
        const ra = getRegistration(a);
        const rb = getRegistration(b);
        const pa = ra?.reg ?? 0;
        const pb = rb?.reg ?? 0;
        if (pb !== pa) return pb - pa;
        return fillRatio(b) - fillRatio(a);
      });
    } else if (sort === 'availability') {
      rows.sort((a, b) => {
        const sa = spotsLeft(a);
        const sb = spotsLeft(b);
        if (sb !== sa) return sb - sa;
        return byDateAsc(a, b);
      });
    } else {
      rows.sort((a, b) => createdSortKey(b) - createdSortKey(a));
    }

    return rows;
  }, [publicEvents, search, filter, sort]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ════════════ Hero Banner ════════════ */}
      <PremiumHeroBackdrop>
        <div className="relative py-20 lg:py-28">
          <div className="section-container text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
            >
              Upcoming Events
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mx-auto mt-4 max-w-2xl text-base text-white/60 lg:text-lg"
            >
              Join our community gatherings, workshops, and celebrations
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                size="lg"
                className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                onClick={() => navigate('/events/suggest')}
              >
                <Sparkles className="mr-2 h-5 w-5" /> Suggest Event
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => navigate(`/visit-book/${primaryAshramId}`)}
              >
                <Calendar className="mr-2 h-5 w-5" /> Visit Us
              </Button>
            </motion.div>
          </div>
        </div>
      </PremiumHeroBackdrop>

      {/* ════════════ Filters ════════════ */}
      <div className="sticky top-16 lg:top-20 z-30 border-b bg-background/95 backdrop-blur-xl">
        <div className="section-container py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="border-none bg-muted/50 pl-9 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="w-full lg:w-56">
              <Select value={sort} onValueChange={(v) => setSort(v as SortId)}>
                <SelectTrigger className="border-none bg-muted/50 rounded-xl">
                  <SelectValue placeholder="Sort events" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100]">
                  {SORT_OPTIONS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={filter === cat ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap px-4 py-1.5 transition-all hover:scale-[1.02]"
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ Event Grid ════════════ */}
      <div className="section-container py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processed.map((event, idx) => {
            const img =
              event.imageUrl ||
              'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80';
            const reg = getRegistration(event);
            const today = startOfDay(new Date());
            const isPast = parseEventDay(event.date).getTime() < today.getTime();
            const badge = daysBadge(event.date);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
              >
                <Card
                  className={cn(
                    'card-hover overflow-hidden border-none bg-card shadow-sm rounded-2xl ring-1 ring-border/50',
                    isPast && 'opacity-50',
                  )}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img src={img} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute left-3 top-3 flex flex-col gap-1">
                      <div className="rounded-lg bg-background/90 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm">
                        <span className="block text-[10px] font-bold uppercase text-primary">
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="block text-lg font-bold leading-none text-foreground">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <Badge className={cn('text-[10px] font-bold shadow-sm', badge.className)}>
                        {badge.text}
                      </Badge>
                    </div>
                    {isPast && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          Event Passed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-foreground">{event.title}</h3>
                    <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString()} • {event.time}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    {reg && (
                      <div className="mb-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            {reg.reg}/{reg.cap} registered
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (reg.reg / reg.cap) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                    <Button
                      className="group w-full rounded-xl"
                      disabled={isPast}
                      onClick={() => navigate(`/events/book/${event.id}`)}
                    >
                      Register / Join
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {processed.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">No events found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
