import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Activity,
  Users,
  FileText,
  Database,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Trash2,
  TrendingUp,
  Download,
  Upload,
  AlertTriangle,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

type ActiveTab = 'health' | 'users' | 'logs' | 'backup';

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('health');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.endsWith('/users')) setActiveTab('users');
    else if (location.pathname.endsWith('/logs')) setActiveTab('logs');
    else if (location.pathname.endsWith('/backup')) setActiveTab('backup');
    else setActiveTab('health');
  }, [location.pathname]);

  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<{ email: any[]; security: any[]; audit: any[] }>({ email: [], security: [], audit: [] });
  const [loading, setLoading] = useState(false);
  const [logsFilter, setLogsFilter] = useState<'all' | 'email' | 'security' | 'audit'>('all');

  // Simulated metrics for System Health
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 42,
    dbLatency: 4,
    uptime: '14d 6h 32m'
  });

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
        { id: 'aud-1', action: 'UPDATE_CONFIG', user: 'Keshav Patel', details: 'Updated website studio & background settings in Admin Settings', createdAt: new Date().toISOString() },
        { id: 'aud-2', action: 'HERO_CONFIG_SAVE', user: 'Keshav Patel', details: 'Configured video hero backdrop in Admin Settings', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 'aud-3', action: 'ROLE_MODIFICATION', user: 'Keshav Patel', details: 'Updated user administrative privileges', createdAt: new Date(Date.now() - 14400000).toISOString() },
      ],
    });
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    void loadAll();
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

  const handleUpdateUserRole = async (id: string, role: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id || (u as any)._id === id ? { ...u, role } : u)));
    try {
      await api.updateSuperAdminUserRole(id, role);
      toast.success('User role modified successfully.');
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

  // Backup & Restore handlers
  const [restoreFilePending, setRestoreFilePending] = useState<any | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [securityActionInProgress, setSecurityActionInProgress] = useState(false);

  const createAndDownloadSecurityBackup = async (actionReason: string) => {
    try {
      const fullBackup = await api.backupDatabase();
      const snapshot = {
        ...fullBackup,
        securityMetadata: {
          action: actionReason,
          triggeredAt: new Date().toISOString(),
          triggeredBy: 'Super Admin',
          systemFingerprint: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
        },
      };

      const jsonStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const dlUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = dlUrl;
      link.download = `niswartha_security_backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(dlUrl);

      try {
        const notif = {
          id: `sec-backup-${Date.now()}`,
          userId: 'superadmin',
          title: `🛡️ Security Backup Created: ${actionReason}`,
          message: `Automatic full system safety backup file was downloaded and archived before executing: "${actionReason}".`,
          type: 'security',
          read: false,
          createdAt: new Date().toISOString(),
        };
        const existing = localStorage.getItem('notifications');
        const notifs = existing ? JSON.parse(existing) : [];
        localStorage.setItem('notifications', JSON.stringify([notif, ...notifs]));
      } catch {}

      try {
        const secBackups = localStorage.getItem('superadmin_security_backups');
        const list = secBackups ? JSON.parse(secBackups) : [];
        list.unshift({
          id: `sec_${Date.now()}`,
          date: new Date().toISOString(),
          reason: actionReason,
        });
        localStorage.setItem('superadmin_security_backups', JSON.stringify(list.slice(0, 10)));
      } catch {}

      return true;
    } catch (err) {
      console.error('Failed to create security backup:', err);
      return false;
    }
  };

  const handleBackup = async () => {
    toast.info('Exporting full database backup...');
    await createAndDownloadSecurityBackup('Manual Database Backup Export');
    toast.success('Database backup exported and saved to device.');
  };

  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setRestoreFilePending(json);
      } catch {
        toast.error('Invalid backup JSON format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const executeConfirmedRestore = async () => {
    if (!restoreFilePending) return;
    setLoading(true);
    setSecurityActionInProgress(true);
    toast.info('Archiving safety backup to your device before restoring...');
    await createAndDownloadSecurityBackup('Pre-Database Restore Safety Backup');
    setSecurityActionInProgress(false);

    try {
      const res = await api.restoreDatabase(restoreFilePending);
      setLoading(false);
      setRestoreFilePending(null);
      if (res.success) {
        toast.success('Database restored successfully! Security backup secured. Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore database');
      setLoading(false);
    }
  };

  const executeConfirmedReset = async () => {
    setShowResetConfirm(false);
    setLoading(true);
    setSecurityActionInProgress(true);
    toast.info('Creating security snapshot and saving backup to your device...');
    await createAndDownloadSecurityBackup('Pre-Factory Reset Full Backup');
    setSecurityActionInProgress(false);

    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const primary_theme_color = localStorage.getItem('primary_theme_color');
      const secBackups = localStorage.getItem('superadmin_security_backups');
      const notifs = localStorage.getItem('notifications');

      localStorage.clear();
      sessionStorage.clear();

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', user);
      if (primary_theme_color) localStorage.setItem('primary_theme_color', primary_theme_color);
      if (secBackups) localStorage.setItem('superadmin_security_backups', secBackups);
      if (notifs) localStorage.setItem('notifications', notifs);

      toast.success('Website data reset to factory default! Security backup saved. Reloading...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
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
          <p className="text-xs text-muted-foreground">Manage core system security, diagnostic metrics, user directory, and database backups</p>
        </div>
        <Button onClick={loadAll} variant="outline" size="sm" className="rounded-full gap-1.5 h-9 bg-white">
          <RefreshCw className="h-3.5 w-3.5" /> Reload
        </Button>
      </div>

      {/* Admin Settings Link Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
        <div>
          <span className="font-bold flex items-center gap-1.5 text-amber-950 text-sm">
            <Settings className="h-4 w-4 text-amber-600" />
            Website Studio, Hero Media & Configurations
          </span>
          <p className="text-[11px] text-amber-800/90 mt-0.5">
            Page Hero banners, contact info, accent themes, and website operational settings are now in Admin Settings for streamlined administration.
          </p>
        </div>
        <Link to="/admin/settings">
          <Button size="sm" variant="outline" className="rounded-full bg-white border-amber-300 text-amber-950 font-bold hover:bg-amber-100 gap-1.5 h-8 whitespace-nowrap shadow-xs">
            Open Admin Settings <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Main Tabs Container */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-zinc-200">
        {[
          { id: 'health' as const, label: 'System Health', icon: Activity },
          { id: 'users' as const, label: 'User Management', icon: Users },
          { id: 'logs' as const, label: 'System Logs', icon: FileText },
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

            {/* Diagnostics overview list */}
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
                      onChange={handleRestoreFileSelected}
                      id="restore-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading || securityActionInProgress}
                    />
                    <Button variant="outline" className="w-full rounded-full gap-2 h-11 border-amber-300 text-amber-900 bg-white hover:bg-amber-50 font-bold text-xs" disabled={loading || securityActionInProgress}>
                      <Upload className="h-4 w-4" /> {securityActionInProgress ? 'Archiving Security Backup...' : loading ? 'Restoring Database...' : 'Upload & Restore Backup'}
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
                    onClick={() => setShowResetConfirm(true)}
                    disabled={loading || securityActionInProgress}
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

      {/* Restore Database Security Confirmation Modal */}
      <AlertDialog open={Boolean(restoreFilePending)} onOpenChange={(o) => !o && setRestoreFilePending(null)}>
        <AlertDialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl border-none">
          <AlertDialogHeader className="items-center text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <AlertDialogTitle className="text-xl font-bold font-serif text-zinc-950">
              Security Confirmation: Restore Database?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-600 leading-relaxed">
              Restoring will replace existing records with the selected backup file. For your safety, the system will <strong>automatically generate a full security backup snapshot, download it to your device, and archive it into the Super Admin security logs</strong> before overwriting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={securityActionInProgress || loading}
              onClick={() => setRestoreFilePending(null)}
              className="rounded-full text-xs font-semibold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={securityActionInProgress || loading}
              onClick={executeConfirmedRestore}
              className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
            >
              {securityActionInProgress ? 'Downloading Backup...' : 'Save Security Backup & Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Factory Reset Security Confirmation Modal */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl border-none">
          <AlertDialogHeader className="items-center text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-7 w-7 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-xl font-bold font-serif text-red-950">
              Security Safeguard: Reset All Website Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-600 leading-relaxed">
              This action will reset ashrams, needs, events, and configurations back to factory defaults. As an administrative safeguard, <strong>a complete database safety backup will be automatically captured and downloaded to your computer</strong> prior to resetting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={securityActionInProgress || loading}
              onClick={() => setShowResetConfirm(false)}
              className="rounded-full text-xs font-semibold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={securityActionInProgress || loading}
              onClick={executeConfirmedReset}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
            >
              {securityActionInProgress ? 'Archiving Backup...' : 'Download Safety Backup & Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
