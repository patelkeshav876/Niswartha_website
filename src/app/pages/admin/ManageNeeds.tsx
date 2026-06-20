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
      <div className="bg-background sticky top-0 z-10 border-b p-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Manage Needs</h1>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Set the <strong>goal (₹)</strong> to complete each need and how much is already raised.
          Donors see what is left; gifts are capped so totals never exceed the goal.
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search needs..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading && (
          <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
        )}
        {!loading &&
          filteredNeeds.map((need) => {
            const pct =
              need.quantityRequired > 0
                ? Math.round((need.quantityFulfilled / need.quantityRequired) * 100)
                : 0;
            const remaining = Math.max(0, need.quantityRequired - need.quantityFulfilled);
            return (
              <Card key={need.id} className="overflow-hidden border shadow-sm">
                <div className="flex h-28 sm:h-24">
                  <div className="w-28 h-full bg-muted relative shrink-0">
                    <img
                      src={
                        need.imageUrl ||
                        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80'
                      }
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm line-clamp-1">{need.title}</h3>
                        <Badge
                          variant={need.urgency === 'high' ? 'destructive' : 'secondary'}
                          className="text-[10px] h-5 px-1.5 shrink-0"
                        >
                          {need.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {need.category}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        Goal ₹{need.quantityRequired.toLocaleString()} · Raised ₹
                        {need.quantityFulfilled.toLocaleString()} ·{' '}
                        <span className="font-medium text-foreground">{remaining.toLocaleString()}</span>{' '}
                        left
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-1">
                      <div className="text-xs">
                        <span className="font-bold text-primary">{pct}%</span>
                        <span className="text-muted-foreground ml-1">funded</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(need)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(need.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        {!loading && filteredNeeds.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>No needs found.</p>
          </div>
        )}
      </div>

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
