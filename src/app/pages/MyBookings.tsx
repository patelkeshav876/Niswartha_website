import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { api } from '../lib/api';
import {
  buildEventLookupMap,
  resolveEvent,
  placeholderEventForBooking,
} from '../lib/eventBookingHelpers';
import { buildAshramLookupMap } from '../lib/ashramLookup';
import { mergeBookingsDesc } from '../lib/mergeUserBookings';
import { VISIT_PURPOSE_OPTIONS } from '../components/visit/visitBookingConstants';
import type { Ashram, Event, EventBookingRecord, UnifiedBookingRow, VisitBookingRecord } from '../types';

export function MyBookings() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [rows, setRows] = useState<UnifiedBookingRow[]>([]);
  const [eventById, setEventById] = useState<Map<string, Event>>(new Map());
  const [ashramById, setAshramById] = useState<Map<string, Ashram>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!currentUser?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [eventRows, visitRows, eventMap, ashramMap] = await Promise.all([
        api.getEventBookings({ userId: currentUser.id }) as Promise<EventBookingRecord[]>,
        api.getVisitBookings({ userId: currentUser.id }) as Promise<VisitBookingRecord[]>,
        buildEventLookupMap(),
        buildAshramLookupMap(),
      ]);

      const evList = Array.isArray(eventRows) ? eventRows : [];
      const vList = Array.isArray(visitRows) ? visitRows : [];

      const eventIds = [...new Set(evList.map((b) => b.eventId).filter(Boolean))];
      await Promise.all(eventIds.map((id) => resolveEvent(id, eventMap)));

      setEventById(eventMap);
      setAshramById(ashramMap);
      setRows(mergeBookingsDesc(evList, vList));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const getEventDetails = (eventId: string): Event =>
    eventById.get(eventId) ?? placeholderEventForBooking(eventId);

  const handleCancel = async (row: UnifiedBookingRow) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      if (row.kind === 'event') {
        await api.deleteEventBooking(row.booking.id);
      } else {
        await api.deleteVisitBooking(row.booking.id);
      }
      setRows((prev) => prev.filter((r) => r.booking.id !== row.booking.id));
    } catch {
      alert('Failed to cancel booking');
    }
  };

  const total = rows.length;
  const confirmed = rows.filter((r) => r.booking.status === 'confirmed').length;
  const pending = rows.filter((r) => r.booking.status === 'pending').length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">My Bookings</h1>
            <p className="text-xs text-muted-foreground">Events & site visits</p>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : rows.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">No bookings yet</p>
            <p className="text-xs text-muted-foreground mb-4">Book an event or schedule a visit</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline" onClick={() => navigate('/events')}>
                Browse events
              </Button>
              <Button onClick={() => navigate('/')}>Book a visit</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const b = row.booking;
              const isEvent = row.kind === 'event';
              const event = isEvent ? getEventDetails((b as EventBookingRecord).eventId) : null;
              const ashram = !isEvent ? ashramById.get((b as VisitBookingRecord).ashramId) : null;

              const title = isEvent
                ? event!.title
                : `Visit — ${ashram?.name ?? 'Organization'}`;
              const location = isEvent ? event!.location : ashram?.location ?? '—';
              const img =
                (isEvent ? event!.imageUrl : ashram?.imageUrl) ||
                'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80';

              return (
                <Card key={`${row.kind}-${b.id}`} className="border-none shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 flex-shrink-0">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                      </div>
                      <div className="flex-1 py-3 pr-3">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="font-bold text-sm line-clamp-2 flex-1">{title}</h3>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-5 border-muted-foreground/30"
                            >
                              {isEvent ? 'Event' : 'Visit'}
                            </Badge>
                            <Badge
                              variant={b.status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {b.status ?? 'confirmed'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {b.date
                                ? new Date(b.date + 'T12:00:00').toLocaleDateString()
                                : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{b.time || b.timeSlot || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{location}</span>
                          </div>
                          {isEvent && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>
                                {(b as EventBookingRecord).guests ?? 1} guest
                                {((b as EventBookingRecord).guests ?? 1) > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {!isEvent && (
                            <>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>
                                  {(b as VisitBookingRecord).visitorCount ?? 1} visitor
                                  {((b as VisitBookingRecord).visitorCount ?? 1) > 1 ? 's' : ''}
                                </span>
                              </div>
                              {(b as VisitBookingRecord).purpose && (
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  <span className="font-medium text-foreground/80">Purpose: </span>
                                  {VISIT_PURPOSE_OPTIONS.find(
                                    (p) => p.id === (b as VisitBookingRecord).purpose,
                                  )?.label ?? (b as VisitBookingRecord).purpose}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="bg-muted/50 rounded p-2 mb-3">
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <Mail className="h-3 w-3 text-primary" />
                            <span className="truncate">{b.email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3 w-3 text-primary" />
                            <span>{b.phone || '—'}</span>
                          </div>
                        </div>
                        {b.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-xs text-destructive"
                            onClick={() => void handleCancel(row)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel booking
                          </Button>
                        )}
                        {b.status === 'pending' && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2">
                            <p className="text-xs text-orange-700">
                              Waiting for confirmation from admin
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
