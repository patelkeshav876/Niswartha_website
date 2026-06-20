import type { EventBookingRecord, UnifiedBookingRow, VisitBookingRecord } from '../types';

export function todayISODateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function mergeBookingsDesc(
  events: EventBookingRecord[],
  visits: VisitBookingRecord[],
): UnifiedBookingRow[] {
  const rows: UnifiedBookingRow[] = [
    ...events.map((booking) => ({ kind: 'event' as const, booking })),
    ...visits.map((booking) => ({ kind: 'visit' as const, booking })),
  ];
  return rows.sort((a, b) => {
    const db = b.booking.date || '';
    const da = a.booking.date || '';
    return db.localeCompare(da);
  });
}

export function mergeUpcomingPreview(
  events: EventBookingRecord[],
  visits: VisitBookingRecord[],
  todayIso: string,
  limit: number,
): UnifiedBookingRow[] {
  const rows: UnifiedBookingRow[] = [
    ...events.map((booking) => ({ kind: 'event' as const, booking })),
    ...visits.map((booking) => ({ kind: 'visit' as const, booking })),
  ];
  return rows
    .filter((r) => r.booking.date && r.booking.date >= todayIso)
    .sort((a, b) => (a.booking.date || '').localeCompare(b.booking.date || ''))
    .slice(0, limit);
}
