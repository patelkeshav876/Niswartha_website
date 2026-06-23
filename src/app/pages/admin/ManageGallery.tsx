import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { Album } from '../../types';

export function ManageGallery() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const data = await api.getAlbums();
      setAlbums(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load gallery albums');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCoverUrl('');
    setImages([]);
    setImageUrlInput('');
    setDialogOpen(true);
  };

  const openEdit = (album: Album) => {
    setEditingId(album.id);
    setName(album.name);
    setDescription(album.description);
    setCoverUrl(album.coverUrl || '');
    setImages(album.images || []);
    setImageUrlInput('');
    setDialogOpen(true);
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (images.includes(imageUrlInput.trim())) {
      toast.error('Image URL already added');
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    if (!coverUrl) {
      setCoverUrl(imageUrlInput.trim()); // Set coverUrl to first image by default
    }
    setImageUrlInput('');
  };

  const removeImageUrl = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAlbum = async () => {
    if (!name.trim()) {
      toast.error('Album name is required');
      return;
    }
    if (images.length === 0) {
      toast.error('Add at least one image URL');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim() || images[0],
        images,
      };

      if (editingId) {
        await api.updateAlbum(editingId, payload);
        toast.success('Album updated successfully');
      } else {
        await api.createAlbum(payload);
        toast.success('Album created successfully');
      }
      setDialogOpen(false);
      await loadAlbums();
    } catch (err) {
      console.error(err);
      toast.error('Could not save album');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteAlbum(deleteId);
      toast.success('Album deleted successfully');
      setDeleteId(null);
      await loadAlbums();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete album');
    }
  };

  const filteredAlbums = albums.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Gallery Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Create, update, and manage student photo albums</p>
        </div>
        <Button onClick={openCreate} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white self-start sm:self-auto gap-1.5 text-xs font-bold px-4 py-2 shadow-sm border-none">
          <Plus className="h-4 w-4" />
          Create Album
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200"
        />
      </div>

      {/* Grid of Albums */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-100 rounded-3xl">
          <p className="text-sm">No photo albums created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <Card key={album.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
              <div>
                <div className="relative aspect-video bg-zinc-100 overflow-hidden">
                  <img
                    src={album.coverUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600'}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/60 text-white font-bold text-[9px] tracking-wide border-none px-2.5 py-1">
                      {album.images?.length || 0} Photos
                    </Badge>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-bold text-zinc-950 font-serif truncate">{album.name}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{album.description}</p>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-medium">
                  {new Date(album.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(album)} className="h-8 w-8 rounded-lg hover:bg-zinc-100">
                    <Edit2 className="h-3.5 w-3.5 text-zinc-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(album.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Album Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl bg-white p-6 border-none shadow-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950">
              {editingId ? 'Edit Photo Album' : 'Create Photo Album'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Album Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Speech Therapy Workshop 2026"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the content of this album..."
                className="rounded-xl border-zinc-200 min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Cover Image URL (Optional)</Label>
              <Input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="URL for the primary cover photo"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="space-y-2 border-t pt-3">
              <Label className="text-zinc-700 font-semibold flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-[#0F6D4E]" />
                Album Photos ({images.length})
              </Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste direct photo URL..."
                  className="rounded-xl border-zinc-200"
                />
                <Button type="button" onClick={addImageUrl} className="rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800">
                  Add URL
                </Button>
              </div>

              {/* Thumbnails grid */}
              <div className="grid grid-cols-4 gap-2.5 mt-3 max-h-40 overflow-y-auto p-1.5 border rounded-2xl border-dashed">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-zinc-50 rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute top-1 right-1 h-5 w-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-4 py-8 text-center text-xs text-zinc-400 font-medium">
                    No images added. Paste URLs to construct the album.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={saveAlbum} disabled={saving} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white">
              {saving ? 'Saving...' : 'Save Album'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white border-none p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Photo Album?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this album? This action will permanently delete all links in this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-red-600 text-white hover:bg-red-700">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
