import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Props = {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
};

const variants = {
  primary:
    'bg-white/[0.04] ring-1 ring-primary/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_10px_40px_-8px_rgba(0,0,0,0.65),0_0_0_1px_rgba(15,109,78,0.15)]',
  secondary:
    'bg-white/[0.035] ring-1 ring-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_10px_40px_-8px_rgba(0,0,0,0.6)]',
  accent:
    'bg-white/[0.04] ring-1 ring-rose-300/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_10px_40px_-8px_rgba(0,0,0,0.55)]',
};

/**
 * Neumorphic / glass stat cell for dark hero surfaces.
 */
export function PremiumDarkStatTile({ icon, value, label, variant = 'primary', className }: Props) {
  return (
    <div
      className={cn(
        'rounded-[1.35rem] px-2 py-3.5 text-center backdrop-blur-md transition-transform duration-300 hover:scale-[1.02]',
        variants[variant],
        className,
      )}
    >
      <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-black/25 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
        {icon}
      </div>
      <p className="text-lg font-bold tracking-tight text-white drop-shadow-sm">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium text-white/55">{label}</p>
    </div>
  );
}
