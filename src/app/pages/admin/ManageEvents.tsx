import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { mockEvents } from '../../data/mock';
import { useNavigate } from 'react-router';
import { api } from '../../lib/api';
import type { Event as EventItem } from '../../types';
import { toast } from 'sonner';

const ASHRAM_ID = 'ashram-1';

const fallbackImg =
  'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80';

type AdminEventFilter = 'all' | 'approved' | 'pending';

export function ManageEvents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<AdminEventFilter>('all');
  const [myEvents, setMyEvents] = useState<EventItem[]>(() =>
    mockEvents.filter((event) => event.ashramId === ASHRAM_ID),
  );
  const [declineTarget, setDeclineTarget] = useState<EventItem | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declining, setDeclining] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await api.getEvents(ASHRAM_ID);
      if (data && Array.isArray(data)) setMyEvents(data as EventItem[]);
    } catch {
      /* keep mock */
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const eventBookings: Record<string, { registered: number; capacity: number }> = {
    'event-1': { registered: 24, capacity: 50 },
    'event-2': { registered: 12, capacity: 30 },
    'event-3': { registered: 45, capacity: 100 },
  };

  const tabMatches = (event: EventItem): boolean => {
    if (filterTab === 'all') return true;
    if (filterTab === 'pending') return event.status === 'pending_approval';
    if (event.status === 'pending_approval') return false;
    return event.status === 'approved' || event.status === undefined || event.status === null;
  };

  const filteredEvents = myEvents.filter(
    (event) =>
      tabMatches(event) && event.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalRegistrations = Object.values(eventBookings).reduce((sum, b) => sum + b.registered, 0);

  const approveEvent = async (ev: EventItem) => {
    try {
      await api.updateEvent(ev.id, { status: 'approved' });
      toast.success('Event published! Users can now register.');
      await reload();
    } catch {
      toast.error('Could not approve event.');
    }
  };

  const confirmDecline = async () => {
    if (!declineTarget) return;
    setDeclining(true);
    try {
      await api.deleteEvent(declineTarget.id);
      if (declineReason.trim()) {
        toast.message('Suggestion declined', { description: declineReason.trim() });
      } else {
        toast.success('Suggestion removed.');
      }
      setDeclineTarget(null);
      setDeclineReason('');
      await reload();
    } catch {
      toast.error('Could not decline.');
    } finally {
      setDeclining(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const confirmDeleteEvent = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteEvent(deleteConfirmId);
      setMyEvents((prev) => prev.filter((e) => e.id !== deleteConfirmId));
      toast.success('Event deleted successfully');
      setDeleteConfirmId(null);
      await reload();
    } catch {
      setMyEvents((prev) => prev.filter((e) => e.id !== deleteConfirmId));
      toast.success('Event removed');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40 border-b bg-background/95 px-6 py-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-serif font-bold text-zinc-950">Manage Events</h1>
              <p className="text-xs text-muted-foreground">Schedule and manage institute events</p>
            </div>
          </div>
          <Button onClick={() => navigate('/admin/events/create')} className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white gap-1.5 text-xs font-bold px-4 py-2 shadow-sm">
            <Plus className="h-4 w-4" /> Create New Event
          </Button>
        </div>

        <div className="relative mb-3">
          <Input
            placeholder="Search events..."
            className="border-none bg-muted/50 pl-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(
            [
              { id: 'all' as const, label: 'All Events' },
              { id: 'approved' as const, label: 'Approved' },
              { id: 'pending' as const, label: 'Pending Approval' },
            ] as const
          ).map((t) => (
            <Button
              key={t.id}
              type="button"
              size="sm"
              variant={filterTab === t.id ? 'default' : 'outline'}
              className="shrink-0 rounded-full text-xs"
              onClick={() => setFilterTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
        <div className="mb-6 grid grid-cols-3 gap-3">
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-1.5 h-5 w-5 text-[#0F6D4E]" />
              <p className="text-xl font-bold text-zinc-950">{filteredEvents.length}</p>
              <p className="text-[11px] text-muted-foreground">Total Listed</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-1.5 h-5 w-5 text-emerald-600" />
              <p className="text-xl font-bold text-zinc-950">{totalRegistrations}</p>
              <p className="text-[11px] text-muted-foreground">Registrations</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-1.5 h-5 w-5 text-amber-600" />
              <p className="text-xl font-bold text-zinc-950">{myEvents.filter(e => e.status === 'pending_approval').length}</p>
              <p className="text-[11px] text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const bookingInfo = eventBookings[event.id] ?? { registered: 0, capacity: 0 };
            const fillPercentage =
              bookingInfo.capacity > 0 ? (bookingInfo.registered / bookingInfo.capacity) * 100 : 0;
            const isPending = event.status === 'pending_approval';
            const showUserSuggested = event.isUserSuggested && event.status === 'approved';

            return (
              <Card
                key={event.id}
                className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all bg-white"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="h-44 sm:h-32 w-full sm:w-40 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 relative">
                      <img
                        src={event.imageUrl || fallbackImg}
                        className="h-full w-full object-cover"
                        alt={event.title}
                      />
                      {isPending && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-amber-500 text-white font-bold text-[9px] border-none px-2 py-0.5">
                            Pending Review
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold font-serif text-zinc-950">{event.title}</h3>
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{event.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {showUserSuggested && (
                            <Badge variant="secondary" className="text-[10px] rounded-full">
                              👤 User Suggested
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] rounded-full font-mono">
                            {event.date}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#0F6D4E]" />
                          {new Date(event.date).toLocaleDateString()} • {event.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#0F6D4E]" />
                          <span className="truncate max-w-[200px]">{event.location}</span>
                        </span>
                      </div>

                      {bookingInfo.capacity > 0 && (
                        <div className="max-w-md pt-1">
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-500">Registrations</span>
                            <span className="font-bold text-zinc-800">
                              {bookingInfo.registered}/{bookingInfo.capacity}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                            <div
                              className="h-full rounded-full bg-[#0F6D4E] transition-all"
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons Section */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100">
                        {isPending ? (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              className="h-9 rounded-full bg-[#0F6D4E] text-white text-xs font-bold px-4 gap-1.5"
                              onClick={() => approveEvent(event)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve & Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-full border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-4 gap-1.5"
                              onClick={() => setDeclineTarget(event)}
                            >
                              <X className="h-3.5 w-3.5" />
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap w-full justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full text-xs font-medium border-zinc-200"
                              onClick={() => navigate(`/admin/events/bookings/${event.id}`)}
                            >
                              <Users className="mr-1.5 h-3.5 w-3.5 text-[#0F6D4E]" />
                              View Bookings
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full text-xs font-medium border-zinc-200 hover:bg-zinc-50"
                              onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                            >
                              <Edit2 className="mr-1.5 h-3.5 w-3.5 text-zinc-600" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full text-xs font-medium border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteConfirmId(event.id)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredEvents.length === 0 && (
            <Card className="border-dashed p-8 text-center bg-white rounded-3xl">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
              <p className="mb-1 text-sm font-bold text-zinc-800">No events found</p>
              <p className="text-xs text-muted-foreground">Try another tab or search filter</p>
            </Card>
          )}
        </div>
      </main>

      {/* Decline Modal */}
      <Dialog open={!!declineTarget} onOpenChange={(o) => !o && setDeclineTarget(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg text-zinc-950">Decline Event Suggestion</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Provide an optional reason for declining this suggestion.
          </p>
          <Textarea
            placeholder="Reason for declining…"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
            className="rounded-xl border-zinc-200 text-xs"
          />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="rounded-full text-xs" onClick={() => setDeclineTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" className="rounded-full text-xs font-bold" disabled={declining} onClick={confirmDecline}>
              {declining ? 'Removing…' : 'Decline & Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg text-zinc-950">Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Are you sure you want to permanently delete this event? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-full text-xs" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" className="rounded-full text-xs font-bold" onClick={confirmDeleteEvent}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
