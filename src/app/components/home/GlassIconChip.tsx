import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** Larger lift for primary CTAs */
  emphasis?: boolean;
};

/**
 * Circular / pill glass control on dark backgrounds (avatar, badges).
 */
export function GlassIconChip({ children, className, emphasis }: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-center backdrop-blur-xl',
        'bg-gradient-to-b from-white/[0.14] to-white/[0.05]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.22)]',
        'ring-1 ring-white/20',
        emphasis && 'shadow-[0_12px_40px_rgba(15,109,78,0.25),inset_0_1px_0_0_rgba(255,255,255,0.25)] ring-primary/30',
        className,
      )}
    >
      {children}
    </div>
  );
}
