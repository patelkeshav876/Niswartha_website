import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Search, Calendar, Phone, Mail, Clock, Eye, Trash2, XCircle, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function ManageBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getVisitBookings({ ashramId: 'ashram-1' });
      setBookings(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load visit bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const changeStatus = async (id: string, nextStatus: string) => {
    try {
      const bk = bookings.find((b) => b.id === id);
      if (!bk) return;
      await api.createVisitBooking({
        ...bk,
        status: nextStatus,
      });
      toast.success(`Booking status updated to ${nextStatus}`);
      await loadBookings();
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev: any) => ({ ...prev, status: nextStatus }));
      }
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteVisitBooking(deleteId);
      toast.success('Visit booking deleted');
      setDeleteId(null);
      await loadBookings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete booking');
    }
  };

  const filteredBookings = bookings.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">Visit Bookings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage and coordinate schedules for volunteers, colleges, corporates, and individuals visiting the school</p>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search by visitor name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200"
        />
      </div>

      {/* Grid List / Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-100 rounded-3xl">
          <p className="text-sm">No visit bookings logged.</p>
        </div>
      ) : (
        <Card className="border border-zinc-200/50 rounded-3xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F2EB] text-zinc-700 font-bold border-b">
                <tr>
                  <th className="p-4 font-semibold">Visitor Details</th>
                  <th className="p-4 font-semibold">Date & Time</th>
                  <th className="p-4 font-semibold">Org Info</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-zinc-950 leading-snug">{b.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{b.visitorCount} {b.visitorCount === 1 ? 'visitor' : 'visitors'} • Purpose: {b.purpose}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-zinc-700 text-xs font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span>{b.date} • {b.time || b.timeSlot}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-zinc-800 text-xs">
                      {b.orgType ? (
                        <div>
                          <Badge className="bg-zinc-100 text-zinc-700 font-semibold border-none text-[8px] py-0 px-2 uppercase tracking-wide">
                            {b.orgType}
                          </Badge>
                          {b.orgName && <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[150px]">{b.orgName}</p>}
                        </div>
                      ) : 'Individual'}
                    </td>
                    <td className="p-4">
                      <Badge className={`font-bold border-none uppercase text-[8px] px-2.5 py-0.5 ${
                        b.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedBooking(b); setViewDialogOpen(true); }} className="h-8 w-8 rounded-lg hover:bg-zinc-100">
                          <Eye className="h-3.5 w-3.5 text-zinc-600" />
                        </Button>
                        
                        {b.status !== 'confirmed' && (
                          <Button variant="ghost" size="icon" onClick={() => changeStatus(b.id, 'confirmed')} className="h-8 w-8 rounded-lg hover:bg-emerald-50 text-emerald-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {b.status !== 'cancelled' && (
                          <Button variant="ghost" size="icon" onClick={() => changeStatus(b.id, 'cancelled')} className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-600">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600">
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
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 border-none shadow-2xl overflow-y-auto max-h-[85vh]">
          {selectedBooking && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-serif font-bold text-zinc-950">Visit Booking Detail</DialogTitle>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">ID: {selectedBooking.id}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed divide-y">
                {/* Visitor Main details */}
                <div className="py-2.5 space-y-1.5">
                  <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Visitor Name</p>
                  <p className="font-bold text-zinc-900">{selectedBooking.name}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-600 mt-2 font-medium">
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {selectedBooking.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {selectedBooking.email}</span>
                  </div>
                </div>

                {/* Organization Details */}
                <div className="py-3">
                  <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Organization Info</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">
                    {selectedBooking.orgType || 'Individual'} 
                    {selectedBooking.orgName ? ` - ${selectedBooking.orgName}` : ''}
                  </p>
                </div>

                {/* Date/Time/Purpose */}
                <div className="py-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Date & Time Slot</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">{selectedBooking.date} • {selectedBooking.time || selectedBooking.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Purpose of Visit</p>
                    <p className="font-semibold text-[#0F6D4E] mt-0.5 capitalize">{selectedBooking.purpose}</p>
                  </div>
                </div>

                {/* Group Details */}
                <div className="py-3 space-y-2">
                  <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Visitor Count & Names</p>
                  <div className="bg-zinc-50 border p-3 rounded-2xl space-y-1 text-xs">
                    <p className="font-bold text-zinc-800">Total Group Size: {selectedBooking.visitorCount || 1}</p>
                    <div className="border-t pt-1.5 mt-1.5 space-y-1">
                      {selectedBooking.visitorNames?.map((name: string, i: number) => (
                        <p key={i} className="text-zinc-600 font-medium">• {name}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedBooking.emergencyContactName && (
                  <div className="py-3 space-y-1.5">
                    <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Emergency Contact</p>
                    <p className="font-semibold text-zinc-950">
                      {selectedBooking.emergencyContactName} ({selectedBooking.emergencyContactPhone})
                    </p>
                  </div>
                )}

                {/* Status Options */}
                <div className="py-4 flex gap-2">
                  {selectedBooking.status !== 'confirmed' && (
                    <Button onClick={() => changeStatus(selectedBooking.id, 'confirmed')} className="flex-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold gap-1">
                      Confirm Booking
                    </Button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <Button onClick={() => changeStatus(selectedBooking.id, 'cancelled')} className="flex-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold gap-1">
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl bg-white border-none p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Visit Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking log from the system?
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
