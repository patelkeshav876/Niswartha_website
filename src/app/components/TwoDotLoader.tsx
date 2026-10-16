import React from 'react';

interface TwoDotLoaderProps {
  size?: number;
  className?: string;
  message?: string;
}

export function TwoDotLoader({ size = 52, className = '', message }: TwoDotLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className="relative inline-flex items-center justify-center select-none"
        style={{ width: `${size}px`, height: `${size}px` }}
        role="status"
        aria-label="Loading..."
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-[spin_1.1s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite]"
        >
          <circle
            cx="32"
            cy="50"
            r="12"
            fill="#00D492"
            className="animate-pulse"
          />
          <circle
            cx="68"
            cy="50"
            r="12"
            fill="#0088FF"
            className="animate-pulse"
            style={{ animationDelay: '0.55s' }}
          />
        </svg>
      </div>
      {message && (
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
