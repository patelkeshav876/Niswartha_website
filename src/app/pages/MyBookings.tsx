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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

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

  const filteredRows = rows.filter((row) => {
    const b = row.booking;
    const isEvent = row.kind === 'event';
    const event = isEvent ? getEventDetails((b as EventBookingRecord).eventId) : null;
    const ashram = !isEvent ? ashramById.get((b as VisitBookingRecord).ashramId) : null;
    const title = isEvent ? (event?.title || '') : (`Ashram Visit — ${ashram?.name ?? ''}`);

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'confirmed' && b.status === 'confirmed') ||
      (statusFilter === 'pending' && (b.status === 'pending' || !b.status));

    return matchesSearch && matchesFilter;
  });

  const total = rows.length;
  const confirmed = rows.filter((r) => r.booking.status === 'confirmed').length;
  const pending = rows.filter((r) => r.booking.status === 'pending' || !r.booking.status).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header section */}
      <div className="border-b border-zinc-200/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">My Bookings Log</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track your upcoming ashram visits & registered events</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/events')}
            className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white text-xs font-bold shadow-sm"
          >
            + New Event Registration
          </Button>
        </div>
      </div>

      {/* Summary grid tiles matching Screenshot 1 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Logs', value: total, color: 'text-zinc-900 bg-zinc-100', icon: Calendar },
          { label: 'Confirmed', value: confirmed, color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
          { label: 'Pending', value: pending, color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock },
        ].map((stat, i) => (
          <Card key={i} className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-3.5 sm:p-4 text-center">
            <stat.icon className={`mx-auto mb-1.5 h-5 w-5 ${stat.color.split(' ')[0]}`} />
            <p className="text-xl sm:text-2xl font-bold text-zinc-950 font-mono">{stat.value}</p>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Search & Filter pills */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search bookings by event or ashram..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-full border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6D4E]/30"
          />
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'pending', label: 'Pending' },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={statusFilter === tab.id ? 'default' : 'outline'}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-full h-8 text-xs font-bold px-3.5 ${
                statusFilter === tab.id ? 'bg-[#0F6D4E] hover:bg-[#0c593f] text-white' : 'border-zinc-200 text-zinc-700'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredRows.length === 0 ? (
        <Card className="p-10 text-center border-dashed rounded-3xl bg-white space-y-3">
          <Calendar className="h-10 w-10 mx-auto text-zinc-300" />
          <div>
            <h3 className="text-sm font-bold text-zinc-900">No Bookings Found</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Schedule a visit or register for upcoming events</p>
          </div>
          <div className="flex gap-2 justify-center pt-1">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-bold" onClick={() => navigate('/events')}>
              Browse Events
            </Button>
            <Button size="sm" className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white text-xs font-bold border-none" onClick={() => navigate('/visit-book/ashram-1')}>
              Book a Visit
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((row) => {
            const b = row.booking;
            const isEvent = row.kind === 'event';
            const event = isEvent ? getEventDetails((b as EventBookingRecord).eventId) : null;
            const ashram = !isEvent ? ashramById.get((b as VisitBookingRecord).ashramId) : null;

            const title = isEvent ? event!.title : `Ashram Visit — ${ashram?.name ?? 'Organization'}`;
            const location = isEvent ? event!.location : ashram?.location ?? 'Nagpur, Maharashtra';
            const img = (isEvent ? event!.imageUrl : ashram?.imageUrl) || 'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80';

            return (
              <Card key={`${row.kind}-${b.id}`} className="border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden bg-white hover:border-[#0F6D4E]/40 transition-all">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-36 h-36 shrink-0 bg-zinc-100 overflow-hidden relative">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <Badge className="absolute top-2 left-2 bg-black/70 text-white border-none font-bold text-[9px] uppercase px-2 py-0.5">
                      {isEvent ? 'Event' : 'Site Visit'}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-zinc-950 font-serif text-sm sm:text-base line-clamp-1">{title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-[#0F6D4E]" />
                          {location}
                        </p>
                      </div>

                      <Badge className={`font-bold border-none uppercase text-[9px] px-2.5 py-1 shrink-0 ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status ?? 'pending'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs text-zinc-600 font-medium">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#0F6D4E]" />
                          {b.date ? new Date(b.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#0F6D4E]" />
                          {b.time || b.timeSlot || '—'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-[#0F6D4E]" />
                          {isEvent
                            ? `${(b as EventBookingRecord).guests ?? 1} guest(s)`
                            : `${(b as VisitBookingRecord).visitorCount ?? 1} visitor(s)`}
                        </p>
                        {!isEvent && (b as VisitBookingRecord).purpose && (
                          <p className="text-[10px] text-zinc-500 italic truncate">
                            Purpose: {VISIT_PURPOSE_OPTIONS.find(p => p.id === (b as VisitBookingRecord).purpose)?.label ?? (b as VisitBookingRecord).purpose}
                          </p>
                        )}
                      </div>
                    </div>

                    {b.status !== 'cancelled' && (
                      <div className="pt-2 flex justify-end border-t border-zinc-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel(row)}
                          className="h-7 px-3 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-full"
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
