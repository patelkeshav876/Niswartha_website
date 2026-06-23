import 'react-day-picker/dist/style.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { addDays, startOfDay, isBefore } from 'date-fns';
import { ArrowLeft, Calendar, Check, Clock, MapPin, ExternalLink, Building, Info, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Calendar as CalendarUi } from '../components/ui/calendar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { VisitTimeSlotGrid, type SlotAvailability } from '../components/visit/VisitTimeSlotGrid';
import {
  VISIT_PURPOSE_OPTIONS,
  VISIT_MAX_PARTY,
} from '../components/visit/visitBookingConstants';
import {
  validateVisitBookingForm,
  type VisitBookingFormState,
} from '../components/visit/visitBookingValidation';
import { mockAshrams } from '../data/mock';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { VISIT_TIME_SLOTS, VISIT_SLOT_CAPACITY } from '../lib/visitSlots';
import type { Ashram } from '../types';
import { toast } from 'sonner';

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatBookingId(id: string): string {
  return id.replace(/\D/g, '').slice(-8) || Date.now().toString().slice(-8);
}

function mergeSlotAvailability(
  raw: Record<string, SlotAvailability> | undefined,
  fallbackFull: boolean,
): Record<string, SlotAvailability> {
  const out: Record<string, SlotAvailability> = {};
  for (const s of VISIT_TIME_SLOTS) {
    const hit = raw?.[s.id];
    if (fallbackFull) {
      out[s.id] = hit ?? {
        booked: VISIT_SLOT_CAPACITY,
        capacity: VISIT_SLOT_CAPACITY,
        available: 0,
      };
    } else if (hit) {
      out[s.id] = hit;
    } else {
      out[s.id] = {
        booked: 0,
        capacity: VISIT_SLOT_CAPACITY,
        available: VISIT_SLOT_CAPACITY,
      };
    }
  }
  return out;
}

function parseApiError(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong';
  const t = err.message.trim();
  if (t.startsWith('{')) {
    try {
      const j = JSON.parse(t) as { error?: string };
      if (j.error) return j.error;
    } catch {
      /* ignore */
    }
  }
  return t || 'Something went wrong';
}

const emptyForm = (): VisitBookingFormState => ({
  name: '',
  email: '',
  phone: '',
  orgType: '',
  orgName: '',
  userLocation: '',
  visitorCount: 1,
  visitorNames: [''],
  ageGroup: 'mixed',
  gender: '',
  durationMinutes: '60',
  purpose: '',
  idNumber: 'NOT_REQUIRED', // Bypass on backend
  idDocumentDataUrl: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
});

