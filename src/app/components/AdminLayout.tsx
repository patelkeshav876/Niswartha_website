import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
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
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Image,
  FileText,
  UserCheck,
  Bell,
  Search,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
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
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile sidebar on navigate
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0].toUpperCase() : 'ADMIN';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#F5F2EB] text-zinc-800 border-r border-zinc-200/50">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-200/30">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/10">
            <Heart className="h-4.5 w-4.5 text-white" fill="white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-md font-bold tracking-tight font-serif text-zinc-900">Niswartha</p>
              <p className="-mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Admin Portal</p>
            </div>
          )}
        </Link>
        {mobileOpen && (
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Admin Profile Details */}
      {!collapsed && (
        <div className="px-6 py-6 border-b border-zinc-200/30">
          <div className="flex items-center gap-3 bg-white/50 border border-white p-3 rounded-2xl shadow-sm">
            <img
              src={currentUser?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser?.id}`}
              alt={currentUser?.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-primary/20 shadow-inner"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-zinc-900">{currentUser?.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center py-6 border-b border-zinc-200/30">
          <img
            src={currentUser?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser?.id}`}
            alt={currentUser?.name}
            className="h-9 w-9 rounded-full object-cover border-2 border-primary/20 shadow-sm"
          />
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto scrollbar-hide">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#E3DCCE] text-zinc-950 shadow-sm font-semibold border-l-4 border-primary pl-3'
                    : 'text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Log Out */}
      <div className="p-4 border-t border-zinc-200/30">
        <button
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      {/* Desktop Sidebar (Persistent) */}
      <aside className={cn('hidden md:block transition-all duration-300', collapsed ? 'w-20' : 'w-64')}>
        <div className="sticky top-0 h-screen flex flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Collapsible toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex fixed left-[228px] top-6 z-50 h-6 w-6 items-center justify-center rounded-full border bg-white text-zinc-500 shadow-md hover:text-zinc-900 transition-all duration-300"
        style={{ left: collapsed ? '68px' : '244px' }}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 top-0 left-0 z-50 w-64 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-zinc-200/50 bg-[#FDFBF7]/90 px-6 backdrop-blur-md">
          {/* Greeting / Page Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-full hover:bg-zinc-200/50"
            >
              <Menu className="h-5 w-5 text-zinc-700" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-wider text-zinc-950 font-serif">
                HELLO, {firstName}!
              </h1>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Welcome back to dashboard</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full mx-4 hidden lg:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-full border border-zinc-200 bg-[#FAF9F5] pl-10 pr-4 text-sm text-zinc-800 placeholder-zinc-400 focus:border-primary/50 focus:bg-white focus:outline-none transition-all duration-200 shadow-inner"
            />
          </div>

          {/* Top Nav Actions */}
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-zinc-200 hover:bg-zinc-100 gap-1.5 font-medium text-xs text-zinc-700"
              >
                <Globe className="h-3.5 w-3.5" />
                Live Website
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full hover:bg-zinc-100/80"
              onClick={() => navigate('/admin/settings')}
            >
              <Bell className="h-5 w-5 text-zinc-500" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
