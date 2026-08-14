import { useState, useEffect } from 'react';

interface TransparentCarGraphicProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function TransparentCarGraphic({ src, alt = 'Car', className, style }: TransparentCarGraphicProps) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Convert near-white/light studio background pixels to 100% transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is studio background light gray/white (R > 215, G > 215, B > 215)
          if (r > 210 && g > 210 && b > 210) {
            data[i + 3] = 0; // Alpha 0 = 100% transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
      } catch {
        setProcessedSrc(src);
      }
    };
    img.onerror = () => setProcessedSrc(src);
    img.src = src;
  }, [src]);

  return (
    <img
      src={processedSrc}
      alt={alt}
      style={style}
      className={className}
    />
  );
}
