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

function SupportDoodle() {
  return (
    <div className="w-full flex items-center justify-center py-2">
      <svg
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[260px] h-auto drop-shadow-sm select-none"
      >
        {/* Soft background glow doodle blobs */}
        <path
          d="M60 90C40 40 100 20 160 30C220 20 280 50 260 100C240 150 180 160 140 155C90 150 70 120 60 90Z"
          fill="currentColor"
          className="text-primary/10"
        />
        {/* Big Heart at top */}
        <path
          d="M160 42C150 24 125 24 116 38C104 56 122 80 160 104C198 80 216 56 204 38C195 24 170 24 160 42Z"
          fill="#F43F5E"
          stroke="#9F1239"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sparkles / Little doodles */}
        <path d="M75 45L78 52L85 55L78 58L75 65L72 58L65 55L72 52Z" fill="#FBBF24" />
        <path d="M245 40L247 45L252 47L247 49L245 54L243 49L238 47L243 45Z" fill="#FBBF24" />
        <circle cx="95" cy="120" r="3" fill="#60A5FA" />
        <circle cx="230" cy="115" r="4" fill="#34D399" />
        <path d="M50 110C55 105 65 108 70 112" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="M250 110C255 105 265 108 270 112" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />

        {/* Gift / Care Box doodle */}
        <rect
          x="115"
          y="95"
          width="90"
          height="65"
          rx="12"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="2.5"
        />
        {/* Box Lid */}
        <rect
          x="108"
          y="85"
          width="104"
          height="16"
          rx="6"
          fill="#F8FAFC"
          stroke="#1E293B"
          strokeWidth="2.5"
        />
        {/* Ribbon Vertical */}
        <line x1="160" y1="85" x2="160" y2="160" stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" />
        {/* Ribbon Bow */}
        <path
          d="M160 85C148 72 135 78 142 85C150 90 156 86 160 85ZM160 85C172 72 185 78 178 85C170 90 164 86 160 85Z"
          fill="#FFE4E6"
          stroke="#E11D48"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Helping Hands Doodle underneath */}
        <path
          d="M65 145C85 142 105 130 115 125M255 145C235 142 215 130 205 125"
          stroke="#1E293B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

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
        <Button onClick={() => navigate('/')} className="rounded-full bg-primary text-primary-foreground px-6">
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
        <div className="bg-card p-4 rounded-2xl border border-border shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-serif font-bold text-foreground leading-tight">Direct Ashram Support</h1>
              <p className="text-xs text-primary font-semibold">{ashram.name}</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px] px-2.5 py-1">
            <ShieldCheck className="h-3 w-3 mr-1" /> Verified Ashram
          </Badge>
        </div>

        {/* Main Notice & Action Card */}
        <Card className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-3 text-center sm:text-left">
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-mono font-bold tracking-wider px-3 py-1">
              Direct Ashram Connection
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Support {ashram.name}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              We do not collect online payments or intermediate checkouts. To contribute food items, educational stationery, hearing supplies, or visit our children, connect directly with the ashram team or log physical goods shipments.
            </p>
          </div>

          {/* Minimalist SVG Line-Art Doodle */}
          <SupportDoodle />

          {/* Action Buttons */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm p-4 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              Chat on WhatsApp
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>

            <a
              href={`tel:${ashram.phone || '9823011223'}`}
              className="flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm p-4 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Phone className="h-5 w-5" />
              Call Ashram Directly
            </a>
          </div>
        </Card>

        {/* Physical Item Shipment Flow Link */}
        <Card className="border border-border rounded-3xl p-6 bg-card shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Package className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-serif font-bold text-foreground text-base">Sending Physical Goods or Supplies?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log your sent item shipment (food, books, clothes, hearing aids) so the ashram team can verify receipt and issue an official acknowledgment receipt proof in your profile.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/donate-flow?ashram=${ashram.id}`)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-2xl h-12 gap-2 shadow-sm"
          >
            <Package className="h-4 w-4" /> Send Physical Items & Get Receipt Proof
          </Button>
        </Card>
      </main>
    </div>
  );
}
