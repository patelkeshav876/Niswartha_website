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
import { Plus, Search, Edit2, Trash2, Heart, ShieldAlert, Calendar, User, Phone } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { ChildRecord } from '../../types';

export function ManageChildren() {
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildRecord | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [education, setEducation] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const data = await api.getChildren();
      setChildren(data);
    } catch (err) {
      console.error(err);
      // Fallback defaults
      setChildren([
        {
          id: 'child-1',
          name: 'Aarav Sharma',
          age: 9,
          gender: 'Male',
          education: 'Class 4',
          admissionDate: '2022-06-15',
          healthNotes: 'Uses digital hearing aids. No other systemic health issues.',
          guardianInformation: { name: 'Ramesh Sharma', relationship: 'Uncle', phone: '9876543210' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'child-2',
          name: 'Ananya Deshmukh',
          age: 12,
          gender: 'Female',
          education: 'Class 7',
          admissionDate: '2020-01-10',
          healthNotes: 'Congenital bilateral profound hearing loss. Undergoing speech therapy.',
          guardianInformation: { name: 'Sunita Deshmukh', relationship: 'Mother', phone: '9988776655' },
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setAge('');
    setGender('Male');
    setEducation('');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setHealthNotes('');
    setGuardianName('');
    setGuardianRelation('');
    setGuardianPhone('');
    setDialogOpen(true);
  };

  const openEdit = (child: ChildRecord) => {
    setEditingId(child.id);
    setName(child.name);
    setAge(String(child.age));
    setGender(child.gender);
    setEducation(child.education);
    setAdmissionDate(child.admissionDate);
    setHealthNotes(child.healthNotes || '');
    setGuardianName(child.guardianInformation?.name || '');
    setGuardianRelation(child.guardianInformation?.relationship || '');
    setGuardianPhone(child.guardianInformation?.phone || '');
    setDialogOpen(true);
  };

  const openView = (child: ChildRecord) => {
    setSelectedChild(child);
    setViewDialogOpen(true);
  };

  const saveChild = async () => {
    if (!name.trim()) {
      toast.error('Child name is required');
      return;
    }
    if (!age.trim() || Number.isNaN(Number(age))) {
      toast.error('Valid age is required');
      return;
    }
    if (!education.trim()) {
      toast.error('Education details / Class is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        age: Number(age),
        gender,
        education: education.trim(),
        admissionDate,
        healthNotes: healthNotes.trim() || undefined,
        guardianInformation: {
          name: guardianName.trim(),
          relationship: guardianRelation.trim(),
          phone: guardianPhone.trim(),
        },
      };

      if (editingId) {
        await api.updateChild(editingId, payload);
        toast.success('Child profile updated successfully');
      } else {
        await api.createChild(payload);
        toast.success('Child profile created successfully');
      }
      setDialogOpen(false);
      await loadChildren();
    } catch (err) {
      console.error(err);
      toast.error('Could not save child record');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteChild(deleteId);
      toast.success('Child record deleted');
      setDeleteId(null);
      await loadChildren();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete child record');
    }
  };

  const filteredChildren = children.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950 flex items-center gap-2">
            Child Records Directory
            <Badge className="bg-[#0F6D4E]/10 text-[#0F6D4E] hover:bg-[#0F6D4E]/10 border-none font-bold text-[9px] px-2 py-0.5 uppercase tracking-wide">
              Secure
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Admin-only student database containing educational and health records</p>
        </div>
        <Button onClick={openCreate} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white self-start sm:self-auto gap-1.5 text-xs font-bold px-4 py-2 shadow-sm border-none">
          <Plus className="h-4 w-4" />
          Roster Student
        </Button>
      </div>

      {/* Security alert header */}
      <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-800 leading-relaxed">
        <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600" />
        <div>
          <p className="font-bold uppercase tracking-wider">Confidentiality Agreement</p>
          <p className="mt-0.5 text-rose-700/90">This module is highly secure. Children records must never be made public, shared externally, or rendered outside authenticated administrator sessions.</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200"
        />
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-100 rounded-3xl">
          <p className="text-sm">No child records registered.</p>
        </div>
      ) : (
        <Card className="border border-zinc-200/50 rounded-3xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F2EB] text-zinc-700 font-bold border-b">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Age / Gender</th>
                  <th className="p-4 font-semibold">Class / Education</th>
                  <th className="p-4 font-semibold">Admission Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredChildren.map((child) => (
                  <tr key={child.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <button onClick={() => openView(child)} className="text-left group">
                        <p className="font-bold text-zinc-950 group-hover:text-[#0F6D4E] group-hover:underline leading-snug">
                          {child.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">ID: {child.id}</p>
                      </button>
                    </td>
                    <td className="p-4 text-zinc-700">
                      {child.age} yrs • {child.gender}
                    </td>
                    <td className="p-4 font-medium text-zinc-800">
                      {child.education}
                    </td>
                    <td className="p-4 text-zinc-500">
                      {child.admissionDate}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => openView(child)} className="rounded-lg text-xs font-bold border-zinc-200">
                          View details
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(child)} className="h-8 w-8 rounded-lg hover:bg-zinc-100">
                          <Edit2 className="h-3.5 w-3.5 text-zinc-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(child.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600">
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

      {/* Details View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 border-none shadow-2xl">
          {selectedChild && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-serif font-bold text-zinc-950">{selectedChild.name}</DialogTitle>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Student Profile Detail</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed divide-y">
                {/* General Info */}
                <div className="py-2.5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Age & Gender</p>
                    <p className="font-bold text-zinc-900 mt-0.5">{selectedChild.age} Years • {selectedChild.gender}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Class / Grade</p>
                    <p className="font-bold text-zinc-900 mt-0.5">{selectedChild.education}</p>
                  </div>
                </div>

                {/* Admission */}
                <div className="py-3 flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-[#0F6D4E] shrink-0" />
                  <div>
                    <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Admission Date</p>
                    <p className="font-semibold text-zinc-800 mt-0.5">{selectedChild.admissionDate}</p>
                  </div>
                </div>

                {/* Guardian Details */}
                <div className="py-3 space-y-2">
                  <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Guardian Information</p>
                  <div className="bg-zinc-50 border p-3 rounded-2xl space-y-1.5">
                    <p className="font-bold text-zinc-900">{selectedChild.guardianInformation?.name || 'N/A'}</p>
                    <p className="text-xs text-zinc-500 font-medium">{selectedChild.guardianInformation?.relationship || 'N/A'}</p>
                    {selectedChild.guardianInformation?.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-[#0F6D4E] font-bold mt-1">
                        <Phone className="h-3.5 w-3.5" />
                        {selectedChild.guardianInformation.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Health & Audiometry Notes */}
                <div className="py-3 space-y-1.5">
                  <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Health & Audiometry Notes</p>
                  <div className="bg-rose-50/50 border border-rose-100/50 p-3 rounded-2xl text-xs text-zinc-600 leading-relaxed">
                    {selectedChild.healthNotes || 'No special medical comments added.'}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={() => setViewDialogOpen(false)} className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
                  Close Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 border-none shadow-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950">
              {editingId ? 'Edit Student Profile' : 'Roster Student'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Student Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Age (Years)</Label>
                <Input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 9"
                  className="rounded-xl border-zinc-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="rounded-xl border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Class / Grade</Label>
                <Input
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Class 4"
                  className="rounded-xl border-zinc-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Admission Date</Label>
                <Input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="rounded-xl border-zinc-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Health & Speech Notes</Label>
              <Textarea
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Mention audiometry details, hearing aid prescriptions, or other medical observations..."
                className="rounded-xl border-zinc-200 min-h-[70px]"
              />
            </div>

            {/* Guardian Info Fields */}
            <div className="space-y-3 border-t pt-3">
              <Label className="text-zinc-700 font-bold uppercase text-[10px] tracking-wide block">Guardian Information</Label>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-zinc-600 font-medium">Guardian Name</Label>
                  <Input
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Guardian's name"
                    className="rounded-xl border-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-zinc-600 font-medium">Relationship</Label>
                    <Input
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      placeholder="e.g. Mother, Uncle"
                      className="rounded-xl border-zinc-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-600 font-medium">Guardian Phone</Label>
                    <Input
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="rounded-xl border-zinc-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={saveChild} disabled={saving} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white">
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white border-none p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Student Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete Aarav's child profile? This action will destroy all related guardian and health logs.
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
