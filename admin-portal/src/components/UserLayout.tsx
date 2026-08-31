import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import {
  Heart,
  User,
  BookOpen,
  Gift,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

const USER_LINKS = [
  { to: '/profile', label: 'My Profile', icon: User, end: true },
  { to: '/my-bookings', label: 'My Bookings', icon: BookOpen },
  { to: '/donation-history', label: 'Donations', icon: Gift },
  { to: '/settings', label: 'Account Settings', icon: Settings },
  { to: '/notifications', label: 'Notifications', icon: Bell },
] as const;

export function UserLayout() {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (currentUser) {
          const list = await api.getNotifications();
          const unread = list.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Failed to load notifications unread count:', err);
      }
    };
    fetchUnread();
    
    // Refresh count on navigate
    const timer = setInterval(fetchUnread, 15000);
    return () => clearInterval(timer);
  }, [location.pathname, currentUser]);

  // Close mobile sidebar on navigate
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0].toUpperCase() : 'USER';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#F5F2EB] text-zinc-800 border-r border-zinc-200/50">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-200/30 border-dashed">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/10">
            <Heart className="h-4.5 w-4.5 text-white" fill="white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-md font-bold tracking-tight font-serif text-zinc-900">Niswartha</p>
              <p className="-mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">User Dashboard</p>
            </div>
          )}
        </Link>
        {mobileOpen && (
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* User Profile Card */}
      {!collapsed && (
        <div className="px-6 py-6 border-b border-zinc-200/30 border-dashed">
          <div className="flex items-center gap-3 bg-white/50 border border-white p-3 rounded-2xl shadow-sm">
            <div className="relative">
              <img
                src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'User')}`}
                alt={currentUser?.name}
                className="h-11 w-11 rounded-full object-cover border-2 border-primary/20 shadow-inner bg-zinc-200"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-zinc-900">{currentUser?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center py-6 border-b border-zinc-200/30 border-dashed">
          <img
            src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'User')}`}
            alt={currentUser?.name}
            className="h-9 w-9 rounded-full object-cover border-2 border-primary/20 shadow-sm bg-zinc-200"
          />
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto scrollbar-hide">
        {USER_LINKS.map((link) => {
          const Icon = link.icon;
          const isNotif = link.to === '/notifications';
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'bg-[#E3DCCE] text-zinc-950 shadow-sm font-semibold border-l-4 border-primary pl-3'
                    : 'text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
              {isNotif && unreadCount > 0 && (
                <span className={cn(
                  "bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0",
                  collapsed ? "absolute top-2 right-2 h-4 w-4" : "h-5 w-5 ml-auto"
                )}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Log Out */}
      <div className="p-4 border-t border-zinc-200/30">
        <button
          onClick={() => logout()}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
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
        className="hidden md:flex fixed top-6 z-50 h-6 w-6 items-center justify-center rounded-full border bg-white text-zinc-500 shadow-md hover:text-zinc-900 transition-all duration-300"
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
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Welcome back to Niswartha portal</p>
            </div>
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
                Back to Website
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full hover:bg-zinc-100/80"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5 text-zinc-500" />
              {unreadCount > 0 && (
                <span className="absolute right-2.5 top-2.5 h-4 w-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
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
