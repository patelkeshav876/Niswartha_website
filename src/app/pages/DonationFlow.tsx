import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { LottieLoader } from '../components/LottieLoader';
import {
  ArrowLeft,
  MapPin,
  Package,
  Apple,
  Shirt,
  BookOpen,
  Stethoscope,
  Building2,
  Users,
  ShieldCheck,
  Info,
  Footprints,
  Banknote,
  Truck,
  Check,
  Circle,
  Calendar as CalendarIcon,
  Printer,
  FileText,
  Download,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar as CalendarUi } from '../components/ui/calendar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { mockAshrams, mockNeeds } from '../data/mock';
import { api } from '../lib/api';
import { useUser } from '../context/UserContext';
import type { Ashram, Need } from '../types';
import { cn } from '../lib/utils';

const PROGRESS_LABELS = ['Need', 'Branch', 'Details', 'Done'] as const;

function needCategoryIcon(category: Need['category']) {
  switch (category) {
    case 'Food':
      return Apple;
    case 'Clothes':
      return Shirt;
    case 'Education':
      return BookOpen;
    case 'Healthcare':
      return Stethoscope;
    default:
      return Package;
  }
}

function formatVerifiedDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function randomRef(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `DON-${n}`;
}

function StepProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  const allComplete = step === 4;
  return (
    <div className="mb-6">
      <div className="flex items-start">
        {PROGRESS_LABELS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4;
          const done = allComplete || step > n;
          const current = !allComplete && step === n;
          return (
            <Fragment key={label}>
              {i > 0 && (
                <div
                  className={cn(
                    'mx-0.5 mt-4 h-0.5 min-w-[6px] flex-1 rounded-full',
                    allComplete || step > i ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
              <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    done && 'bg-primary text-primary-foreground',
                    current &&
                    'bg-primary text-primary-foreground ring-2 ring-primary/25 ring-offset-2 ring-offset-background',
                    !done &&
                    !current &&
                    'border-2 border-muted-foreground/35 bg-background text-muted-foreground',
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </div>
                <span
                  className={cn(
                    'text-center text-[10px] font-medium leading-tight',
                    current && 'text-primary',
                    !current && !done && 'text-muted-foreground',
                    done && 'text-foreground',
                  )}
                >
                  {label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function DonationFlow() {
  const params = useParams<{ ashramId?: string; needId?: string }>();
  const [searchParams] = useSearchParams();
  const rawAshramId = params.ashramId || searchParams.get('ashram') || searchParams.get('ashramId') || 'ashram-1';
  const rawNeedId = params.needId || searchParams.get('need') || searchParams.get('needId');

  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [ashram, setAshram] = useState<Ashram | null>(null);
  const [need, setNeed] = useState<Need | null>(null);
  const [availableNeeds, setAvailableNeeds] = useState<Need[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const today = useMemo(() => new Date(), []);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | undefined>(today);
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');
  const [submittingShipment, setSubmittingShipment] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name || '');
      if (!phone) setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, allNeeds, c] = await Promise.all([
          api.getAshram(rawAshramId).catch(() => mockAshrams.find((x) => x.id === rawAshramId) || mockAshrams[0]),
          api.getNeeds(rawAshramId).catch(() => mockNeeds.filter((n) => n.ashramId === rawAshramId)),
          api.getConfig().catch(() => null),
        ]);
        if (cancelled) return;
        const targetAshram = (a as Ashram) || mockAshrams[0];
        setAshram(targetAshram);
        if (c) setConfig(c);

        const ashramNeeds = Array.isArray(allNeeds) && allNeeds.length > 0
          ? allNeeds
          : mockNeeds.filter((n) => n.ashramId === targetAshram.id || n.ashramId === rawAshramId);
        setAvailableNeeds(ashramNeeds);

        let targetNeed: Need | null = null;
        if (rawNeedId) {
          targetNeed = ashramNeeds.find((n) => n.id === rawNeedId) || null;
          if (!targetNeed) {
            try {
              targetNeed = (await api.getNeed(rawNeedId)) as Need;
            } catch {}
          }
        }
        if (!targetNeed && ashramNeeds.length > 0) {
          targetNeed = ashramNeeds[0];
        }
        if (!targetNeed) {
          targetNeed = {
            id: 'need-care-general',
            ashramId: targetAshram.id,
            title: 'General Essential Care & Physical Provisions',
            description: 'Physical items, groceries, books, clothes, or hygiene supplies delivered directly to our ashram children.',
            category: 'Food',
            quantityRequired: 50,
            quantityFulfilled: 0,
            unit: 'Shipments / Kits',
            urgency: 'high',
            imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=75&fm=webp',
          };
        }
        setNeed(targetNeed);
        setLoadError(null);
      } catch {
        if (cancelled) return;
        const fallbackAshram = mockAshrams.find((x) => x.id === rawAshramId) || mockAshrams[0];
        const fallbackNeeds = mockNeeds.filter((n) => n.ashramId === rawAshramId);
        setAshram(fallbackAshram);
        setAvailableNeeds(fallbackNeeds);
        setNeed(fallbackNeeds[0] || mockNeeds[0]);
        setLoadError(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawAshramId, rawNeedId]);

  const NeedIcon = need ? needCategoryIcon(need.category) : Package;

  const remainingQty = useMemo(() => {
    if (!need) return 0;
    return Math.max(0, need.quantityRequired - need.quantityFulfilled);
  }, [need]);

  const handleSubmitShipment = async () => {
    if (!selectedDeliveryDate || !fullName.trim() || !phone.trim() || !ashram || !need) return;
    setSubmittingShipment(true);
    const ref = randomRef();
    const dateStr = selectedDeliveryDate.toISOString().split('T')[0];
    setReference(ref);

    try {
      await api.createItemDonation({
        reference: ref,
        referenceNumber: ref,
        userId: currentUser?.id || phone.trim(),
        userEmail: currentUser?.email || '',
        ashramId: ashram.id,
        ashramName: ashram.name,
        needId: need.id,
        needTitle: need.title,
        category: need.category,
        fullName: fullName.trim(),
        donorName: fullName.trim(),
        phone: phone.trim(),
        donorPhone: phone.trim(),
        quantity: 1,
        deliveryDate: dateStr,
        expectedDeliveryDate: dateStr,
        scheduledDate: dateStr,
        notes: notes.trim(),
        courierName: notes.trim() ? notes.trim().slice(0, 50) : 'Courier / Direct Parcel',
        status: 'pending',
      });
      setStep(4);
    } catch {
      setStep(4);
    } finally {
      setSubmittingShipment(false);
    }
  };

  if (loading) {
    return <LottieLoader message="Loading Item Details..." />;
  }

  if (loadError || !ashram || !need) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-background px-4 pb-24 pt-20 items-center justify-center text-center">
        <h2 className="text-xl font-serif font-bold text-zinc-950 mb-2">Item Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">{loadError || 'The requested need could not be found.'}</p>
        <Button onClick={() => navigate('/needs')} className="rounded-full bg-[#1E3A8A] text-white px-6">
          Browse Active Needs
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[540px] bg-background pt-16 lg:pt-20 pb-24">
      <div className="sticky top-16 lg:top-20 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => {
              if (step === 1) navigate(-1);
              else if (step === 3) setStep(2);
              else if (step === 4) navigate('/needs');
              else setStep(1);
            }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Item donation
            </p>
            <h1 className="font-serif text-lg font-bold text-primary leading-tight">
              {step === 1 && 'Selected need'}
              {step === 2 && 'How would you like to help?'}
              {step === 3 && 'Send items'}
              {step === 4 && 'Donation confirmed'}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        <p className="text-center text-xs text-muted-foreground mb-1">
          Step {step} of 4
        </p>
        <StepProgress step={step} />

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {availableNeeds.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600">Choose Item Need / Category</Label>
                <select
                  value={need.id}
                  onChange={(e) => {
                    const found = availableNeeds.find((n) => n.id === e.target.value);
                    if (found) setNeed(found);
                  }}
                  className="w-full text-xs font-semibold bg-white border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                >
                  {availableNeeds.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({n.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Card className="border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <NeedIcon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-base leading-snug">{need.title}</h2>
                      <Badge className="shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        Available
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{need.category}</p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Quantity Needed: {need.quantityRequired.toLocaleString()} Units · {remainingQty.toLocaleString()} Units remaining
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {need.urgency === 'high' && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                High urgency — the orphanage needs this soon.
              </div>
            )}

            <Card className="border-none shadow-sm">
              <CardContent className="space-y-4 p-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Beneficiary</p>
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold">{ashram.name}</p>
                      <div className="mt-0.5 flex items-start gap-1 text-muted-foreground text-xs">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{ashram.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Benefits</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>50+ children directly supported through verified programs</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Admin verified</p>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Yes — need verified {formatVerifiedDate(need.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                This item will be marked Pending once you proceed and shipment details are shared
                with the orphanage admin.
              </p>
            </div>

            <Button className="h-12 w-full rounded-xl" onClick={() => setStep(2)}>
              Proceed to Step 2
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground">
              Supporting need: <span className="font-semibold text-foreground">{need.title}</span>
            </p>

            <Accordion type="single" collapsible defaultValue="items" className="space-y-2 w-full">
              <AccordionItem value="items" className="rounded-xl border bg-card px-1 shadow-sm">
                <AccordionTrigger className="px-3 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                      <Truck className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Send items via courier</span>
                        <Badge className="bg-violet-600 hover:bg-violet-600 text-[10px] text-white">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal">
                        Ship items directly to institute address
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Tell us when to expect your package and how to reach you — the admin will verify and acknowledge receipt.
                  </p>
                  <Button
                    className="w-full rounded-xl bg-violet-600 hover:bg-violet-600/90 font-bold"
                    onClick={() => setStep(3)}
                  >
                    Continue with shipment details
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="visit" className="rounded-xl border bg-card px-1 shadow-sm">
                <AccordionTrigger className="px-3 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                      <Footprints className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Physical visit and hand delivery</span>
                        <Badge className="bg-primary text-primary-foreground text-[10px]">
                          In Person
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal">
                        Visit the orphanage and deliver items in person
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Book a slot and meet the children — bring your items directly during your campus visit.
                  </p>
                  <Button
                    className="w-full rounded-xl font-bold"
                    onClick={() => navigate(`/visit-book/${ashram.id}`)}
                  >
                    Book a visit
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contact" className="rounded-xl border bg-card px-1 shadow-sm">
                <AccordionTrigger className="px-3 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Contact Ashram Directly / WhatsApp</span>
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] text-white">
                          Direct Contact
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal">
                        Chat on WhatsApp or call orphanage administration
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Speak directly with the ashram team regarding item delivery, custom requirements, or inquiries.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {(() => {
                      const rawNum = String(config?.whatsappNumber || '9131201107').replace(/[^\d]/g, '');
                      const cleanWa = rawNum.length === 10 ? `91${rawNum}` : rawNum;
                      const callPhone = config?.ashramPhone || ashram.contact.phone || '+91 91312 01107';
                      const telNumber = callPhone.replace(/[^\d+]/g, '');
                      return (
                        <>
                          <a
                            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                              `Hello Niswartha Team, I want to inquire/support your ashram for need: ${need.title}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                              Chat on WhatsApp
                            </Button>
                          </a>
                          <a href={`tel:${telNumber}`} className="flex-1">
                            <Button variant="outline" className="w-full rounded-xl font-bold border-zinc-200">
                              Call Ashram ({callPhone})
                            </Button>
                          </a>
                        </>
                      );
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <Card className="border-none shadow-md">
              <CardContent className="space-y-5 p-4 sm:p-5">
                {/* Theme Calendar Picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#1E3A8A]" />
                    Expected Delivery Date
                  </Label>
                  <div className="flex justify-center bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs">
                    <CalendarUi
                      mode="single"
                      selected={selectedDeliveryDate}
                      onSelect={(d) => d && setSelectedDeliveryDate(d)}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="mx-auto"
                      classNames={{
                        day_selected:
                          '!bg-[#1E3A8A] !text-white rounded-full hover:!bg-[#0c593f] hover:!text-white focus:!bg-[#1E3A8A]',
                        day_today: 'font-bold text-zinc-950 underline',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullname">Your full name</Label>
                  <Input
                    id="fullname"
                    placeholder="e.g. Amara Osei"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact phone number (10 Digits)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g. Package contains 15 blankets, shipping via BlueDart..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <p className="font-semibold text-primary mb-2">What happens next?</p>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground text-xs">
                <li>Orphanage admin receives your courier details instantly</li>
                <li>Admin verifies and acknowledges receipt once items arrive</li>
                <li>You receive an instant notification & proof update in your Profile</li>
              </ul>
            </div>

            <Button
              className="h-12 w-full rounded-xl bg-[#1E3A8A] hover:bg-[#0c593f]"
              disabled={!selectedDeliveryDate || !fullName.trim() || !phone.trim() || submittingShipment}
              onClick={handleSubmitShipment}
            >
              {submittingShipment ? 'Submitting...' : 'Submit shipment details'}
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Official Item Donation Receipt Proof Slip */}
            <Card className="border-2 border-emerald-500/30 rounded-3xl bg-white shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-700 via-primary to-primary text-white p-5 text-center relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> Official Shipment Receipt Proof
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl">Niswartha Support Acknowledgment</h3>
                <p className="text-[11px] text-white/90 font-mono mt-0.5">Ref No: {reference}</p>
              </div>

              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-zinc-100 pb-3">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Ashram Institution</span>
                    <span className="font-bold text-zinc-900 text-xs sm:text-sm">{ashram.name}</span>
                    <span className="text-[11px] text-zinc-500 block truncate">{ashram.location}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Donor Information</span>
                    <span className="font-bold text-zinc-900 text-xs sm:text-sm">{fullName}</span>
                    <span className="text-[11px] text-zinc-500 block">{phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-b border-zinc-100 pb-3">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Supported Need / Item</span>
                    <span className="font-bold text-zinc-900">{need.title}</span>
                    <span className="text-[11px] text-primary block font-medium">Category: {need.category}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Expected Arrival</span>
                    <span className="font-bold text-zinc-900">
                      {selectedDeliveryDate ? selectedDeliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled'}
                    </span>
                    <span className="text-[11px] text-emerald-600 block font-bold">Status: Pledged & Verified ✓</span>
                  </div>
                </div>

                {notes && (
                  <div className="text-xs bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/60">
                    <span className="font-bold text-zinc-700">Courier / Package Note: </span>
                    <span className="text-zinc-600">{notes}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl gap-2 text-xs font-bold border-zinc-300 hover:bg-zinc-50 h-11"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4 text-zinc-600" /> Print / Save Receipt Proof
                  </Button>
                  <Button
                    className="flex-1 rounded-xl gap-2 text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white h-11 shadow-xs"
                    onClick={() => navigate('/donation-history')}
                  >
                    <FileText className="h-4 w-4" /> View in Donation History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-4">Donation journey</p>
                <div className="relative space-y-0 pl-2">
                  {[
                    { label: 'Need selected', done: true },
                    { label: 'Donation initiated', done: true },
                    { label: 'Shipment details received', done: true },
                    { label: 'Admin verification', done: false },
                    { label: 'Need marked fulfilled', done: false },
                  ].map((item, i, arr) => (
                    <div key={item.label} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        {item.done ? (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                        )}
                        {i < arr.length - 1 && (
                          <div
                            className={cn(
                              'w-px flex-1 min-h-[12px] mt-1',
                              item.done ? 'bg-primary/40' : 'bg-border',
                            )}
                          />
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-sm pt-0.5',
                          item.done ? 'text-foreground font-medium' : 'text-muted-foreground',
                        )}
                      >
                        {item.label}
                        {!item.done && (
                          <span className="block text-[11px] font-normal text-muted-foreground">
                            (pending)
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                What happens next: The orphanage admin has been notified. They will confirm when your
                shipment arrives and update the need when it is fulfilled.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl text-xs font-semibold"
                onClick={() => navigate('/profile')}
              >
                Go to My Profile
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl text-xs font-semibold"
                onClick={() => navigate('/needs')}
              >
                Back to Needs
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
