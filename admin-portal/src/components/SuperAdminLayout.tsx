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
  Megaphone,
  Image as ImageIcon,
  Layers,
  Globe,
  Sparkles,
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
  { to: '/super-admin/backup', label: 'Backup & Restore', icon: Database },
] as const;

export function SuperAdminLayout() {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Link to="/super-admin" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F6D4E] text-white shadow-md shadow-[#0F6D4E]/20 transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-zinc-950 font-serif">Niswartha</p>
              <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0F6D4E]">SUPER ADMIN</p>
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
                  ? 'bg-amber-500/10 text-amber-800 font-extrabold shadow-sm'
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 font-bold text-xs">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'K'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">{currentUser?.name || 'Keshav Patel'}</p>
              <p className="text-[9px] text-zinc-500 truncate">{currentUser?.email || 'keshavpatel3690@gmail.com'}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 rounded-xl text-xs font-semibold text-zinc-700 border-zinc-200 hover:bg-zinc-100"
              onClick={() => navigate('/admin')}
            >
              <Globe className="h-4 w-4 text-[#0F6D4E]" />
              Admin Portal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 rounded-xl text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar matching Screenshot 1 */}
        <header className="flex h-16 items-center justify-between px-6 bg-white border-b border-zinc-200/80 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM LIVE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-zinc-500 hidden sm:inline">
              Role: <strong className="text-zinc-900">Super Administrator</strong>
            </span>
            {/* Black Pill Admin Panel Switcher Button (Exact match to Screenshot 1) */}
            <Button
              size="sm"
              onClick={() => navigate('/admin')}
              className="rounded-full bg-zinc-950 text-white font-bold text-xs px-5 py-2 hover:bg-zinc-800 shadow-md transition-transform hover:scale-105"
            >
              Admin Panel
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
