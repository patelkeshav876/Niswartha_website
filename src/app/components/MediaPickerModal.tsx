import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Image as ImageIcon, Video, Upload, Search, Folder, Check, Camera, RefreshCw, Sparkles, Filter, Crop } from 'lucide-react';
import { api } from '../lib/api';
import { processImageFile, processVideoFile } from '../lib/mediaProcessor';
import { ImageCropperModal } from './ImageCropperModal';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: (media: { url: string; type: 'image' | 'video'; name: string; id?: string; thumbnailUrl?: string }) => void;
  allowedTypes?: 'image' | 'video' | 'any';
  title?: string;
}

const FOLDERS = ['All', 'Heroes', 'Events', 'Children', 'Gallery', 'Ads', 'General'];

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelectMedia,
  allowedTypes = 'any',
  title = 'Select Media',
}: Props) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>(
    allowedTypes === 'any' ? 'all' : allowedTypes
  );
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Upload tab states
  const [uploadFolder, setUploadFolder] = useState('General');
  const [uploadName, setUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const typeParam = selectedType === 'all' ? undefined : selectedType;
      const folderParam = selectedFolder === 'All' ? undefined : selectedFolder;
      const list = await api.getMediaItems({ type: typeParam, folder: folderParam, search: search || undefined });
      setItems(list || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void fetchItems();
    }
  }, [open, selectedType, selectedFolder, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let payload: any = {};
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        if (allowedTypes === 'image') {
          toast.error('Only image uploads are allowed for this field');
          setIsUploading(false);
          return;
        }
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
        if (allowedTypes === 'video') {
          toast.error('Only video uploads are allowed for this field');
          setIsUploading(false);
          return;
        }
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

      const saved = await api.uploadMediaItem(payload);
      toast.success('Media uploaded and compressed successfully');
      setSelectedItem(saved);
      onSelectMedia({
        url: saved.url,
        type: saved.type,
        name: saved.name,
        id: saved.id,
        thumbnailUrl: saved.thumbnailUrl,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (!selectedItem) {
      toast.error('Please select a media item');
      return;
    }
    onSelectMedia({
      url: selectedItem.url,
      type: selectedItem.type,
      name: selectedItem.name,
      id: selectedItem.id,
      thumbnailUrl: selectedItem.thumbnailUrl,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-white">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="font-serif text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-zinc-100 rounded-full p-1">
                <TabsTrigger value="library" className="rounded-full text-xs px-4">
                  <Folder className="h-3.5 w-3.5 mr-1.5" /> Media Library
                </TabsTrigger>
                <TabsTrigger value="upload" className="rounded-full text-xs px-4">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload New
                </TabsTrigger>
              </TabsList>

              {activeTab === 'library' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search media..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-8 text-xs rounded-full max-w-[180px]"
                    />
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="library" className="space-y-4">
              {/* Type and Folder filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  {allowedTypes === 'any' && (
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg mr-2">
                      <button
                        type="button"
                        onClick={() => setSelectedType('all')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                          selectedType === 'all' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedType('image')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                          selectedType === 'image' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        Images
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedType('video')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                          selectedType === 'video' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        Videos
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                  {FOLDERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFolder(f)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
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

              {/* Media Grid */}
              {loading ? (
                <div className="py-16 text-center text-xs text-muted-foreground">Loading media library...</div>
              ) : items.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                  <ImageIcon className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No media found</p>
                  <p className="text-xs mt-1">Upload items or switch filters to view available media.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[360px] overflow-y-auto p-1">
                  {items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-zinc-50 ${
                          isSelected ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-zinc-200 hover:border-primary/50'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="h-full w-full relative bg-zinc-900 flex items-center justify-center">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} className="h-full w-full object-cover" alt="" />
                            ) : (
                              <Video className="h-8 w-8 text-white/70" />
                            )}
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white rounded p-0.5 text-[9px]">
                              <Video className="h-3 w-3" />
                            </span>
                          </div>
                        ) : (
                          <img src={item.thumbnailUrl || item.url} className="h-full w-full object-cover" alt="" />
                        )}

                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shadow">
                              <Check className="h-4 w-4" />
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1.5 py-0.5 truncate group-hover:opacity-100 opacity-90 transition-opacity">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 py-4">
              <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-8 text-center bg-zinc-50/50 hover:bg-zinc-50 transition-all relative">
                <input
                  type="file"
                  accept={allowedTypes === 'image' ? 'image/*' : allowedTypes === 'video' ? 'video/*' : 'image/*,video/*'}
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {isUploading ? 'Compressing and Uploading...' : 'Click or Drag file to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Images are automatically converted to WebP and compressed into responsive sizes. Videos are validated up to 30MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
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
                  <label className="text-xs font-bold text-zinc-700 uppercase">Custom Name (Optional)</label>
                  <Input
                    placeholder="Defaults to filename..."
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" className="rounded-full text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'library' && (
            <div className="flex gap-2">
              {selectedItem && selectedItem.type === 'image' && (
                <Button
                  variant="outline"
                  className="rounded-full text-xs gap-1.5"
                  onClick={() => setCropImageSrc(selectedItem.url)}
                >
                  <Crop className="h-3.5 w-3.5" /> Crop Image
                </Button>
              )}
              <Button className="rounded-full px-6 text-xs" onClick={handleConfirmSelect} disabled={!selectedItem}>
                Use Selected Media
              </Button>
            </div>
          )}
        </DialogFooter>

        {/* Cropper Modal */}
        {cropImageSrc && (
          <ImageCropperModal
            open={Boolean(cropImageSrc)}
            onOpenChange={() => setCropImageSrc(null)}
            imageSrc={cropImageSrc}
            onCropComplete={(croppedUrl) => {
              if (selectedItem) {
                const updated = { ...selectedItem, url: croppedUrl, thumbnailUrl: croppedUrl };
                setSelectedItem(updated);
              }
              setCropImageSrc(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
