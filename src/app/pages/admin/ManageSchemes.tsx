import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, Edit2, Trash2, Check, X, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { GovScheme, GovSchemeCategory } from '../../types';

const CATEGORIES: GovSchemeCategory[] = [
  'Education',
  'Scholarship',
  'Child Welfare',
  'Healthcare',
  'Disability Support',
];

export function ManageSchemes() {
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GovSchemeCategory>('Education');
  const [published, setPublished] = useState(true);
  const [eligibility, setEligibility] = useState('');
  const [link, setLink] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemes();
      setSchemes(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('Education');
    setPublished(true);
    setEligibility('');
    setLink('');
    setDialogOpen(true);
  };

  const openEdit = (scheme: GovScheme) => {
    setEditingId(scheme.id);
    setTitle(scheme.title);
    setDescription(scheme.description);
    setCategory(scheme.category);
    setPublished(scheme.published !== false);
    setEligibility(scheme.eligibility || '');
    setLink(scheme.link || '');
    setDialogOpen(true);
  };

  const saveScheme = async () => {
    if (!title.trim()) {
      toast.error('Scheme title is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        published,
        eligibility: eligibility.trim() || undefined,
        link: link.trim() || undefined,
      };

      if (editingId) {
        await api.updateScheme(editingId, payload);
        toast.success('Scheme updated successfully');
      } else {
        await api.createScheme(payload);
        toast.success('Scheme created successfully');
      }
      setDialogOpen(false);
      await loadSchemes();
    } catch (err) {
      console.error(err);
      toast.error('Could not save government scheme');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteScheme(deleteId);
      toast.success('Scheme deleted successfully');
      setDeleteId(null);
      await loadSchemes();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete scheme');
    }
  };

  const togglePublishStatus = async (scheme: GovScheme) => {
    try {
      const nextStatus = !scheme.published;
      await api.updateScheme(scheme.id, { ...scheme, published: nextStatus });
      toast.success(`Scheme ${nextStatus ? 'published' : 'unpublished'}`);
      await loadSchemes();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const filteredSchemes = schemes.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Government Schemes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage educational aids, scholarships, and child welfare schemes</p>
        </div>
        <Button onClick={openCreate} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white self-start sm:self-auto gap-1.5 text-xs font-bold px-4 py-2 shadow-sm border-none">
          <Plus className="h-4 w-4" />
          Add Scheme
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search schemes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200"
        />
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-100 rounded-3xl">
          <p className="text-sm">No government schemes cataloged yet.</p>
        </div>
      ) : (
        <Card className="border border-zinc-200/50 rounded-3xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F2EB] text-zinc-700 font-bold border-b">
                <tr>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSchemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 min-w-[280px]">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                          <FileText className="h-4.5 w-4.5 text-[#0F6D4E]" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 leading-snug">{scheme.title}</p>
                          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{scheme.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-emerald-50 text-[#0F6D4E] font-bold border-none uppercase text-[9px] px-2.5 py-0.5">
                        {scheme.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <button onClick={() => togglePublishStatus(scheme)}>
                        <Badge className={`font-bold border-none uppercase text-[9px] px-2.5 py-0.5 cursor-pointer ${
                          scheme.published ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {scheme.published ? 'Published' : 'Draft'}
                        </Badge>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(scheme)} className="h-8 w-8 rounded-lg hover:bg-zinc-100">
                          <Edit2 className="h-3.5 w-3.5 text-zinc-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(scheme.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit Scheme Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl bg-white p-6 border-none shadow-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950">
              {editingId ? 'Edit Government Scheme' : 'Add Government Scheme'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Scheme Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Digital Speech-Aid and Cochlear Implant Grants"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as GovSchemeCategory)}>
                <SelectTrigger className="rounded-xl border-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100]">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Scheme Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe details and provisions of this government program..."
                className="rounded-xl border-zinc-200 min-h-[100px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Eligibility Requirements</Label>
              <Textarea
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="Specify target group details (e.g. 40% certificate, annual income limit)..."
                className="rounded-xl border-zinc-200 min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Official Scheme URL Link</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. https://scholarships.gov.in/"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
              <input
                type="checkbox"
                id="scheme-publish"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="scheme-publish" className="text-zinc-800 font-semibold cursor-pointer">
                Publish Scheme immediately (visible to the public)
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={saveScheme} disabled={saving} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white">
              {saving ? 'Saving...' : 'Save Scheme'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white border-none p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Government Scheme?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scheme record? This cannot be undone.
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
