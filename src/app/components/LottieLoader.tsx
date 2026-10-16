import React from 'react';
import { TwoDotLoader } from './TwoDotLoader';

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
        <TwoDotLoader size={56} />
        {message && (
          <p className="text-sm font-semibold text-primary animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

