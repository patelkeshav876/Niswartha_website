import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, Outlet, useLocation } from 'react-router';
import { useUser } from '../context/UserContext';
import { cn } from '../lib/utils';
import {
  Heart,
  Activity,
  Users,
  Settings,
  Calendar,
  Gift,
  ImageIcon,
  FileText,
  UserCheck,
  BookOpen,
  LogOut,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Layers,
} from 'lucide-react';
import { Button } from './ui/button';

const SIDEBAR_ITEMS = [
  { to: '/', label: 'SuperAdmin Studio', icon: Sparkles, end: true },
  { to: '/events', label: 'Manage Events', icon: Calendar },
  { to: '/needs', label: 'Needs Management', icon: Gift },
  { to: '/gallery', label: 'Gallery Management', icon: ImageIcon },
  { to: '/schemes', label: 'Government Schemes', icon: FileText },
  { to: '/team', label: 'Team & Staff', icon: UserCheck },
  { to: '/children', label: 'Children Directory', icon: BookOpen },
  { to: '/users', label: 'User Directory', icon: Users },
  { to: '/bookings', label: 'Visit Bookings', icon: Activity },
  { to: '/feed', label: 'Feed & Updates', icon: Layers },
  { to: '/settings', label: 'System Settings', icon: Settings },
];

export function AdminLayout() {
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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 bg-white shrink-0">
        <div className="flex h-20 items-center gap-3 px-6 border-b border-zinc-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F6D4E] text-white shadow-md shadow-[#0F6D4E]/20 transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-zinc-950 font-serif">Niswartha</p>
              <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0F6D4E]">Control Center</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200',
                isActive(item.to, item.end)
                  ? 'bg-[#0F6D4E]/10 text-[#0F6D4E] font-extrabold shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t bg-zinc-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F6D4E] text-white font-bold text-xs shadow-sm">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'K'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">{currentUser?.name || 'Keshav Patel'}</p>
              <p className="text-[9px] text-zinc-500 truncate">{currentUser?.email || 'keshavpatel3690@gmail.com'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F6D4E] text-white">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-serif font-bold text-base text-zinc-900">Niswartha Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
