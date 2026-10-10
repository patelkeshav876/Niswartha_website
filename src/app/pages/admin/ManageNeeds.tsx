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
import { Plus, Search, Edit2, Trash2, ArrowLeft, IndianRupee, Package } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'needs' | 'shipments'>('needs');
  const [searchTerm, setSearchTerm] = useState('');
  const [needs, setNeeds] = useState<Need[]>([]);
  const [itemDonations, setItemDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Acknowledge Shipment Modal state
  const [ackItem, setAckItem] = useState<any | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [nData, iData] = await Promise.all([
        api.getNeeds(ASHRAM_ID),
        api.getItemDonations(),
      ]);
      if (nData.length > 0) setNeeds(nData as Need[]);
      else setNeeds(mockNeeds.filter((n) => n.ashramId === ASHRAM_ID));
      setItemDonations(iData || []);
    } catch {
      setNeeds(mockNeeds.filter((n) => n.ashramId === ASHRAM_ID));
      setItemDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (item: any, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.updateItemDonationStatus(item.id, newStatus, adminNotesInput.trim());
      toast.success(`Shipment status updated to ${newStatus}. User notified!`);
      setAckItem(null);
      setAdminNotesInput('');
      await load();
    } catch {
      toast.error('Failed to update shipment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredNeeds = needs.filter((need) =>
    (need.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()),
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
      toast.error('Units needed (quantity) must be a valid number');
      return;
    }
    if (!Number.isFinite(ful) || ful < 0) {
      toast.error('Units received must be a valid number');
      return;
    }
    if (ful > req && req > 0) {
      toast.error('Received units cannot exceed units needed');
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
        toast.success('Need updated successfully');
      } else {
        await api.createNeed(payload);
        toast.success('Need created successfully');
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      console.error('Error saving need:', e);
      try {
        const stored = localStorage.getItem('admin_needs');
        const list = stored ? JSON.parse(stored) : [];
        if (editingId) {
          const updated = list.map((n: any) => (n.id === editingId ? { ...n, ...payload, id: editingId } : n));
          localStorage.setItem('admin_needs', JSON.stringify(updated));
          toast.success('Need updated locally');
        } else {
          const newNeed = { id: 'need_' + Date.now(), ...payload };
          localStorage.setItem('admin_needs', JSON.stringify([newNeed, ...list]));
          toast.success('Need created locally');
        }
        setDialogOpen(false);
        await load();
      } catch {
        toast.error('Could not save need. Please check input values.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteNeed(deleteId);
      toast.success('Need removed successfully');
      setDeleteId(null);
      await load();
    } catch (e) {
      console.error('Error deleting need:', e);
      try {
        const stored = localStorage.getItem('admin_needs');
        if (stored) {
          const list = JSON.parse(stored);
          localStorage.setItem('admin_needs', JSON.stringify(list.filter((n: any) => n.id !== deleteId)));
        }
        toast.success('Need removed locally');
        setDeleteId(null);
        await load();
      } catch {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-background/95 sticky top-0 z-40 border-b px-6 py-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-serif font-bold text-zinc-950">Manage Needs and Item Donations</h1>
            <p className="text-xs text-muted-foreground">Track funding goals, verify physical item shipments, and issue acknowledgment receipts</p>
          </div>
          {activeTab === 'needs' && (
            <Button onClick={openCreate} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-bold px-4 py-2 shadow-sm">
              <Plus className="h-4 w-4" /> Add New Need
            </Button>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex border-b mb-3">
          <button
            onClick={() => setActiveTab('needs')}
            className={`px-5 py-2 text-xs font-bold border-b-2 transition-all ${activeTab === 'needs' ? 'border-primary text-primary' : 'border-transparent text-zinc-500'
              }`}
          >
            Active Needs List ({needs.length})
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'shipments' ? 'border-primary text-primary' : 'border-transparent text-zinc-500'
              }`}
          >
            Item Shipments & Proof Receipts ({itemDonations.length})
            {itemDonations.some((i) => i.status === 'pending') && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

        <div className="relative mb-1">
          <Input
            placeholder={activeTab === 'needs' ? "Search needs..." : "Search shipments by donor, item or reference..."}
            className="border-none bg-muted/50 pl-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-4">
        {loading && (
          <p className="text-center text-sm text-muted-foreground py-12">Loading data...</p>
        )}

        {/* Tab 1: Needs List */}
        {!loading && activeTab === 'needs' && (
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
                            <Package className="h-3.5 w-3.5 text-primary" />
                            Needed: {need.quantityRequired.toLocaleString()} Units · Received: {need.quantityFulfilled.toLocaleString()} Units
                          </span>
                          <span className="font-bold text-primary">
                            {pct}% Fulfilled ({remaining.toLocaleString()} Units remaining)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
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
          }))}
        {!loading && activeTab === 'needs' && filteredNeeds.length === 0 && (
          <Card className="border-dashed p-8 text-center bg-white rounded-3xl">
            <p className="text-sm font-bold text-zinc-800">No needs found</p>
            <p className="text-xs text-muted-foreground mt-1">Try another search or click 'Add New Need' above</p>
          </Card>
        )}

        {/* Tab 2: Item Shipments & Proof Receipts */}
        {!loading && activeTab === 'shipments' && (
          itemDonations.length === 0 ? (
            <Card className="border-dashed p-10 text-center bg-white rounded-3xl">
              <p className="text-sm font-bold text-zinc-800">No Item Shipments Found</p>
              <p className="text-xs text-muted-foreground mt-1">When donors select 'Send Item' and ship physical goods, their courier details will appear here for verification.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {itemDonations.map((item) => {
                const isReceived = item.status === 'received' || item.status === 'verified';
                return (
                  <Card key={item.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-zinc-900 font-serif">{item.needTitle || 'Donated Item'}</h3>
                          <Badge className={`font-bold border-none uppercase text-[9px] px-2.5 py-0.5 rounded-full ${isReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                            {isReceived ? 'Received & Verified ✓' : 'Pending Verification ⏳'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ref: <span className="font-mono font-bold text-zinc-800">{item.reference || item.id}</span> • Expected: <span className="font-semibold">{item.deliveryDate}</span>
                        </p>
                      </div>

                      {!isReceived ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setAckItem(item);
                            setAdminNotesInput(`Received package in good condition at institute.`);
                          }}
                          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 shadow-sm"
                        >
                          Acknowledge & Mark Received ✓
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAckItem(item);
                            setAdminNotesInput(item.adminNotes || '');
                          }}
                          className="rounded-full text-xs font-bold border-zinc-200"
                        >
                          View / Edit Acknowledgment Proof
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-50 p-3 rounded-2xl">
                      <div>
                        <span className="text-zinc-500 block">Donor Name & Contact</span>
                        <span className="font-semibold text-zinc-900">{item.fullName} ({item.phone})</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Category</span>
                        <span className="font-semibold text-zinc-900">{item.category || 'Direct Need'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Submitted On</span>
                        <span className="font-semibold text-zinc-900">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-zinc-600">
                        <span className="font-bold text-zinc-800">Donor Note: </span>"{item.notes}"
                      </p>
                    )}

                    {isReceived && (
                      <div className="text-xs bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200">
                        <span className="font-bold">Admin Verified Proof: </span>
                        {item.adminNotes ? `"${item.adminNotes}"` : 'Acknowledged and confirmed receipt by institute admin.'}
                        {item.receivedAt && (
                          <span className="block text-[10px] text-emerald-700 mt-1 font-mono">
                            Verified on: {new Date(item.receivedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )
        )}
      </main>

      {/* Acknowledge Shipment Modal */}
      <Dialog open={!!ackItem} onOpenChange={(open) => !open && setAckItem(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg">
              Acknowledge & Confirm Shipment Receipt
            </DialogTitle>
          </DialogHeader>

          {ackItem && (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-emerald-950">{ackItem.needTitle || 'Donated Item'}</p>
                <p className="text-emerald-800">Donor: {ackItem.fullName} ({ackItem.phone})</p>
                <p className="text-emerald-800 font-mono">Ref: {ackItem.reference || ackItem.id}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes" className="text-xs font-bold text-zinc-800">
                  Admin Verification & Receipt Note (Shown as proof to donor)
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="e.g. Package received in good condition at institute campus by Sita Devi."
                  className="rounded-2xl min-h-[90px] text-xs resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAckItem(null)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={() => ackItem && handleUpdateStatus(ackItem, 'received')}
              disabled={updatingStatus}
              className="rounded-full bg-[#1E3A8A] hover:bg-[#0c593f] text-white font-bold"
            >
              {updatingStatus ? 'Updating...' : 'Confirm Receipt & Notify Donor ✓'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label htmlFor="goal">Units Needed (Total Quantity Required)</Label>
              <Input
                id="goal"
                type="number"
                min={0}
                value={form.quantityRequired}
                onChange={(e) => setForm((f) => ({ ...f, quantityRequired: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="raised">Units Received (Fulfilled Quantity)</Label>
              <Input
                id="raised"
                type="number"
                min={0}
                value={form.quantityFulfilled}
                onChange={(e) => setForm((f) => ({ ...f, quantityFulfilled: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Item donations update this count automatically; adjust here if needed.
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
