import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

type Tint = 'primary' | 'blue' | 'orange';

const tintStyles: Record<Tint, { well: string; icon: string }> = {
  primary: {
    well:
      'bg-gradient-to-b from-primary/12 to-primary/5 shadow-[inset_0_2px_8px_rgba(15,109,78,0.08),0_1px_0_0_rgba(255,255,255,0.7)] ring-1 ring-primary/15',
    icon: 'text-primary',
  },
  blue: {
    well:
      'bg-gradient-to-b from-blue-500/12 to-blue-500/5 shadow-[inset_0_2px_8px_rgba(59,130,246,0.08),0_1px_0_0_rgba(255,255,255,0.7)] ring-1 ring-blue-500/15',
    icon: 'text-blue-600',
  },
  orange: {
    well:
      'bg-gradient-to-b from-orange-500/14 to-orange-500/5 shadow-[inset_0_2px_8px_rgba(234,88,12,0.08),0_1px_0_0_rgba(255,255,255,0.7)] ring-1 ring-orange-500/15',
    icon: 'text-orange-600',
  },
};

type Props = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tint: Tint;
  onClick: () => void;
};

/**
 * Squircle quick-action with soft 3D well + floating shadow card.
 */
export function HomeQuickActionTile({ title, subtitle, icon, tint, onClick }: Props) {
  const t = tintStyles[tint];
  return (
    <Card
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'cursor-pointer border-0 bg-card/95 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18),0_4px_16px_-4px_rgba(15,109,78,0.08)]',
        'rounded-[1.35rem] ring-1 ring-border/60 transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_20px_50px_-16px_rgba(15,23,42,0.22),0_8px_24px_-6px_rgba(15,109,78,0.12)]',
        'active:scale-[0.98]',
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center p-3 text-center sm:p-5">
        <div
          className={cn(
            'mb-2 flex h-11 w-11 items-center justify-center rounded-2xl sm:mb-3 sm:h-14 sm:w-14',
            t.well,
          )}
        >
          <span className={cn(t.icon, '[&_svg]:h-5 [&_svg]:w-5 sm:[&_svg]:h-6 sm:[&_svg]:w-6')}>
            {icon}
          </span>
        </div>
        <h3 className="mb-0.5 text-xs font-bold sm:mb-1 sm:text-base">{title}</h3>
        <p className="text-[10px] leading-tight text-muted-foreground sm:text-xs">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
