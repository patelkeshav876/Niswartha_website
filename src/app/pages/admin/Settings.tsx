import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Image as ImageIcon,
  Save,
  Upload,
  GraduationCap,
  Plus,
  Trash2,
  Briefcase,
  CheckCircle2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
} from 'lucide-react';
import { api } from '../../lib/api';
import { mockAlumni } from '../../data/mock';
import type { Alumni } from '../../types';
import { toast } from 'sonner';

export function Settings() {
  const [config, setConfig] = useState<any>({
    ashramPhone: '+91 91312 01107',
    contactPhone: '+91 91312 01107',
    whatsappNumber: '+91 91312 01107',
    ashramEmail: 'contact@deafdumbinstitute.org',
    ashramLocation: 'North Ambazari Road, Shankar Nagar, Nagpur, Maharashtra 440010',
    whatsappWelcomeMessage: 'Hello! I would like to learn more about support options for the Niswartha Ashram.',
    aboutHeroImgUrl: '',
    aboutAssemblyImgUrl: '',
    aboutAwardImgUrl: '',
    aboutPrincipalImgUrl: '',
    aboutSportsImgUrl: '',
    aboutCulturalImgUrl: '',
    aboutArtImgUrl: '',
    aboutDigitalImgUrl: '',
  });
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
        if (c) setConfig(c);
        if (a && a.length > 0) {
          setAlumniList(a);
        } else {
          setAlumniList(mockAlumni);
        }
      } catch {
        // use fallback
        setAlumniList(mockAlumni);
      }
    })();
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await api.updateConfig(config);
      toast.success('Settings and contact numbers updated successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
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

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 font-sans">
      {/* Sticky Header */}
      <div className="bg-background sticky top-0 z-20 border-b p-4 backdrop-blur-md bg-white/90">
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold font-poppins text-zinc-900 leading-tight">Admin Settings</h1>
              <p className="text-xs text-zinc-500">Manage support phone numbers, About Us pictures, and Alumni showcase</p>
            </div>
          </div>
          <Button onClick={handleSaveConfig} disabled={loading} size="sm" className="rounded-full gap-1.5 shadow">
            <Save className="h-4 w-4" /> Save All Settings
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-10 w-full">
        {/* ════════════ 1. Support & Contact Information Management ════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold font-poppins text-zinc-900">Support & Contact Information</h2>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              Syncs with Support Page, WhatsApp button, Donation & Footer
            </span>
          </div>

          <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white overflow-hidden p-6 space-y-6">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Configure the primary phone numbers and contact channels used across the platform. Updating and saving the number below automatically updates the <strong>Help / Support page</strong>, <strong>floating WhatsApp button</strong>, <strong>Donation pages</strong>, and the <strong>website footer</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Support / Ashram Phone Number */}
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
                  value={config.ashramEmail || ''}
                  onChange={(e) => setConfig({ ...config, ashramEmail: e.target.value })}
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

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveConfig} disabled={loading} className="rounded-xl bg-primary text-white font-bold text-xs gap-1.5 shadow-sm px-6 h-10">
                <Save className="h-4 w-4" /> Save Contact Numbers
              </Button>
            </div>
          </Card>
        </section>

        {/* ════════════ 2. All 8 About Us Page Pictures Management ════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold font-poppins text-zinc-900">About Us Page Images (All 8 Sections)</h2>
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

              {/* 4. Principal Portrait Photo */}
              <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <Label className="text-xs font-bold text-zinc-900 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> 4. Principal Portrait Photo
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">Dr. Meenal Sangole</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutPrincipalImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutPrincipalImgUrl: e.target.value })}
                    placeholder="Principal portrait URL..."
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
                  <img src={config.aboutPrincipalImgUrl} alt="Principal" className="h-24 w-full object-cover object-top rounded-xl border mt-2" />
                )}
              </div>

              {/* 5. Sports Education Photo */}
              <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <Label className="text-xs font-bold text-emerald-950 uppercase flex items-center justify-between">
                  <span>5. Sports Education Photo</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Playground & Games</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutSportsImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutSportsImgUrl: e.target.value })}
                    placeholder="Sports playground URL..."
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
                  <span className="text-[10px] text-zinc-400 font-normal">Dance & Performances</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutCulturalImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutCulturalImgUrl: e.target.value })}
                    placeholder="Cultural performance URL..."
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

              {/* 7. Art & Craft Education Photo */}
              <div className="space-y-2 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
                <Label className="text-xs font-bold text-indigo-950 uppercase flex items-center justify-between">
                  <span>7. Art & Craft Education Photo</span>
                  <span className="text-[10px] text-indigo-700 font-semibold">Handicrafts & Clay</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutArtImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutArtImgUrl: e.target.value })}
                    placeholder="Art & Craft photo URL..."
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
                  <img src={config.aboutArtImgUrl} alt="Art & Craft" className="h-24 w-full object-cover rounded-xl border mt-2" />
                )}
              </div>

              {/* 8. Speech Therapy & Digital Classrooms Photo */}
              <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                <Label className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                  <span>8. Speech & Digital Education Photo</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Digital Classrooms</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutDigitalImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutDigitalImgUrl: e.target.value })}
                    placeholder="Digital classroom photo URL..."
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
                  <img src={config.aboutDigitalImgUrl} alt="Digital Classroom" className="h-24 w-full object-cover rounded-xl border mt-2" />
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* ════════════ 2. Alumni & Works Management (Matching Screenshot) ════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold font-poppins text-zinc-900">Alumni & Works Management</h2>
            </div>
            <span className="text-xs text-zinc-500">Showcased in the public Gallery section</span>
          </div>

          <Card className="border border-zinc-200 shadow-sm rounded-3xl bg-white overflow-hidden p-6 space-y-6">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Add hearing-impaired alumni and their employment/business details to inspire visitors, parents, and community members.
            </p>

            {/* Add New Alumni Form */}
            <form onSubmit={handleAddAlumni} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" /> Add New Alumni
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Full Name *</Label>
                  <Input
                    placeholder="e.g. Sonu Raju Nakashe"
                    value={newAlumni.name}
                    onChange={(e) => setNewAlumni({ ...newAlumni, name: e.target.value })}
                    className="bg-white rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Current Work / Employment *</Label>
                  <Input
                    placeholder="e.g. Working as a salesman at Max Trillium mall, Nagpur"
                    value={newAlumni.work}
                    onChange={(e) => setNewAlumni({ ...newAlumni, work: e.target.value })}
                    className="bg-white rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Batch / Year</Label>
                  <Input
                    placeholder="e.g. Batch 2018"
                    value={newAlumni.batch}
                    onChange={(e) => setNewAlumni({ ...newAlumni, batch: e.target.value })}
                    className="bg-white rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Photo URL or Device Upload</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image link or upload below..."
                    value={newAlumni.imageUrl}
                    onChange={(e) => setNewAlumni({ ...newAlumni, imageUrl: e.target.value })}
                    className="bg-white rounded-xl text-xs flex-1"
                  />
                  <label className="inline-flex items-center px-3.5 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer bg-white hover:bg-zinc-100 shadow-xs whitespace-nowrap">
                    <Upload className="h-3.5 w-3.5 mr-1" /> Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAlumniPhotoUpload}
                    />
                  </label>
                </div>
                {newAlumni.imageUrl && (
                  <div className="flex items-center gap-3 pt-2">
                    <img src={newAlumni.imageUrl} alt="Preview" className="h-12 w-12 rounded-full object-cover border-2 border-primary/30" />
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Photo loaded
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={addingAlumni} size="sm" className="rounded-full gap-1.5">
                  <Plus className="h-4 w-4" /> {addingAlumni ? 'Adding...' : 'Add Alumni'}
                </Button>
              </div>
            </form>

            {/* Existing Alumni List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Current Alumni Directory ({alumniList.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {alumniList.map((alum) => (
                  <div
                    key={alum.id}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex flex-col justify-between hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {alum.imageUrl ? (
                        <img
                          src={alum.imageUrl}
                          alt={alum.name}
                          className="h-14 w-14 rounded-full object-cover border-2 border-primary/20 shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-lg font-poppins shrink-0">
                          {alum.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-poppins font-bold text-sm text-zinc-900 truncate">{alum.name}</h4>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">{alum.work}</p>
                        {alum.batch && (
                          <span className="inline-block mt-2 text-[10px] font-mono text-zinc-500 bg-zinc-200/60 px-2 py-0.5 rounded-md">
                            {alum.batch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200/70 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlumni(alum.id, alum.name)}
                        className="text-destructive hover:bg-destructive/10 text-xs h-8 px-2.5 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* ════════════ 3. Account & System Preferences ════════════ */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">System Preferences</h2>
          <Card className="border border-zinc-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">System Notifications</span>
                </div>
                <span className="text-xs text-primary font-bold">Enabled</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Admin Access & Role Security</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold">Active</span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}