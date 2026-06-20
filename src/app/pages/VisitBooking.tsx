import 'react-day-picker/dist/style.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { addDays, startOfDay, isBefore } from 'date-fns';
import { ArrowLeft, Calendar, Check, Clock, MapPin, ShieldCheck } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { VisitTimeSlotGrid, type SlotAvailability } from '../components/visit/VisitTimeSlotGrid';
import {
  AGE_GROUP_OPTIONS,
  DURATION_OPTIONS,
  GENDER_OPTIONS,
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

const ACCENT = '#FF6633';
const ACCENT_HOVER = '#e85a2e';

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
  userLocation: '',
  visitorCount: 1,
  visitorNames: [''],
  ageGroup: '',
  gender: '',
  durationMinutes: '',
  purpose: '',
  idNumber: '',
  idDocumentDataUrl: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  phoneOtpToken: '',
  phoneOtpVerified: false,
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
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpHint, setOtpHint] = useState<string | null>(null);

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
    durationLabel: string;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setForm((f) => ({
        ...f,
        name: currentUser.name || f.name,
        email: currentUser.email || f.email,
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

  const sendOtp = async () => {
    setFieldError(null);
    setOtpHint(null);
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setFieldError('Enter a valid 10-digit mobile number');
      return;
    }
    setOtpSending(true);
    try {
      const out = await api.sendVisitOtp(form.phone);
      if (out.devCode) {
        setOtpHint(`Demo OTP: ${out.devCode}`);
        setOtpCode(out.devCode);
      } else {
        setOtpHint('We sent a 6-digit code to your phone.');
      }
      setForm((f) => ({ ...f, phoneOtpToken: '', phoneOtpVerified: false }));
      setOtpCode('');
    } catch (e) {
      setFieldError(parseApiError(e));
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    setFieldError(null);
    if (otpCode.trim().length !== 6) {
      setFieldError('Enter the 6-digit OTP');
      return;
    }
    setOtpVerifying(true);
    try {
      const out = await api.verifyVisitOtp(form.phone, otpCode.trim());
      setForm((f) => ({
        ...f,
        phoneOtpToken: out.phoneOtpToken,
        phoneOtpVerified: true,
      }));
      setOtpHint(null);
    } catch (e) {
      setFieldError(parseApiError(e));
    } finally {
      setOtpVerifying(false);
    }
  };

  const onIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 320 * 1024) {
      setFieldError('ID image must be under 320KB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, idDocumentDataUrl: String(reader.result || '') }));
      setFieldError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!ashramId || !selectedDate || !ashram || !currentUser?.id) {
      if (!currentUser?.id) {
        toast.error('Session expired. Please re-login.');
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
        phoneOtpToken: form.phoneOtpToken,
        userLocation: form.userLocation.trim(),
        visitorCount: form.visitorCount,
        visitorNames: form.visitorNames.map((n) => n.trim()),
        ageGroup: form.ageGroup,
        gender: form.gender || undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        purpose: form.purpose,
        idNumber: form.idNumber.trim(),
        idDocumentDataUrl: form.idDocumentDataUrl || undefined,
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
      const id = (doc as { id?: string }).id || `visit-${Date.now()}`;
      const purposeLabel =
        VISIT_PURPOSE_OPTIONS.find((p) => p.id === form.purpose)?.label ?? form.purpose;
      const durationLabel = form.durationMinutes
        ? DURATION_OPTIONS.find((d) => d.value === form.durationMinutes)?.label ?? ''
        : 'Not specified';

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
        durationLabel,
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
      <div className="mx-auto min-h-screen max-w-[480px] bg-background pb-24">
        <div className="sticky top-0 z-40 border-b bg-background/95 px-4 py-4 backdrop-blur-md">
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-4 p-4">
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!ashram || !ashramId) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center gap-4 px-6 pb-24">
        <p className="text-muted-foreground text-center">Organization not found.</p>
        <Button onClick={() => navigate('/')}>Back home</Button>
      </div>
    );
  }

  const canSubmitDate = Boolean(
    selectedDate && !isBefore(startOfDay(selectedDate), today),
  );

  return (
    <div className="relative mx-auto min-h-screen max-w-[480px] bg-[#fafafa] pb-[28rem]">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="flex-1 text-center text-base font-bold text-zinc-900 pr-9">Book a visit</h1>
        </div>
      </header>

      <div className="relative z-10 space-y-5 p-4">
        {fieldError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {fieldError}
          </p>
        )}

        <div>
          <h2 className="mb-2 text-sm font-bold text-zinc-900">Visit date</h2>
          <Card className="overflow-hidden rounded-2xl border-zinc-100 shadow-md">
            <CardContent className="p-2 sm:p-3">
              <CalendarUi
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                defaultMonth={selectedDate}
                disabled={(d) => isBefore(startOfDay(d), today) || isBefore(maxDate, startOfDay(d))}
                fromDate={today}
                toDate={maxDate}
                className="mx-auto w-full"
                classNames={{
                  day_selected:
                    '!bg-[#FF6633] !text-white rounded-full hover:!bg-[#e85a2e] hover:!text-white focus:!bg-[#FF6633]',
                  day_today: 'font-semibold text-zinc-900',
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-bold text-zinc-900">Time slot</h2>
          <p className="mb-3 text-xs text-zinc-500">
            Up to {VISIT_SLOT_CAPACITY} people per slot (your party must fit in remaining space).
          </p>
          {loadingSlots && !slotsReady ? (
            <p className="text-sm text-muted-foreground">Loading availability…</p>
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

        <Card className="rounded-2xl border-zinc-100 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <h3 className="text-sm font-bold text-zinc-900">Your details</h3>
            <div className="space-y-2">
              <Label htmlFor="vb-name">Full name</Label>
              <Input
                id="vb-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vb-email">Email</Label>
              <Input
                id="vb-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-xl"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vb-phone">Mobile (OTP)</Label>
              <div className="flex gap-2">
                <Input
                  id="vb-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone: e.target.value,
                      phoneOtpVerified: false,
                      phoneOtpToken: '',
                    }))
                  }
                  className="rounded-xl"
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 rounded-xl"
                  disabled={otpSending}
                  onClick={() => void sendOtp()}
                >
                  {otpSending ? '…' : 'Send OTP'}
                </Button>
              </div>
              {otpHint && <p className="text-xs text-orange-700">{otpHint}</p>}
              <div className="flex gap-2">
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="rounded-xl"
                  placeholder="6-digit OTP"
                  maxLength={6}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-xl"
                  disabled={otpVerifying}
                  onClick={() => void verifyOtp()}
                >
                  {otpVerifying ? '…' : 'Verify'}
                </Button>
              </div>
              {form.phoneOtpVerified && (
                <p className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Phone verified
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vb-loc">Your city / location</Label>
              <Input
                id="vb-loc"
                value={form.userLocation}
                onChange={(e) => setForm((f) => ({ ...f, userLocation: e.target.value }))}
                className="rounded-xl"
                placeholder="e.g. Nagpur, Maharashtra"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-100 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <h3 className="text-sm font-bold text-zinc-900">Visitors</h3>
            <div className="space-y-2">
              <Label>Number of visitors</Label>
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
                <SelectTrigger className="rounded-xl">
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
            <div className="space-y-2">
              <Label>Age group</Label>
              <Select
                value={form.ageGroup || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, ageGroup: v as VisitBookingFormState['ageGroup'] }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100]">
                  {AGE_GROUP_OPTIONS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gender (optional)</Label>
              <Select
                value={form.gender || '__none__'}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, gender: v === '__none__' ? '' : v }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Prefer not to say" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100]">
                  {GENDER_OPTIONS.map((o) => (
                    <SelectItem key={o.id || 'prefer-not'} value={o.id || '__none__'}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visitor names</Label>
              <p className="text-xs text-muted-foreground">Legal / preferred name for each person.</p>
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
                  className="rounded-xl"
                  placeholder={`Visitor ${i + 1} full name`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-100 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <h3 className="text-sm font-bold text-zinc-900">Visit</h3>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select
                value={form.purpose || undefined}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, purpose: v as VisitBookingFormState['purpose'] }))
                }
              >
                <SelectTrigger className="rounded-xl">
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
            <div className="space-y-2">
              <Label>Duration (optional)</Label>
              <Select
                value={form.durationMinutes || '__none__'}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, durationMinutes: v === '__none__' ? '' : v }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100]">
                  {DURATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value || 'n'} value={o.value || '__none__'}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-100 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <h3 className="text-sm font-bold text-zinc-900">ID & emergency</h3>
            <div className="space-y-2">
              <Label htmlFor="vb-id">Government ID number</Label>
              <Input
                id="vb-id"
                value={form.idNumber}
                onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
                className="rounded-xl"
                placeholder="Aadhaar / passport / other"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vb-id-file">ID document photo (optional)</Label>
              <Input
                id="vb-id-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="rounded-xl text-sm"
                onChange={onIdFile}
              />
              {form.idDocumentDataUrl && (
                <p className="text-xs text-emerald-700">Image attached</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vb-ec-name">Emergency contact name</Label>
              <Input
                id="vb-ec-name"
                value={form.emergencyContactName}
                onChange={(e) => setForm((f) => ({ ...f, emergencyContactName: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vb-ec-phone">Emergency contact phone</Label>
              <Input
                id="vb-ec-phone"
                type="tel"
                value={form.emergencyContactPhone}
                onChange={(e) => setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="mx-auto w-full max-w-[480px] space-y-2">
          <Button
            type="button"
            disabled={!canSubmitDate || submitting}
            className="h-12 w-full rounded-2xl text-base font-semibold text-white shadow-lg border-0"
            style={{ backgroundColor: ACCENT }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = ACCENT_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ACCENT;
            }}
            onClick={() => void handleSubmit()}
          >
            {submitting ? 'Submitting…' : 'Submit booking'}
          </Button>
        </div>
      </div>

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
          className="max-w-[min(100%,22rem)] rounded-3xl border-0 bg-white p-6 shadow-2xl sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {confirmed && (
            <>
              <DialogHeader className="items-center space-y-3 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Check className="h-8 w-8 text-white stroke-[3]" />
                </div>
                <DialogTitle className="text-xl font-bold text-zinc-900">Booking confirmed</DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  A summary was sent to your email. Keep your booking ID for reference.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 max-h-[50vh] space-y-3 overflow-y-auto rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-left text-sm">
                <p className="text-center font-semibold" style={{ color: ACCENT }}>
                  Booking ID — {confirmed.displayId}
                </p>
                <div className="flex gap-3">
                  <img
                    src={confirmed.imageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-bold text-zinc-900">{confirmed.orgName}</p>
                    <div className="flex items-start gap-2 text-xs text-zinc-600">
                      <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{confirmed.dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{confirmed.timeLabel}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-zinc-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{ashram.location}</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      <span className="font-medium text-zinc-800">Purpose:</span> {confirmed.purposeLabel}
                    </p>
                    <p className="text-xs text-zinc-600">
                      <span className="font-medium text-zinc-800">Visitors:</span> {confirmed.visitorCount}
                    </p>
                    <p className="text-xs text-zinc-600">
                      <span className="font-medium text-zinc-800">Duration:</span> {confirmed.durationLabel}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-2 sm:justify-stretch">
                <Button
                  type="button"
                  className="h-12 w-full rounded-2xl font-semibold text-white border-0"
                  style={{ backgroundColor: ACCENT }}
                  onClick={() => setConfirmOpen(false)}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
