/** Keep in sync with server `VISIT_SLOT_IDS` in server/index.js */
export const VISIT_SLOT_CAPACITY = 6;

export const VISIT_TIME_SLOTS = [
  { id: 'visit-09', label: '09.00 AM' },
  { id: 'visit-10', label: '10.00 AM' },
  { id: 'visit-11', label: '11.00 AM' },
  { id: 'visit-12', label: '12.00 PM' },
  { id: 'visit-14', label: '02.00 PM' },
  { id: 'visit-15', label: '03.00 PM' },
  { id: 'visit-16', label: '04.00 PM' },
] as const;

export type VisitSlotId = (typeof VISIT_TIME_SLOTS)[number]['id'];
