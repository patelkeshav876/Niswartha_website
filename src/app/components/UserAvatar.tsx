import { useState } from 'react';
import { cn } from '../lib/utils';
import { User as UserIcon } from 'lucide-react';

export type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  gender?: string | null;
  className?: string;
  shape?: 'circle' | 'rounded';
  sizeClassName?: string;
  fallbackIcon?: boolean;
};

export function UserAvatar({
  src,
  name = 'User',
  className,
  shape = 'circle',
  sizeClassName = 'h-10 w-10',
  fallbackIcon = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  // If user has an explicit custom image (like a data URL or valid photo) and it hasn't errored
  const hasImage = Boolean(src) && !imageError;

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  if (hasImage && src) {
    return (
      <img
        src={src}
        alt={name || 'User Avatar'}
        onError={() => setImageError(true)}
        className={cn(
          sizeClassName,
          shapeClass,
          'object-cover border border-primary/20 shadow-sm bg-primary/10 shrink-0',
          className
        )}
      />
    );
  }

  // High-reliability inline SVG / gradient avatar (no external API calls, 100% reliable)
  return (
    <div
      className={cn(
        sizeClassName,
        shapeClass,
        'flex items-center justify-center font-bold text-white shadow-sm select-none shrink-0 border border-emerald-400/30',
        'bg-gradient-to-br from-emerald-600 via-[#0F6D4E] to-teal-800',
        className
      )}
      title={name || 'User'}
    >
      {fallbackIcon ? (
        <UserIcon className="h-1/2 w-1/2 text-white/90" />
      ) : (
        <span className="font-serif leading-none text-[1em]">{initial}</span>
      )}
    </div>
  );
}
