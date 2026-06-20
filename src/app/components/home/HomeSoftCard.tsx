import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  contentClassName?: string;
};

/**
 * Light-surface list row card: large radius, layered soft shadow, optional press.
 */
export function HomeSoftCard({ children, onClick, className, contentClassName }: Props) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-0 bg-card shadow-[0_8px_30px_-10px_rgba(15,23,42,0.12),0_2px_8px_-4px_rgba(15,23,42,0.06)]',
        'rounded-2xl ring-1 ring-border/50 transition-all duration-300',
        onClick &&
          'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-12px_rgba(15,23,42,0.16),0_4px_14px_-6px_rgba(15,109,78,0.08)] active:scale-[0.99]',
        className,
      )}
      onClick={onClick}
    >
      <CardContent className={cn('p-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
