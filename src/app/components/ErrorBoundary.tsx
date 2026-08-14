import React, { Component, type ReactNode } from 'react';
import { useRouteError, useNavigate } from 'react-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from './ui/button';
import { RefreshCw, Home, Sparkles } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    
    // Auto-recover from Vercel dynamic import chunk mismatches
    if (error.message?.includes('Failed to fetch dynamically imported module') || error.name === 'ChunkLoadError') {
      const lastReload = sessionStorage.getItem('last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallbackView error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

export function RouteErrorFallback() {
  const error: any = useRouteError();
  const navigate = useNavigate();

  // Auto reload for chunk mismatches
  React.useEffect(() => {
    const msg = error?.message || String(error || '');
    if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('ChunkLoadError')) {
      const lastReload = sessionStorage.getItem('last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <ErrorFallbackView
      error={error}
      onGoHome={() => navigate('/')}
    />
  );
}

function ErrorFallbackView({
  error,
  resetError,
  onGoHome,
}: {
  error: any;
  resetError?: () => void;
  onGoHome?: () => void;
}) {
  const errorMessage = error?.message || (typeof error === 'string' ? error : 'An unexpected application exception occurred.');

  const handleReload = () => {
    if (resetError) resetError();
    window.location.reload();
  };

  const handleClearCacheAndReload = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-2xl space-y-6 animate-fade-up">
        {/* Lottie or Heart Animation Fallback Container */}
        <div className="relative mx-auto h-28 w-28 flex items-center justify-center rounded-3xl bg-emerald-50/80 border border-emerald-200/60 shadow-inner overflow-hidden">
          <DotLottieReact
            src="https://lottie.host/81a91c10-0988-42fa-986c-0e78fbcf19d4/6uVNm3L66h.lottie"
            loop
            autoplay
            style={{ width: '100px', height: '100px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-[#0F6D4E] text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Niswartha Auto-Recovery System
          </div>
          <h2 className="text-xl font-serif font-bold text-zinc-950">Application Reload Required</h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            We updated or optimized a feature on the website. A quick refresh will load the latest version seamlessly!
          </p>
        </div>

        {/* Technical details toggle (subtle & non-intrusive) */}
        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 text-left">
          <p className="text-[10px] font-mono text-zinc-500 truncate" title={errorMessage}>
            <span className="font-bold text-red-600">Info:</span> {errorMessage}
          </p>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={handleReload}
            className="w-full h-11 rounded-full bg-[#0F6D4E] text-white hover:bg-[#0b543c] font-bold text-sm shadow-md gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Page
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onGoHome || (() => (window.location.href = '/'))}
              variant="outline"
              className="flex-1 h-10 rounded-full border-zinc-300 text-zinc-800 text-xs font-semibold gap-1.5"
            >
              <Home className="h-3.5 w-3.5" /> Return Home
            </Button>
            <Button
              onClick={handleClearCacheAndReload}
              variant="ghost"
              className="flex-1 h-10 rounded-full text-zinc-600 hover:bg-zinc-100 text-xs font-semibold"
            >
              Clear Cache & Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
