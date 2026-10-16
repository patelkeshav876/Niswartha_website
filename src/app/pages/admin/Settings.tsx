import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Sparkles,
  Layers,
  Image as ImageIcon,
  GraduationCap,
  Save,
  Upload,
  Plus,
  Trash2,
  Briefcase,
  CheckCircle2,
  Sliders,
  Shield,
  Palette,
  Heart,
  X,
} from 'lucide-react';
import { api, applyThemeColor } from '../../lib/api';
import { mockAlumni } from '../../data/mock';
import type { Alumni } from '../../types';
import { toast } from 'sonner';
import { HeroManager } from '../../components/HeroManager';

type SettingsTab = 'general' | 'hero' | 'about' | 'alumni';

const DEFAULT_CONFIG = {
  siteName: 'Niswartha — Selfless Service',
  siteTagline: 'Empowering Deaf & Dumb Children',
  contactEmail: 'contact@niswartha.org',
  contactPhone: '+91 91312 01107',
  ashramPhone: '+91 91312 01107',
  whatsappNumber: '+91 91312 01107',
  ashramEmail: 'contact@deafdumbinstitute.org',
  ashramLocation: 'North Ambazari Road, Shankar Nagar, Nagpur, Maharashtra 440010',
  whatsappWelcomeMessage: 'Hello! I would like to learn more about support options for the Niswartha Ashram.',
  maintenanceMode: false,
  allowNewRegistrations: true,
  enableNotifications: true,
  globalAnnouncement: '',
  marqueeSpeed: 35,
  supportCauseTitle: 'Support Our Cause',
  supportCauseSubtitle: 'Your generous contribution helps us provide better care, education, and opportunities to our children.',
  supportCauseBgUrl: '',
  donationWording: 'Support Our Mission',
  heroBgType: 'gradient',
  heroOverlayOpacity: 0.55,
  heroBgUrl: '',
  heroParallax: true,
  aboutHeroImgUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  aboutAssemblyImgUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
  aboutAwardImgUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80',
  aboutPrincipalImgUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  aboutSportsImgUrl: '',
  aboutCulturalImgUrl: '',
  aboutArtImgUrl: '',
  aboutDigitalImgUrl: '',
  primaryThemeColor: 'green',
};

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [config, setConfig] = useState<any>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  // Alumni state
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [newAlumni, setNewAlumni] = useState({
    name: '',
    work: '',
    batch: '',
    imageUrl: '',
  });
  const [addingAlumni, setAddingAlumni] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) setConfig((prev: any) => ({ ...prev, [field]: res }));
    };
    reader.readAsDataURL(file);
  };

  const handleAlumniPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) setNewAlumni((prev) => ({ ...prev, imageUrl: res }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    (async () => {
      try {
        const [c, a] = await Promise.all([
          api.getConfig().catch(() => null),
          api.getAlumni().catch(() => []),
        ]);
        if (c) {
          setConfig((prev: any) => ({ ...prev, ...c }));
          if (c.primaryThemeColor) applyThemeColor(c.primaryThemeColor);
        }
        if (a && a.length > 0) {
          setAlumniList(a);
        } else {
          setAlumniList(mockAlumni);
        }
      } catch {
        setAlumniList(mockAlumni);
      }
    })();
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await api.updateConfig(config);
      toast.success('All configurations saved and applied successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async (newVal: boolean) => {
    const updated = { ...config, maintenanceMode: newVal };
    setConfig(updated);
    try {
      await api.updateConfig(updated);
      toast.success(newVal ? 'Maintenance Mode activated. Public pages now locked.' : 'Maintenance Mode turned OFF! Website is now fully live.');
    } catch {
      toast.error('Could not sync maintenance mode');
    }
  };

  const handleClearAnnouncement = async () => {
    const updated = { ...config, globalAnnouncement: '' };
    setConfig(updated);
    try {
      await api.updateConfig(updated);
      toast.success('Announcement banner removed and cleared!');
    } catch {
      toast.error('Failed to clear announcement');
    }
  };

  const handleAddAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlumni.name.trim() || !newAlumni.work.trim()) {
      toast.error('Please enter name and work details');
      return;
    }
    setAddingAlumni(true);
    try {
      const created = await api.createAlumni({
        name: newAlumni.name.trim(),
        work: newAlumni.work.trim(),
        batch: newAlumni.batch.trim() || 'Graduate',
        imageUrl: newAlumni.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=75&fm=webp',
      });
      setAlumniList((prev) => [created, ...prev]);
      setNewAlumni({ name: '', work: '', batch: '', imageUrl: '' });
      toast.success('Alumni added successfully!');
    } catch {
      toast.error('Failed to add alumni');
    } finally {
      setAddingAlumni(false);
    }
  };

  const handleDeleteAlumni = async (id: string, name: string) => {
    try {
      await api.deleteAlumni(id);
      setAlumniList((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Removed ${name} from alumni`);
    } catch {
      toast.error('Failed to delete alumni');
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General Configurations', icon: SettingsIcon },
    { id: 'hero' as const, label: 'Page Hero Manager', icon: Layers },
    { id: 'about' as const, label: 'About Us Photos', icon: ImageIcon },
    { id: 'alumni' as const, label: 'Alumni Showcase', icon: GraduationCap },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 font-sans">
      {/* Sticky Header */}
      <div className="bg-background sticky top-0 z-20 border-b p-4 backdrop-blur-md bg-white/95">
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold font-poppins text-zinc-900 leading-tight">Admin Settings & Website Studio</h1>
              <p className="text-xs text-zinc-500">Configure global website options, page hero media, contact numbers & pictures</p>
            </div>
          </div>
          <Button onClick={handleSaveConfig} disabled={loading} size="sm" className="rounded-full gap-1.5 shadow">
            <Save className="h-4 w-4" /> Save All Changes
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 w-full">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-zinc-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-t-xl'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ════════════ TAB 1: GENERAL CONFIGURATIONS ════════════ */}
        {activeTab === 'general' && (
          <div className="space-y-8 animate-fade-up">
            {/* 1. Support & Contact Information */}
            <section className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-bold font-poppins text-zinc-900">Support & Contact Information</h2>
                </div>
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                  Syncs with Support Page, WhatsApp button, Donation & Footer
                </span>
              </div>

              <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white overflow-hidden p-6 space-y-6">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Configure the primary phone numbers and contact channels used across the platform. Updating and saving the numbers below automatically updates the <strong>Help / Support page</strong>, <strong>floating WhatsApp button</strong>, <strong>Donation pages</strong>, and the <strong>website footer</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Support Number */}
                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                    <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" /> Phone Support Number</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Support Page & Footer</span>
                    </Label>
                    <Input
                      value={config.ashramPhone || config.contactPhone || ''}
                      onChange={(e) => setConfig({ ...config, ashramPhone: e.target.value, contactPhone: e.target.value })}
                      placeholder="e.g. +91 91312 01107"
                      className="rounded-xl text-xs bg-white"
                    />
                    <p className="text-[10px] text-zinc-400">Default: +91 91312 01107. Clicking "Call" on any page dials this number.</p>
                  </div>

                  {/* WhatsApp Support Number */}
                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                    <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Number</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Floating Button & Chat</span>
                    </Label>
                    <Input
                      value={config.whatsappNumber || ''}
                      onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                      placeholder="e.g. +91 91312 01107"
                      className="rounded-xl text-xs bg-white"
                    />
                    <p className="text-[10px] text-zinc-400">Default: +91 91312 01107. Opens WhatsApp chat with donors and supporters.</p>
                  </div>

                  {/* Support Email */}
                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                    <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> Support Email Address</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Support & Footer</span>
                    </Label>
                    <Input
                      value={config.ashramEmail || config.contactEmail || ''}
                      onChange={(e) => setConfig({ ...config, ashramEmail: e.target.value, contactEmail: e.target.value })}
                      placeholder="contact@deafdumbinstitute.org or ddingp1@gmail.com"
                      className="rounded-xl text-xs bg-white"
                    />
                  </div>

                  {/* Physical Address */}
                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                    <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> Ashram Location Address</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Footer & Map</span>
                    </Label>
                    <Input
                      value={config.ashramLocation || ''}
                      onChange={(e) => setConfig({ ...config, ashramLocation: e.target.value })}
                      placeholder="North Ambazari Road, Shankar Nagar, Nagpur"
                      className="rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>

                {/* WhatsApp Pre-filled Welcome Message */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">
                    WhatsApp Default Welcome Message
                  </Label>
                  <Input
                    value={config.whatsappWelcomeMessage || ''}
                    onChange={(e) => setConfig({ ...config, whatsappWelcomeMessage: e.target.value })}
                    placeholder="Hello! I would like to learn more about support options for the Niswartha Ashram."
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
              </Card>
            </section>

            {/* 2. Policies, Announcements & Marquee Speed */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold font-poppins text-zinc-900">Policies & Announcement Banners</h2>
              </div>

              <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Maintenance Mode */}
                  <div className={`p-4 rounded-2xl border transition-all ${config.maintenanceMode ? 'bg-amber-500/10 border-amber-300' : 'bg-zinc-50/60 border-zinc-200'}`}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-zinc-900">Maintenance Mode</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.maintenanceMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {config.maintenanceMode ? '🔴 ACTIVE (Public Locked)' : '🟢 OFF (Website Live)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Locks public pages and shows update overlay screen</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.maintenanceMode || false}
                        onChange={(e) => handleToggleMaintenance(e.target.checked)}
                        className="h-5 w-5 text-primary border-zinc-300 rounded focus:ring-primary cursor-pointer shrink-0"
                      />
                    </div>
                    {config.maintenanceMode ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleToggleMaintenance(false)}
                        className="w-full mt-2 rounded-xl text-xs font-bold h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        ✓ Turn OFF Maintenance Mode Now
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleMaintenance(true)}
                        className="w-full mt-2 rounded-xl text-xs font-semibold h-8 text-zinc-700 border-zinc-300 hover:bg-amber-50"
                      >
                        Turn ON Maintenance Mode
                      </Button>
                    )}
                  </div>

                  {/* Donation Wording */}
                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/60 border">
                    <Label className="text-xs font-bold text-zinc-800 uppercase">Donation Button Wording</Label>
                    <select
                      value={config.donationWording || 'Support Our Mission'}
                      onChange={(e) => setConfig({ ...config, donationWording: e.target.value })}
                      className="text-xs bg-white border border-zinc-200 rounded-xl w-full px-3 py-2.5 font-medium"
                    >
                      <option value="Support Our Mission">Support Our Mission (Recommended)</option>
                      <option value="Make an Impact">Make an Impact</option>
                      <option value="Join Our Cause">Join Our Cause</option>
                      <option value="Be a Helping Hand">Be a Helping Hand</option>
                      <option value="Contribute with Love">Contribute with Love</option>
                      <option value="Partner With Us">Partner With Us</option>
                    </select>
                  </div>
                </div>

                {/* Global Announcement Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-800 uppercase">Global Announcement Text</Label>
                    {config.globalAnnouncement && (
                      <button
                        type="button"
                        onClick={handleClearAnnouncement}
                        className="text-[11px] text-destructive hover:underline font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <X className="h-3 w-3" /> Clear & Remove Banner
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={config.globalAnnouncement || ''}
                      onChange={(e) => setConfig({ ...config, globalAnnouncement: e.target.value })}
                      placeholder="e.g. Donation receipts for 80G tax benefits are now available."
                      className="rounded-xl text-xs flex-1"
                    />
                    {config.globalAnnouncement && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAnnouncement}
                        className="rounded-xl text-xs h-9 px-3 border-red-200 text-destructive hover:bg-red-50"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">Leave blank or click Clear to hide the announcement notification banner across the website.</p>
                </div>

                {/* Staff Roster Marquee Speed */}
                <div className="space-y-2 border p-4 rounded-2xl bg-emerald-50/40 border-emerald-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Staff Roster Marquee Speed (Seconds)
                    </Label>
                    <span className="text-xs font-mono font-bold text-primary">
                      {config.marqueeSpeed || 35}s {Number(config.marqueeSpeed || 35) <= 20 ? '(Fast)' : Number(config.marqueeSpeed || 35) >= 50 ? '(Slow)' : '(Normal)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={80}
                      step={5}
                      value={config.marqueeSpeed || 35}
                      onChange={(e) => setConfig({ ...config, marqueeSpeed: Number(e.target.value) })}
                      className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <Input
                      type="number"
                      min={10}
                      max={80}
                      value={config.marqueeSpeed || 35}
                      onChange={(e) => setConfig({ ...config, marqueeSpeed: Number(e.target.value) })}
                      className="w-20 rounded-xl text-xs font-bold font-mono h-8 bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">Lower seconds = faster continuous motion, higher seconds = smooth slow motion.</p>
                </div>
              </Card>
            </section>

            {/* 3. Support Our Cause Card Customization */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold font-poppins text-zinc-900">"Support Our Cause" Card Settings</h2>
              </div>

              <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Card Title</Label>
                  <Input
                    value={config.supportCauseTitle || 'Support Our Cause'}
                    onChange={(e) => setConfig({ ...config, supportCauseTitle: e.target.value })}
                    placeholder="e.g. Support Our Cause"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Subtitle Description</Label>
                  <Textarea
                    value={config.supportCauseSubtitle || 'Your generous contribution helps us provide better care, education, and opportunities to our children.'}
                    onChange={(e) => setConfig({ ...config, supportCauseSubtitle: e.target.value })}
                    placeholder="Description text..."
                    className="text-xs min-h-[60px] rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Background / Featured Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.supportCauseBgUrl || ''}
                      onChange={(e) => setConfig({ ...config, supportCauseBgUrl: e.target.value })}
                      placeholder="Paste image URL or choose file from device..."
                      className="rounded-xl text-xs flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-50 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'supportCauseBgUrl')}
                      />
                    </label>
                  </div>
                </div>
              </Card>
            </section>

            {/* 4. Primary Theme Accent Color */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold font-poppins text-zinc-900">Website Primary Theme Accent Color</h2>
              </div>

              <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white p-6 space-y-4">
                <p className="text-xs text-zinc-500">
                  Switch the overall site accent theme between our signature Niswartha Emerald Green and our official Niswartha Logo Bluish color.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      setConfig((prev: any) => ({ ...prev, primaryThemeColor: 'green' }));
                      applyThemeColor('green');
                      toast.success('Applied Niswartha Emerald Green theme!');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      (config.primaryThemeColor || 'green') === 'green'
                        ? 'border-primary bg-emerald-50/70 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow">
                      🌿
                    </div>
                    <div>
                      <p className="font-bold text-xs text-zinc-900">Niswartha Emerald Green</p>
                      <p className="text-[10px] text-zinc-500">Signature green theme</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setConfig((prev: any) => ({ ...prev, primaryThemeColor: 'blue' }));
                      applyThemeColor('blue');
                      toast.success('Applied Niswartha Logo Bluish theme!');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      config.primaryThemeColor === 'blue'
                        ? 'border-primary bg-blue-50/70 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-lg shadow">
                      💙
                    </div>
                    <div>
                      <p className="font-bold text-xs text-zinc-900">Niswartha Logo Bluish Color</p>
                      <p className="text-[10px] text-zinc-500">Official logo royal blue theme</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveConfig} disabled={loading} size="lg" className="rounded-full shadow px-8">
                <Save className="h-4 w-4 mr-2" /> Save All Configurations
              </Button>
            </div>
          </div>
        )}

        {/* ════════════ TAB 2: PAGE HERO MANAGER ════════════ */}
        {activeTab === 'hero' && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold font-poppins text-zinc-900">Page Hero Background Manager</h2>
                <p className="text-xs text-zinc-500">Customize the hero canvas, cover photo, video, parallax effect, and opacity for every page</p>
              </div>
            </div>

            <HeroManager />
          </div>
        )}

        {/* ════════════ TAB 3: ABOUT US PHOTOS ════════════ */}
        {activeTab === 'about' && (
          <section className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold font-poppins text-zinc-900">About Us Page Images (All 8 Sections)</h2>
              </div>
              <span className="text-xs text-zinc-500">Upload from device or paste image URLs</span>
            </div>

            <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white overflow-hidden p-6">
              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                Every image across the About Us page can be customized below. Updates take effect immediately when saved.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Hero Campus Photo */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>1. Hero Campus Photo</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Top of About Page</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutHeroImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutHeroImgUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutHeroImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutHeroImgUrl && (
                    <img src={config.aboutHeroImgUrl} alt="Hero" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>

                {/* 2. School Assembly Photo */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>2. School Assembly Photo</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Why Families Choose Us</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutAssemblyImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutAssemblyImgUrl: e.target.value })}
                      placeholder="Assembly photo URL..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutAssemblyImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutAssemblyImgUrl && (
                    <img src={config.aboutAssemblyImgUrl} alt="Assembly" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>

                {/* 3. National Award Certificate */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>3. National Award Certificate</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Award Section</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutAwardImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutAwardImgUrl: e.target.value })}
                      placeholder="Award certificate URL..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutAwardImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutAwardImgUrl && (
                    <img src={config.aboutAwardImgUrl} alt="Award" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>

                {/* 4. Principal Photo */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>4. Principal Photo</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Leadership Card</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutPrincipalImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutPrincipalImgUrl: e.target.value })}
                      placeholder="Principal photo URL..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutPrincipalImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutPrincipalImgUrl && (
                    <img src={config.aboutPrincipalImgUrl} alt="Principal" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>

                {/* 5. Sports Education Photo */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>5. Sports Education Photo</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Facilities Grid</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutSportsImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutSportsImgUrl: e.target.value })}
                      placeholder="Sports photo URL..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutSportsImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutSportsImgUrl && (
                    <img src={config.aboutSportsImgUrl} alt="Sports" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>

                {/* 6. Cultural Education Photo */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>6. Cultural Education Photo</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Facilities Grid</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutCulturalImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutCulturalImgUrl: e.target.value })}
                      placeholder="Cultural photo URL..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutCulturalImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutCulturalImgUrl && (
                    <img src={config.aboutCulturalImgUrl} alt="Cultural" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>

                {/* 7. Vocational & Art Photo */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>7. Art & Craft Training Photo</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Facilities Grid</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutArtImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutArtImgUrl: e.target.value })}
                      placeholder="Art photo URL..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutArtImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutArtImgUrl && (
                    <img src={config.aboutArtImgUrl} alt="Art" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>

                {/* 8. Speech & Digital Therapy Photo */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                  <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                    <span>8. Speech & Digital Therapy Photo</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Facilities Grid</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.aboutDigitalImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutDigitalImgUrl: e.target.value })}
                      placeholder="Digital photo URL..."
                      className="rounded-xl text-xs bg-white flex-1"
                    />
                    <label className="inline-flex items-center px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'aboutDigitalImgUrl')}
                      />
                    </label>
                  </div>
                  {config.aboutDigitalImgUrl && (
                    <img src={config.aboutDigitalImgUrl} alt="Digital" className="h-24 w-full object-cover rounded-xl border mt-2" />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <Button onClick={handleSaveConfig} disabled={loading} className="rounded-xl bg-primary text-white font-bold text-xs gap-1.5 shadow-sm px-6 h-10">
                  <Save className="h-4 w-4" /> Save About Us Pictures
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* ════════════ TAB 4: ALUMNI SHOWCASE ════════════ */}
        {activeTab === 'alumni' && (
          <section className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold font-poppins text-zinc-900">Alumni Showcase Management</h2>
              </div>
              <span className="text-xs text-zinc-500">Inspiring students from our school</span>
            </div>

            {/* Add New Alumni Form */}
            <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Add New Alumni Graduate
              </h3>
              <form onSubmit={handleAddAlumni} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Full Name *</Label>
                  <Input
                    value={newAlumni.name}
                    onChange={(e) => setNewAlumni({ ...newAlumni, name: e.target.value })}
                    placeholder="e.g. Anand Deshmukh"
                    className="rounded-xl text-xs bg-zinc-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Current Role / Job *</Label>
                  <Input
                    value={newAlumni.work}
                    onChange={(e) => setNewAlumni({ ...newAlumni, work: e.target.value })}
                    placeholder="e.g. Graphic Designer at TCS"
                    className="rounded-xl text-xs bg-zinc-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Batch Year</Label>
                  <Input
                    value={newAlumni.batch}
                    onChange={(e) => setNewAlumni({ ...newAlumni, batch: e.target.value })}
                    placeholder="e.g. Batch 2021"
                    className="rounded-xl text-xs bg-zinc-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Profile Picture</Label>
                  <div className="flex gap-2">
                    <label className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-zinc-50 hover:bg-zinc-100 shadow-xs">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAlumniPhotoUpload}
                      />
                    </label>
                    <Button type="submit" disabled={addingAlumni} className="rounded-xl text-xs font-bold px-4">
                      {addingAlumni ? 'Adding...' : 'Add Alumni'}
                    </Button>
                  </div>
                </div>
              </form>
              {newAlumni.imageUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={newAlumni.imageUrl} alt="Preview" className="h-10 w-10 rounded-full object-cover border" />
                  <span className="text-xs text-emerald-600 font-semibold">Image loaded successfully</span>
                </div>
              )}
            </Card>

            {/* Existing Alumni List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {alumniList.map((alumni) => (
                <Card key={alumni.id} className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={alumni.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=75&fm=webp'}
                      alt={alumni.name}
                      className="h-12 w-12 rounded-full object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-zinc-900 truncate">{alumni.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                        <Briefcase className="h-3 w-3 shrink-0 text-primary" /> {alumni.work}
                      </p>
                      <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-100">
                        {alumni.batch || 'Graduate'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAlumni(alumni.id, alumni.name)}
                    className="text-zinc-400 hover:text-destructive shrink-0 rounded-full h-8 w-8"
                    title="Remove Alumni"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}