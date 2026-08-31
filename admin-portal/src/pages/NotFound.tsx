import { useNavigate } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, Heart, Compass, ShieldAlert } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#fafbfc] p-6 text-center overflow-hidden">
      {/* Dynamic Background Ambient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0F6D4E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 space-y-6 max-w-lg mx-auto bg-white/80 backdrop-blur-xl border border-zinc-200/80 p-8 sm:p-10 rounded-3xl shadow-xl shadow-zinc-950/5"
      >
        {/* Animated 404 Lottie Illustration */}
        <div className="w-72 h-64 mx-auto flex items-center justify-center relative">
          <DotLottieReact
            src="https://lottie.host/4a01adbf-e915-4ec0-b5ac-463987a8425d/rykF3b26je.lottie"
            loop
            autoplay
          />
        </div>

        {/* Header Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200/60">
            <ShieldAlert className="h-3.5 w-3.5" />
            404 Error — Page Not Found
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
            Lost Your Way in Niswartha?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
            The page you are looking for doesn't exist, has been removed, or the link typed in the address bar is incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate('/admin')}
            className="flex-1 gap-2 rounded-full h-11 bg-[#0F6D4E] text-white font-bold hover:bg-[#0c593f] shadow-md shadow-[#0F6D4E]/20 transition-transform hover:scale-[1.02]"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 gap-2 rounded-full h-11 border-zinc-300 font-bold text-zinc-700 hover:bg-zinc-100 transition-transform hover:scale-[1.02]"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Footer Brand Tag */}
        <div className="pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1.5">
          <Heart className="h-3 w-3 text-[#0F6D4E]" fill="currentColor" />
          <span>Niswartha — Selfless Service Admin Control System</span>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;
