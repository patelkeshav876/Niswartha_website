import { mockEvents } from '../data/mock';
import type { Event } from '../types';
import { api } from './api';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&q=80';

export function parseBookingDayMs(dateStr: string): number {
  const t = new Date(dateStr + 'T12:00:00').getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Merge API events with mock defaults so lookups work offline and for legacy IDs. */
export async function buildEventLookupMap(): Promise<Map<string, Event>> {
  const map = new Map<string, Event>();
  for (const e of mockEvents) {
    map.set(e.id, e);
  }
  try {
    const list = await api.getEvents();
    if (Array.isArray(list)) {
      for (const raw of list) {
        const e = raw as Event;
        if (e?.id) map.set(e.id, e);
      }
    }
  } catch {
    /* mock only */
  }
  return map;
}

export async function resolveEvent(
  eventId: string,
  map: Map<string, Event>,
): Promise<Event | undefined> {
  const hit = map.get(eventId);
  if (hit) return hit;
  try {
    const e = (await api.getEvent(eventId)) as Event;
    if (e?.id) {
      map.set(e.id, e);
      return e;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function placeholderEventForBooking(eventId: string): Event {
  return {
    id: eventId,
    ashramId: '',
    title: 'Event',
    date: '',
    time: '',
    location: 'Details unavailable',
    description: '',
    imageUrl: FALLBACK_IMG,
  };
}
