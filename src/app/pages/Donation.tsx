import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { mockAshrams, mockNeeds } from '../data/mock';
import { Check, CreditCard, ArrowLeft, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import type { Ashram, Need } from '../types';
import {
  addNeedToCart,
  clearCart,
  getCart,
  remainingForLine,
  removeNeedFromCart,
  setCart,
  type CartLine,
} from '../lib/donationCart';
import { Link } from 'react-router';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[src=\"https://checkout.razorpay.com/v1/checkout.js\"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function Donation() {
  const { id: ashramId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const needParam = searchParams.get('need');
  const { currentUser } = useUser();

  const [ashram, setAshram] = useState<Ashram | null>(null);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  /** Per-need rupee amounts (need-specific donations) */
  const [needAmounts, setNeedAmounts] = useState<Record<string, number>>({});
  /** General ashram donation (no needs in cart) */
  const [generalAmount, setGeneralAmount] = useState<number | ''>('');
  const [customGeneral, setCustomGeneral] = useState('');

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [lastBreakdown, setLastBreakdown] = useState<{ title: string; amount: number }[]>([]);
  const [lastTotal, setLastTotal] = useState(0);

  const hasNeedCart = cartLines.length > 0;

  useEffect(() => {
    if (!ashramId) return;
    let cancelled = false;
    (async () => {
      try {
        const a = await api.getAshram(ashramId);
        if (!cancelled) setAshram(a as Ashram);
      } catch {
        const m = mockAshrams.find((x) => x.id === ashramId);
        if (!cancelled) setAshram(m || null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ashramId]);

  useEffect(() => {
    if (!ashramId) return;
    let cancelled = false;
    (async () => {
      if (needParam) {
        try {
          const n = await api.getNeed(needParam);
          if (n.ashramId === ashramId) addNeedToCart(n as Need);
        } catch {
          const m = mockNeeds.find((x) => x.id === needParam && x.ashramId === ashramId);
          if (m) addNeedToCart(m);
        }
      }

      let lines = getCart().filter((l) => l.ashramId === ashramId);
      const refreshed: CartLine[] = [];
      for (const l of lines) {
        try {
          const n = await api.getNeed(l.needId);
          refreshed.push({
            needId: n.id,
            ashramId: n.ashramId,
            title: n.title,
            imageUrl: n.imageUrl,
            quantityRequired: n.quantityRequired,
            quantityFulfilled: n.quantityFulfilled,
          });
        } catch {
          const m = mockNeeds.find((x) => x.id === l.needId);
          if (m) {
            refreshed.push({
              needId: m.id,
              ashramId: m.ashramId,
              title: m.title,
              imageUrl: m.imageUrl,
              quantityRequired: m.quantityRequired,
              quantityFulfilled: m.quantityFulfilled,
            });
          }
        }
      }
      if (cancelled) return;
      setCart(refreshed);
      setCartLines(refreshed);
      const am: Record<string, number> = {};
      for (const line of refreshed) {
        const rem = remainingForLine(line);
        am[line.needId] = rem > 0 ? Math.min(500, rem) : 0;
      }
      setNeedAmounts(am);
    })();
    return () => {
      cancelled = true;
    };
  }, [ashramId, needParam]);

  const totalNeedDonation = useMemo(() => {
    return cartLines.reduce((sum, line) => {
      const raw = needAmounts[line.needId] ?? 0;
      const rem = remainingForLine(line);
      const n = Math.min(Math.max(0, Number(raw) || 0), rem);
      return sum + n;
    }, 0);
  }, [cartLines, needAmounts]);

  const generalTotal = (generalAmount || Number(customGeneral) || 0) as number;

  const payableTotal = hasNeedCart ? totalNeedDonation : generalTotal;

  const goNextFromAmount = () => {
    if (hasNeedCart) {
      const active = cartLines.filter((line) => {
        const rem = remainingForLine(line);
        const v = Math.min(Math.max(0, Number(needAmounts[line.needId]) || 0), rem);
        return rem > 0 && v > 0;
      });
      if (active.length === 0) {
        toast.error('Enter at least one amount toward a need that is not yet complete.');
        return;
      }
      for (const line of active) {
        const rem = remainingForLine(line);
        const v = Math.min(Math.max(0, Number(needAmounts[line.needId]) || 0), rem);
        if (v <= 0 || v > rem) {
          toast.error('Check amounts — each must be within the remaining goal.');
          return;
        }
      }
    } else {
      const t = generalAmount || Number(customGeneral);
      if (!t || t <= 0) {
        toast.error('Please choose or enter a donation amount.');
        return;
      }
    }
    setStep(2);
  };

  const handlePay = async () => {
    if (!currentUser) {
      toast.error('Please log in to make a donation');
      navigate('/login');
      return;
    }
    if (!ashram) return;

    setProcessing(true);
    try {
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
      if (!keyId) {
        toast.error('Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID in .env');
        setProcessing(false);
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error('Could not load Razorpay checkout');
        setProcessing(false);
        return;
      }

      const date = new Date().toISOString();
      const total = payableTotal;
      const order = await api.createRazorpayOrder({
        amount: total,
        currency: 'INR',
        receipt: `rcpt_${currentUser.id.slice(-8)}_${Date.now()}`,
        notes: {
          userId: currentUser.id,
          ashramId: ashram.id,
        },
      });

      const recordDonation = async () => {
        if (hasNeedCart) {
          const lines = cartLines
            .map((line) => {
              const rem = remainingForLine(line);
              const amt = Math.min(
                Math.max(0, Number(needAmounts[line.needId]) || 0),
                rem,
              );
              return { needId: line.needId, amount: amt, title: line.title };
            })
            .filter((x) => x.amount > 0);

          try {
            await api.createDonationsBatch({
              userId: currentUser.id,
              ashramId: ashram.id,
              lines: lines.map(({ needId, amount }) => ({ needId, amount })),
              date,
              status: 'completed',
            });
          } catch {
            for (const row of lines) {
              await api.createDonation({
                userId: currentUser.id,
                ashramId: ashram.id,
                needId: row.needId,
                amount: row.amount,
                date,
                status: 'completed',
              });
            }
          }

          setLastBreakdown(lines.map((l) => ({ title: l.title, amount: l.amount })));
          setLastTotal(lines.reduce((s, l) => s + l.amount, 0));
          clearCart();
          setCartLines([]);
        } else {
          const amt = Number(generalAmount || customGeneral);
          await api.createDonation({
            userId: currentUser.id,
            ashramId: ashram.id,
            amount: amt,
            date,
            status: 'completed',
          });
          setLastBreakdown([{ title: 'General support', amount: amt }]);
          setLastTotal(amt);
        }
      };

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: ashram.name,
        description: 'Donation',
        handler: async () => {
          await recordDonation();
          setStep(4);
          toast.success('Payment successful! Thank you.');
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: { color: '#84cc16' },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });

      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setProcessing(false);
      });
      rzp.open();
    } catch (e: any) {
      console.error('Payment Error:', e);
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Payment failed: ${msg}`);
    } finally {
      // Processing state is cleared on modal dismiss / failure / success.
    }
  };

  if (!ashramId || !ashram) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">
        Ashram not found
      </div>
    );
  }

  const updateNeedAmount = (needId: string, value: string) => {
    const line = cartLines.find((l) => l.needId === needId);
    const rem = line ? remainingForLine(line) : 0;
    const n = Math.min(Math.max(0, Number(value) || 0), rem);
    setNeedAmounts((prev) => ({ ...prev, [needId]: n }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-10">
      <header className="p-4 flex items-center border-b border-border/60 bg-background/95 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="ml-3 min-w-0">
          <h1 className="text-lg font-bold truncate">Donate</h1>
          <p className="text-xs text-muted-foreground truncate">{ashram.name}</p>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-6"
            >
              {hasNeedCart ? (
                <>
                  <div>
                    <h2 className="text-xl font-serif font-semibold">Amount per need</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your gift goes toward completing each goal. You can adjust how much applies to
                      each line (up to what is still needed).
                    </p>
                  </div>
                  <div className="space-y-4">
                    {cartLines.map((line) => {
                      const rem = remainingForLine(line);
                      const goal = Number(line.quantityRequired) || 0;
                      const done = Number(line.quantityFulfilled) || 0;
                      return (
                        <Card key={line.needId} className="overflow-hidden border shadow-sm">
                          <div className="flex gap-3 p-3">
                            <img
                              src={
                                line.imageUrl ||
                                'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80'
                              }
                              alt=""
                              className="h-16 w-16 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{line.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Goal ₹{goal.toLocaleString()} · Raised ₹{done.toLocaleString()}
                              </p>
                              <p className="text-xs font-semibold text-primary mt-1">
                                ₹{rem.toLocaleString()} left to complete
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 h-8 w-8 text-muted-foreground"
                              onClick={() => {
                                removeNeedFromCart(line.needId);
                                setCartLines(getCart().filter((l) => l.ashramId === ashramId));
                                setNeedAmounts((prev) => {
                                  const next = { ...prev };
                                  delete next[line.needId];
                                  return next;
                                });
                              }}
                            >
                              ×
                            </Button>
                          </div>
                          <div className="px-3 pb-3 flex items-center gap-2">
                            <span className="text-muted-foreground font-bold">₹</span>
                            <Input
                              type="number"
                              min={0}
                              max={rem}
                              disabled={rem <= 0}
                              value={rem <= 0 ? 0 : needAmounts[line.needId] ?? ''}
                              onChange={(e) => updateNeedAmount(line.needId, e.target.value)}
                              className="h-11 font-medium"
                            />
                          </div>
                          {rem <= 0 && (
                            <p className="px-3 pb-2 text-[11px] text-amber-700">
                              This need is fully funded — remove it or browse other needs.
                            </p>
                          )}
                        </Card>
                      );
                    })}
                  </div>

                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to="/needs">
                      <PlusCircle className="h-4 w-4" />
                      Fulfill more needs
                    </Link>
                  </Button>

                  <div className="rounded-xl border bg-muted/30 p-4 flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>₹{totalNeedDonation.toLocaleString()}</span>
                  </div>

                  <Button className="w-full h-12 text-lg" onClick={goNextFromAmount}>
                    Continue to confirmation
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-serif font-semibold">Select amount</h2>
                  <p className="text-sm text-muted-foreground">
                    General donation to {ashram.name}. To fund specific needs, open{' '}
                    <Link to="/needs" className="text-primary underline">
                      Urgent Needs
                    </Link>
                    .
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[500, 1000, 2000, 5000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setGeneralAmount(val);
                          setCustomGeneral('');
                        }}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          generalAmount === val
                            ? 'border-primary bg-primary/5 text-primary font-bold'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customGeneral}
                      onChange={(e) => {
                        setCustomGeneral(e.target.value);
                        setGeneralAmount('');
                      }}
                      className="pl-8 h-14 text-lg font-medium"
                    />
                  </div>
                  <Button className="w-full h-12 text-lg" onClick={goNextFromAmount}>
                    Continue to confirmation
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-serif font-semibold">Confirm your donation</h2>
              <p className="text-sm text-muted-foreground">
                Please review the details before you continue to payment.
              </p>

              <Card className="border shadow-sm">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium text-right max-w-[60%]">{ashram.name}</span>
                  </div>
                  {hasNeedCart ? (
                    cartLines.map((line) => {
                      const rem = remainingForLine(line);
                      const amt = Math.min(
                        Math.max(0, Number(needAmounts[line.needId]) || 0),
                        rem,
                      );
                      if (amt <= 0) return null;
                      return (
                        <div
                          key={line.needId}
                          className="flex justify-between gap-2 text-sm border-t pt-3 first:border-0 first:pt-0"
                        >
                          <span className="text-muted-foreground line-clamp-2">{line.title}</span>
                          <span className="font-semibold shrink-0">₹{amt.toLocaleString()}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">General donation</span>
                      <span className="font-semibold">
                        ₹{(generalAmount || Number(customGeneral)).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-3">
                    <span>Total</span>
                    <span>₹{payableTotal.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Edit amounts
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue to payment
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-serif font-semibold">Payment method</h2>
              <div className="space-y-3">
                <div className="flex items-center p-4 border rounded-xl gap-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Credit / Debit card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                  </div>
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-primary rounded-full" />
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Donation total</span>
                  <span className="font-medium">₹{payableTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-lg">
                  <span>Pay</span>
                  <span>₹{payableTotal.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-center text-muted-foreground">
                By paying you confirm this is a voluntary contribution. This demo does not charge a
                real card.
              </p>

              <Button
                className="w-full h-14 text-lg shadow-lg"
                onClick={handlePay}
                disabled={processing}
              >
                {processing ? 'Processing…' : `Confirm & pay ₹${payableTotal.toLocaleString()}`}
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
                Back
              </Button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-6 pt-4"
            >
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Check className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary">Thank you</h2>
              <p className="text-muted-foreground text-sm">
                Your contribution of ₹{lastTotal.toLocaleString()} to {ashram.name} was recorded.
              </p>

              <Card className="w-full text-left border shadow-sm">
                <div className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Applied to
                  </p>
                  {lastBreakdown.map((row) => (
                    <div key={row.title} className="flex justify-between text-sm">
                      <span className="line-clamp-2 pr-2">{row.title}</span>
                      <span className="font-medium shrink-0">₹{row.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex flex-col gap-3 w-full">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link to="/needs" onClick={() => clearCart()}>
                    <PlusCircle className="h-4 w-4" />
                    Fulfill more needs
                  </Link>
                </Button>
                <Button className="w-full" onClick={() => navigate('/')}>
                  Back to home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
