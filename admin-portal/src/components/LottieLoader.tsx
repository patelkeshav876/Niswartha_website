import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieLoaderProps {
  src?: string;
  message?: string;
}

export function LottieLoader({
  src = 'https://lottie.host/81a91c10-0988-42fa-986c-0e78fbcf19d4/6uVNm3L66h.lottie',
  message = 'Loading Niswartha...',
}: LottieLoaderProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 flex items-center justify-center">
          <DotLottieReact
            src={src}
            loop
            autoplay
          />
        </div>
        {message && (
          <p className="text-sm font-semibold text-[#0F6D4E] animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
