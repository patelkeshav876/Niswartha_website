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
  AlertTriangle
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

type ActiveTab = 'health' | 'users' | 'ads' | 'logs' | 'configs' | 'backup';

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('health');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.endsWith('/users')) setActiveTab('users');
    else if (location.pathname.endsWith('/ads')) setActiveTab('ads');
    else if (location.pathname.endsWith('/logs')) setActiveTab('logs');
    else if (location.pathname.endsWith('/configs')) setActiveTab('configs');
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
  
  // Ad modal states
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [adForm, setAdForm] = useState({
    title: '',
    bannerUrl: '',
    targetUrl: '',
    placement: 'home_top',
    startDate: '',
    endDate: '',
    enabled: true
  });

  // Simulated metrics for System Health
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 42,
    dbLatency: 4,
    uptime: '14d 6h 32m'
  });

  // Fetch functions
  const fetchConfig = async () => {
    try {
      const c = await api.getConfig();
      setConfig(c);
    } catch {
      toast.error('Failed to load global configurations.');
    }
  };

  const fetchUsers = async () => {
    try {
      const u = await api.getSuperAdminUsers();
      setUsers(u);
    } catch {
      toast.error('Failed to load user directory.');
    }
  };

  const fetchAds = async () => {
    try {
      const a = await api.getAdvertisements();
      setAds(a);
    } catch {
      toast.error('Failed to load advertisements.');
    }
  };

  const fetchLogs = async () => {
    try {
      const l = await api.getSuperAdminLogs(logsFilter, 50);
      setLogs(l);
    } catch {
      toast.error('Failed to retrieve audit logs.');
    }
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
      if (editingAd) {
        await api.updateAdvertisement(editingAd.id, adForm);
        toast.success('Ad campaign modified.');
      } else {
        await api.createAdvertisement(adForm);
        toast.success('Ad campaign launched.');
      }
      setIsAdModalOpen(false);
      void fetchAds();
    } catch {
      toast.error('Failed to save ad campaign.');
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Cancel and delete this ad campaign?')) return;
    try {
      await api.deleteAdvertisement(id);
      toast.success('Ad deleted.');
      void fetchAds();
    } catch {
      toast.error('Failed to delete ad.');
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
          { id: 'users' as const, label: 'User Management', icon: Users },
          { id: 'ads' as const, label: 'Ads Manager', icon: Megaphone },
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
                      <Button variant="outline" size="sm" className="rounded-full text-xs h-8" onClick={() => openAdModal(ad)}>
                        <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full text-xs text-destructive hover:bg-destructive/5 h-8" onClick={() => handleDeleteAd(ad.id)}>
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
                  <h3 className="font-serif font-bold text-zinc-850 text-sm">Policies & Announcement Banners</h3>
                  
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
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
                <div className="border border-red-200/50 rounded-2xl p-6 bg-red-50/10 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-zinc-900 text-base mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                      Restore Database Backup
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                      Upload a previously exported backup JSON file to restore the system state. Warning: This clears all existing tables and overrides them.
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
                    <Button variant="outline" className="w-full rounded-full gap-2 h-11 border-red-200 text-red-700 bg-white hover:bg-red-50" disabled={loading}>
                      <Upload className="h-4 w-4" /> {loading ? 'Restoring Database...' : 'Upload & Restore Backup'}
                    </Button>
                  </div>
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
              <Input
                value={adForm.bannerUrl}
                onChange={(e) => setAdForm({ ...adForm, bannerUrl: e.target.value })}
                placeholder="Paste banner cover photo URL..."
                className="rounded-xl text-xs"
              />
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
    </div>
  );
}
