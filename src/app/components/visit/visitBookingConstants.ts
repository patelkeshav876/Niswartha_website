import { VISIT_SLOT_CAPACITY } from '../../lib/visitSlots';

export const VISIT_MAX_PARTY = VISIT_SLOT_CAPACITY;

export const VISIT_PURPOSE_OPTIONS = [
  { id: 'visit', label: 'General visit' },
  { id: 'darshan', label: 'Darshan' },
  { id: 'meditation', label: 'Meditation' },
  { id: 'event', label: 'Event' },
  { id: 'volunteer', label: 'Volunteer' },
] as const;

export type VisitPurposeId = (typeof VISIT_PURPOSE_OPTIONS)[number]['id'];

export const AGE_GROUP_OPTIONS = [
  { id: 'child', label: 'Mostly children' },
  { id: 'adult', label: 'Mostly adults' },
  { id: 'senior', label: 'Mostly seniors' },
  { id: 'mixed', label: 'Mixed ages' },
] as const;

export type AgeGroupId = (typeof AGE_GROUP_OPTIONS)[number]['id'];

export const GENDER_OPTIONS = [
  { id: '', label: 'Prefer not to say' },
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'other', label: 'Other' },
] as const;

export const DURATION_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
] as const;
