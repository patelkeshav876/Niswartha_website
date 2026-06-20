import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { mockAshrams, mockNeeds } from '../data/mock';
import { api } from '../lib/api';
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
  const { ashramId, needId } = useParams<{ ashramId: string; needId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [ashram, setAshram] = useState<Ashram | null>(null);
  const [need, setNeed] = useState<Need | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [deliveryDate, setDeliveryDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (!ashramId || !needId) {
      setLoadError('Missing ashram or need.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [a, n] = await Promise.all([
          api.getAshram(ashramId),
          api.getNeed(needId),
        ]);
        if (cancelled) return;
        if (n.ashramId !== ashramId) {
          setLoadError('This need does not belong to this ashram.');
          return;
        }
        setAshram(a as Ashram);
        setNeed(n as Need);
        setLoadError(null);
      } catch {
        const mA = mockAshrams.find((x) => x.id === ashramId);
        const mN = mockNeeds.find((x) => x.id === needId && x.ashramId === ashramId);
        if (cancelled) return;
        if (!mA || !mN) {
          setLoadError('Need or ashram not found.');
          return;
        }
        setAshram(mA);
        setNeed(mN);
        setLoadError(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ashramId, needId]);

  const NeedIcon = need ? needCategoryIcon(need.category) : Package;

  const remainingQty = useMemo(() => {
    if (!need) return 0;
    return Math.max(0, need.quantityRequired - need.quantityFulfilled);
  }, [need]);

  const handleSubmitShipment = () => {
    if (!deliveryDate.trim() || !fullName.trim() || !phone.trim()) return;
    setReference(randomRef());
    setStep(4);
  };

  if (loadError || !ashram || !need) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-background px-4 pb-24 pt-4">
        <Button variant="ghost" size="sm" className="mb-4 w-fit -ml-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <p className="text-center text-muted-foreground">{loadError || 'Loading…'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-background pb-24">
      <div className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
                      Goal ₹{need.quantityRequired.toLocaleString()} · ₹
                      {remainingQty.toLocaleString()} remaining
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
              Donating for: <span className="font-semibold text-foreground">{need.title}</span>
            </p>

            <Accordion type="single" collapsible className="space-y-2 w-full">
              <AccordionItem value="visit" className="rounded-xl border bg-card px-1 shadow-sm">
                <AccordionTrigger className="px-3 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                      <Footprints className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Physical visit</span>
                        <Badge className="bg-primary text-primary-foreground text-[10px]">
                          Most impactful
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal">
                        Visit the orphanage in person
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Book a slot and meet the children — your presence often means as much as any gift.
                  </p>
                  <Button
                    className="w-full rounded-xl"
                    onClick={() => navigate(`/visit-book/${ashram.id}`)}
                  >
                    Book a visit
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="money" className="rounded-xl border bg-card px-1 shadow-sm">
                <AccordionTrigger className="px-3 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                      <Banknote className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Send money</span>
                        <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px] text-white">
                          Fastest
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal">
                        Remote monetary donation
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Complete a secure payment toward this ashram; you can include this need in your
                    donation basket on the next screen.
                  </p>
                  <Button
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-600/90"
                    onClick={() =>
                      navigate(`/donate/${ashram.id}?need=${encodeURIComponent(need.id)}`)
                    }
                  >
                    Continue to payment
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="items" className="rounded-xl border bg-card px-1 shadow-sm">
                <AccordionTrigger className="px-3 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                      <Truck className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Send items</span>
                        <Badge className="bg-violet-600 hover:bg-violet-600 text-[10px] text-white">
                          Direct need
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal">
                        Ship items via courier
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Tell us when to expect your package and how to reach you — the admin will confirm
                    when it arrives.
                  </p>
                  <Button
                    className="w-full rounded-xl bg-violet-600 hover:bg-violet-600/90"
                    onClick={() => setStep(3)}
                  >
                    Continue with shipment
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <Card className="border-none shadow-md">
              <CardContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery">Expected delivery date</Label>
                  <Input
                    id="delivery"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullname">Your full name</Label>
                  <Input
                    id="fullname"
                    placeholder="e.g. Amara Osei"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g. Package contains 15 blankets..."
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
                <li>Admin confirms receipt once items arrive</li>
                <li>Need status updates to Fulfilled after admin verification</li>
              </ul>
            </div>

            <Button
              className="h-12 w-full rounded-xl"
              disabled={!deliveryDate.trim() || !fullName.trim() || !phone.trim()}
              onClick={handleSubmitShipment}
            >
              Submit shipment details
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <Card className="border-none shadow-md text-center">
              <CardContent className="p-6 space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-8 w-8" />
                </div>
                <h2 className="font-serif text-xl font-bold">Donation confirmed!</h2>
                <p className="text-sm text-muted-foreground">{ashram.name}</p>
                <p className="text-sm font-mono font-medium">
                  Reference: {reference}
                </p>
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

            <Button className="h-12 w-full rounded-xl" onClick={() => navigate('/needs')}>
              Back to needs list
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
