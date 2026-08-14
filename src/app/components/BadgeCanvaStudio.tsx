import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sparkles, Palette, Download, Check, Layers, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BadgeCanvaStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImage: (imageUrl: string) => void;
  initialTitle?: string;
  initialHero?: string;
  initialSymbol?: string;
}

const PRESET_TEMPLATES = [
  {
    id: 'gryffindor',
    name: 'Gryffindor Crimson & Gold',
    bgStart: '#800000',
    bgEnd: '#cc0000',
    border: '#ffd700',
    symbol: '🦁',
    title: 'Lion of Courage',
    hero: 'Gryffindor',
  },
  {
    id: 'slytherin',
    name: 'Slytherin Emerald & Silver',
    bgStart: '#064e3b',
    bgEnd: '#0f6d4e',
    border: '#e2e8f0',
    symbol: '🐍',
    title: 'Ambition Crest',
    hero: 'Slytherin',
  },
  {
    id: 'ravenclaw',
    name: 'Ravenclaw Sapphire & Bronze',
    bgStart: '#1e3a8a',
    bgEnd: '#2563eb',
    border: '#d97706',
    symbol: '🦅',
    title: 'Wisdom Eagle',
    hero: 'Ravenclaw',
  },
  {
    id: 'hufflepuff',
    name: 'Hufflepuff Canary & Onyx',
    bgStart: '#d97706',
    bgEnd: '#f59e0b',
    border: '#18181b',
    symbol: '🦡',
    title: 'Loyalty Shield',
    hero: 'Hufflepuff',
  },
  {
    id: 'avengers',
    name: 'Avengers Titanium Blue',
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
    border: '#38bdf8',
    symbol: '🅰️',
    title: 'Avengers Assembled',
    hero: 'Avengers',
  },
  {
    id: 'superman',
    name: 'Superman Sol & Steel',
    bgStart: '#1d4ed8',
    bgEnd: '#dc2626',
    border: '#facc15',
    symbol: '⚡',
    title: 'Man of Steel',
    hero: 'Superman',
  },
  {
    id: 'batman',
    name: 'Batman Dark Obsidian',
    bgStart: '#09090b',
    bgEnd: '#27272a',
    border: '#eab308',
    symbol: '🦇',
    title: 'Dark Knight',
    hero: 'Batman',
  },
  {
    id: 'ironman',
    name: 'Iron Man Arc Gold',
    bgStart: '#7f1d1d',
    bgEnd: '#b91c1c',
    border: '#f59e0b',
    symbol: '⚙️',
    title: 'Arc Benefactor',
    hero: 'Iron Man',
  },
];

export function BadgeCanvaStudio({
  isOpen,
  onClose,
  onApplyImage,
  initialTitle = 'Honor Badge',
  initialHero = 'Hero',
  initialSymbol = '🛡️',
}: BadgeCanvaStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [title, setTitle] = useState(initialTitle);
  const [hero, setHero] = useState(initialHero);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [bgStart, setBgStart] = useState('#0f6d4e');
  const [bgEnd, setBgEnd] = useState('#042f2e');
  const [borderColor, setBorderColor] = useState('#f59e0b');
  const [ringStyle, setRingStyle] = useState<'gold' | 'silver' | 'emerald' | 'glow'>('gold');

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialHero) setHero(initialHero);
    if (initialSymbol) setSymbol(initialSymbol);
  }, [initialTitle, initialHero, initialSymbol]);

  // Render Canvas Artwork
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 12;

    ctx.clearRect(0, 0, size, size);

    // Outer Glow / Shadow
    ctx.save();
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = bgStart;
    ctx.fill();
    ctx.restore();

    // Radial Gradient Background
    const radGrad = ctx.createRadialGradient(center - 30, center - 30, 10, center, center, radius);
    radGrad.addColorStop(0, bgStart);
    radGrad.addColorStop(1, bgEnd);

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = radGrad;
    ctx.fill();

    // Metallic Outer Ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Inner Metallic Accent Ring
    ctx.beginPath();
    ctx.arc(center, center, radius - 8, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();

    // Center Emblem Symbol
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '64px sans-serif';
    ctx.fillText(symbol || '🛡️', center, center - 20);

    // Hero Title Text
    ctx.font = 'bold 16px serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(hero.toUpperCase(), center, center + 42);

    // Subtitle Text
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = borderColor;
    ctx.fillText(title.toUpperCase(), center, center + 64);

    // Glass Shine Arc Reflection
    ctx.beginPath();
    ctx.arc(center, center, radius - 4, Math.PI * 1.15, Math.PI * 1.85);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();
  }, [isOpen, title, hero, symbol, bgStart, bgEnd, borderColor, ringStyle]);

  const applyTemplate = (tpl: (typeof PRESET_TEMPLATES)[0]) => {
    setBgStart(tpl.bgStart);
    setBgEnd(tpl.bgEnd);
    setBorderColor(tpl.border);
    setSymbol(tpl.symbol);
    setTitle(tpl.title);
    setHero(tpl.hero);
  };

  const handleExportAndApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onApplyImage(dataUrl);
    toast.success('Custom badge graphic designed and applied!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-3xl bg-zinc-950 text-white p-6 border-zinc-800 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-bold text-amber-400 flex items-center gap-2">
            <Palette className="h-5 w-5 text-amber-400" />
            Canva Badge Studio & Creative Designer
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
          {/* Left Canvas Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="relative p-2 bg-black/40 rounded-full border border-amber-400/30 shadow-2xl">
              <canvas ref={canvasRef} width={300} height={300} className="w-[220px] h-[220px] rounded-full" />
            </div>
            <p className="text-[11px] text-zinc-400 font-mono text-center">
              Real-time High-Res PNG Canva Preview
            </p>
          </div>

          {/* Right Customization Controls */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Presets */}
            <div className="space-y-1.5">
              <Label className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Canva Theme Presets
              </Label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-400 whitespace-nowrap text-[10px] font-bold text-zinc-200 transition-all"
                  >
                    {tpl.symbol} {tpl.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-[10px]">Gradient Start</Label>
                <input
                  type="color"
                  value={bgStart}
                  onChange={(e) => setBgStart(e.target.value)}
                  className="w-full h-8 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-[10px]">Gradient End</Label>
                <input
                  type="color"
                  value={bgEnd}
                  onChange={(e) => setBgEnd(e.target.value)}
                  className="w-full h-8 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-[10px]">Border Ring</Label>
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-full h-8 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-[10px]">Hero / House Title</Label>
                <Input
                  value={hero}
                  onChange={(e) => setHero(e.target.value)}
                  placeholder="e.g. Gryffindor"
                  className="bg-zinc-900 border-zinc-700 text-xs h-9 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-400 text-[10px]">Badge Subtitle</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lion Honor"
                  className="bg-zinc-900 border-zinc-700 text-xs h-9 text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-400 text-[10px]">Emblem Symbol / Emoji</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. 🦁, ⚡, 🛡️, 🦇, 🐍"
                className="bg-zinc-900 border-zinc-700 text-xs h-9 text-white"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="rounded-full text-xs border-zinc-700 text-zinc-300">
            Cancel
          </Button>
          <Button
            onClick={handleExportAndApply}
            className="rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs gap-1.5 shadow-lg"
          >
            <Check className="h-4 w-4" /> Export & Apply Custom Graphic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
