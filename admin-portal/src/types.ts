export type UserRole = 'donor' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  createdAt?: string;
}

export type NeedCategory = 'Food' | 'Clothes' | 'Education' | 'Healthcare' | 'Other';

export interface Need {
  id: string;
  ashramId: string;
  title: string;
  category: NeedCategory;
  urgency: 'low' | 'medium' | 'high';
  quantityRequired: number;
  quantityFulfilled: number;
  unit?: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  ashramId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  imageUrl?: string;
  capacity?: number;
  registeredCount?: number;
  published?: boolean;
}

export interface GovScheme {
  id: string;
  title: string;
  department: string;
  description: string;
  eligibility: string;
  benefits: string;
  applicationLink?: string;
  documentUrl?: string;
  published: boolean;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  joinedYear?: string;
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  story: string;
  imageUrl?: string;
  admissionDate: string;
  needsCategory: string;
  createdAt: string;
}

export interface Post {
  id: string;
  ashramId: string;
  imageUrl?: string;
  caption: string;
  likes: number;
  createdAt: string;
}
