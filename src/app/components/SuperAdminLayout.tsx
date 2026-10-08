import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, Outlet, useLocation } from 'react-router';
import { useUser } from '../context/UserContext';
import { cn } from '../lib/utils';
import {
  Shield,
  Heart,
  Activity,
  Users,
  Settings,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  FileText,
  AlertCircle,
  Home,
  Megaphone,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { Button } from './ui/button';

const SIDEBAR_ITEMS = [
  { to: '/super-admin', label: 'System Health', icon: Activity, end: true },
  { to: '/super-admin/media', label: 'Media Library', icon: ImageIcon },
  { to: '/super-admin/hero', label: 'Page Hero Manager', icon: Layers },
  { to: '/super-admin/users', label: 'User Directory', icon: Users },
  { to: '/super-admin/ads', label: 'Ad Placements', icon: Megaphone },
  { to: '/super-admin/logs', label: 'System Audit Logs', icon: FileText },
  { to: '/super-admin/configs', label: 'Configurations', icon: Settings },
  { to: '/super-admin/backup', label: 'Backup & Restore', icon: Database }
] as const;

export function SuperAdminLayout() {
  const { currentUser, logout, isSuperAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50/70 text-zinc-800">
      {/* ──── Desktop Sidebar ──── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 bg-white shrink-0">
        <div className="flex h-20 items-center gap-3 px-6 border-b border-zinc-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F6D4E] text-white shadow-md shadow-[#0F6D4E]/20 transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-zinc-950 font-serif">Niswartha</p>
              <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0F6D4E]">Super Admin</p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200',
                isActive(item.to, item.end)
                  ? 'bg-amber-500/10 text-amber-700'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t bg-zinc-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">{currentUser?.name}</p>
              <p className="text-[9px] text-zinc-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start rounded-xl text-xs gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-3.5 w-3.5" /> Website
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-xl text-xs text-destructive hover:bg-destructive/5 gap-2"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* ──── Main Content frame ──── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header toolbar */}
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full h-9 w-9"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">System Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-semibold hidden sm:inline-block">Role: Super Administrator</span>
            <div className="h-8 w-px bg-zinc-200 hidden sm:block" />
            <Link to="/admin">
              <Button size="sm" className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800 text-xs px-4 h-9">
                Admin Panel
              </Button>
            </Link>
          </div>
        </header>

        {/* Content canvas (Centered layout constraint) */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ──── Mobile Sidebar Drawer ──── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/35 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          
          <aside className="relative flex flex-col w-[260px] bg-white h-full animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                <span className="font-serif font-bold text-sm">Super Admin</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {SIDEBAR_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-colors',
                    isActive(item.to, item.end)
                      ? 'bg-amber-500/10 text-amber-700'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t bg-zinc-50/50">
              <Button
                variant="outline"
                size="sm"
                className="w-full mb-2 rounded-xl text-xs gap-1.5 h-9"
                onClick={() => { navigate('/'); setMobileOpen(false); }}
              >
                <Home className="h-4 w-4" /> Website
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-xl text-xs text-destructive hover:bg-destructive/5 gap-1.5 h-9"
                onClick={() => { logout(); setMobileOpen(false); }}
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
