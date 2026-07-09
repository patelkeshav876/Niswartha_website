import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Plus, Search, Trash2, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { api } from '../../lib/api';
import { RichContentEditor, ContentBlock } from '../../components/RichContentEditor';
import { toast } from 'sonner';

const ASHRAM_ID = 'ashram-1';

export function FeedManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reload = useCallback(async () => {
    try {
      const list = await api.getPosts(ASHRAM_ID);
      if (Array.isArray(list)) {
        setPosts(list);
      }
    } catch {
      // keep empty
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      toast.error('Caption description is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Use first block image or a fallback cover image if coverUrl is empty
      let finalCover = coverUrl.trim();
      if (!finalCover) {
        const firstImgBlock = blocks.find((b) => b.type === 'image' && b.images && b.images.length > 0);
        if (firstImgBlock && firstImgBlock.images) {
          finalCover = firstImgBlock.images[0];
        } else {
          finalCover = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80';
        }
      }

      const payload = {
        id: `post-${Date.now()}`,
        ashramId: ASHRAM_ID,
        imageUrl: finalCover,
        caption: caption.trim(),
        contentBlocks: blocks,
        likes: 0,
        createdAt: new Date().toISOString()
      };

      await api.createPost(payload);
      toast.success('Announcement published successfully!');
      setIsCreateOpen(false);
      setCaption('');
      setCoverUrl('');
      setBlocks([]);
      await reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.deletePost(id);
      toast.success('Announcement deleted');
      await reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete post');
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="h-9 w-9 border rounded-full bg-white shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif text-zinc-900">Manage Feed & News</h1>
            <p className="text-xs text-muted-foreground">Publish announcements, visual blogs, and news updates</p>
          </div>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="rounded-full shadow-md shadow-primary/10 self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Publish Update
        </Button>
      </div>

      {/* Quick Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search updates..."
          className="pl-9 bg-white rounded-xl border-zinc-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Feed list Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden border border-zinc-200/60 shadow-sm rounded-2xl bg-white flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="flex h-36 border-b border-zinc-100">
              <div className="w-36 h-full bg-zinc-50 relative shrink-0">
                <img src={post.imageUrl} className="h-full w-full object-cover" alt="Post Cover" />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <p className="text-sm font-semibold text-zinc-800 line-clamp-3 leading-snug">{post.caption}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                    <Heart className="h-3.5 w-3.5 fill-current text-red-500" />
                    <span>{post.likes} likes</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed border-zinc-200 rounded-2xl bg-white p-6">
            <Sparkles className="h-10 w-10 text-muted/40 mx-auto mb-2" />
            <p className="text-sm font-semibold">No announcements found</p>
            <p className="text-xs max-w-xs mx-auto mt-1">Publish updates about events, news, or new drives for the community.</p>
          </div>
        )}
      </div>

      {/* Visual Creator Dialog Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Compose Visual Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {/* Title / Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Summary Caption *</label>
              <Input
                placeholder="Give a short summary or caption for the feed catalog..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Optional Cover photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Cover Image URL (Optional)</label>
              <Input
                placeholder="Leave blank to use the first image block as catalog cover..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Content blocks visual builder */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Visual Content Blocks</label>
              <RichContentEditor blocks={blocks} onChange={setBlocks} />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="rounded-full" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className="rounded-full px-6" onClick={handleCreatePost} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}