export function VisitBooking() {
  const navigate = useNavigate();
  const { ashramId } = useParams<{ ashramId: string }>();
  const { currentUser } = useUser();

  const [ashram, setAshram] = useState<Ashram | null>(null);
  const [loadingAshram, setLoadingAshram] = useState(true);

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addDays(today, 90), [today]);
  const todayIso = useMemo(() => toLocalISODate(today), [today]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotAvail, setSlotAvail] = useState<Record<string, SlotAvailability>>({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsReady, setSlotsReady] = useState(false);

  const [form, setForm] = useState<VisitBookingFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    id: string;
    displayId: string;
    dateLabel: string;
    timeLabel: string;
    orgName: string;
    imageUrl: string;
    purposeLabel: string;
    visitorCount: number;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setForm((f) => ({
        ...f,
        name: currentUser.name || f.name,
        email: currentUser.email || f.email,
        phone: currentUser.phone || f.phone,
        userLocation: currentUser.location || f.userLocation,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!ashramId) {
      setLoadingAshram(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingAshram(true);
      try {
        const a = (await api.getAshram(ashramId)) as Ashram;
        if (!cancelled && a?.id) setAshram(a);
        else if (!cancelled) {
          const m = mockAshrams.find((x) => x.id === ashramId);
          if (m) setAshram(m);
        }
      } catch {
        if (!cancelled) {
          const m = mockAshrams.find((x) => x.id === ashramId);
          if (m) setAshram(m);
        }
      } finally {
        if (!cancelled) setLoadingAshram(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ashramId]);

  const dateStr = selectedDate ? toLocalISODate(selectedDate) : '';

  const refreshAvailability = useCallback(async () => {
    if (!ashramId || !dateStr) return;
    setLoadingSlots(true);
    setSlotsReady(false);
    try {
      const { slots } = await api.getVisitAvailability(ashramId, dateStr);
      setSlotAvail(mergeSlotAvailability(slots, false));
    } catch {
      setSlotAvail(mergeSlotAvailability(undefined, true));
    } finally {
      setLoadingSlots(false);
      setSlotsReady(true);
    }
  }, [ashramId, dateStr]);

  useEffect(() => {
    void refreshAvailability();
  }, [refreshAvailability]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [dateStr]);

  useEffect(() => {
    if (!selectedSlot || !slotAvail[selectedSlot]) return;
    if (slotAvail[selectedSlot].available < form.visitorCount) {
      setSelectedSlot(null);
    }
  }, [selectedSlot, slotAvail, form.visitorCount]);

  const handleSubmit = async () => {
    if (!ashramId || !selectedDate || !ashram || !currentUser?.id) {
      if (!currentUser?.id) {
        toast.error('Session expired. Please sign in to book a visit.');
        navigate('/login');
      }
      return;
    }
    setFieldError(null);
    const err = validateVisitBookingForm(form, {
      selectedDateIso: dateStr,
      selectedSlotId: selectedSlot,
      todayIso,
    });
    if (err) {
      setFieldError(err);
      return;
    }
    if (isBefore(startOfDay(selectedDate), today)) {
      setFieldError('Cannot book a past date');
      return;
    }

    const slotMeta = VISIT_TIME_SLOTS.find((s) => s.id === selectedSlot);
    setSubmitting(true);
    try {
      const doc = await api.createVisitBooking({
        ashramId,
        userId: currentUser.id,
        date: dateStr,
        timeSlot: selectedSlot,
        time: slotMeta?.label ?? '',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        userLocation: form.userLocation.trim(),
        visitorCount: form.visitorCount,
        visitorNames: form.visitorNames.map((n) => n.trim()),
        purpose: form.purpose,
        orgType: form.orgType,
        orgName: form.orgType === 'Individual' ? '' : form.orgName.trim(),
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        idNumber: form.idNumber,
        ageGroup: form.ageGroup,
        gender: form.gender || undefined,
        durationMinutes: Number(form.durationMinutes) || 60,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
      const id = (doc as { id?: string }).id || `visit-${Date.now()}`;
      const purposeLabel =
        VISIT_PURPOSE_OPTIONS.find((p) => p.id === form.purpose)?.label ?? form.purpose;

      setConfirmed({
        id,
        displayId: formatBookingId(id),
        dateLabel: selectedDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        timeLabel: slotMeta?.label ?? '',
        orgName: ashram.name,
        imageUrl: ashram.imageUrl,
        purposeLabel,
        visitorCount: form.visitorCount,
      });
      setConfirmOpen(true);
    } catch (e) {
      setFieldError(parseApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAshram) {
    return (
      <div className="section-container py-12 space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[600px] bg-muted animate-pulse rounded-3xl" />
          <div className="h-[400px] bg-muted animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!ashram || !ashramId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground text-center">Organization not found.</p>
        <Button onClick={() => navigate('/')} className="rounded-full">Back home</Button>
      </div>
    );
  }

  const canSubmitDate = Boolean(
    selectedDate && !isBefore(startOfDay(selectedDate), today),
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12">
      <div className="section-container space-y-8">
        {/* Back Link */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0 border border-zinc-200 bg-white">
            <ArrowLeft className="h-5 w-5 text-zinc-700" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">Book a Visit</h1>
            <p className="text-xs sm:text-sm text-zinc-500">Plan a visit to {ashram.name} in Nagpur</p>
          </div>
        </div>

        {fieldError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">
            {fieldError}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Date & Time */}
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date picker */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#0F6D4E]" />
                    Select Date
                  </h3>
                  <CalendarUi
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    defaultMonth={selectedDate}
                    disabled={(d) => isBefore(startOfDay(d), today) || isBefore(maxDate, startOfDay(d))}
                    fromDate={today}
                    toDate={maxDate}
                    className="mx-auto border border-zinc-100 p-2 rounded-2xl"
                    classNames={{
                      day_selected:
                        '!bg-[#0F6D4E] !text-white rounded-full hover:!bg-[#0c593f] hover:!text-white focus:!bg-[#0F6D4E]',
                      day_today: 'font-bold text-zinc-950 underline',
                    }}
                  />
                </div>

                {/* Time slot picker */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#0F6D4E]" />
                    Select Time Slot
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Up to {VISIT_SLOT_CAPACITY} visitors per slot. Please choose a slot that accommodates your party.
                  </p>
                  {loadingSlots && !slotsReady ? (
                    <p className="text-xs text-muted-foreground animate-pulse">Loading availability…</p>
                  ) : null}
                  <VisitTimeSlotGrid
                    selectedSlotId={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                    availabilityById={slotAvail}
                    loading={loadingSlots}
                    ready={slotsReady}
                    maxSelectable={form.visitorCount}
                  />
                </div>
              </div>
            </Card>

            {/* Step 2: Visitors Details */}
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-[#0F6D4E]" />
                Visitor Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full name */}
                <div className="space-y-2">
                  <Label htmlFor="vb-name" className="text-zinc-700 font-medium">Full Name</Label>
                  <Input
                    id="vb-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="rounded-xl border-zinc-200"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="vb-email" className="text-zinc-700 font-medium">Email Address</Label>
                  <Input
                    id="vb-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="rounded-xl border-zinc-200"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="vb-phone" className="text-zinc-700 font-medium">Mobile Number</Label>
                  <Input
                    id="vb-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="rounded-xl border-zinc-200"
                    placeholder="10-digit mobile number"
                  />
                </div>

                {/* City location */}
                <div className="space-y-2">
                  <Label htmlFor="vb-loc" className="text-zinc-700 font-medium">Your City / Location</Label>
                  <Input
                    id="vb-loc"
                    value={form.userLocation}
                    onChange={(e) => setForm((f) => ({ ...f, userLocation: e.target.value }))}
                    className="rounded-xl border-zinc-200"
                    placeholder="e.g. Nagpur, Maharashtra"
                  />
                </div>

                {/* Organization Type */}
                <div className="space-y-2">
                  <Label className="text-zinc-700 font-medium">Organization Type</Label>
                  <Select
                    value={form.orgType || undefined}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        orgType: v as VisitBookingFormState['orgType'],
                        orgName: v === 'Individual' ? '' : f.orgName,
                      }))
                    }
                  >
                    <SelectTrigger className="rounded-xl border-zinc-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100]">
                      {['Individual', 'NGO', 'College', 'School', 'Corporate'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization Name (Conditional) */}
                {form.orgType && form.orgType !== 'Individual' && (
                  <div className="space-y-2">
                    <Label htmlFor="vb-orgname" className="text-zinc-700 font-medium">Organization Name</Label>
                    <Input
                      id="vb-orgname"
                      value={form.orgName}
                      onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))}
                      className="rounded-xl border-zinc-200"
                      placeholder="Enter organization/college name"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Step 3: Purpose & Count */}
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-[#0F6D4E]" />
                Purpose & Group Size
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visitor count */}
                <div className="space-y-2">
                  <Label className="text-zinc-700 font-medium">Number of Visitors</Label>
                  <Select
                    value={String(form.visitorCount)}
                    onValueChange={(v) => {
                      const n = Math.min(VISIT_MAX_PARTY, Math.max(1, Number(v) || 1));
                      setForm((f) => ({
                        ...f,
                        visitorCount: n,
                        visitorNames: Array.from({ length: n }, (_, i) => f.visitorNames[i] ?? ''),
                      }));
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100]">
                      {Array.from({ length: VISIT_MAX_PARTY }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? 'person' : 'people'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label className="text-zinc-700 font-medium">Purpose of Visit</Label>
                  <Select
                    value={form.purpose || undefined}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, purpose: v }))
                    }
                  >
                    <SelectTrigger className="rounded-xl border-zinc-200">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100]">
                      {VISIT_PURPOSE_OPTIONS.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Visitor names inputs */}
              <div className="space-y-3">
                <Label className="text-zinc-700 font-medium">Visitor Names</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Please provide names for each person attending.</p>
                {form.visitorNames.map((name, i) => (
                  <Input
                    key={i}
                    value={name}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...f.visitorNames];
                        next[i] = e.target.value;
                        return { ...f, visitorNames: next };
                      })
                    }
                    className="rounded-xl border-zinc-200"
                    placeholder={`Visitor ${i + 1} full name`}
                  />
                ))}
              </div>
            </Card>

            {/* Step 4: Emergency Contact */}
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0F6D4E]" />
                Emergency Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vb-ec-name" className="text-zinc-700 font-medium">Contact Person Name</Label>
                  <Input
                    id="vb-ec-name"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm((f) => ({ ...f, emergencyContactName: e.target.value }))}
                    className="rounded-xl border-zinc-200"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vb-ec-phone" className="text-zinc-700 font-medium">Contact Person Phone</Label>
                  <Input
                    id="vb-ec-phone"
                    type="tel"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))}
                    className="rounded-xl border-zinc-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 rounded-full h-12"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canSubmitDate || submitting}
                onClick={() => void handleSubmit()}
                className="w-2/3 rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] h-12 font-bold text-white shadow-md border-none"
              >
                {submitting ? 'Submitting Booking…' : 'Submit Visit Booking'}
              </Button>
            </div>
          </div>

          {/* Sidebar Location / Instructions */}
          <div className="space-y-8">
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <MapPin className="h-4 w-4 text-[#0F6D4E]" />
                Ashram Location
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-semibold">
                {ashram.location}
              </p>
              
              <div className="relative overflow-hidden rounded-2xl bg-zinc-50 border aspect-video h-48">
                <iframe
                  title="Niswartha Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.52982230485!2d79.00247348981146!3d21.139300975253805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c0a5a3d0f0d5%3A0x2c64115049cfad7a!2sNagpur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1719114751480!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <a
                href="https://maps.google.com/?q=Deaf+and+Dumb+Industrial+Institute+Nagpur"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full rounded-full gap-1.5 font-bold text-xs h-10 border-[#0F6D4E] text-[#0F6D4E] hover:bg-[#0F6D4E]/5">
                  Get Directions
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-[#0F6D4E] to-[#0c593f] p-6 text-white space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wide">Visitor Guidelines</h4>
              <ul className="text-xs text-white/90 space-y-2 list-disc list-inside leading-relaxed">
                <li>Visits must be booked at least 24 hours in advance.</li>
                <li>Please arrive 10 minutes prior to your selected slot.</li>
                <li>Ensure you bring a government-issued photo ID.</li>
                <li>Interactions with students are guided by school supervisors.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) {
            setConfirmed((c) => {
              if (c) navigate('/my-bookings');
              return null;
            });
          }
        }}
      >
        <DialogContent
          className="max-w-md rounded-3xl border-none bg-white p-6 shadow-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {confirmed && (
            <div className="space-y-4">
              <DialogHeader className="items-center space-y-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-8 w-8 text-[#0F6D4E] stroke-[3]" />
                </div>
                <DialogTitle className="text-xl font-bold text-zinc-900">Visit Booked Successfully</DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  Your visit has been confirmed and saved to your account. An email has been sent.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 space-y-2.5 text-sm">
                <p className="text-center font-bold text-[#0F6D4E]">
                  Booking ID: {confirmed.displayId}
                </p>
                <div className="border-t border-zinc-200/50 pt-2 space-y-1 text-xs text-zinc-600">
                  <p><strong>Organization:</strong> {confirmed.orgName}</p>
                  <p><strong>Date:</strong> {confirmed.dateLabel}</p>
                  <p><strong>Time Slot:</strong> {confirmed.timeLabel}</p>
                  <p><strong>Visitors:</strong> {confirmed.visitorCount} {confirmed.visitorCount === 1 ? 'person' : 'people'}</p>
                  <p><strong>Purpose:</strong> {confirmed.purposeLabel}</p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => {
                    setConfirmOpen(false);
                    navigate('/my-bookings');
                  }}
                  className="w-full rounded-full bg-[#0F6D4E] text-white hover:bg-[#0c593f]"
                >
                  Go to My Bookings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
