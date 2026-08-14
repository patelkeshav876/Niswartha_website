import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage Provider Abstract Interface
 * Allows seamless switching between LocalStorageProvider, Cloudinary, S3, Firebase, or Supabase.
 */
export class StorageProvider {
  /**
   * Upload / Save file
   * @param {Buffer|string} bufferOrDataUrl 
   * @param {string} filename 
   * @param {string} mimeType 
   * @returns {Promise<{ url: string, key: string }>}
   */
  async saveFile(bufferOrDataUrl, filename, mimeType) {
    throw new Error('saveFile not implemented');
  }

  /**
   * Delete file
   * @param {string} fileKey 
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileKey) {
    throw new Error('deleteFile not implemented');
  }
}

/**
 * Local File System Storage Provider
 * Saves uploaded media into server/uploads or public/uploads directory.
 */
export class LocalStorageProvider extends StorageProvider {
  constructor(uploadsDir = path.join(__dirname, '../../uploads')) {
    super();
    this.uploadsDir = uploadsDir;
    if (!fs.existsSync(this.uploadsDir)) {
      try {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      } catch (e) {
        console.warn('[LocalStorageProvider] Warning: Could not create uploads directory:', e.message);
      }
    }
  }

  async saveFile(bufferOrDataUrl, filename, mimeType) {
    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(this.uploadsDir, cleanFilename);

    let buffer;
    if (typeof bufferOrDataUrl === 'string' && bufferOrDataUrl.startsWith('data:')) {
      const base64Data = bufferOrDataUrl.split(',')[1];
      buffer = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(bufferOrDataUrl)) {
      buffer = bufferOrDataUrl;
    } else {
      buffer = Buffer.from(bufferOrDataUrl);
    }

    try {
      await fs.promises.writeFile(filePath, buffer);
      const publicUrl = `/uploads/${cleanFilename}`;
      return {
        url: publicUrl,
        key: cleanFilename,
      };
    } catch (err) {
      console.warn('[LocalStorageProvider] Local disk write error, falling back to data URL storage:', err.message);
      // Fallback if local disk is read-only (e.g., serverless execution environments)
      const dataUrl = typeof bufferOrDataUrl === 'string' ? bufferOrDataUrl : `data:${mimeType};base64,${buffer.toString('base64')}`;
      return {
        url: dataUrl,
        key: `base64-${cleanFilename}`,
      };
    }
  }

  async deleteFile(fileKey) {
    if (!fileKey || fileKey.startsWith('base64-')) return true;
    const filePath = path.join(this.uploadsDir, fileKey);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (err) {
      console.warn('[LocalStorageProvider] Error deleting file:', err.message);
      return false;
    }
  }
}

// Default export active instance (Can be swapped with S3 / Cloudinary / Supabase adapters)
export const storageProvider = new LocalStorageProvider();
