import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
  Heart,
  Calendar,
  Users,
  Home,
  Info,
  MapPin,
  Bell,
  LogOut,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  User,
  ChevronDown,
  Gift,
  BookOpen,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/needs', label: 'Needs', icon: Gift },
] as const;

export function Navbar() {
  const { currentUser, logout, isAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-dropdown]')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [profileOpen]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-12px_rgba(0,0,0,0.06)] border-b border-border/50'
            : 'bg-transparent',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
                <Heart className="h-5 w-5 text-white" fill="white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-lg font-bold tracking-tight text-foreground font-serif">Niswartha</p>
                <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Selfless Service</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive(link.to)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <>
                  {/* Visit Us CTA */}
                  <Button
                    size="sm"
                    className="hidden md:inline-flex gap-2 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => navigate('/visit-book/ashram-1')}
                  >
                    <MapPin className="h-4 w-4" />
                    Visit Us
                  </Button>

                  {/* Notification Bell */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full hover:bg-muted/60"
                    onClick={() => navigate('/profile')}
                  >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </Button>

                  {/* Profile Dropdown */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors duration-200 hover:bg-muted/60"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden md:block text-sm font-medium text-foreground">
                        {currentUser.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={cn(
                        'hidden md:block h-4 w-4 text-muted-foreground transition-transform duration-200',
                        profileOpen && 'rotate-180'
                      )} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-card p-1.5 shadow-xl shadow-black/10"
                        >
                          <div className="px-3 py-2 border-b border-border/50 mb-1">
                            <p className="text-sm font-semibold">{currentUser.name}</p>
                            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                          </div>
                          <button onClick={() => navigate('/profile')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60">
                            <User className="h-4 w-4 text-muted-foreground" /> Profile
                          </button>
                          <button onClick={() => navigate('/my-bookings')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60">
                            <BookOpen className="h-4 w-4 text-muted-foreground" /> My Bookings
                          </button>
                          <button onClick={() => navigate('/donation-history')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60">
                            <Heart className="h-4 w-4 text-muted-foreground" /> Donations
                          </button>
                          <button onClick={() => navigate('/settings')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60">
                            <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                          </button>
                          {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60">
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Admin Panel
                            </button>
                          )}
                          <div className="border-t border-border/50 mt-1 pt-1">
                            <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/5">
                              <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="rounded-full">
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate('/signup')} className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-full"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-card shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <p className="font-bold font-serif text-lg">Menu</p>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive(link.to)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/visit-book/ashram-1"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  Visit Us
                </NavLink>
              </div>
              {currentUser && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-muted/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { logout(); setMobileOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
