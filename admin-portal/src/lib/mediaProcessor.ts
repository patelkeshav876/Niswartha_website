/**
 * Client-Side Media Processor
 * Handles automated compression, WebP conversion, multi-resolution generation (thumbnail, medium, original),
 * video file validation, and video thumbnail frame extraction.
 */

export interface ProcessedImageData {
  originalDataUrl: string;
  mediumDataUrl: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

export interface ProcessedVideoData {
  videoDataUrl: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
  duration: number;
  sizeBytes: number;
  mimeType: string;
}

/**
 * Resizes and compresses an image to WebP (or JPEG fallback) at specific max dimensions.
 */

function resizeImageToCanvas(
  img: HTMLImageElement,
  maxDimension: number,
  quality: number = 0.8
): { dataUrl: string; width: number; height: number } {
  let width = img.width;
  let height = img.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
  }

  // Try WebP first, fallback to JPEG
  let dataUrl = canvas.toDataURL('image/webp', quality);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  return { dataUrl, width, height };
}

/**
 * Processes an image file or data URL:
 * Generates Original (1600px), Medium (800px), and Thumbnail (250px)
 */
export function processImageDataUrl(dataUrl: string): Promise<ProcessedImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const orig = resizeImageToCanvas(img, 1600, 0.85);
        const med = resizeImageToCanvas(img, 800, 0.8);
        const thumb = resizeImageToCanvas(img, 250, 0.7);

        // Estimate size from base64
        const base64Str = orig.dataUrl.split(',')[1] || '';
        const sizeBytes = Math.round((base64Str.length * 3) / 4);

        resolve({
          originalDataUrl: orig.dataUrl,
          mediumDataUrl: med.dataUrl,
          thumbnailDataUrl: thumb.dataUrl,
          width: img.width,
          height: img.height,
          sizeBytes,
          mimeType: orig.dataUrl.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg',
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(new Error('Failed to load image for processing'));
    img.src = dataUrl;
  });
}

export function processImageFile(file: File): Promise<ProcessedImageData> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        processImageDataUrl(reader.result).then(resolve).catch(reject);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validates a video file (size, mime type) and extracts a snapshot thumbnail frame.
 */
export function processVideoFile(file: File, maxSizeBytes: number = 30 * 1024 * 1024): Promise<ProcessedVideoData> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('File is not a supported video format'));
      return;
    }
    if (file.size > maxSizeBytes) {
      const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
      reject(new Error(`Video file size exceeds maximum allowed limit of ${maxMB}MB`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const videoDataUrl = reader.result as string;
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth || 640, 480);
        canvas.height = Math.round((canvas.width * (video.videoHeight || 360)) / (video.videoWidth || 640));

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.75);

        resolve({
          videoDataUrl,
          thumbnailDataUrl,
          width: video.videoWidth || 640,
          height: video.videoHeight || 360,
          duration: Math.round(video.duration || 0),
          sizeBytes: file.size,
          mimeType: file.type || 'video/mp4',
        });
      };

      video.onerror = () => {
        // Fallback without frame snapshot if seek fails
        resolve({
          videoDataUrl,
          thumbnailDataUrl: '',
          width: 640,
          height: 360,
          duration: 0,
          sizeBytes: file.size,
          mimeType: file.type || 'video/mp4',
        });
      };

      video.src = videoDataUrl;
    };

    reader.onerror = () => reject(new Error('Failed to read video file'));
    reader.readAsDataURL(file);
  });
}
