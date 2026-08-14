import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useUser } from './context/UserContext';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { WhatsAppButton } from './components/WhatsAppButton';
import { api } from './lib/api';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AdPopupModal } from './components/AdPopupModal';
import { ShieldAlert } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const { currentUser, loading } = useUser();
  const [config, setConfig] = useState<any>(null);

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Load global config details (e.g. for maintenance filter, announcements)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const c = await api.getConfig();
        if (active) setConfig(c);
      } catch {
        // use defaults
      }
    })();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const hideNavFooter = ['/login', '/signup', '/onboarding', '/super-admin'].some((path) =>
    location.pathname.startsWith(path)
  );

  const isPublicPage = !['/admin', '/super-admin', '/login', '/signup'].some((path) =>
    location.pathname.startsWith(path)
  );

  // Maintenance mode gating (bypassed by super admin users and authentication endpoints)
  const showMaintenance = config?.maintenanceMode && isPublicPage && currentUser?.role !== 'super_admin';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-36 h-36 flex items-center justify-center">
            <DotLottieReact
              src="https://lottie.host/f1920018-4203-4927-a43e-aa0bff45eb09/I8cwfrA9rp.json"
              loop
              autoplay
            />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Niswartha...</p>
        </div>
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
          <div className="max-w-md rounded-xl border border-amber-200/50 bg-amber-500/5 p-4 text-xs text-amber-800 leading-relaxed font-semibold">
            <span className="font-bold uppercase tracking-wider block mb-1">Update from Administrator:</span>
            {config.globalAnnouncement}
          </div>
        )}
      </div>
    );
  }

  const wrapperClass = isPublicPage ? 'flex min-h-screen flex-col bg-background public-no-select' : 'flex min-h-screen flex-col bg-background';

  return (
    <div className={wrapperClass}>
      {/* Dynamic site announcement banner */}
      {config?.globalAnnouncement && !showMaintenance && (
        <div className="bg-primary text-white text-center py-2 px-4 text-xs font-semibold select-none flex items-center justify-center gap-2 relative z-50">
          <span>📢 {config.globalAnnouncement}</span>
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

      {/* Floating support widgets and popups on public pages */}
      {isPublicPage && (
        <>
          <WhatsAppButton />
          <AdPopupModal />
        </>
      )}

      <Toaster position="top-center" expand={true} richColors closeButton />
    </div>
  );
}
