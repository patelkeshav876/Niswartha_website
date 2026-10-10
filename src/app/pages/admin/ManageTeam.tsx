import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, Edit2, Trash2, User, Users, Upload, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { TeamMember } from '../../types';

export function ManageTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Single Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Management' | 'Faculty' | 'Staff'>('Faculty');

  // Bulk Import State
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<'Management' | 'Faculty' | 'Staff'>('Faculty');
  const [bulkRole, setBulkRole] = useState('Special Teacher');
  const [bulkText, setBulkText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setImageUrl(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            setImageUrl(result);
          }
          toast.success('Photo selected from device');
        };
        img.onerror = () => setImageUrl(result);
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const loadTeam = async () => {
    setLoading(true);
    try {
      const data = await api.getTeamMembers();
      setTeam(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team members');
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
    setRole('Special Teacher');
    setImageUrl('');
    setDescription('');
    setCategory('Faculty');
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

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        role: role.trim() || 'Teacher',
        imageUrl: imageUrl.trim() || '',
        description: description.trim() || undefined,
        category,
      };

      if (editingId) {
        await api.updateTeamMember(editingId, payload);
        toast.success('Team member updated');
      } else {
        await api.createTeamMember(payload);
        toast.success('Team member added');
      }
      setDialogOpen(false);
      await loadTeam();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  // Handle Bulk Roster Add
  const handleBulkImport = async () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast.error('Please enter at least one teacher or staff name.');
      return;
    }

    setBulkImporting(true);
    let successCount = 0;

    try {
      for (const line of lines) {
        let memberName = line;
        let memberRole = bulkRole || 'Teacher';

        // Check if line format is "Name (Role/Year)" e.g. "Draupadi Chavan (Since 1996)"
        if (line.includes('(') && line.includes(')')) {
          const match = line.match(/^(.*?)\((.*?)\)$/);
          if (match) {
            memberName = match[1].trim();
            const parenthetical = match[2].trim();
            if (parenthetical.toLowerCase().startsWith('since') || /^\d{4}$/.test(parenthetical)) {
              memberRole = `${bulkRole} (${parenthetical})`;
            } else {
              memberRole = parenthetical;
            }
          }
        }

        await api.createTeamMember({
          name: memberName,
          role: memberRole,
          imageUrl: '', // Keep blank!
          category: bulkCategory,
        });
        successCount++;
      }

      toast.success(`Successfully added ${successCount} members to the roster!`);
      setBulkDialogOpen(false);
      setBulkText('');
      await loadTeam();
    } catch (err) {
      console.error(err);
      toast.error(`Added ${successCount} members, but hit an error.`);
    } finally {
      setBulkImporting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteTeamMember(deleteId);
      toast.success('Team member removed');
      setDeleteId(null);
      await loadTeam();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove team member');
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
          <h2 className="text-xl font-bold font-serif text-zinc-950">Team and Faculty Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage special educators, art instructors, and staff roster</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setBulkDialogOpen(true)}
            className="rounded-full border-emerald-200 text-[#1E3A8A] bg-emerald-50/50 hover:bg-emerald-100 font-semibold text-xs gap-1.5"
          >
            <Users className="h-4 w-4" /> Bulk Import Teachers
          </Button>
          <Button onClick={openCreate} className="rounded-full bg-[#1E3A8A] hover:bg-[#0c593f] text-white font-bold text-xs gap-1.5 shadow">
            <Plus className="h-4 w-4" /> Add Single Member
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by teacher name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200 bg-white"
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
        <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-100 rounded-3xl space-y-3">
          <p className="text-sm">No roster members found.</p>
          <Button variant="outline" size="sm" onClick={() => setBulkDialogOpen(true)} className="rounded-full text-xs">
            Bulk Add Teachers
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeam.map((member) => (
            <Card key={member.id} className="border border-zinc-200/80 shadow-xs rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
              <div>
                <div className="relative aspect-square w-full bg-zinc-50 border-b overflow-hidden flex items-center justify-center">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <div className="h-16 w-16 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] flex items-center justify-center text-xl font-bold font-serif mb-2">
                        {member.name?.charAt(0)?.toUpperCase() || 'T'}
                      </div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">No Photo</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-50 text-[#1E3A8A] font-bold border border-emerald-200/60 uppercase text-[8px] tracking-wide px-2.5 py-1">
                      {member.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h4 className="font-bold text-zinc-950 truncate leading-snug">{member.name}</h4>
                  <p className="text-xs text-[#1E3A8A] font-semibold truncate">{member.role}</p>
                  {member.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mt-1">{member.description}</p>
                  )}
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

      {/* Single Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 border-none shadow-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950">
              {editingId ? 'Edit Team Member' : 'Add Single Team Member'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Full Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Meenal Sudhir Sangole"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Role / Designation *</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Special Teacher (Since 1996)"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Category</Label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger className="rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faculty">Faculty (Teachers)</SelectItem>
                  <SelectItem value="Staff">Staff (Support & Admin)</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold">Profile Photo (Direct from System)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-zinc-50/60">
                {imageUrl ? (
                  <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-zinc-200 shrink-0 shadow-sm bg-white">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-500 shrink-0">
                    <User className="h-7 w-7" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl text-xs font-bold gap-1.5 h-8 bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-800"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#1E3A8A]" />
                      {imageUrl ? 'Change Photo' : 'Choose Picture from Device'}
                    </Button>
                    {imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setImageUrl('')}
                        className="rounded-xl text-xs text-red-600 hover:bg-red-50 h-8 font-semibold"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">Pick image directly from system files or phone gallery</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Additional Description / Notes (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief background or qualifications..."
                rows={2}
                className="rounded-xl border-zinc-200 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button onClick={saveMember} disabled={saving} className="rounded-full bg-[#1E3A8A] text-white font-bold text-xs">
              {saving ? 'Saving...' : 'Save Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Roster Add Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl bg-white p-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1E3A8A]" />
              Bulk Add Multiple Teachers / Staff
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Paste multiple teacher names (one per line). You can also include joining year e.g. <span className="font-mono text-emerald-800">"Draupadi Chavan (Since 1996)"</span>. All added members will be listed under the selected Category and Designation.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Target Category</Label>
                <Select value={bulkCategory} onValueChange={(val: any) => setBulkCategory(val)}>
                  <SelectTrigger className="rounded-xl border-zinc-200 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty">Faculty (Teachers)</SelectItem>
                    <SelectItem value="Staff">Staff (Support)</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Default Role / Designation</Label>
                <Input
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value)}
                  placeholder="e.g. Special Teacher"
                  className="rounded-xl border-zinc-200 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Paste Staff Names (One Per Line)</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Draupadi Popat Chavan (Since 1996)\nUttara Narendra Patwardhan (1996)\nJyoti Naneshwar Santpe (Since 1998)\nSaral Sandesh Waghmare (Since 1999)\nNeha Aparajit (Since 2000)`}
                rows={8}
                className="rounded-2xl border-zinc-200 font-mono text-xs leading-relaxed"
              />
              <p className="text-[10px] text-zinc-400">
                {bulkText.split('\n').filter((l) => l.trim()).length} names detected for batch import.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={bulkImporting || !bulkText.trim()}
              className="rounded-full bg-[#1E3A8A] text-white font-bold text-xs"
            >
              {bulkImporting ? 'Importing Roster...' : 'Import All Staff Members'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action will delete the teacher from the public roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-red-600 text-white font-bold text-xs">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
