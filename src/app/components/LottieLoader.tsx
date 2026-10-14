import React from 'react';

interface LottieLoaderProps {
  src?: string;
  message?: string;
}

export function LottieLoader({
  message = 'Loading Niswartha...',
}: LottieLoaderProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <img
            src="/logo.png"
            alt="Niswartha"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
        </div>
        {message && (
          <p className="text-sm font-semibold text-primary animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

