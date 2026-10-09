import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LottieLoader } from '../components/LottieLoader';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockAshrams } from '../data/mock';
import { ArrowLeft, MessageCircle, Phone, Package, ShieldCheck, ExternalLink, Heart } from 'lucide-react';
import { api } from '../lib/api';
import type { Ashram } from '../types';

export function Donation() {
  const { id: ashramId } = useParams();
  const navigate = useNavigate();

  const [ashram, setAshram] = useState<Ashram | null>(null);
  const [loadingAshram, setLoadingAshram] = useState(true);

  useEffect(() => {
    if (!ashramId) {
      setLoadingAshram(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const a = await api.getAshram(ashramId);
        if (!cancelled) setAshram(a as Ashram);
      } catch {
        const m = mockAshrams.find((x) => x.id === ashramId);
        if (!cancelled) setAshram(m || null);
      } finally {
        if (!cancelled) setLoadingAshram(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ashramId]);

  if (loadingAshram) {
    return <LottieLoader message="Loading Ashram Contact Info..." />;
  }

  if (!ashramId || !ashram) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif font-bold text-zinc-950 mb-2">Ashram Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">We could not locate the requested ashram page.</p>
        <Button onClick={() => navigate('/')} className="rounded-full bg-[#1E3A8A] text-white px-6">
          Return Home
        </Button>
      </div>
    );
  }

  const whatsappNumber = '919823011223';
  const whatsappMessage = encodeURIComponent(
    `Hello Niswartha Ashram Team, I would like to support ${ashram.name}. Please guide me with direct item contributions or ashram support.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20 lg:pt-24 pb-16">
      <main className="flex-1 max-w-2xl mx-auto px-4 w-full space-y-6 animate-fade-up">
        {/* Header Bar */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-serif font-bold text-zinc-950 leading-tight">Direct Ashram Support</h1>
              <p className="text-xs text-[#1E3A8A] font-semibold">{ashram.name}</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-[#1E3A8A] border-none font-bold text-[10px] px-2.5 py-1">
            <ShieldCheck className="h-3 w-3 mr-1" /> Direct Ashram Contact
          </Badge>
        </div>

        {/* Main Notice & Action Card */}
        <Card className="border border-emerald-800/20 bg-gradient-to-br from-[#1E3A8A] to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Heart className="h-40 w-40 text-white" />
          </div>

          <div className="relative z-10 space-y-3">
            <Badge className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] uppercase font-mono font-bold tracking-wider px-3 py-1">
              Direct Ashram Connection
            </Badge>
            <h2 className="text-2xl font-serif font-bold tracking-tight">Support {ashram.name} Directly</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              We do not collect online money or website payment checkouts. To contribute physical items, arrange supplies, or discuss support, please connect directly with the ashram administration or send item shipment details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm p-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              Chat on WhatsApp
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>

            <a
              href={`tel:${ashram.phone || '9823011223'}`}
              className="flex items-center justify-center gap-2.5 bg-white text-[#1E3A8A] hover:bg-emerald-50 font-bold text-sm p-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Phone className="h-5 w-5" />
              Call Ashram Directly
            </a>
          </div>
        </Card>

        {/* Physical Item Shipment Flow Link */}
        <Card className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
              <Package className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-serif font-bold text-zinc-900 text-base">Sending Physical Goods or Supplies?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Log your sent item shipment (food, books, clothes, hearing aids) so the ashram team can verify receipt and issue an official acknowledgment proof receipt in your profile.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/donate-flow?ashram=${ashram.id}`)}
            className="w-full bg-[#1E3A8A] hover:bg-[#0c593f] text-white font-bold text-xs rounded-xl h-12 gap-2 shadow-sm"
          >
            <Package className="h-4 w-4" /> Send Physical Items & Get Receipt Proof
          </Button>
        </Card>
      </main>
    </div>
  );
}
