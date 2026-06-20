import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useUser } from './context/UserContext';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const location = useLocation();
  const { loading } = useUser();

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const hideNavFooter = ['/login', '/signup', '/onboarding'].some((path) =>
    location.pathname.startsWith(path)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/25 flex items-center justify-center animate-pulse">
            <svg className="h-5 w-5 text-white" fill="white" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
      <Toaster position="top-center" expand={true} richColors closeButton />
    </div>
  );
}