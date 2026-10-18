import { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useUser } from './context/UserContext';
import { useConfig } from './context/ConfigContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { WhatsAppButton } from './components/WhatsAppButton';
import { api, applyThemeColor } from './lib/api';
import { ShieldAlert, X, Wrench } from 'lucide-react';
import { TwoDotLoader } from './components/TwoDotLoader';
import { Button } from './components/ui/button';

export function Layout() {
  const location = useLocation();
  const { currentUser, loading } = useUser();
  const { config } = useConfig();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const hideNavFooter = ['/login', '/signup', '/onboarding', '/super-admin'].some((path) =>
    location.pathname.startsWith(path)
  );

  const isPublicPage = !['/admin', '/super-admin', '/login', '/signup'].some((path) =>
    location.pathname.startsWith(path)
  );

  // Maintenance mode gating (bypassed by admin and super admin users and dashboard/login endpoints)
  const isPrivilegedUser = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const showMaintenance = Boolean(config?.maintenanceMode) && isPublicPage && !isPrivilegedUser;

  const handleEmergencyDisableMaintenance = async () => {
    try {
      const updated = { ...config, maintenanceMode: false };
      setConfig(updated);
      await api.updateConfig(updated);
      toast.success('Maintenance mode disabled. Website is back online!');
    } catch {
      toast.error('Failed to disable maintenance mode.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <TwoDotLoader size={60} message="Loading Niswartha..." />
      </div>
    );
  }

  if (showMaintenance) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-6 animate-pulse">
          <ShieldAlert className="h-9 w-9" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
          Under Maintenance
        </h1>
        <p className="max-w-md text-sm text-muted-foreground leading-relaxed mb-6">
          We are currently updating our platform to serve you better. We will be back online shortly. Thank you for your patience!
        </p>
        {config?.globalAnnouncement && (
          <div className="max-w-md rounded-xl border border-amber-200/50 bg-amber-500/5 p-4 text-xs text-amber-800 leading-relaxed font-semibold mb-6">
            <span className="font-bold uppercase tracking-wider block mb-1">Update from Administrator:</span>
            {config.globalAnnouncement}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              Staff / Admin Sign In
            </Button>
          </Link>
          {currentUser && (
            <Button
              onClick={handleEmergencyDisableMaintenance}
              size="sm"
              className="rounded-full text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Wrench className="h-3.5 w-3.5" /> Turn Off Maintenance Mode
            </Button>
          )}
        </div>
      </div>
    );
  }

  const wrapperClass = isPublicPage ? 'flex min-h-screen flex-col bg-background public-no-select' : 'flex min-h-screen flex-col bg-background';

  return (
    <div className={wrapperClass}>
      {/* Dynamic site announcement banner */}
      {config?.globalAnnouncement && !showMaintenance && !announcementDismissed && (
        <div className="bg-primary text-white text-center py-2 px-4 text-xs font-semibold select-none flex items-center justify-between gap-2 relative z-50">
          <div className="flex-1 text-center">
            <span>📢 {config.globalAnnouncement}</span>
          </div>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
            title="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!hideNavFooter && <Navbar />}

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {!hideNavFooter && <Footer />}

      {/* Floating support widgets on public pages */}
      {isPublicPage && <WhatsAppButton />}
    </div>
  );
}
