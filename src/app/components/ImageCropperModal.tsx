import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  targetAspectRatio?: number; // e.g. 16/9 = 1.77, 1/1 = 1, 3/1 = 3
  title?: string;
}

export function ImageCropperModal({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  targetAspectRatio,
  title = 'Crop & Resize Image',
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedAspect, setSelectedAspect] = useState<number | 'free'>(targetAspectRatio || 'free');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!imageSrc || !open) return;
    setLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    };
    img.src = imageSrc;
  }, [imageSrc, open]);

  // Draw crop preview on canvas
  useEffect(() => {
    if (!loaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const width = 600;
    const height = typeof selectedAspect === 'number' ? Math.round(width / selectedAspect) : Math.round((width * img.height) / img.width);

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Center and transform
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  }, [loaded, zoom, panX, panY, rotation, selectedAspect]);

  const handleApplyCrop = () => {
    if (!canvasRef.current) return;
    const croppedDataUrl = canvasRef.current.toDataURL('image/webp', 0.85);
    onCropComplete(croppedDataUrl);
    toast.success('Image cropped and resized successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 bg-white overflow-hidden">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="font-serif text-lg font-bold flex items-center gap-2">
            <Crop className="h-5 w-5 text-primary" /> {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Canvas Crop Viewport */}
          <div className="relative aspect-video w-full rounded-2xl bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-200 shadow-inner">
            {!loaded ? (
              <div className="text-xs text-white/70 animate-pulse">Loading image preview...</div>
            ) : (
              <canvas ref={canvasRef} className="max-w-full max-h-[380px] object-contain rounded-lg shadow-lg" />
            )}
          </div>

          {/* Controls: Aspect Ratio Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-xs">
            <span className="font-bold text-zinc-700 uppercase">Aspect Ratio:</span>
            <div className="flex bg-zinc-100 p-0.5 rounded-lg gap-1">
              {[
                { label: 'Free', value: 'free' as const },
                { label: '16:9 Banner', value: 16 / 9 },
                { label: '4:3 Card', value: 4 / 3 },
                { label: '1:1 Square', value: 1 },
                { label: '3:1 Wide', value: 3 / 1 },
              ].map((asp) => (
                <button
                  key={asp.label}
                  type="button"
                  onClick={() => setSelectedAspect(asp.value)}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
                    selectedAspect === asp.value ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  {asp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position & Zoom Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-50 p-3 rounded-2xl border text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-zinc-700">
                <span>Zoom Level</span>
                <span className="text-primary">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-zinc-700">
                <span>Horizontal Pan</span>
                <span className="text-primary">{panX}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                step="5"
                value={panX}
                onChange={(e) => setPanX(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-zinc-700">
                <span>Vertical Pan</span>
                <span className="text-primary">{panY}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                step="5"
                value={panY}
                onChange={(e) => setPanY(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" className="rounded-full text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full px-6 text-xs gap-1.5 shadow" onClick={handleApplyCrop} disabled={!loaded}>
            <Check className="h-4 w-4" /> Apply Crop & Resize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
