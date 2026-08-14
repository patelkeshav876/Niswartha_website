import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Upload, RefreshCw, X, Check, RotateCw, Crop, Sliders, Eye, Trash2, Paintbrush, Eraser } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadWithCameraProps {
  value?: string;
  onChange: (base64Value: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'any';
  maxSizeKB?: number;
}

export function ImageUploadWithCamera({
  value,
  onChange,
  label = 'Upload Image',
  aspectRatio = 'any',
  maxSizeKB = 500,
}: ImageUploadWithCameraProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);

  // Image Edit States
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [opacity, setOpacity] = useState(1.0); // 0.1 to 1.0
  const [zoom, setZoom] = useState(1.0); // 0.5 to 2.0
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>('cover');

  // Blur Brush States
  const [blurBrushMode, setBlurBrushMode] = useState(false);
  const [brushSize, setBrushSize] = useState(30); // 10px to 80px
  const [blurIntensity, setBlurIntensity] = useState(15); // 5px to 30px
  const [isBrushing, setIsBrushing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImage(reader.result);
        setRotation(0);
        setOpacity(1.0);
        setZoom(1.0);
        setEditorOpen(true);
        clearBlurCanvas();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearBlurCanvas = () => {
    const canvas = blurCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Handle Blur Brushing on Overlay Canvas
  const drawBlurStroke = (clientX: number, clientY: number) => {
    const canvas = blurCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.filter = `blur(${blurIntensity}px)`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!blurBrushMode) return;
    setIsBrushing(true);
    drawBlurStroke(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isBrushing || !blurBrushMode) return;
    drawBlurStroke(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsBrushing(false);
  };

  // Render & Process Edited Image + Blur Layer onto Final Canvas
  const processAndApplyImage = () => {
    if (!rawImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = img.width;
      let height = img.height;

      const MAX_DIM = 900;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      if (rotation === 90 || rotation === 270) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();

      // Composite Blur Brush Layer if drawn
      const blurCanvas = blurCanvasRef.current;
      if (blurCanvas) {
        ctx.save();
        ctx.filter = `blur(${blurIntensity}px)`;
        ctx.drawImage(blurCanvas, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      const processedDataUrl = canvas.toDataURL('image/png', 0.85);
      onChange(processedDataUrl);
      setEditorOpen(false);
      toast.success('Image applied with custom edits & blur brush!');
    };
    img.src = rawImage;
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-2xl border border-zinc-200/80 bg-zinc-50 p-2 overflow-hidden flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="h-12 w-16 object-cover rounded-xl border border-zinc-200 shrink-0 bg-white"
            />
            <div className="truncate text-xs">
              <p className="font-bold text-zinc-800 truncate">{label}</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="h-3 w-3" /> Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full text-xs h-8 px-3 gap-1 font-semibold"
            >
              <Upload className="h-3.5 w-3.5" /> Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              className="rounded-full h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-11 rounded-2xl border-dashed border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50/30 text-xs font-bold text-zinc-700 gap-2 transition-all"
        >
          <Upload className="h-4 w-4 text-emerald-600" />
          {label}
        </Button>
      )}

      {/* Interactive Crop, Rotate, Opacity & Blur Brush Studio Modal */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 bg-white space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif font-bold text-zinc-900 flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-[#0F6D4E]" />
              Image Studio & Blur Brush Tool
            </DialogTitle>
          </DialogHeader>

          {/* Interactive Live Preview Box + Blur Canvas Overlay */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`relative aspect-video w-full rounded-2xl bg-zinc-950/90 border border-zinc-200 overflow-hidden flex items-center justify-center p-4 select-none touch-none ${
              blurBrushMode ? 'cursor-crosshair ring-2 ring-amber-400' : ''
            }`}
          >
            {rawImage && (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={rawImage}
                  alt="Edit preview"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom})`,
                    opacity: opacity,
                    objectFit: fitMode,
                  }}
                  className="max-h-full max-w-full transition-transform duration-200 ease-out pointer-events-none"
                />
                <canvas
                  ref={blurCanvasRef}
                  width={500}
                  height={300}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono text-emerald-300 font-bold border border-white/10">
              {rotation}° | {Math.round(opacity * 100)}% Opacity | {zoom.toFixed(1)}x Zoom
            </div>
            {blurBrushMode && (
              <div className="absolute bottom-2 left-2 bg-amber-400 text-zinc-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Paintbrush className="h-3 w-3" /> Blur Brush Active (Drag to paint blur)
              </div>
            )}
          </div>

          {/* Blur Brush Tool Controls */}
          <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Paintbrush className="h-4 w-4 text-amber-600" /> Blur Brush Tool
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBlurBrushMode(!blurBrushMode)}
                  className={`h-7 px-3 text-[10px] font-bold rounded-full gap-1 border-amber-400/60 ${
                    blurBrushMode ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300' : 'bg-white text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Paintbrush className="h-3 w-3" />
                  {blurBrushMode ? 'Brushing ON' : 'Turn ON Blur Brush'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearBlurCanvas}
                  className="h-7 px-2 text-[10px] font-bold text-amber-800 hover:bg-amber-200/50 rounded-full gap-1"
                >
                  <Eraser className="h-3 w-3" /> Clear Blur
                </Button>
              </div>
            </div>

            {blurBrushMode && (
              <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>Brush Radius:</span>
                    <span className="font-mono">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>Blur Strength:</span>
                    <span className="font-mono">{blurIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={blurIntensity}
                    onChange={(e) => setBlurIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rotate, Zoom & Fitting Controls */}
          <div className="space-y-3 text-xs font-medium">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 uppercase text-[10px] flex items-center gap-1">
                  <RotateCw className="h-3.5 w-3.5 text-[#0F6D4E]" /> Rotate Picture
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 h-8"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Rotate 90° ({rotation}°)
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-zinc-700 uppercase text-[10px]">
                  <span className="flex items-center gap-1"><Crop className="h-3.5 w-3.5 text-[#0F6D4E]" /> Zoom / Scale</span>
                  <span className="font-mono">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0F6D4E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-zinc-700 uppercase text-[10px]">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-[#0F6D4E]" /> Opacity Transparency</span>
                  <span className="font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0F6D4E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 uppercase text-[10px]">Fitting Mode</label>
                <select
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value as any)}
                  className="w-full h-8 rounded-xl border border-zinc-200 text-xs px-2.5 bg-white font-bold text-zinc-800"
                >
                  <option value="cover">Cover (Fill Container)</option>
                  <option value="contain">Contain (Fit Whole Image)</option>
                  <option value="fill">Fill (Stretch Aspect)</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button onClick={processAndApplyImage} className="rounded-full bg-[#0F6D4E] text-white hover:bg-[#0c593f] text-xs font-bold">
              Apply & Save Edits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
