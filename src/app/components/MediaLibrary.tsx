import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import {
  Image as ImageIcon,
  Video,
  Upload,
  Search,
  Folder,
  Trash2,
  Edit,
  Copy,
  Eye,
  RefreshCw,
  Plus,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';
import { api } from '../lib/api';
import { processImageFile, processVideoFile } from '../lib/mediaProcessor';
import { toast } from 'sonner';

const FOLDERS = ['All', 'Heroes', 'Events', 'Children', 'Gallery', 'Ads', 'General'];

export function MediaLibrary() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');

  // Preview lightbox state
  const [previewItem, setPreviewItem] = useState<any>(null);

  // Upload dialog states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('General');
  const [uploadName, setUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Replace dialog states
  const [replaceItem, setReplaceItem] = useState<any>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const typeParam = selectedType === 'all' ? undefined : selectedType;
      const folderParam = selectedFolder === 'All' ? undefined : selectedFolder;
      const list = await api.getMediaItems({ type: typeParam, folder: folderParam, search: search || undefined });
      setItems(list || []);
    } catch {
      toast.error('Failed to load media items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMedia();
  }, [selectedFolder, selectedType, search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let payload: any = {};
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        const videoData = await processVideoFile(file);
        payload = {
          name: uploadName || file.name.replace(/\.[^/.]+$/, ''),
          fileData: videoData.videoDataUrl,
          thumbnailData: videoData.thumbnailDataUrl,
          mimeType: videoData.mimeType,
          type: 'video',
          folder: uploadFolder,
          width: videoData.width,
          height: videoData.height,
          size: videoData.sizeBytes,
        };
      } else {
        const imageData = await processImageFile(file);
        payload = {
          name: uploadName || file.name.replace(/\.[^/.]+$/, ''),
          fileData: imageData.originalDataUrl,
          mediumData: imageData.mediumDataUrl,
          thumbnailData: imageData.thumbnailDataUrl,
          mimeType: imageData.mimeType,
          type: 'image',
          folder: uploadFolder,
          width: imageData.width,
          height: imageData.height,
          size: imageData.sizeBytes,
        };
      }

      await api.uploadMediaItem(payload);
      toast.success('Media item processed and uploaded');
      setUploadOpen(false);
      setUploadName('');
      void fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceItem) return;

    setIsUploading(true);
    try {
      let payload: any = {};
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        const videoData = await processVideoFile(file);
        payload = {
          fileData: videoData.videoDataUrl,
          mimeType: videoData.mimeType,
        };
      } else {
        const imageData = await processImageFile(file);
        payload = {
          fileData: imageData.originalDataUrl,
          mimeType: imageData.mimeType,
        };
      }

      await api.updateMediaItem(replaceItem.id, payload);
      toast.success('Media asset replaced');
      setReplaceItem(null);
      void fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to replace media asset');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete media asset "${name}"? This action cannot be undone.`)) return;
    try {
      await api.deleteMediaItem(id);
      toast.success('Media asset deleted');
      void fetchMedia();
    } catch {
      toast.error('Failed to delete media asset');
    }
  };

  const copyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Media URL copied to clipboard');
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-zinc-900">Centralized Media Library</h1>
          <p className="text-xs text-muted-foreground">Manage, compress, organize, and reuse assets across all pages</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="rounded-full shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Upload Asset
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-zinc-100 p-0.5 rounded-lg mr-2">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedType === 'all' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('image')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedType === 'image' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
              }`}
            >
              Images
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('video')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedType === 'video' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
              }`}
            >
              Videos
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {FOLDERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFolder(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  selectedFolder === f
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-full bg-zinc-50"
          />
        </div>
      </div>

      {/* Media Items Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground">Loading media library...</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-white p-8">
          <Sparkles className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">No media items found</p>
          <p className="text-xs mt-1 max-w-xs mx-auto">Upload new photos or videos to start building your central media repository.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => setPreviewItem(item)}>
                {item.type === 'video' ? (
                  <div className="h-full w-full relative bg-zinc-950 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <Video className="h-10 w-10 text-white/80" />
                    )}
                    <span className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="h-10 w-10 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow">
                        <Eye className="h-5 w-5" />
                      </span>
                    </span>
                  </div>
                ) : (
                  <>
                    <img src={item.thumbnailUrl || item.url} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                    <span className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="h-10 w-10 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow">
                        <Eye className="h-5 w-5" />
                      </span>
                    </span>
                  </>
                )}
                <Badge className="absolute top-2 left-2 text-[9px] font-bold uppercase rounded-full bg-black/60 text-white backdrop-blur-sm">
                  {item.folder || 'General'}
                </Badge>
              </div>

              <CardContent className="p-3">
                <p className="text-xs font-bold text-zinc-900 truncate leading-snug" title={item.name}>{item.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex justify-between">
                  <span>{formatSize(item.size)}</span>
                  <span>{item.type}</span>
                </p>

                <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t text-xs">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-zinc-600" onClick={() => copyUrl(item.url)} title="Copy URL">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-zinc-600" onClick={() => setReplaceItem(item)} title="Replace Asset">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id, item.name)} title="Delete Asset">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">Upload Media Asset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-6 text-center bg-zinc-50/50 relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-zinc-900">
                  {isUploading ? 'Compressing & Saving...' : 'Click or Drop photo/video here'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 uppercase">Target Folder</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full text-xs border rounded-xl px-3 py-2 bg-white"
              >
                {FOLDERS.filter((f) => f !== 'All').map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 uppercase">Custom Asset Name</label>
              <Input
                placeholder="Give descriptive title..."
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="rounded-full text-xs" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Dialog */}
      <Dialog open={Boolean(replaceItem)} onOpenChange={() => setReplaceItem(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">Replace Asset: {replaceItem?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">Select a new file to replace this asset. The URL will remain updated across the website.</p>
            <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-6 text-center bg-zinc-50 relative">
              <input
                type="file"
                accept={replaceItem?.type === 'video' ? 'video/*' : 'image/*'}
                onChange={handleReplace}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <p className="text-xs font-bold text-primary">
                {isUploading ? 'Replacing...' : 'Click to select new replacement file'}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="rounded-full text-xs" onClick={() => setReplaceItem(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox Preview Modal */}
      <Dialog open={Boolean(previewItem)} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-6 bg-white overflow-hidden">
          <DialogHeader className="flex justify-between items-center border-b pb-3">
            <DialogTitle className="font-serif text-base font-bold">{previewItem?.name}</DialogTitle>
          </DialogHeader>

          {previewItem && (
            <div className="space-y-4 py-2">
              <div className="max-h-[60vh] rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
                {previewItem.type === 'video' ? (
                  <video src={previewItem.url} controls autoPlay className="max-h-[55vh] w-full" />
                ) : (
                  <img src={previewItem.url} className="max-h-[55vh] max-w-full object-contain" alt="" />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-zinc-50 p-3 rounded-xl border">
                <div>
                  <p className="font-bold text-zinc-900">{previewItem.name}</p>
                  <p className="text-[10px] text-zinc-500">{previewItem.type} · {formatSize(previewItem.size)} · Folder: {previewItem.folder}</p>
                </div>
                <Button size="sm" className="rounded-full text-xs gap-1.5" onClick={() => copyUrl(previewItem.url)}>
                  <Copy className="h-3.5 w-3.5" /> Copy Media Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
