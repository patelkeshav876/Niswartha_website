import { mockAshrams } from '../data/mock';
import type { Ashram } from '../types';
import { api } from './api';

export async function buildAshramLookupMap(): Promise<Map<string, Ashram>> {
  const map = new Map<string, Ashram>();
  for (const a of mockAshrams) {
    map.set(a.id, a);
  }
  try {
    const list = await api.getAshrams();
    if (Array.isArray(list)) {
      for (const raw of list) {
        const a = raw as Ashram;
        if (a?.id) map.set(a.id, a);
      }
    }
  } catch {
    /* mock only */
  }
  return map;
}
