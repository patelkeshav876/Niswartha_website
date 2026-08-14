import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MediaPickerModal } from './MediaPickerModal';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Layers,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Monitor,
  Smartphone,
  Eye,
  Check
} from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

const PAGES = [
  { key: 'home', label: 'Home Page' },
  { key: 'about', label: 'About Us' },
  { key: 'events', label: 'Events Page' },
  { key: 'needs', label: 'Current Needs' },
  { key: 'gallery', label: 'Photo Gallery' },
  { key: 'schemes', label: 'Government Schemes' },
  { key: 'ashram-detail', label: 'Ashram Details' },
];

export function HeroManager() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [form, setForm] = useState({
    pageKey: 'home',
    bgType: 'gradient',
    bgUrl: '',
    bgVideoUrl: '',
    mobileFallbackUrl: '',
    overlayOpacity: 0.55,
    blurIntensity: 0,
    brightness: 1.0,
    textAlign: 'center',
    sizeMode: 'standard',
    customHeight: 550,
    objectFit: 'cover',
    autoPlayVideo: true,
    loopVideo: true,
    parallax: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Media Picker modal states
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'bgUrl' | 'bgVideoUrl' | 'mobileFallbackUrl'>('bgUrl');
  const [mediaPickerType, setMediaPickerType] = useState<'image' | 'video' | 'any'>('any');

  const fetchConfig = async (pageKey: string) => {
    setLoading(true);
    try {
      const data = await api.getHeroConfig(pageKey);
      setForm({
        pageKey,
        bgType: data?.bgType || 'gradient',
        bgUrl: data?.bgUrl || '',
        bgVideoUrl: data?.bgVideoUrl || '',
        mobileFallbackUrl: data?.mobileFallbackUrl || '',
        overlayOpacity: data?.overlayOpacity !== undefined ? Number(data.overlayOpacity) : 0.55,
        blurIntensity: data?.blurIntensity !== undefined ? Number(data.blurIntensity) : 0,
        brightness: data?.brightness !== undefined ? Number(data.brightness) : 1.0,
        textAlign: data?.textAlign || 'center',
        sizeMode: data?.sizeMode || 'standard',
        customHeight: data?.customHeight !== undefined ? Number(data.customHeight) : 550,
        objectFit: data?.objectFit || 'cover',
        autoPlayVideo: data?.autoPlayVideo !== undefined ? Boolean(data.autoPlayVideo) : true,
        loopVideo: data?.loopVideo !== undefined ? Boolean(data.loopVideo) : true,
        parallax: data?.parallax !== undefined ? Boolean(data.parallax) : true,
      });
    } catch {
      toast.error('Failed to load hero configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchConfig(selectedPage);
  }, [selectedPage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateHeroConfig(selectedPage, form);
      toast.success(`Hero backdrop configuration saved for ${PAGES.find((p) => p.key === selectedPage)?.label}`);
    } catch {
      toast.error('Failed to save hero configuration');
    } finally {
      setSaving(false);
    }
  };

  const openPicker = (target: 'bgUrl' | 'bgVideoUrl' | 'mobileFallbackUrl', allowed: 'image' | 'video' | 'any') => {
    setMediaPickerTarget(target);
    setMediaPickerType(allowed);
    setMediaPickerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Page Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Dynamic Hero Background Manager</h2>
            <p className="text-xs text-muted-foreground">Customize hero media, overlays, blur, brightness, and text alignment for each page</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="text-xs bg-card border rounded-full px-4 py-2 font-bold text-zinc-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
          >
            {PAGES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
          <Button onClick={handleSave} disabled={saving} className="rounded-full text-xs px-5 shadow">
            <Save className="h-3.5 w-3.5 mr-1.5" /> {saving ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b pb-2 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> Media and Visual Type
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'gradient', label: 'Gradient Canvas', icon: Sparkles },
                  { type: 'image', label: 'Cover Image', icon: ImageIcon },
                  { type: 'video', label: 'Ambient Video', icon: Video },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setForm({ ...form, bgType: item.type })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      form.bgType === item.type
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30 shadow-sm'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Image URL Inputs */}
              {form.bgType === 'image' && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-xs font-bold text-zinc-700 uppercase">Background Image URL</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL or pick from Media Library..."
                      value={form.bgUrl}
                      onChange={(e) => setForm({ ...form, bgUrl: e.target.value })}
                      className="text-xs rounded-xl flex-1"
                    />
                    <Button type="button" variant="outline" className="rounded-xl text-xs whitespace-nowrap" onClick={() => openPicker('bgUrl', 'image')}>
                      Media Library
                    </Button>
                  </div>
                </div>
              )}

              {/* Video URL Inputs */}
              {form.bgType === 'video' && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase">Background Video Link URL (.mp4 / WebM)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste video URL or select video from Media Library..."
                        value={form.bgVideoUrl}
                        onChange={(e) => setForm({ ...form, bgVideoUrl: e.target.value })}
                        className="text-xs rounded-xl flex-1"
                      />
                      <Button type="button" variant="outline" className="rounded-xl text-xs whitespace-nowrap" onClick={() => openPicker('bgVideoUrl', 'video')}>
                        Media Library
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase">Mobile Fallback Image URL</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Image URL shown on small screens or when video fails..."
                        value={form.mobileFallbackUrl}
                        onChange={(e) => setForm({ ...form, mobileFallbackUrl: e.target.value })}
                        className="text-xs rounded-xl flex-1"
                      />
                      <Button type="button" variant="outline" className="rounded-xl text-xs whitespace-nowrap" onClick={() => openPicker('mobileFallbackUrl', 'image')}>
                        Media Library
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.autoPlayVideo}
                        onChange={(e) => setForm({ ...form, autoPlayVideo: e.target.checked })}
                        className="rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      Auto-Play Video
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.loopVideo}
                        onChange={(e) => setForm({ ...form, loopVideo: e.target.checked })}
                        className="rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      Loop Video
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hero Height & Dimension Sizing */}
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b pb-2 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> Hero Dimensions and Height Sizing
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { mode: 'full', label: 'Full Screen (100vh)', sub: 'Like Home Hero' },
                  { mode: 'standard', label: 'Standard (80vh)', sub: 'High Impact' },
                  { mode: 'compact', label: 'Compact (50vh)', sub: 'Header Banner' },
                  { mode: 'custom', label: 'Custom Length', sub: 'Specify Height' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setForm({ ...form, sizeMode: item.mode })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      form.sizeMode === item.mode
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30 shadow-sm'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>

              {form.sizeMode === 'custom' && (
                <div className="space-y-2 pt-2 border-t bg-zinc-50 p-4 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <label className="text-zinc-700 uppercase">Custom Height (Pixels)</label>
                    <span className="text-primary font-mono">{form.customHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="1000"
                    step="20"
                    value={form.customHeight}
                    onChange={(e) => setForm({ ...form, customHeight: Number(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-zinc-500">Drag to adjust exact hero container height between 300px and 1000px.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase">Media Scaling / Fit Mode</label>
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    {[
                      { fit: 'cover', label: 'Cover (Crop Fill)' },
                      { fit: 'contain', label: 'Contain (Fit All)' },
                      { fit: 'fill', label: 'Stretch (Full Fill)' },
                    ].map((item) => (
                      <button
                        key={item.fit}
                        type="button"
                        onClick={() => setForm({ ...form, objectFit: item.fit })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          form.objectFit === item.fit ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Effects & Typography */}
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b pb-2 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> Visual Effects and Layout Controls
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 bg-zinc-50 p-3 rounded-xl border">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Dark Overlay</span>
                    <span className="text-primary">{Math.round(form.overlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={form.overlayOpacity}
                    onChange={(e) => setForm({ ...form, overlayOpacity: Number(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2 bg-zinc-50 p-3 rounded-xl border">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Blur Intensity</span>
                    <span className="text-primary">{form.blurIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={form.blurIntensity}
                    onChange={(e) => setForm({ ...form, blurIntensity: Number(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2 bg-zinc-50 p-3 rounded-xl border">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Brightness</span>
                    <span className="text-primary">{Math.round(form.brightness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={form.brightness}
                    onChange={(e) => setForm({ ...form, brightness: Number(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase">Text Alignment</label>
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    {[
                      { align: 'left', icon: AlignLeft, label: 'Left' },
                      { align: 'center', icon: AlignCenter, label: 'Center' },
                      { align: 'right', icon: AlignRight, label: 'Right' },
                    ].map((item) => (
                      <button
                        key={item.align}
                        type="button"
                        onClick={() => setForm({ ...form, textAlign: item.align })}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          form.textAlign === item.align ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border p-3 rounded-xl bg-zinc-50/50 mt-6">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Parallax Scrolling</p>
                    <p className="text-[10px] text-zinc-500">Smooth hardware-accelerated scroll effect</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.parallax}
                    onChange={(e) => setForm({ ...form, parallax: e.target.checked })}
                    className="h-4 w-4 text-primary border-zinc-300 rounded focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Interactive Desktop/Mobile Preview */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-none shadow-sm bg-white sticky top-24">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                  <Eye className="h-4 w-4 text-primary" /> Live Preview
                </div>
                <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                      previewDevice === 'desktop' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                    }`}
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                      previewDevice === 'mobile' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </button>
                </div>
              </div>

              {/* Preview Container Frame */}
              <div className={`mx-auto transition-all ${previewDevice === 'mobile' ? 'max-w-[280px]' : 'w-full'}`}>
                <div
                  className="relative overflow-hidden rounded-2xl text-white bg-[#0e1118] p-6 shadow-xl min-h-[260px] flex flex-col justify-center"
                  style={{
                    filter: form.blurIntensity > 0 || form.brightness !== 1.0 ? `brightness(${form.brightness})` : undefined,
                  }}
                >
                  {/* Gradient Fill */}
                  {form.bgType === 'gradient' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#12151f] via-[#0e1118] to-[#080a10]" />
                  )}

                  {/* Image Fill */}
                  {form.bgType === 'image' && form.bgUrl && (
                    <img
                      src={form.bgUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: form.blurIntensity > 0 ? `blur(${form.blurIntensity}px)` : undefined }}
                      alt=""
                    />
                  )}

                  {/* Video Fill */}
                  {form.bgType === 'video' && form.bgVideoUrl && (
                    <video
                      src={form.bgVideoUrl}
                      autoPlay={form.autoPlayVideo}
                      loop={form.loopVideo}
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: form.blurIntensity > 0 ? `blur(${form.blurIntensity}px)` : undefined }}
                    />
                  )}

                  {/* Overlay */}
                  {form.bgType !== 'gradient' && (
                    <div className="absolute inset-0 bg-black" style={{ opacity: form.overlayOpacity }} />
                  )}

                  {/* Preview Text Content */}
                  <div
                    className={`relative z-10 space-y-2 ${
                      form.textAlign === 'left'
                        ? 'text-left'
                        : form.textAlign === 'right'
                        ? 'text-right'
                        : 'text-center'
                    }`}
                  >
                    <Badge className="bg-primary/20 text-primary-foreground border-none text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5">
                      {PAGES.find((p) => p.key === selectedPage)?.label}
                    </Badge>
                    <h3 className="font-serif font-bold text-lg md:text-xl leading-tight">
                      Niswartha — Selfless Service
                    </h3>
                    <p className="text-[11px] text-white/70 max-w-xs mx-auto leading-relaxed">
                      Empowering hearing-impaired children with education and hope for an independent future.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        allowedTypes={mediaPickerType}
        onSelectMedia={(media) => {
          setForm({ ...form, [mediaPickerTarget]: media.url });
        }}
      />
    </div>
  );
}
