import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import {
  Heart,
  LayoutDashboard,
  Calendar,
  Gift,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  BookOpen,
  Image,
  FileText,
  UserCheck,
  Globe,
  MapPin,
  Shield,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { cn } from '../lib/utils';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/needs', label: 'Needs Management', icon: Gift },
  { to: '/admin/feed', label: 'News & Updates', icon: MessageSquare },
  { to: '/admin/gallery', label: 'Gallery Management', icon: Image },
  { to: '/admin/schemes', label: 'Gov Schemes', icon: FileText },
  { to: '/admin/events', label: 'Event Management', icon: Calendar },
  { to: '/admin/bookings', label: 'Visit Bookings', icon: BookOpen },
  { to: '/admin/children', label: 'Child Records', icon: UserCheck },
  { to: '/admin/team', label: 'Team Management', icon: Users },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

export function AdminLayout() {
  const { currentUser, logout, isSuperAdmin } = useUser();
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
    <div className="min-h-screen bg-[#fafbfc] text-zinc-800 flex flex-col font-sans">
      {/* ──── Top Public Header Bar (Exact match to Screenshot 2) ──── */}
      <header className="h-16 bg-white border-b border-zinc-200/80 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F6D4E] text-white shadow-md shadow-[#0F6D4E]/20">
            <Heart className="h-4 w-4 text-white" fill="white" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight font-serif text-zinc-950">Niswartha</p>
            <p className="-mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-400">SELFLESS SERVICE</p>
          </div>
        </div>

        {/* Center Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} className="hover:text-[#0F6D4E] transition-colors">Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} className="hover:text-[#0F6D4E] transition-colors">About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/events'); }} className="hover:text-[#0F6D4E] transition-colors">Events</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/needs'); }} className="hover:text-[#0F6D4E] transition-colors">Needs</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/gallery'); }} className="hover:text-[#0F6D4E] transition-colors">Gallery</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/schemes'); }} className="hover:text-[#0F6D4E] transition-colors">Gov Schemes</a>
        </nav>

        {/* Right CTA & Account */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => navigate('/admin/bookings')}
            className="rounded-full bg-[#0F6D4E] text-white font-bold text-xs px-4 h-9 gap-1.5 shadow-sm hover:bg-[#0c593f]"
          >
            <MapPin className="h-3.5 w-3.5" />
            Visit Us
          </Button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 bg-zinc-100/80 px-3 py-1 rounded-full border border-zinc-200/60">
            <div className="h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'K'}
            </div>
            <span className="text-xs font-bold text-zinc-800">{currentUser?.name?.split(' ')[0] || 'Keshav'}</span>
          </div>

          {/* Live Website / Super Admin Button (Matching Screenshot 2) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin')}
            className="rounded-full border-zinc-300 font-bold text-xs h-9 px-4 gap-1.5 text-zinc-700 hover:bg-zinc-100"
          >
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            Super Admin
          </Button>
        </div>
      </header>

      {/* ──── Main Admin Layout with Left Sidebar ──── */}
      <div className="flex-1 flex min-w-0">
        {/* Left Sidebar (Exact layout & styling from Screenshot 2) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200/80 bg-white shrink-0">
          <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F6D4E] text-white font-bold text-xs shadow-sm">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-950 font-serif">Niswartha</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#0F6D4E]">ADMIN PORTAL</p>
            </div>
          </div>

          {/* User Badge Card from Screenshot 2 */}
          <div className="p-4 border-b border-zinc-100">
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/70 p-3 rounded-2xl">
              <div className="h-10 w-10 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'KP'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-zinc-900">{currentUser?.name || 'Keshav Patel'}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">SUPER ADMIN</p>
              </div>
            </div>
          </div>

          {/* Sidebar Nav Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {ADMIN_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive: active }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150',
                    active
                      ? 'bg-[#EAF5F0] text-[#0F6D4E] font-extrabold shadow-2xs'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                  )
                }
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Admin Pages Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
