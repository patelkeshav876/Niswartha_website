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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40 border-b bg-background/95 px-6 py-4 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Manage Events</h1>
            <p className="text-xs text-muted-foreground">Schedule and track events</p>
          </div>
        </div>

        <div className="relative mb-3">
          <Input
            placeholder="Search events..."
            className="border-none bg-muted/50 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'approved' as const, label: 'Approved' },
              { id: 'pending' as const, label: 'Pending Approval' },
            ] as const
          ).map((t) => (
            <Button
              key={t.id}
              type="button"
              size="sm"
              variant={filterTab === t.id ? 'default' : 'outline'}
              className="shrink-0 rounded-full"
              onClick={() => setFilterTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-6">
        <div className="mb-6 grid grid-cols-3 gap-3">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{filteredEvents.length}</p>
              <p className="text-xs text-muted-foreground">Listed</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 h-5 w-5 text-green-600" />
              <p className="text-2xl font-bold">{totalRegistrations}</p>
              <p className="text-xs text-muted-foreground">Registrations</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-orange-600" />
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
        </div>

        <Button className="mb-6 h-12 w-full gap-2" onClick={() => navigate('/admin/events/create')}>
          <Plus className="h-5 w-5" />
          Create New Event
        </Button>

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
                className="border-none shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    <div className="h-32 w-24 flex-shrink-0">
                      <img
                        src={event.imageUrl || fallbackImg}
                        className="h-full w-full rounded-l-lg object-cover"
                        alt={event.title}
                      />
                    </div>

                    <div className="min-w-0 flex-1 py-3 pr-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 flex-1 text-sm font-bold">{event.title}</h3>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {isPending && (
                            <Badge className="bg-orange-500 text-[10px] text-white hover:bg-orange-500">
                              Awaiting Approval
                            </Badge>
                          )}
                          {showUserSuggested && (
                            <Badge variant="secondary" className="text-[10px]">
                              👤 User Suggested
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {event.date}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(event.date).toLocaleDateString()} • {event.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {bookingInfo.capacity > 0 && (
                        <div className="mb-3">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Registrations</span>
                            <span className="font-medium">
                              {bookingInfo.registered}/{bookingInfo.capacity}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isPending ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-8 flex-1 gap-1 text-xs"
                            onClick={() => approveEvent(event)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve & Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 flex-1 gap-1 border-destructive/50 text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => setDeclineTarget(event)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 flex-1 text-xs"
                            onClick={() => navigate(`/admin/events/bookings/${event.id}`)}
                          >
                            <Users className="mr-1 h-3 w-3" />
                            View Bookings
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredEvents.length === 0 && (
            <Card className="border-dashed p-8 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">No events found</p>
              <p className="text-xs text-muted-foreground">Try another tab or search</p>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={!!declineTarget} onOpenChange={(o) => !o && setDeclineTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline suggestion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Optional note (shown in a toast only — event will be removed from the list).
          </p>
          <Textarea
            placeholder="Reason for declining…"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
          />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDeclineTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={declining} onClick={confirmDecline}>
              {declining ? 'Removing…' : 'Decline & remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
