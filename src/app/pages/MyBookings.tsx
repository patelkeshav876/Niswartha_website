import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
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
import { toast } from 'sonner';

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
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadBookings();
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
      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel booking');
    }
  };

  const total = rows.length;
  const confirmed = rows.filter((r) => r.booking.status === 'confirmed').length;
  const pending = rows.filter((r) => r.booking.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">My Bookings Log</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Track your upcoming visits and registered event bookings</p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Logs', value: total, color: 'bg-zinc-50 text-zinc-800', icon: Calendar },
          { label: 'Confirmed', value: confirmed, color: 'bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
          { label: 'Pending', value: pending, color: 'bg-amber-50 text-amber-800', icon: Clock },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden p-4">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <stat.icon className={`h-5 w-5 ${stat.color.split(' ')[1]}`} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold hidden sm:block">{stat.label}</p>
                <p className="text-xl font-bold text-zinc-950">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 rounded-3xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-3xl bg-white">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-900">No Bookings Yet</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-6">Schedule visits or register for events</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-bold" onClick={() => navigate('/events')}>
              Browse Events
            </Button>
            <Button size="sm" className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white text-xs font-bold border-none" onClick={() => navigate('/')}>
              Book a Visit
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const b = row.booking;
            const isEvent = row.kind === 'event';
            const event = isEvent ? getEventDetails((b as EventBookingRecord).eventId) : null;
            const ashram = !isEvent ? ashramById.get((b as VisitBookingRecord).ashramId) : null;

            const title = isEvent ? event!.title : `Ashram Visit — ${ashram?.name ?? 'Organization'}`;
            const location = isEvent ? event!.location : ashram?.location ?? ' नागपुर ';
            const img = (isEvent ? event!.imageUrl : ashram?.imageUrl) || 'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80';

            return (
              <Card key={`${row.kind}-${b.id}`} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-32 h-32 shrink-0 bg-zinc-100 overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-zinc-950 font-serif line-clamp-1">{title}</h4>
                        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5" />
                          {location}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <Badge className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none font-bold text-[8px] uppercase py-0.5 px-2">
                          {isEvent ? 'Event' : 'Site Visit'}
                        </Badge>
                        <Badge className={`font-bold border-none uppercase text-[8px] py-0.5 px-2 ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status ?? 'pending'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-600 font-medium">
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#0F6D4E]" />
                          {b.date ? new Date(b.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#0F6D4E]" />
                          {b.time || b.timeSlot || '—'}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#0F6D4E]" />
                          {isEvent
                            ? `${(b as EventBookingRecord).guests ?? 1} guest${((b as EventBookingRecord).guests ?? 1) > 1 ? 's' : ''}`
                            : `${(b as VisitBookingRecord).visitorCount ?? 1} visitor${((b as VisitBookingRecord).visitorCount ?? 1) > 1 ? 's' : ''}`}
                        </p>
                        {!isEvent && (b as VisitBookingRecord).purpose && (
                          <p className="text-[10px] text-zinc-500 italic truncate">
                            Purpose: {VISIT_PURPOSE_OPTIONS.find(p => p.id === (b as VisitBookingRecord).purpose)?.label ?? (b as VisitBookingRecord).purpose}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-5 items-center bg-zinc-50 p-3 rounded-2xl border text-xs text-zinc-500">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                        {b.email || '—'}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        {b.phone || '—'}
                      </p>
                    </div>

                    {b.status !== 'cancelled' && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(row)}
                          className="rounded-full text-xs font-bold text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 h-8"
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
