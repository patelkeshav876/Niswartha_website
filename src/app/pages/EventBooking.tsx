import { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { mockEvents } from '../data/mock';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import type { Event as EventType } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  label: string;
  available: number;
  total: number;
}

const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', label: '09:00 AM', available: 8, total: 10 },
  { id: 'slot-2', label: '10:00 AM', available: 10, total: 10 },
  { id: 'slot-3', label: '11:00 AM', available: 6, total: 10 },
  { id: 'slot-4', label: '12:00 PM', available: 0, total: 10 },
  { id: 'slot-5', label: '02:00 PM', available: 9, total: 10 },
  { id: 'slot-6', label: '03:00 PM', available: 7, total: 10 },
  { id: 'slot-7', label: '04:00 PM', available: 10, total: 10 },
];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toISODateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const fallbackEventImg =
  'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80';

export function EventBooking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useUser();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guestPill, setGuestPill] = useState<1 | 2 | 3 | 4 | '5+'>(1);
  const [guestCustom, setGuestCustom] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((f) => ({
        ...f,
        name: currentUser.name || f.name,
        email: currentUser.email || f.email,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getEvent(id);
        if (cancelled) return;
        if (data) setEvent(data as EventType);
      } catch {
        const mock = mockEvents.find((e) => e.id === id);
        if (!cancelled && mock) setEvent(mock);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const datePills = useMemo(() => {
    const t0 = startOfToday();
    return Array.from({ length: 14 }, (_, i) => addDays(t0, i));
  }, []);

  useEffect(() => {
    if (!selectedDate && datePills.length > 0) {
      setSelectedDate(toISODateLocal(datePills[0]));
    }
  }, [datePills, selectedDate]);

  const numGuests = guestPill === '5+' ? guestCustom : guestPill;

  const selectedSlotObj = TIME_SLOTS.find((s) => s.id === selectedSlot);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !id) {
      return;
    }

    if (!currentUser?.id) {
      toast.error('Session expired. Please re-login.');
      return;
    }

    setIsSubmitting(true);

    try {
      const slot = TIME_SLOTS.find((s) => s.id === selectedSlot);
      const bookingData = {
        eventId: id,
        userId: currentUser?.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        time: slot?.label ?? '',
        guests: numGuests,
        ...formData,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      await api.createEventBooking(bookingData);

      setBookingSuccess(true);

      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto min-h-screen max-w-[480px] bg-background pb-24">
        <div className="sticky top-0 z-40 border-b bg-background/95 px-4 py-4 backdrop-blur-md">
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-4 p-4">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-6 pb-24">
        <p className="text-muted-foreground">Event not found</p>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground text-center mb-6">
          Your visit has been scheduled successfully.
          <br />
          Check your email for confirmation details.
        </p>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }

  const today = startOfToday();

  return (
    <div className="relative mx-auto min-h-screen max-w-[480px] bg-background pb-40">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/events')} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Book Your Visit</h1>
            <p className="text-xs text-muted-foreground">Pick a date & showtime</p>
          </div>
        </div>
      </div>

      <main className="px-4 py-5">
        <form id="booking-form" onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img
                  src={event.imageUrl || fallbackEventImg}
                  alt={event.title}
                  className="h-24 w-24 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold mb-1 line-clamp-2">{event.title}</h2>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-2">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <Label className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Calendar className="h-4 w-4 text-primary" />
                Select date
              </Label>
              <div className="w-full overflow-x-auto scroll-smooth pb-2 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory">
                <div className="flex min-w-min gap-2 pb-1">
                  {datePills.map((d) => {
                    const key = toISODateLocal(d);
                    const isPast = d < today;
                    const isToday = isSameDay(d, today);
                    const selected = selectedDate === key;
                    const dayAbbr = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isPast}
                        onClick={() => !isPast && setSelectedDate(key)}
                        className={cn(
                          'snap-start shrink-0 rounded-2xl border-2 px-3 py-2 text-center transition-all min-w-[4.25rem]',
                          isPast && 'opacity-40 line-through cursor-not-allowed border-transparent bg-muted',
                          !isPast &&
                            selected &&
                            'border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]',
                          !isPast &&
                            !selected &&
                            'border-border bg-card hover:border-primary/40 active:scale-95',
                        )}
                      >
                        {isToday ? (
                          <span className="block text-[9px] font-semibold uppercase tracking-wide">
                            Today
                          </span>
                        ) : (
                          <span className="block text-[10px] font-medium text-muted-foreground">
                            {dayAbbr}
                          </span>
                        )}
                        <span className="block text-lg font-bold leading-tight">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedDate && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <Label className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <Clock className="h-4 w-4 text-primary" />
                  Select time
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const booked = slot.available === 0;
                    const selected = selectedSlot === slot.id;
                    const fill = slot.total > 0 ? (slot.available / slot.total) * 100 : 0;
                    const borderClass = booked
                      ? 'border-destructive/50 opacity-60'
                      : slot.available > 5
                        ? 'border-primary/40 hover:border-primary'
                        : 'border-orange-400 hover:border-orange-500';

                    return (
                      <motion.button
                        key={slot.id}
                        type="button"
                        disabled={booked}
                        onClick={() => !booked && setSelectedSlot(slot.id)}
                        whileTap={!booked ? { scale: 0.97 } : undefined}
                        animate={
                          selected
                            ? { scale: [1, 1.04, 1], transition: { duration: 0.35 } }
                            : { scale: 1 }
                        }
                        className={cn(
                          'rounded-2xl border-2 bg-card p-2.5 text-left shadow-sm transition-transform hover:scale-[1.02]',
                          borderClass,
                          selected && 'border-primary bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/25',
                          booked && 'cursor-not-allowed',
                        )}
                      >
                        <p
                          className={cn(
                            'text-center text-xs font-bold',
                            selected ? 'text-primary-foreground' : 'text-foreground',
                          )}
                        >
                          {slot.label}
                        </p>
                        <div
                          className={cn(
                            'mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10',
                            selected && 'bg-primary-foreground/25',
                          )}
                        >
                          <div
                            className={cn(
                              'h-full rounded-full bg-primary',
                              selected && 'bg-primary-foreground',
                            )}
                            style={{ width: `${fill}%` }}
                          />
                        </div>
                        <p
                          className={cn(
                            'mt-1.5 text-center text-[10px] font-medium',
                            selected ? 'text-primary-foreground/90' : 'text-muted-foreground',
                          )}
                        >
                          {booked ? 'Full' : `${slot.available} left`}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <Label className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Users className="h-4 w-4 text-primary" />
                Guests
              </Label>
              <div className="flex flex-wrap gap-2">
                {([1, 2, 3, 4] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setGuestPill(n);
                    }}
                    className={cn(
                      'min-w-[2.75rem] rounded-full border-2 px-3 py-2 text-sm font-semibold transition-colors',
                      guestPill === n
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary/40',
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGuestPill('5+')}
                  className={cn(
                    'min-w-[2.75rem] rounded-full border-2 px-3 py-2 text-sm font-semibold transition-colors',
                    guestPill === '5+'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/40',
                  )}
                >
                  5+
                </button>
              </div>
              {guestPill === '5+' && (
                <div className="mt-3 space-y-1">
                  <Label htmlFor="guests-more" className="text-xs">
                    Number of guests
                  </Label>
                  <Input
                    id="guests-more"
                    type="number"
                    min={5}
                    max={50}
                    value={guestCustom}
                    onChange={(e) => setGuestCustom(Math.max(5, Number(e.target.value) || 5))}
                    className="max-w-[120px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="space-y-4 p-4">
              <h3 className="font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Your information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Full name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  Phone *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests" className="text-sm">
                  Special requests (optional)
                </Label>
                <Textarea
                  id="requests"
                  placeholder="Any special requirements…"
                  rows={3}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground pb-2">
            By confirming, you agree to receive confirmation via email and SMS
          </p>
        </form>
      </main>

      <AnimatePresence>
        {selectedSlot && selectedSlotObj && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md pb-safe"
          >
            <div className="mx-auto w-full max-w-[480px]">
            <div className="mb-3 space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Event</span>
                <span className="max-w-[60%] text-right font-medium line-clamp-1">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedSlotObj.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium">{numGuests}</span>
              </div>
            </div>
            <Button
              type="submit"
              form="booking-form"
              className="h-11 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirming…' : 'Confirm booking'}
            </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
