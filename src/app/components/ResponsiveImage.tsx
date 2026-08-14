import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto' | 'banner';
}

export function ResponsiveImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80',
  className,
  aspectRatio,
  ...props
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1] md:aspect-[4/1]',
    auto: '',
  }[aspectRatio || 'auto'];

  const currentSrc = error ? fallbackSrc : src;

  return (
    <div className={cn('relative overflow-hidden bg-muted/60', aspectClass, className)}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt || 'Image'}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) setError(true);
        }}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
}
