import React from 'react';

interface HandSupportIconProps {
  className?: string;
  size?: number | string;
  fill?: string;
}

export function HandSupportIcon({ className = 'h-5 w-5', size, fill = 'currentColor' }: HandSupportIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size || '1em'}
      height={size || '1em'}
      fill={fill}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand Supporting Heart Vector Path */}
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      <path
        d="M5 16.5C4.17 16.5 3.5 17.17 3.5 18c0 1.93 1.57 3.5 3.5 3.5h10c1.93 0 3.5-1.57 3.5-3.5 0-.83-.67-1.5-1.5-1.5H5z"
        opacity="0.85"
      />
    </svg>
  );
}
