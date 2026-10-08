import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { ImageSearchPicker } from '../../components/ImageSearchPicker';
import { Plus, Search, Edit2, Trash2, ArrowLeft, IndianRupee } from 'lucide-react';
import { mockNeeds } from '../../data/mock';
import { Link } from 'react-router';
import { api } from '../../lib/api';
import type { Need, NeedCategory } from '../../types';
import { toast } from 'sonner';

const ASHRAM_ID = 'ashram-1';

const categories: NeedCategory[] = [
  'Food',
  'Clothes',
  'Education',
  'Healthcare',
  'Other',
];

const emptyForm = {
  title: '',
  description: '',
  category: 'Food' as NeedCategory,
  urgency: 'medium' as Need['urgency'],
  imageUrl: '',
  quantityRequired: '',
  quantityFulfilled: '',
};

export function ManageNeeds() {
  const [searchTerm, setSearchTerm] = useState('');
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getNeeds(ASHRAM_ID);
      if (data.length > 0) setNeeds(data as Need[]);
      else setNeeds(mockNeeds.filter((n) => n.ashramId === ASHRAM_ID));
    } catch {
      setNeeds(mockNeeds.filter((n) => n.ashramId === ASHRAM_ID));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredNeeds = needs.filter((need) =>
    need.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (need: Need) => {
    setEditingId(need.id);
    setForm({
      title: need.title,
      description: need.description,
      category: need.category,
      urgency: need.urgency,
      imageUrl: need.imageUrl || '',
      quantityRequired: String(need.quantityRequired),
      quantityFulfilled: String(need.quantityFulfilled),
    });
    setDialogOpen(true);
  };

  const saveNeed = async () => {
    const req = Number(form.quantityRequired);
    const ful = Number(form.quantityFulfilled);
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!Number.isFinite(req) || req < 0) {
      toast.error('Goal amount (₹) must be a valid number');
      return;
    }
    if (!Number.isFinite(ful) || ful < 0) {
      toast.error('Raised amount (₹) must be a valid number');
      return;
    }
    if (ful > req && req > 0) {
      toast.error('Raised cannot exceed goal');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ashramId: ASHRAM_ID,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        urgency: form.urgency,
        imageUrl: form.imageUrl.trim() || undefined,
        quantityRequired: req,
        quantityFulfilled: ful,
        createdAt: editingId
          ? needs.find((n) => n.id === editingId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      };

      if (editingId) {
        await api.updateNeed(editingId, { ...payload, id: editingId });
        toast.success('Need updated');
      } else {
        await api.createNeed(payload);
        toast.success('Need created');
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Could not save. Is the API running?');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteNeed(deleteId);
      toast.success('Need removed');
      setDeleteId(null);
      await load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-background/95 sticky top-0 z-40 border-b px-6 py-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-serif font-bold text-zinc-950">Manage Needs</h1>
              <p className="text-xs text-muted-foreground">Set goal amounts, track funding, and manage ashram needs</p>
            </div>
          </div>
          <Button onClick={openCreate} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white gap-1.5 text-xs font-bold px-4 py-2 shadow-sm">
            <Plus className="h-4 w-4" /> Add New Need
          </Button>
        </div>

        <div className="relative mb-1">
          <Input
            placeholder="Search needs..."
            className="border-none bg-muted/50 pl-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-4">
        {loading && (
          <p className="text-center text-sm text-muted-foreground py-12">Loading needs...</p>
        )}
        {!loading &&
          filteredNeeds.map((need) => {
            const pct =
              need.quantityRequired > 0
                ? Math.min(100, Math.round((need.quantityFulfilled / need.quantityRequired) * 100))
                : 0;
            const remaining = Math.max(0, need.quantityRequired - need.quantityFulfilled);
            return (
              <Card
                key={need.id}
                className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all bg-white"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="h-44 sm:h-32 w-full sm:w-40 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 relative">
                      <img
                        src={
                          need.imageUrl ||
                          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80'
                        }
                        className="h-full w-full object-cover"
                        alt={need.title}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant={need.urgency === 'high' ? 'destructive' : 'secondary'}
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                        >
                          {need.urgency} Urgency
                        </Badge>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold font-serif text-zinc-950">{need.title}</h3>
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{need.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] rounded-full font-semibold">
                          {need.category}
                        </Badge>
                      </div>

                      {/* Goal & Funding Progress Bar */}
                      <div className="max-w-md pt-1 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-medium flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5 text-[#0F6D4E]" />
                            Goal ₹{need.quantityRequired.toLocaleString()} · Raised ₹{need.quantityFulfilled.toLocaleString()}
                          </span>
                          <span className="font-bold text-[#0F6D4E]">
                            {pct}% Funded ({remaining.toLocaleString()} left)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-[#0F6D4E] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons Section */}
                      <div className="pt-3 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full text-xs font-medium border-zinc-200 hover:bg-zinc-50"
                          onClick={() => openEdit(need)}
                        >
                          <Edit2 className="mr-1.5 h-3.5 w-3.5 text-zinc-600" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full text-xs font-medium border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(need.id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        {!loading && filteredNeeds.length === 0 && (
          <Card className="border-dashed p-8 text-center bg-white rounded-3xl">
            <p className="text-sm font-bold text-zinc-800">No needs found</p>
            <p className="text-xs text-muted-foreground mt-1">Try another search or click 'Add New Need' above</p>
          </Card>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit need' : 'Add need'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Monthly groceries"
              />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as NeedCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency</Label>
                <Select
                  value={form.urgency}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, urgency: v as Need['urgency'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Need image</Label>
              <ImageSearchPicker
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                searchQuery={form.title}
              />
            </div>
            <div>
              <Label htmlFor="goal">Goal amount (₹) — total to complete this need</Label>
              <Input
                id="goal"
                type="number"
                min={0}
                value={form.quantityRequired}
                onChange={(e) => setForm((f) => ({ ...f, quantityRequired: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="raised">Already raised (₹)</Label>
              <Input
                id="raised"
                type="number"
                min={0}
                value={form.quantityFulfilled}
                onChange={(e) => setForm((f) => ({ ...f, quantityFulfilled: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Donations add to this automatically; adjust here for corrections.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveNeed} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this need?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Donation history for past gifts stays in records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
