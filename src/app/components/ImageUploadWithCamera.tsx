import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Camera, Upload, RefreshCw, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadWithCameraProps {
  value?: string;
  onChange: (base64Value: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'any';
  maxSizeKB?: number;
}

export function ImageUploadWithCamera({
  value,
  onChange,
  label = 'Upload Image',
  aspectRatio = 'any',
  maxSizeKB = 300,
}: ImageUploadWithCameraProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream on unmount or close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Image compression using Canvas
  const compressAndProcessImage = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Restrict max dimensions to keep size under control
      const MAX_DIM = 800;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        onChange(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG with 0.75 quality
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
      
      // Check size
      const sizeInBytes = Math.round((compressedDataUrl.length * 3) / 4);
      const sizeInKB = sizeInBytes / 1024;

      if (sizeInKB > maxSizeKB) {
        // Compress more if too large
        const highlyCompressed = canvas.toDataURL('image/jpeg', 0.5);
        onChange(highlyCompressed);
      } else {
        onChange(compressedDataUrl);
      }
    };
    img.src = dataUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        compressAndProcessImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCameraOpen(true);
    setStream(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to access camera. Please check permissions.');
      setCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror image for user convenience
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      compressAndProcessImage(dataUrl);
      toast.success('Photo captured successfully');
    }

    closeCamera();
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Preview Frame */}
        <div
          className={`relative border-2 border-dashed border-zinc-200 bg-zinc-50 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 transition-all ${
            aspectRatio === 'square'
              ? 'h-24 w-24'
              : aspectRatio === 'video'
              ? 'aspect-video w-40'
              : 'h-24 w-32'
          }`}
        >
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-1 right-1 h-5 w-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="text-center p-2 text-zinc-400">
              <Camera className="h-5 w-5 mx-auto mb-1 opacity-60" />
              <span className="text-[10px] font-semibold uppercase tracking-wider block">No Image</span>
            </div>
          )}
        </div>

        {/* Upload Buttons */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startCamera}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <Camera className="h-3.5 w-3.5" />
            Take Photo
          </Button>
        </div>
      </div>

      {/* Camera Capture Dialog */}
      <Dialog open={cameraOpen} onOpenChange={(open) => !open && closeCamera()}>
        <DialogContent className="max-w-md rounded-3xl bg-white border-none p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-md font-bold font-serif text-zinc-950">Capture Photo</DialogTitle>
          </DialogHeader>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-zinc-200">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
                <span className="text-xs">Initializing camera stream...</span>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button type="button" variant="outline" onClick={closeCamera} className="rounded-full flex-1">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={capturePhoto}
              disabled={!stream}
              className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white flex-1 gap-1.5 font-semibold"
            >
              <Check className="h-4 w-4" />
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
