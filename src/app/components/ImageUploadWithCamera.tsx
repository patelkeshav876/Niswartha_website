import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
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
  maxSizeKB = 1000,
}: ImageUploadWithCameraProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Directly compresses image onto Canvas and returns data URL
  const compressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Save as clean JPEG at 0.85 quality
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        try {
          const compressed = await compressImage(reader.result);
          onChange(compressed);
          toast.success('Image uploaded successfully');
        } catch {
          onChange(reader.result);
        } finally {
          setUploading(false);
        }
      } else {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[200px]'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9]'
      : 'aspect-video max-h-48';

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 group">
          <div className={`relative w-full ${aspectClass} overflow-hidden flex items-center justify-center`}>
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl shadow-lg">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-white hover:bg-white/20 text-xs h-7 px-2.5 rounded-lg font-bold gap-1"
              disabled={uploading}
            >
              <Upload className="h-3.5 w-3.5" /> Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-7 w-7 rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-200 hover:border-[#1E3A8A] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-zinc-50/50 hover:bg-[#1E3A8A]/5"
        >
          <div className="h-10 w-10 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center">
            {uploading ? (
              <div className="h-4 w-4 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-zinc-800">
              {uploading ? 'Processing Image...' : label}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Click to choose a photo directly from your device</p>
          </div>
        </div>
      )}
    </div>
  );
}
