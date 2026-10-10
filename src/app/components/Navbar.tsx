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
  Image,
  FileText,
  Shield,
} from 'lucide-react';
import { HandSupportIcon } from './HandSupportIcon';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/needs', label: 'Needs', icon: Gift },
  { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/schemes', label: 'Gov Schemes', icon: FileText },
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

  const heroRoutes = ['/', '/about', '/events', '/needs', '/gallery', '/schemes', '/help'];
  const isHeroPage =
    heroRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/visit-book') ||
    location.pathname.startsWith('/donate') ||
    location.pathname.startsWith('/ashram');

  return (
    <>
      {/* Navbar wrapper — full width fixed strip */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out will-change-transform',
          scrolled ? 'pt-3 px-4 sm:px-6 lg:px-10' : 'pt-0 px-0'
        )}
      >
        {/* The actual nav pill */}
        <nav
          className={cn(
            'transition-all duration-300 ease-out mx-auto',
            scrolled
              ? [
                  'max-w-5xl rounded-full',
                  'bg-white/85 backdrop-blur-2xl',
                  'shadow-[0_8px_32px_0_rgba(0,0,0,0.12),0_2px_8px_0_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]',
                  'border border-white/80',
                  'text-foreground',
                ].join(' ')
              : isHeroPage
                ? 'max-w-none rounded-none bg-transparent text-white'
                : 'max-w-none rounded-none bg-white/60 backdrop-blur-xl text-foreground'
          )}
        >

        <div className={cn('mx-auto transition-all duration-300 ease-out', scrolled ? 'px-5 sm:px-7' : 'px-4 sm:px-6 lg:px-8 max-w-7xl')}>
          <div className={cn('flex items-center justify-between transition-all duration-300 ease-out', scrolled ? 'h-[52px]' : 'h-16 lg:h-20')}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              {/* Logo icon — always solid white */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105 bg-white border border-zinc-200">
                <img src="/logo.png" alt="Niswartha Logo" className="h-full w-full object-cover" />
              </div>
              <div className={cn('hidden sm:block transition-all duration-300', scrolled ? '' : '')}>
                <p
                  className={cn(
                    'font-bold tracking-tight font-serif transition-all duration-300',
                    scrolled ? 'text-base text-foreground' : 'text-lg',
                    !scrolled && isHeroPage ? 'text-white drop-shadow-sm' : 'text-foreground'
                  )}
                >
                  Niswartha
                </p>
                {!scrolled && (
                  <p className={cn(
                    '-mt-1 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors duration-300',
                    isHeroPage ? 'text-white/70' : 'text-muted-foreground'
                  )}>
                    Selfless Service
                  </p>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group',
                    isActive(link.to)
                      ? !scrolled && isHeroPage
                        ? 'text-white'
                        : 'text-primary'
                      : !scrolled && isHeroPage
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={cn(
                        'absolute bottom-0 left-2 right-2 h-0.5 rounded-full',
                        !scrolled && isHeroPage ? 'bg-white' : 'bg-primary'
                      )}
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
                    className={cn(
                      'hidden md:inline-flex gap-2 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02]',
                      !scrolled && isHeroPage
                        ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-white/10'
                        : 'bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30'
                    )}
                    onClick={() => navigate('/visit-book/ashram-1')}
                  >
                    <MapPin className="h-4 w-4" />
                    Visit Us
                  </Button>

                  {/* Notification Bell */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'relative h-10 w-10 rounded-full transition-colors duration-200',
                      !scrolled && isHeroPage
                        ? 'text-white hover:bg-white/15'
                        : 'hover:bg-muted/60'
                    )}
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell className="h-5 w-5" />
                  </Button>

                  {/* Profile Dropdown */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={cn(
                        'flex items-center gap-2 rounded-full p-1 pr-3 transition-colors duration-200',
                        !scrolled && isHeroPage ? 'hover:bg-white/15' : 'hover:bg-muted/60'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm',
                          !scrolled && isHeroPage
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span
                        className={cn(
                          'hidden md:block text-sm font-medium',
                          !scrolled && isHeroPage ? 'text-white' : 'text-foreground'
                        )}
                      >
                        {currentUser.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={cn(
                        'hidden md:block h-4 w-4 transition-transform duration-200',
                        !scrolled && isHeroPage ? 'text-white/70' : 'text-muted-foreground',
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
                          className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-card/95 backdrop-blur-xl p-1.5 shadow-xl shadow-black/10"
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
                            <button
                              onClick={() => { window.location.href = 'https://deafanddumbschool.vercel.app/admin'; }}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60"
                            >
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Admin Panel
                            </button>
                          )}
                          {currentUser?.role === 'super_admin' && (
                            <button
                              onClick={() => { window.location.href = 'https://deafanddumbschool.vercel.app/super-admin'; }}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60"
                            >
                              <Shield className="h-4 w-4 text-muted-foreground" /> Super Admin Portal
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className={cn(
                      'rounded-full transition-colors duration-200',
                      !scrolled && isHeroPage
                        ? 'text-white hover:bg-white/15 hover:text-white'
                        : ''
                    )}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/signup')}
                    className={cn(
                      'rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02]',
                      !scrolled && isHeroPage
                        ? 'bg-white text-primary hover:bg-white/90 shadow-white/20'
                        : 'bg-primary text-primary-foreground shadow-primary/20'
                    )}
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'lg:hidden h-10 w-10 rounded-full transition-colors duration-200',
                  !scrolled && isHeroPage ? 'text-white hover:bg-white/15' : ''
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        </nav>
      </div>

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

      {/* Spacer to prevent content from being hidden behind fixed navbar on non-hero pages */}
      {!isHeroPage && <div className={cn('transition-all duration-500', scrolled ? 'h-[72px]' : 'h-16 lg:h-20')} />}
    </>
  );
}
