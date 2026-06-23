export type UserRole = 'donor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  location?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    updates: boolean;
  };
}

export interface Ashram {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  /** Social profile (e.g. Facebook page) */
  facebookUrl?: string;
  adminId: string;
}

export type NeedCategory = 'Food' | 'Clothes' | 'Education' | 'Healthcare' | 'Other';

export interface Need {
  id: string;
  ashramId: string;
  title: string;
  category: NeedCategory;
  description: string;
  quantityRequired: number;
  quantityFulfilled: number;
  urgency: 'low' | 'medium' | 'high';
  imageUrl?: string;
  createdAt: string;
}

export type EventApprovalStatus = 'approved' | 'pending_approval' | 'declined';

export interface Event {
  id: string;
  ashramId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
  /** Admin-created events may omit; user-suggested use `pending_approval` until approved */
  status?: EventApprovalStatus;
  suggestedBy?: string;
  suggestedByName?: string;
  isUserSuggested?: boolean;
  eventType?: string;
  createdAt?: string;
  capacity?: string | number;
}

export interface Post {
  id: string;
  ashramId: string;
  imageUrl: string;
  caption: string;
  likes: number;
  createdAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  ashramId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  needId?: string; // Optional if donating to specific need
}

/** Persisted event visit / registration booking */
export interface EventBookingRecord {
  id: string;
  eventId: string;
  userId?: string;
  date: string;
  timeSlot?: string;
  time?: string;
  guests?: number;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

/** On-site ashram visit appointment */
export interface VisitBookingRecord {
  id: string;
  ashramId: string;
  userId?: string;
  date: string;
  timeSlot: string;
  time?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  type?: 'visit';
  userLocation?: string;
  visitorCount?: number;
  visitorNames?: string[];
  ageGroup?: string;
  gender?: string;
  durationMinutes?: number;
  purpose?: string;
  idNumber?: string;
  idDocumentDataUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export type UnifiedBookingRow =
  | { kind: 'event'; booking: EventBookingRecord }
  | { kind: 'visit'; booking: VisitBookingRecord };

export interface Album {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  images: string[];
  createdAt: string;
}

export type GovSchemeCategory = 'Education' | 'Scholarship' | 'Child Welfare' | 'Healthcare' | 'Disability Support';

export interface GovScheme {
  id: string;
  title: string;
  description: string;
  category: GovSchemeCategory;
  published: boolean;
  eligibility?: string;
  link?: string;
  createdAt: string;
}

export interface ChildRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  education: string;
  admissionDate: string;
  healthNotes?: string;
  guardianInformation?: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: string[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  description?: string;
  category: 'Management' | 'Faculty' | 'Staff';
  createdAt: string;
}