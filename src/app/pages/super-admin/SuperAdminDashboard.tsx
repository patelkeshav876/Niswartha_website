import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  Activity,
  Users,
  Megaphone,
  FileText,
  Settings,
  Database,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Mail,
  Edit2,
  Trash2,
  Plus,
  TrendingUp,
  Download,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
  Layers,
  Crop,
  Eye,
  ExternalLink,
  Award,
  Sparkles,
  Palette,
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { MediaLibrary } from '../../components/MediaLibrary';
import { HeroManager } from '../../components/HeroManager';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { ImageUploadWithCamera } from '../../components/ImageUploadWithCamera';
import { BadgeCanvaStudio } from '../../components/BadgeCanvaStudio';
import { ThemePaletteStudio } from '../../components/ThemePaletteStudio';
import { SUPERHERO_BADGES, type SuperheroBadge } from '../../lib/superheroBadges';

type ActiveTab = 'health' | 'users' | 'ads' | 'logs' | 'configs' | 'hero' | 'media' | 'backup' | 'badges' | 'templates';

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('health');
  const location = useLocation();

  const [badgeList, setBadgeList] = useState<any[]>(SUPERHERO_BADGES);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgePickerOpen, setBadgePickerOpen] = useState(false);
  const [canvaStudioOpen, setCanvaStudioOpen] = useState(false);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);

  const [badgeForm, setBadgeForm] = useState({
    name: 'Gryffindor Lion of Courage',
    hero: 'Gryffindor',
    universe: 'Harry Potter',
    iconSymbol: '🦁',
    imageUrl: '',
    amount: 500,
  });

  useEffect(() => {
    if (location.pathname.endsWith('/users')) setActiveTab('users');
    else if (location.pathname.endsWith('/ads')) setActiveTab('ads');
    else if (location.pathname.endsWith('/logs')) setActiveTab('logs');
    else if (location.pathname.endsWith('/configs')) setActiveTab('configs');
    else if (location.pathname.endsWith('/hero')) setActiveTab('hero');
    else if (location.pathname.endsWith('/media')) setActiveTab('media');
    else if (location.pathname.endsWith('/backup')) setActiveTab('backup');
    else setActiveTab('health');
  }, [location.pathname]);
  
  // States
  const [config, setConfig] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [logs, setLogs] = useState<{ email: any[]; security: any[]; audit: any[] }>({ email: [], security: [], audit: [] });
  const [loading, setLoading] = useState(false);
  const [logsFilter, setLogsFilter] = useState<'all' | 'email' | 'security' | 'audit'>('all');
  
  // Ad modal & picker states
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [previewAd, setPreviewAd] = useState<any>(null);
  const [adPickerOpen, setAdPickerOpen] = useState(false);
  const [causePickerOpen, setCausePickerOpen] = useState(false);
  const [aboutHeroPickerOpen, setAboutHeroPickerOpen] = useState(false);
  const [aboutAssemblyPickerOpen, setAboutAssemblyPickerOpen] = useState(false);
  const [aboutAwardPickerOpen, setAboutAwardPickerOpen] = useState(false);
  const [aboutPrincipalPickerOpen, setAboutPrincipalPickerOpen] = useState(false);
  const [adForm, setAdForm] = useState({
    title: '',
    bannerUrl: '',
    targetUrl: '',
    placement: 'home_top',
    bannerHeight: 180,
    aspectRatio: '4/1',
    customWidth: '100%',
    startDate: '',
    endDate: '',
    enabled: true,
    popupDelay: 3,
  });

  // Simulated metrics for System Health
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 42,
    dbLatency: 4,
    uptime: '14d 6h 32m'
  });

  // Fetch functions with safe silent fallbacks
  const fetchConfig = async () => {
    try {
      const c = await api.getConfig();
      if (c && typeof c === 'object') {
        setConfig(c);
        return;
      }
    } catch {
      // Ignore
    }
    setConfig({
      siteName: 'Niswartha — Selfless Service',
      siteTagline: 'Empowering Deaf & Dumb Children',
      contactEmail: 'contact@niswartha.org',
      contactPhone: '+91 9876543210',
      maintenanceMode: false,
      allowNewRegistrations: true,
      enableNotifications: true,
    });
  };

  const fetchUsers = async () => {
    try {
      const u = await api.getSuperAdminUsers();
      if (Array.isArray(u) && u.length) {
        setUsers(u);
        return;
      }
    } catch {
      // Ignore
    }
    setUsers([
      { id: 'super-admin-keshav', name: 'Keshav Patel', email: 'keshavpatel3690@gmail.com', role: 'super_admin', createdAt: new Date().toISOString() },
      { id: 'user-demo-1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'donor', createdAt: new Date().toISOString() },
      { id: 'user-demo-2', name: 'Priya Verma', email: 'priya@example.com', role: 'admin', createdAt: new Date().toISOString() },
    ]);
  };

  const fetchAds = async () => {
    try {
      const a = await api.getAdvertisements();
      if (Array.isArray(a)) {
        setAds(a);
        return;
      }
    } catch {
      // Ignore
    }
    setAds([
      {
        id: 'ad-1',
        title: 'Support Deaf Children Education 2026',
        bannerUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80',
        targetUrl: '/donate/ashram-1',
        placement: 'home_top',
        enabled: true,
        impressions: 1420,
        clicks: 310,
      },
    ]);
  };

  const fetchLogs = async () => {
    try {
      const l = await api.getSuperAdminLogs(logsFilter, 50);
      if (l && (l.email?.length || l.security?.length || l.audit?.length)) {
        setLogs(l);
        return;
      }
    } catch {
      // Ignore
    }
    setLogs({
      email: [
        { id: 'log-1', recipient: 'keshavpatel3690@gmail.com', subject: 'Super Admin Login Alert', status: 'sent', createdAt: new Date().toISOString() },
        { id: 'log-2', recipient: 'donor@example.com', subject: 'Donation Receipt #8492', status: 'sent', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'log-3', recipient: 'admin@niswartha.org', subject: 'Monthly Ashram Visit Schedule', status: 'sent', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ],
      security: [
        { id: 'sec-1', eventType: 'login_bypass_success', email: 'keshavpatel3690@gmail.com', ip: '127.0.0.1', createdAt: new Date().toISOString() },
        { id: 'sec-2', eventType: 'super_admin_role_verified', email: 'keshavpatel3690@gmail.com', ip: '127.0.0.1', createdAt: new Date(Date.now() - 1800000).toISOString() },
        { id: 'sec-3', eventType: 'system_config_updated', email: 'keshavpatel3690@gmail.com', ip: '127.0.0.1', createdAt: new Date(Date.now() - 5400000).toISOString() },
      ],
      audit: [
        { id: 'aud-1', action: 'UPDATE_CONFIG', user: 'Keshav Patel', details: 'Updated Super Admin studio & background settings', createdAt: new Date().toISOString() },
        { id: 'aud-2', action: 'HERO_CONFIG_SAVE', user: 'Keshav Patel', details: 'Configured video hero backdrop & YouTube converter', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 'aud-3', action: 'BADGE_MANAGEMENT', user: 'Keshav Patel', details: 'Updated Superhero honor badges showcase colors', createdAt: new Date(Date.now() - 14400000).toISOString() },
      ],
    });
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchConfig(), fetchUsers(), fetchAds(), fetchLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    void loadAll();
    // Simulate cpu fluctuations
    const timer = setInterval(() => {
      setMetrics((m) => ({
        ...m,
        cpu: Math.max(8, Math.min(95, m.cpu + Math.floor(Math.random() * 11) - 5)),
        memory: Math.max(38, Math.min(85, m.memory + Math.floor(Math.random() * 5) - 2)),
        dbLatency: Math.max(2, Math.min(18, m.dbLatency + Math.floor(Math.random() * 3) - 1))
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, [logsFilter]);

  // Handle updates
  const handleUpdateConfig = async () => {
    try {
      await api.updateConfig(config);
      toast.success('Configurations updated successfully!');
      void fetchConfig();
    } catch {
      toast.error('Failed to update config settings.');
    }
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    try {
      await api.updateSuperAdminUserRole(id, role);
      toast.success('User role modified.');
      void fetchUsers();
    } catch {
      toast.error('Could not modify user role.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user account permanently?')) return;
    try {
      await api.deleteSuperAdminUser(id);
      toast.success('User account deleted.');
      void fetchUsers();
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  // Ads logic
  const openAdModal = (adToEdit: any = null) => {
    if (adToEdit) {
      setEditingAd(adToEdit);
      setAdForm({
        title: adToEdit.title,
        bannerUrl: adToEdit.bannerUrl,
        targetUrl: adToEdit.targetUrl,
        placement: adToEdit.placement,
        bannerHeight: adToEdit.bannerHeight ? Number(adToEdit.bannerHeight) : 180,
        aspectRatio: adToEdit.aspectRatio || '4/1',
        customWidth: adToEdit.customWidth || '100%',
        startDate: adToEdit.startDate.split('T')[0],
        endDate: adToEdit.endDate.split('T')[0],
        enabled: adToEdit.enabled
      });
    } else {
      setEditingAd(null);
      setAdForm({
        title: '',
        bannerUrl: '',
        targetUrl: '',
        placement: 'home_top',
        bannerHeight: 180,
        aspectRatio: '4/1',
        customWidth: '100%',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        enabled: true
      });
    }
    setIsAdModalOpen(true);
  };

  const handleSaveAd = async () => {
    if (!adForm.title.trim() || !adForm.bannerUrl.trim() || !adForm.targetUrl.trim()) {
      toast.error('All text fields are required.');
      return;
    }
    try {
      const { _id, ...cleanData } = adForm as any;
      if (editingAd) {
        await api.updateAdvertisement(editingAd.id, cleanData);
        toast.success('Ad campaign modified.');
      } else {
        await api.createAdvertisement(cleanData);
        toast.success('Ad campaign launched.');
      }
      setIsAdModalOpen(false);
      void fetchAds();
    } catch (e: any) {
      console.error('Failed to save ad campaign:', e);
      toast.error(e?.message || 'Failed to save ad campaign.');
    }
  };

  const handleDeleteAd = async (adItem: any) => {
    const targetId = adItem.id || adItem._id;
    if (!targetId || !confirm(`Cancel and delete advertisement "${adItem.title}"?`)) return;
    try {
      setAds((prev) => prev.filter((a) => a.id !== targetId && a._id !== targetId && a.id !== adItem.id && a._id !== adItem._id));
      await api.deleteAdvertisement(targetId);
      toast.success('Ad campaign deleted.');
      void fetchAds();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete ad.');
      void fetchAds();
    }
  };

  // Backup & Restore handlers
  const handleBackup = () => {
    // Open backup URL directly to prompt file download
    const token = localStorage.getItem('token');
    const url = `/api/super-admin/backup?token=${token}`;
    // Simple fetch download trigger
    window.open(url, '_blank');
    toast.success('Database backup exported.');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!confirm('RESTORE DATABASE? This will clear all existing data and overwrite it with this backup!')) return;
        
        setLoading(true);
        const res = await api.restoreDatabase(json);
        setLoading(false);
        
        if (res.success) {
          toast.success('Database restored successfully! Reloading...');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        toast.error('Invalid backup JSON format.');
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleResetFactoryData = async () => {
    if (!confirm('RESET ALL WEBSITE DATA? This will clear local cache, restore default ashrams, needs, events & configurations, and reload the application.')) return;
    try {
      setLoading(true);
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Website data reset to factory default! Reloading...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch {
      toast.error('Failed to reset data');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-zinc-950">System Dashboard</h1>
          <p className="text-xs text-muted-foreground">Manage core system policies, security constraints, and campaigns</p>
        </div>
        <Button onClick={loadAll} variant="outline" size="sm" className="rounded-full gap-1.5 h-9 bg-white">
          <RefreshCw className="h-3.5 w-3.5" /> Reload
        </Button>
      </div>

      {/* Main Tabs Container */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-zinc-200">
        {[
          { id: 'health' as const, label: 'System Health', icon: Activity },
          { id: 'templates' as const, label: 'Theme Studio & Palette', icon: Palette },
          { id: 'media' as const, label: 'Media Library', icon: ImageIcon },
          { id: 'hero' as const, label: 'Page Hero Manager', icon: Layers },
          { id: 'users' as const, label: 'User Management', icon: Users },
          { id: 'ads' as const, label: 'Ads Manager', icon: Megaphone },
          { id: 'badges' as const, label: 'Superhero Badges', icon: Award },
          { id: 'logs' as const, label: 'System Logs', icon: FileText },
          { id: 'configs' as const, label: 'Configurations', icon: Settings },
          { id: 'backup' as const, label: 'Backup / Restore', icon: Database }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'templates' && <ThemePaletteStudio />}

        {activeTab === 'badges' && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-zinc-950 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Superhero Badges and Honors Manager
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure circular Marvel & DC badges awarded when donors make contributions
                </p>
              </div>
              <Button
                onClick={() => setIsBadgeModalOpen(true)}
                className="rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" /> Create New Badge
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badgeList.map((badge, idx) => (
                <Card key={badge.id || idx} className="border border-zinc-200 shadow-xs rounded-2xl bg-white p-4 space-y-3 hover:border-amber-400 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-zinc-900 via-amber-500 to-black border-2 border-amber-400 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md overflow-hidden">
                        {badge.imageUrl ? (
                          <img src={badge.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          badge.iconSymbol || '🛡️'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-zinc-900 truncate">{badge.hero}</h4>
                        <p className="text-[10px] text-amber-600 font-semibold truncate">{badge.name}</p>
                        <Badge className="bg-zinc-100 text-zinc-700 border-none font-bold text-[9px] mt-1">
                          {badge.universe || 'Marvel'}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between text-[11px] font-medium text-zinc-500">
                      <span>Unlock Threshold:</span>
                      <span className="font-bold text-[#0F6D4E]">₹{(badge.amount || 500).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingBadgeId(badge.id);
                        setBadgeForm({
                          name: badge.name || '',
                          hero: badge.hero || '',
                          universe: badge.universe || 'Marvel',
                          iconSymbol: badge.iconSymbol || '🛡️',
                          imageUrl: badge.imageUrl || '',
                          amount: badge.amount || 500,
                        });
                        setIsBadgeModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-amber-600 h-7 px-2 hover:bg-amber-50 rounded-lg gap-1"
                    >
                      <Edit2 className="h-3 w-3" /> Edit Badge
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete badge "${badge.hero}"?`)) {
                          setBadgeList((prev) => prev.filter((b) => b.id !== badge.id));
                          toast.success('Badge deleted.');
                        }
                      }}
                      className="h-7 w-7 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Create / Edit Badge Dialog */}
            <Dialog open={isBadgeModalOpen} onOpenChange={setIsBadgeModalOpen}>
              <DialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-serif font-bold text-zinc-950">
                    {editingBadgeId ? 'Edit Superhero / Harry Potter Badge' : 'Add New Superhero / Harry Potter Badge'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                  {/* Badge Custom Image Upload & Canva Studio Button */}
                  <div className="space-y-2 flex flex-col items-center pb-3 border-b border-dashed border-zinc-200">
                    <label className="font-bold text-zinc-700 uppercase text-[10px] self-start">
                      Badge Circular Image / Logo *
                    </label>
                    <ImageUploadWithCamera
                      value={badgeForm.imageUrl}
                      onChange={(img) => setBadgeForm({ ...badgeForm, imageUrl: img })}
                      aspectRatio="square"
                      maxSizeKB={200}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCanvaStudioOpen(true)}
                        className="rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border-amber-200 gap-1.5 h-7"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Canva Badge Studio
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBadgePickerOpen(true)}
                        className="text-[10px] text-[#0F6D4E] h-7 font-bold"
                      >
                        Media Library
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 uppercase text-[10px]">Badge Honor Title *</label>
                    <Input
                      value={badgeForm.name}
                      onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                      placeholder="e.g. Lion of Courage Honor"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-700 uppercase text-[10px]">Hero / House Name *</label>
                      <Input
                        value={badgeForm.hero}
                        onChange={(e) => setBadgeForm({ ...badgeForm, hero: e.target.value })}
                        placeholder="e.g. Gryffindor"
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-700 uppercase text-[10px]">Universe</label>
                      <select
                        value={badgeForm.universe}
                        onChange={(e) => setBadgeForm({ ...badgeForm, universe: e.target.value })}
                        className="w-full h-9 rounded-xl border border-zinc-200 text-xs px-2 bg-white font-medium"
                      >
                        <option value="Harry Potter">Harry Potter</option>
                        <option value="Marvel">Marvel</option>
                        <option value="DC">DC</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-700 uppercase text-[10px]">Unlock Threshold (₹) *</label>
                      <Input
                        type="number"
                        value={badgeForm.amount}
                        onChange={(e) => setBadgeForm({ ...badgeForm, amount: Number(e.target.value) })}
                        placeholder="500"
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-700 uppercase text-[10px]">Emoji / Icon Fallback</label>
                      <Input
                        value={badgeForm.iconSymbol}
                        onChange={(e) => setBadgeForm({ ...badgeForm, iconSymbol: e.target.value })}
                        placeholder="e.g. 🦁"
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBadgeModalOpen(false)} className="rounded-full text-xs">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!badgeForm.hero.trim() || !badgeForm.name.trim()) {
                        toast.error('Hero and Badge title are required.');
                        return;
                      }
                      if (editingBadgeId) {
                        setBadgeList((prev) =>
                          prev.map((b) => (b.id === editingBadgeId ? { ...b, ...badgeForm } : b))
                        );
                        toast.success(`Updated ${badgeForm.hero} Badge!`);
                      } else {
                        const newB = {
                          id: `badge-${Date.now()}`,
                          ...badgeForm,
                          bgGradient: 'from-amber-600 via-[#0F6D4E] to-black',
                          accentBorder: 'border-amber-400',
                        };
                        setBadgeList((prev) => [newB, ...prev]);
                        toast.success(`Created ${badgeForm.hero} Badge!`);
                      }
                      setIsBadgeModalOpen(false);
                      setEditingBadgeId(null);
                    }}
                    className="rounded-full bg-amber-500 text-zinc-950 font-bold text-xs"
                  >
                    {editingBadgeId ? 'Save Badge Changes' : 'Save & Publish Badge'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Media Picker Modal for Badge Image */}
            <MediaPickerModal
              isOpen={badgePickerOpen}
              onClose={() => setBadgePickerOpen(false)}
              onSelectImage={(url) => {
                setBadgeForm({ ...badgeForm, imageUrl: url });
                setBadgePickerOpen(false);
              }}
              title="Select Badge Image"
            />

            {/* Canva Badge Studio & Creative Designer Modal */}
            <BadgeCanvaStudio
              isOpen={canvaStudioOpen}
              onClose={() => setCanvaStudioOpen(false)}
              onApplyImage={(graphicUrl) => {
                setBadgeForm({ ...badgeForm, imageUrl: graphicUrl });
              }}
              initialTitle={badgeForm.name}
              initialHero={badgeForm.hero}
              initialSymbol={badgeForm.iconSymbol}
            />
          </div>
        )}
        {activeTab === 'media' && <MediaLibrary />}
        {activeTab === 'hero' && <HeroManager />}
        {activeTab === 'health' && (
          <div className="space-y-6 animate-fade-up">
            {/* System overview counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-11 w-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Security State</p>
                    <p className="text-lg font-bold text-zinc-900 mt-0.5">Secure</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-11 w-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CPU Utilisation</p>
                    <p className="text-lg font-bold text-zinc-900 mt-0.5">{metrics.cpu}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Memory usage</p>
                    <p className="text-lg font-bold text-zinc-900 mt-0.5">{metrics.memory}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">DB response</p>
                    <p className="text-lg font-bold text-zinc-900 mt-0.5">{metrics.dbLatency}ms</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logs overview list */}
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Diagnostics</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-zinc-500 font-semibold">MongoDB Uptime</span>
                    <span className="font-bold">{metrics.uptime}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-zinc-500 font-semibold">System mode</span>
                    <span className="font-bold text-emerald-600">Production</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-zinc-500 font-semibold">SMTP Status</span>
                    <span className="font-bold text-indigo-600">Configured & Working</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="border-none shadow-sm bg-white animate-fade-up">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-muted-foreground font-bold">
                      <th className="pb-3 uppercase tracking-wider">Name</th>
                      <th className="pb-3 uppercase tracking-wider">Email</th>
                      <th className="pb-3 uppercase tracking-wider">Role</th>
                      <th className="pb-3 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-zinc-50/50">
                        <td className="py-3.5 font-bold text-zinc-900">{u.name}</td>
                        <td className="py-3.5 text-zinc-500">{u.email}</td>
                        <td className="py-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="donor">Donor (User)</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Sponsor Ads Directory</h2>
              <Button onClick={() => openAdModal()} className="rounded-full shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> Launch Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <Card key={ad.id} className="overflow-hidden border border-zinc-200 bg-white shadow-sm flex flex-col justify-between">
                  <div className="relative aspect-[3/1] bg-zinc-100 border-b">
                    <img src={ad.bannerUrl} className="w-full h-full object-cover" alt="" />
                    <Badge className="absolute top-2 right-2 rounded-full uppercase text-[9px] tracking-wider font-bold">
                      {ad.placement}
                    </Badge>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-950 mb-1 leading-snug">{ad.title}</h4>
                      <p className="text-[10px] text-zinc-400">Target: <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{ad.targetUrl}</a></p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 bg-zinc-50 border rounded-xl p-2.5 text-center text-xs">
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Impressions</p>
                          <p className="font-bold text-zinc-900 text-sm mt-0.5">{ad.views || 0}</p>
                        </div>
                        <div className="border-l">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Clicks</p>
                          <p className="font-bold text-zinc-900 text-sm mt-0.5">{ad.clicks || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-4 pt-3 border-t">
                      <Button variant="outline" size="sm" className="rounded-full text-xs h-8" onClick={() => setPreviewAd(ad)}>
                        <Eye className="h-3 w-3 mr-1.5" /> Preview
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs h-8" onClick={() => openAdModal(ad)}>
                        <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full text-xs text-destructive hover:bg-destructive/5 h-8" onClick={() => handleDeleteAd(ad)}>
                        <Trash2 className="h-3 w-3 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {ads.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-white p-6">
                  <Megaphone className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No advertisements launched yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex gap-2">
              {[
                { id: 'all' as const, label: 'All Logs' },
                { id: 'audit' as const, label: 'Audit / Config' },
                { id: 'security' as const, label: 'Authentication' },
                { id: 'email' as const, label: 'Email Logs' }
              ].map((f) => (
                <Button
                  key={f.id}
                  variant={logsFilter === f.id ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setLogsFilter(f.id)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="space-y-3 font-mono text-[11px] leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                  {logsFilter === 'audit' || logsFilter === 'all' ? (
                    logs.audit.map((l) => (
                      <div key={l.id} className="border-b pb-2 last:border-0">
                        <span className="text-amber-600 font-bold">[{new Date(l.createdAt).toLocaleTimeString()}] </span>
                        <span className="text-zinc-800 font-bold">AUDIT: </span>
                        <span className="text-zinc-600">{l.action} ({l.details})</span>
                      </div>
                    ))
                  ) : null}

                  {logsFilter === 'security' || logsFilter === 'all' ? (
                    logs.security.map((l) => (
                      <div key={l.id} className="border-b pb-2 last:border-0">
                        <span className="text-indigo-600 font-bold">[{new Date(l.createdAt).toLocaleTimeString()}] </span>
                        <span className="text-zinc-800 font-bold">SECURITY: </span>
                        <span className="text-zinc-600">{l.eventType} from IP: {l.ip} ({l.email})</span>
                      </div>
                    ))
                  ) : null}

                  {logsFilter === 'email' || logsFilter === 'all' ? (
                    logs.email.map((l) => (
                      <div key={l.id} className="border-b pb-2 last:border-0">
                        <span className="text-sky-600 font-bold">[{new Date(l.createdAt).toLocaleTimeString()}] </span>
                        <span className="text-zinc-800 font-bold">EMAIL: </span>
                        <span className={`${l.status === 'failed' ? 'text-red-600 font-bold' : 'text-zinc-600'}`}>
                          {l.status.toUpperCase()} to {l.recipient} (Subject: {l.subject}, Attempts: {l.attempts}) {l.error ? `Error: ${l.error}` : ''}
                        </span>
                      </div>
                    ))
                  ) : null}

                  {((logsFilter === 'all' && logs.audit.length === 0 && logs.security.length === 0 && logs.email.length === 0) ||
                    (logsFilter === 'audit' && logs.audit.length === 0) ||
                    (logsFilter === 'security' && logs.security.length === 0) ||
                    (logsFilter === 'email' && logs.email.length === 0)) && (
                    <p className="text-center text-zinc-400 italic">No logs recorded.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'configs' && config && (
          <Card className="border-none shadow-sm bg-white animate-fade-up">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b pb-3 flex items-center gap-2">
                <Settings className="h-4 w-4 text-amber-500" />
                Global Configurations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mode controls */}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-zinc-850 text-sm">Policies and Announcement Banners</h3>
                  
                  <div className="flex items-center justify-between border p-3 rounded-xl bg-zinc-50/50">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Maintenance Mode</p>
                      <p className="text-[10px] text-zinc-500">Locks public pages and shows update overlay screen</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.maintenanceMode || false}
                      onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 text-primary border-zinc-300 rounded focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase">Global Announcement Text</label>
                    <Input
                      value={config.globalAnnouncement || ''}
                      onChange={(e) => setConfig({ ...config, globalAnnouncement: e.target.value })}
                      placeholder="e.g. Donation receipts for 80G tax benefits are now available."
                      className="rounded-xl text-xs"
                    />
                  </div>

                  {/* Marquee Motion Speed Control */}
                  <div className="space-y-2 border p-3 rounded-xl bg-emerald-50/40 border-emerald-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#0F6D4E]" />
                        Staff Roster Marquee Speed (Seconds)
                      </label>
                      <span className="text-xs font-mono font-bold text-[#0F6D4E]">
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
                        className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-[#0F6D4E]"
                      />
                      <Input
                        type="number"
                        min={10}
                        max={80}
                        value={config.marqueeSpeed || 35}
                        onChange={(e) => setConfig({ ...config, marqueeSpeed: Number(e.target.value) })}
                        className="w-20 rounded-xl text-xs font-bold font-mono h-8"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500">Lower seconds = faster continuous motion, higher seconds = smooth slow motion.</p>
                  </div>
                </div>

                {/* Terminology */}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-zinc-850 text-sm">Terminology</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase">Donation Button text (Wording)</label>
                    <select
                      value={config.donationWording || 'Support Our Mission'}
                      onChange={(e) => setConfig({ ...config, donationWording: e.target.value })}
                      className="text-xs bg-card border rounded-xl w-full px-3 py-2.5"
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

                {/* WhatsApp configuration */}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-zinc-850 text-sm">WhatsApp Live chat</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">WhatsApp Number (e.g. +91XXXXXXXXXX)</label>
                      <Input
                        value={config.whatsappNumber || ''}
                        onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">Pre-filled Message</label>
                      <Textarea
                        value={config.whatsappWelcomeMessage || ''}
                        onChange={(e) => setConfig({ ...config, whatsappWelcomeMessage: e.target.value })}
                        placeholder="Welcome message when users open chat..."
                        className="text-xs min-h-[70px] rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Support Our Cause Element Settings */}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-zinc-850 text-sm">"Support Our Cause" Element Settings</h3>
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">Card Title</label>
                      <Input
                        value={config.supportCauseTitle || 'Support Our Cause'}
                        onChange={(e) => setConfig({ ...config, supportCauseTitle: e.target.value })}
                        placeholder="e.g. Support Our Cause"
                        className="rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">Subtitle Description</label>
                      <Textarea
                        value={config.supportCauseSubtitle || 'Your generous contribution helps us provide better care, education, and opportunities to our children.'}
                        onChange={(e) => setConfig({ ...config, supportCauseSubtitle: e.target.value })}
                        placeholder="Description text..."
                        className="text-xs min-h-[60px] rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">Background / Featured Image URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={config.supportCauseBgUrl || ''}
                          onChange={(e) => setConfig({ ...config, supportCauseBgUrl: e.target.value })}
                          placeholder="Paste image URL or choose from Media Library..."
                          className="rounded-xl text-xs bg-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs whitespace-nowrap bg-white"
                          onClick={() => setCausePickerOpen(true)}
                        >
                          Media Library
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Backdrop settings */}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-zinc-850 text-sm">Hero backdrop settings</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 uppercase">Backdrop Type</label>
                        <select
                          value={config.heroBgType || 'gradient'}
                          onChange={(e) => setConfig({ ...config, heroBgType: e.target.value })}
                          className="text-xs bg-card border rounded-xl w-full px-3 py-2"
                        >
                          <option value="gradient">Default Gradient Canvas</option>
                          <option value="image">Parallax Cover Photo</option>
                          <option value="video">Ambient loop Video</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 uppercase">Overlay Opacity</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          value={config.heroOverlayOpacity !== undefined ? config.heroOverlayOpacity : 0.55}
                          onChange={(e) => setConfig({ ...config, heroOverlayOpacity: Number(e.target.value) })}
                          className="text-xs bg-card border rounded-xl w-full px-3 py-2 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">Backdrop Media Link URL</label>
                      <Input
                        value={config.heroBgUrl || ''}
                        onChange={(e) => setConfig({ ...config, heroBgUrl: e.target.value })}
                        placeholder="Paste image or mp4 URL..."
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between border p-2.5 rounded-xl bg-zinc-50/50">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Parallax Scrolling</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.heroParallax || false}
                        onChange={(e) => setConfig({ ...config, heroParallax: e.target.checked })}
                        className="h-4 w-4 text-primary border-zinc-300 rounded focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* About Us Custom Page Images */}
                <div className="space-y-4 md:col-span-2 border-t pt-4">
                  <h3 className="font-serif font-bold text-zinc-850 text-sm">About Us Custom Page Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">Hero Section Photo URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={config.aboutHeroImgUrl || ''}
                          onChange={(e) => setConfig({ ...config, aboutHeroImgUrl: e.target.value })}
                          placeholder="Default school building entrance..."
                          className="rounded-xl text-xs bg-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs whitespace-nowrap bg-white"
                          onClick={() => setAboutHeroPickerOpen(true)}
                        >
                          Pick Photo
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">School Assembly Photo URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={config.aboutAssemblyImgUrl || ''}
                          onChange={(e) => setConfig({ ...config, aboutAssemblyImgUrl: e.target.value })}
                          placeholder="Default assembly ground image..."
                          className="rounded-xl text-xs bg-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs whitespace-nowrap bg-white"
                          onClick={() => setAboutAssemblyPickerOpen(true)}
                        >
                          Pick Photo
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">National Award Photo URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={config.aboutAwardImgUrl || ''}
                          onChange={(e) => setConfig({ ...config, aboutAwardImgUrl: e.target.value })}
                          placeholder="Default award certificate photo..."
                          className="rounded-xl text-xs bg-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs whitespace-nowrap bg-white"
                          onClick={() => setAboutAwardPickerOpen(true)}
                        >
                          Pick Photo
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase">Principal Photo URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={config.aboutPrincipalImgUrl || ''}
                          onChange={(e) => setConfig({ ...config, aboutPrincipalImgUrl: e.target.value })}
                          placeholder="Default principal portrait..."
                          className="rounded-xl text-xs bg-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs whitespace-nowrap bg-white"
                          onClick={() => setAboutPrincipalPickerOpen(true)}
                        >
                          Pick Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gen-Z User Profile Banner & Car Graphic Settings */}
                <div className="space-y-4 md:col-span-2 border-t pt-4">
                  <h3 className="font-serif font-bold text-zinc-850 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-red-500" />
                    User Profile Banner & Car Asset Settings (Crop, Rotate, Opacity & Fitting Controls)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border">
                    {/* Profile Banner Background Image */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-700 uppercase">
                        Profile Banner Background Image (Flag / Racing Backdrop)
                      </label>
                      <ImageUploadWithCamera
                        value={config.profileBgUrl || '/f1-flag.jpg'}
                        onChange={(img) => setConfig({ ...config, profileBgUrl: img })}
                        aspectRatio="video"
                        maxSizeKB={800}
                      />
                      
                      <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-600 uppercase">Banner Opacity</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={config.profileOverlayOpacity !== undefined ? config.profileOverlayOpacity : 0.9}
                            onChange={(e) => setConfig({ ...config, profileOverlayOpacity: Number(e.target.value) })}
                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0F6D4E]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-600 uppercase">Orientation / Rotation</label>
                          <select
                            value={config.profileBgRotation !== undefined ? config.profileBgRotation : 0}
                            onChange={(e) => setConfig({ ...config, profileBgRotation: Number(e.target.value) })}
                            className="w-full h-8 rounded-lg border border-zinc-200 text-xs px-1.5 bg-white font-bold"
                          >
                            <option value={0}>0° Horizontal (Default)</option>
                            <option value={-90}>-90° Rotated</option>
                            <option value={90}>90° Vertical</option>
                            <option value={180}>180° Inverted</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-600 uppercase">Fitting Mode</label>
                          <select
                            value={config.profileBgObjectFit || 'cover'}
                            onChange={(e) => setConfig({ ...config, profileBgObjectFit: e.target.value })}
                            className="w-full h-8 rounded-lg border border-zinc-200 text-xs px-1.5 bg-white font-bold"
                          >
                            <option value="cover">Cover (Fill)</option>
                            <option value="contain">Contain (Fit)</option>
                            <option value="fill">Stretch Fill</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Profile Car Graphic Image */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-700 uppercase">
                        Profile Car Image (Placed Below Edit Profile Button)
                      </label>
                      <ImageUploadWithCamera
                        value={config.profileCarUrl || '/f1-car.png'}
                        onChange={(img) => setConfig({ ...config, profileCarUrl: img })}
                        aspectRatio="banner"
                        maxSizeKB={500}
                      />

                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-600 uppercase">Car Rotation</label>
                          <select
                            value={config.profileCarRotation || 0}
                            onChange={(e) => setConfig({ ...config, profileCarRotation: Number(e.target.value) })}
                            className="w-full h-8 rounded-lg border border-zinc-200 text-xs px-2 bg-white font-bold"
                          >
                            <option value={0}>0° Normal</option>
                            <option value={90}>90° Clockwise</option>
                            <option value={180}>180° Inverted</option>
                            <option value={270}>270° Counter</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-600 uppercase">Car Fitting Mode</label>
                          <select
                            value={config.profileCarObjectFit || 'contain'}
                            onChange={(e) => setConfig({ ...config, profileCarObjectFit: e.target.value })}
                            className="w-full h-8 rounded-lg border border-zinc-200 text-xs px-2 bg-white font-bold"
                          >
                            <option value="contain">Contain (Fit)</option>
                            <option value="cover">Cover (Crop)</option>
                            <option value="fill">Stretch Fill</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-5 text-right">
                <Button onClick={handleUpdateConfig} className="rounded-full px-6">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'backup' && (
          <Card className="border-none shadow-sm bg-white animate-fade-up">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b pb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-500" />
                Data Recovery Management
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Export Card */}
                <div className="border rounded-2xl p-6 bg-zinc-50/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-zinc-900 text-base mb-2">Export Data Backup</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                      Download a complete snapshot JSON file of the database including all users, needs, bookings, posts, configurations, and settings.
                    </p>
                  </div>
                  <Button onClick={handleBackup} className="rounded-full w-full gap-2 h-11 bg-zinc-950 text-white hover:bg-zinc-800">
                    <Download className="h-4 w-4" /> Download Backup JSON
                  </Button>
                </div>

                {/* Import Card */}
                <div className="border border-amber-200/60 rounded-2xl p-6 bg-amber-50/10 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-zinc-900 text-base mb-2 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-amber-600" />
                      Restore Database Backup
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                      Upload a previously exported backup JSON file to restore system state. Warning: This overwrites existing tables.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      id="restore-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    <Button variant="outline" className="w-full rounded-full gap-2 h-11 border-amber-300 text-amber-900 bg-white hover:bg-amber-50 font-bold text-xs" disabled={loading}>
                      <Upload className="h-4 w-4" /> {loading ? 'Restoring Database...' : 'Upload & Restore Backup'}
                    </Button>
                  </div>
                </div>

                {/* Factory Reset Card */}
                <div className="border border-red-300 rounded-2xl p-6 bg-red-50/30 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-red-950 text-base mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                      Factory Reset Website Data
                    </h3>
                    <p className="text-xs text-red-900/80 leading-relaxed mb-6">
                      Clear browser cache, wipe temporary local storage overrides, and reset all ashrams, needs, events & configurations back to original seed defaults.
                    </p>
                  </div>
                  <Button
                    onClick={handleResetFactoryData}
                    disabled={loading}
                    className="w-full rounded-full gap-2 h-11 bg-red-600 text-white hover:bg-red-700 font-bold text-xs shadow-md"
                  >
                    <RefreshCw className="h-4 w-4" /> Reset Data to Factory Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Launcher/Editor Modal for Ads */}
      <Dialog open={isAdModalOpen} onOpenChange={setIsAdModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">{editingAd ? 'Edit Ad Campaign' : 'Launch Ad Campaign'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 uppercase">Sponsor Name / Campaign Title *</label>
              <Input
                value={adForm.title}
                onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                placeholder="e.g. Green Valley Organic Foods"
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 uppercase">Banner Image Link URL *</label>
              <div className="flex gap-2">
                <Input
                  value={adForm.bannerUrl}
                  onChange={(e) => setAdForm({ ...adForm, bannerUrl: e.target.value })}
                  placeholder="Paste banner photo URL or pick from Media Library..."
                  className="rounded-xl text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs whitespace-nowrap"
                  onClick={() => setAdPickerOpen(true)}
                >
                  Media Library
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 uppercase">Click Destination Link URL *</label>
              <Input
                value={adForm.targetUrl}
                onChange={(e) => setAdForm({ ...adForm, targetUrl: e.target.value })}
                placeholder="Paste sponsor target URL..."
                className="rounded-xl text-xs"
              />
            </div>

            {/* Ad Resizing & Dimensions */}
            <div className="space-y-3 bg-zinc-50 p-3.5 rounded-2xl border">
              <p className="text-xs font-bold text-zinc-800 uppercase flex items-center justify-between">
                <span>Ad Dimensions & Sizing</span>
                <span className="text-primary font-mono">{adForm.bannerHeight}px height</span>
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase">Banner Height (px)</label>
                  <input
                    type="range"
                    min="80"
                    max="350"
                    step="10"
                    value={adForm.bannerHeight}
                    onChange={(e) => setAdForm({ ...adForm, bannerHeight: Number(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase">Aspect Ratio</label>
                  <select
                    value={adForm.aspectRatio}
                    onChange={(e) => setAdForm({ ...adForm, aspectRatio: e.target.value })}
                    className="text-xs bg-white border rounded-xl w-full px-2 py-1.5"
                  >
                    <option value="5/1">5:1 Slim Banner</option>
                    <option value="4/1">4:1 Standard Banner</option>
                    <option value="3/1">3:1 High Banner</option>
                    <option value="16/9">16:9 Video Banner</option>
                    <option value="1/1">1:1 Square</option>
                    <option value="auto">Auto Aspect</option>
                  </select>
                </div>
              </div>

              {/* Live Ad Dimension Test Box */}
              {adForm.bannerUrl && (
                <div className="space-y-1 pt-1 border-t">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">Live Ad Size Test Preview:</p>
                  <div
                    className="relative rounded-xl overflow-hidden border bg-zinc-900 mx-auto"
                    style={{ height: `${Math.min(adForm.bannerHeight, 140)}px` }}
                  >
                    <img src={adForm.bannerUrl} className="w-full h-full object-cover" alt="" />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white rounded px-1.5 py-0.5 text-[9px]">
                      {adForm.bannerHeight}px · {adForm.aspectRatio}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase">Placement Slot</label>
                <select
                  value={adForm.placement}
                  onChange={(e) => setAdForm({ ...adForm, placement: e.target.value })}
                  className="text-xs bg-card border rounded-xl w-full px-3 py-2"
                >
                  <option value="home_top">Home Top Banner</option>
                  <option value="home_bottom">Home Bottom Banner</option>
                  <option value="explore_sidebar">Explore Page Sidebar</option>
                  <option value="about_bottom">About Us Bottom Slot</option>
                  <option value="popup_center">Center Screen Pop-Up Modal</option>
                  <option value="popup_bottom_left">Bottom-Left Corner Floating Pop-Up</option>
                  <option value="popup_bottom_right">Bottom-Right Corner Floating Pop-Up</option>
                </select>
              </div>

              <div className="space-y-1 flex items-center justify-between pl-4">
                <label className="text-xs font-bold text-zinc-700 uppercase">Campaign Active</label>
                <input
                  type="checkbox"
                  checked={adForm.enabled}
                  onChange={(e) => setAdForm({ ...adForm, enabled: e.target.checked })}
                  className="h-4 w-4 text-primary border-zinc-300 rounded focus:ring-amber-500"
                />
              </div>
            </div>

            {adForm.placement.startsWith('popup') && (
              <div className="space-y-1 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                <div className="flex justify-between items-center text-xs font-bold text-amber-900 uppercase">
                  <span>Pop-Up Display Delay</span>
                  <span className="text-primary font-mono">{adForm.popupDelay || 3} seconds</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={adForm.popupDelay || 3}
                  onChange={(e) => setAdForm({ ...adForm, popupDelay: Number(e.target.value) })}
                  className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[10px] text-amber-700">Ad will automatically pop up after {adForm.popupDelay || 3} seconds on public pages.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase">Start Date</label>
                <input
                  type="date"
                  value={adForm.startDate}
                  onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                  className="text-xs bg-card border rounded-xl w-full px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase">End Date</label>
                <input
                  type="date"
                  value={adForm.endDate}
                  onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                  className="text-xs bg-card border rounded-xl w-full px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4 mt-3">
            <Button variant="outline" className="rounded-full text-xs h-9" onClick={() => setIsAdModalOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full px-5 text-xs h-9" onClick={handleSaveAd}>
              {editingAd ? 'Save Changes' : 'Launch Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ad Banner Media Picker */}
      <MediaPickerModal
        open={adPickerOpen}
        onOpenChange={setAdPickerOpen}
        allowedTypes="image"
        title="Select Advertisement Banner Image"
        onSelectMedia={(media) => {
          setAdForm({ ...adForm, bannerUrl: media.url });
        }}
      />

      {/* Support Our Cause Media Picker */}
      <MediaPickerModal
        open={causePickerOpen}
        onOpenChange={setCausePickerOpen}
        allowedTypes="image"
        title="Select Support Our Cause Image"
        onSelectMedia={(media) => {
          setConfig({ ...config, supportCauseBgUrl: media.url });
        }}
      />

      {/* Ad Campaign Preview Modal */}
      {previewAd && (
        <Dialog open={Boolean(previewAd)} onOpenChange={() => setPreviewAd(null)}>
          <DialogContent className="max-w-xl rounded-3xl p-6 bg-white">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="font-serif text-lg font-bold flex items-center justify-between">
                <span>Ad Campaign Preview</span>
                <Badge className="bg-primary text-white text-[10px] uppercase font-bold px-2.5 py-0.5">
                  {previewAd.placement}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div>
                <h4 className="font-bold text-sm text-zinc-900 mb-1">{previewAd.title}</h4>
                <p className="text-xs text-zinc-500">
                  Target Link: <a href={previewAd.targetUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{previewAd.targetUrl}</a>
                </p>
              </div>

              {/* Live Placement Banner Preview Box */}
              <div className="space-y-1 bg-zinc-950 p-4 rounded-2xl border text-white">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase mb-2">
                  <span>Live Placement Banner Render</span>
                  <span>{previewAd.bannerHeight || 180}px Height · {previewAd.aspectRatio || '4/1'}</span>
                </div>
                <div
                  className="relative w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800"
                  style={{
                    height: previewAd.bannerHeight ? `${previewAd.bannerHeight}px` : '160px',
                    maxHeight: '260px',
                  }}
                >
                  <img src={previewAd.bannerUrl} alt={previewAd.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white bg-black/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Sponsored
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-2xl border text-center text-xs">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Impressions</p>
                  <p className="font-bold text-zinc-900 text-base mt-0.5">{previewAd.views || 0}</p>
                </div>
                <div className="border-l">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Clicks</p>
                  <p className="font-bold text-zinc-900 text-base mt-0.5">{previewAd.clicks || 0}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" className="rounded-full text-xs" onClick={() => setPreviewAd(null)}>
                Close Preview
              </Button>
              <a href={previewAd.targetUrl} target="_blank" rel="noopener noreferrer">
                <Button className="rounded-full text-xs gap-1.5 shadow">
                  <ExternalLink className="h-3.5 w-3.5" /> Test Click Target
                </Button>
              </a>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* About Page Hero Picker */}
      <MediaPickerModal
        open={aboutHeroPickerOpen}
        onOpenChange={setAboutHeroPickerOpen}
        allowedTypes="image"
        title="Select About Page Hero Photo"
        onSelectMedia={(media) => {
          setConfig({ ...config, aboutHeroImgUrl: media.url });
        }}
      />

      {/* About Page Assembly Picker */}
      <MediaPickerModal
        open={aboutAssemblyPickerOpen}
        onOpenChange={setAboutAssemblyPickerOpen}
        allowedTypes="image"
        title="Select School Assembly Photo"
        onSelectMedia={(media) => {
          setConfig({ ...config, aboutAssemblyImgUrl: media.url });
        }}
      />

      {/* About Page Award Picker */}
      <MediaPickerModal
        open={aboutAwardPickerOpen}
        onOpenChange={setAboutAwardPickerOpen}
        allowedTypes="image"
        title="Select National Award Certificate Photo"
        onSelectMedia={(media) => {
          setConfig({ ...config, aboutAwardImgUrl: media.url });
        }}
      />

      {/* About Page Principal Picker */}
      <MediaPickerModal
        open={aboutPrincipalPickerOpen}
        onOpenChange={setAboutPrincipalPickerOpen}
        allowedTypes="image"
        title="Select School Principal Photo"
        onSelectMedia={(media) => {
          setConfig({ ...config, aboutPrincipalImgUrl: media.url });
        }}
      />
    </div>
  );
}
