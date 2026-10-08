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
import { Plus, Search, Edit2, Trash2, Heart, ShieldAlert, Calendar, User, Phone, Filter, GraduationCap, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { ImageUploadWithCamera } from '../../components/ImageUploadWithCamera';
import type { ChildRecord } from '../../types';

const CLASS_OPTIONS = [
  'All',
  'Not School Going (Infant/Underage)',
  'Pre-School / Toddler',
  'Vocational Training / Special Prep',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Hostel Only',
];

export function ManageChildren() {
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildRecord | null>(null);

  // Single Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [education, setEducation] = useState('Class 1');
  const [admissionDate, setAdmissionDate] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Bulk Import State
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkEducation, setBulkEducation] = useState('Not School Going (Infant/Underage)');
  const [bulkGender, setBulkGender] = useState('Male');
  const [bulkText, setBulkText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const data = await api.getChildren();
      setChildren(data);
    } catch (err) {
      console.error(err);
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
        },
        {
          id: 'child-3',
          name: 'Chhotu Ram',
          age: 3,
          gender: 'Male',
          education: 'Not School Going (Infant/Underage)',
          admissionDate: '2025-01-05',
          healthNotes: 'Early childhood observation.',
          guardianInformation: { name: 'Kamla Devi', relationship: 'Mother', phone: '9876000000' },
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
    setEducation('Class 1');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setHealthNotes('');
    setGuardianName('');
    setGuardianRelation('');
    setGuardianPhone('');
    setImageUrl('');
    setDialogOpen(true);
  };

  const openEdit = (child: ChildRecord) => {
    setEditingId(child.id);
    setName(child.name);
    setAge(String(child.age));
    setGender(child.gender || 'Male');
    setEducation(child.education || 'Class 1');
    setAdmissionDate(child.admissionDate || new Date().toISOString().split('T')[0]);
    setHealthNotes(child.healthNotes || '');
    setGuardianName(child.guardianInformation?.name || '');
    setGuardianRelation(child.guardianInformation?.relationship || '');
    setGuardianPhone(child.guardianInformation?.phone || '');
    setImageUrl(child.imageUrl || '');
    setDialogOpen(true);
  };

  const openView = (child: ChildRecord) => {
    setSelectedChild(child);
    setViewDialogOpen(true);
  };

  const saveChild = async () => {
    if (!name.trim()) {
      toast.error('Student name is required');
      return;
    }
    if (!age || isNaN(Number(age))) {
      toast.error('Valid age is required');
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
        imageUrl,
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

  // Bulk Import Children Logic
  const handleBulkImportChildren = async () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast.error('Please enter at least one child record.');
      return;
    }

    setBulkImporting(true);
    let successCount = 0;

    try {
      for (const line of lines) {
        let childName = line;
        let childAge = 5;

        // Check if format is "Name (Age X)" e.g. "Aarav Sharma (Age 9)"
        if (line.includes('(') && line.includes(')')) {
          const match = line.match(/^(.*?)\((.*?)\)$/);
          if (match) {
            childName = match[1].trim();
            const inside = match[2].trim();
            const ageMatch = inside.match(/\d+/);
            if (ageMatch) childAge = Number(ageMatch[0]);
          }
        }

        await api.createChild({
          name: childName,
          age: childAge,
          gender: bulkGender,
          education: bulkEducation,
          admissionDate: new Date().toISOString().split('T')[0],
        });
        successCount++;
      }

      toast.success(`Successfully imported ${successCount} child records!`);
      setBulkDialogOpen(false);
      setBulkText('');
      await loadChildren();
    } catch (err) {
      console.error(err);
      toast.error(`Imported ${successCount} records, but encountered an error.`);
    } finally {
      setBulkImporting(false);
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

  const filteredChildren = children.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.education || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === 'All' ||
      (c.education || '').toLowerCase().includes(selectedClass.toLowerCase());
    return matchesSearch && matchesClass;
  });

  const classCounts = CLASS_OPTIONS.reduce((acc, cls) => {
    if (cls === 'All') {
      acc[cls] = children.length;
    } else {
      acc[cls] = children.filter((c) => (c.education || '').toLowerCase().includes(cls.toLowerCase())).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950 flex items-center gap-2">
            Child Records Directory
            <Badge className="bg-[#0F6D4E]/10 text-[#0F6D4E] border-none font-bold text-[9px] px-2 py-0.5 uppercase tracking-wide">
              Secure
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Admin student database (school-going and non-school children)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setBulkDialogOpen(true)}
            className="rounded-full border-emerald-200 text-[#0F6D4E] bg-emerald-50/50 hover:bg-emerald-100 font-semibold text-xs gap-1.5"
          >
            <Users className="h-4 w-4" /> Bulk Import Children
          </Button>
          <Button onClick={openCreate} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white font-bold text-xs gap-1.5 shadow">
            <Plus className="h-4 w-4" /> Roster Student
          </Button>
        </div>
      </div>

      {/* Confidentiality Notice */}
      <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-800 leading-relaxed">
        <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600" />
        <div>
          <p className="font-bold uppercase tracking-wider">Confidentiality Agreement</p>
          <p className="mt-0.5 text-rose-700/90">This module is highly secure. Children records must never be made public or rendered outside authenticated administrator sessions.</p>
        </div>
      </div>

      {/* Class Filter Bar & Search */}
      <div className="space-y-4 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search student by name, roll, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl border-zinc-200 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#0F6D4E]" />
            <span className="text-xs font-bold text-zinc-700 uppercase">Category Filter:</span>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px] rounded-xl text-xs bg-white border-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls} ({classCounts[cls] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CLASS_OPTIONS.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedClass === cls
                  ? 'bg-[#0F6D4E] text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {cls} {classCounts[cls] ? `(${classCounts[cls]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredChildren.length === 0 ? (
        <Card className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-8 text-center text-zinc-500 space-y-2">
          <GraduationCap className="h-8 w-8 mx-auto text-zinc-300" />
          <p className="text-sm font-semibold">No children records found for {selectedClass === 'All' ? 'this search' : selectedClass}.</p>
          <p className="text-xs text-zinc-400">Click "Roster Student" or "Bulk Import" to add children.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChildren.map((child) => (
            <Card key={child.id} className="border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden bg-white hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0F6D4E] font-serif font-bold text-base shrink-0 overflow-hidden">
                    {child.imageUrl ? (
                      <img src={child.imageUrl} alt={child.name} className="w-full h-full object-cover" />
                    ) : (
                      child.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-zinc-900 truncate">{child.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <Badge className="bg-[#0F6D4E]/10 text-[#0F6D4E] border-none font-bold text-[9px] px-2 py-0.5 truncate max-w-[140px]">
                        {child.education || 'Class 1'}
                      </Badge>
                      <span className="text-[10px] text-zinc-400 font-medium">{child.age} yrs • {child.gender}</span>
                    </div>
                  </div>
                </div>

                {child.guardianInformation?.name && (
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-[11px] space-y-0.5">
                    <p className="text-zinc-400 font-bold uppercase text-[9px]">Guardian</p>
                    <p className="font-semibold text-zinc-800">{child.guardianInformation.name} ({child.guardianInformation.relationship || 'Guardian'})</p>
                    {child.guardianInformation.phone && (
                      <p className="text-[#0F6D4E] font-mono">{child.guardianInformation.phone}</p>
                    )}
                  </div>
                )}
              </CardContent>

              <div className="px-4 py-2.5 bg-zinc-50/50 border-t flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => openView(child)} className="text-[11px] font-bold text-[#0F6D4E] h-7 px-2">
                  View Profile
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(child)} className="h-7 w-7 rounded-lg hover:bg-zinc-200/50">
                    <Edit2 className="h-3.5 w-3.5 text-zinc-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(child.id)} className="h-7 w-7 rounded-lg hover:bg-red-50 text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Detail Modal */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950">Student Full Record</DialogTitle>
          </DialogHeader>

          {selectedChild && (
            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                <div className="h-12 w-12 rounded-xl bg-[#0F6D4E] text-white flex items-center justify-center font-bold text-lg font-serif">
                  {selectedChild.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">{selectedChild.name}</h3>
                  <p className="text-[#0F6D4E] font-semibold">{selectedChild.education} • {selectedChild.gender}, {selectedChild.age} yrs</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-zinc-400 font-bold uppercase text-[9px]">Admission Date</p>
                <p className="font-medium text-zinc-800">{selectedChild.admissionDate || 'N/A'}</p>

                <p className="text-zinc-400 font-bold uppercase text-[9px] pt-1">Guardian Contact</p>
                <p className="font-medium text-zinc-800">{selectedChild.guardianInformation?.name} ({selectedChild.guardianInformation?.relationship}) - {selectedChild.guardianInformation?.phone}</p>

                <p className="text-zinc-400 font-bold uppercase text-[9px] pt-1">Health & Audiometry Notes</p>
                <p className="bg-zinc-50 p-3 rounded-xl border text-zinc-600">{selectedChild.healthNotes || 'No special medical comments added.'}</p>
              </div>

              <Button onClick={() => setViewDialogOpen(false)} className="w-full rounded-full bg-zinc-900 text-white font-bold">
                Close
              </Button>
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
            <div className="space-y-1.5 flex flex-col items-center pb-3 border-b border-dashed border-zinc-200">
              <Label className="text-zinc-700 font-semibold self-start">Profile Photo</Label>
              <ImageUploadWithCamera
                value={imageUrl}
                onChange={setImageUrl}
                aspectRatio="square"
                maxSizeKB={200}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-semibold">Child Full Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="rounded-xl border-zinc-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Age (Years) *</Label>
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
                <Label className="text-zinc-700 font-semibold">Education / Status *</Label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger className="rounded-xl border-zinc-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    {CLASS_OPTIONS.filter((c) => c !== 'All').map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                placeholder="Audiometry notes, hearing aid specs, or medical observations..."
                className="rounded-xl border-zinc-200 min-h-[70px]"
              />
            </div>

            <div className="space-y-3 border-t pt-3">
              <Label className="text-zinc-700 font-bold uppercase text-[10px] tracking-wide block">Guardian Information</Label>
              <div className="space-y-3">
                <Input
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Guardian Name"
                  className="rounded-xl border-zinc-200 text-xs"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value)}
                    placeholder="Relation (e.g. Mother/Uncle)"
                    className="rounded-xl border-zinc-200 text-xs"
                  />
                  <Input
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="rounded-xl border-zinc-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button onClick={saveChild} disabled={saving} className="rounded-full bg-[#0F6D4E] text-white font-bold text-xs">
              {saving ? 'Saving...' : 'Save Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Children Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl bg-white p-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-950 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0F6D4E]" />
              Bulk Add Multiple Children
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Paste child names (one per line). You can specify age e.g. <span className="font-mono text-emerald-800">"Chhotu Ram (Age 3)"</span> or <span className="font-mono text-emerald-800">"Ananya Deshmukh (Age 7)"</span>.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Education / Status</Label>
                <Select value={bulkEducation} onValueChange={setBulkEducation}>
                  <SelectTrigger className="rounded-xl border-zinc-200 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.filter((c) => c !== 'All').map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Default Gender</Label>
                <Select value={bulkGender} onValueChange={setBulkGender}>
                  <SelectTrigger className="rounded-xl border-zinc-200 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Paste Child Names (One Per Line)</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Aarav Sharma (Age 9)\nAnanya Deshmukh (Age 12)\nChhotu Ram (Age 3)\nRitu Kumari (Age 5)`}
                rows={8}
                className="rounded-2xl border-zinc-200 font-mono text-xs leading-relaxed"
              />
              <p className="text-[10px] text-zinc-400">
                {bulkText.split('\n').filter((l) => l.trim()).length} children entries detected for batch import.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleBulkImportChildren}
              disabled={bulkImporting || !bulkText.trim()}
              className="rounded-full bg-[#0F6D4E] text-white font-bold text-xs"
            >
              {bulkImporting ? 'Importing Children...' : 'Import All Children'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Student Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action will permanently delete this student record from the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-red-600 text-white font-bold text-xs">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
