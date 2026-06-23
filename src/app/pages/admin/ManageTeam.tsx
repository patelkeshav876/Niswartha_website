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
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { TeamMember } from '../../types';

export function ManageTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Management' | 'Faculty' | 'Staff'>('Management');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const data = await api.getTeamMembers();
      setTeam(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setImageUrl('');
    setDescription('');
    setCategory('Management');
    setDialogOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setName(member.name);
    setRole(member.role);
    setImageUrl(member.imageUrl || '');
    setDescription(member.description || '');
    setCategory(member.category);
    setDialogOpen(true);
  };

  const saveMember = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!role.trim()) {
      toast.error('Roster designation / role is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        imageUrl: imageUrl.trim() || `https://i.pravatar.cc/150?u=${name.trim().replace(/\s/g, '')}`,
        description: description.trim() || undefined,
        category,
      };

      if (editingId) {
        await api.updateTeamMember(editingId, payload);
        toast.success('Roster profile updated');
      } else {
        await api.createTeamMember(payload);
        toast.success('Roster profile created');
      }
      setDialogOpen(false);
      await loadTeam();
    } catch (err) {
      console.error(err);
      toast.error('Could not save team member profile');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteTeamMember(deleteId);
      toast.success('Roster profile deleted');
      setDeleteId(null);
      await loadTeam();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete profile');
    }
  };

  const filteredTeam = team.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Team Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Roster teachers, instructors, directors, and administrators</p>
        </div>
        <Button onClick={openCreate} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white self-start sm:self-auto gap-1.5 text-xs font-bold px-4 py-2 shadow-sm border-none">
          <Plus className="h-4 w-4" />
          Roster Member
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200"
        />
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-100 rounded-3xl">
          <p className="text-sm">No roster members registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeam.map((member) => (
            <Card key={member.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
              <div>
                <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
                  <img
                    src={member.imageUrl || 'https://i.pravatar.cc/150?u=team'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-50 text-[#0F6D4E] font-bold border-none uppercase text-[8px] tracking-wide px-2.5 py-1">
                      {member.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1.5">
                  <h4 className="font-bold text-zinc-950 truncate leading-snug">{member.name}</h4>
                  <p className="text-xs text-[#0F6D4E] font-semibold truncate">{member.role}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mt-1">{member.description}</p>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-end gap-1.5">
                <Button variant="ghost" size="icon" onClick={() => openEdit(member)} className="h-8 w-8 rounded-lg hover:bg-zinc-100">
                  <Edit2 className="h-3.5 w-3.5 text-zinc-600" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(member.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 border-none shadow-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950">
              {editingId ? 'Edit Team Member' : 'Roster Team Member'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Keshav Patel"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Role / Designation</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Director & Lead Therapist"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                  <SelectTrigger className="rounded-xl border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    {['Management', 'Faculty', 'Staff'].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Photo URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste picture URL"
                  className="rounded-xl border-zinc-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Short Biography</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief profile description..."
                className="rounded-xl border-zinc-200 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={saveMember} disabled={saving} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white">
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white border-none p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Team Roster Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff profile? This will remove them from the public About roster page.
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
