import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Full-bleed premium dark canvas: midnight gradient, soft orbs, subtle grid.
 * Reusable for any hero / dark section on Home.
 */
export function PremiumHeroBackdrop({ children, className }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden text-white',
        'bg-gradient-to-b from-[#12151f] via-[#0e1118] to-[#080a10]',
        className,
      )}
    >
      {/* Cool ambient orbs (reference: soft lavender / cyan bloom) */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(255,255,255,0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,30,42,0.9)_0%,transparent_45%,rgba(8,10,16,0.95)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"
        aria-hidden
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {children}
    </div>
  );
}
