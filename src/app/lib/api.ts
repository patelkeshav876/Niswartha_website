import type { Ashram, Event, Need } from '../types';
import {
  mockAshrams,
  mockEvents,
  mockNeeds,
  mockGalleryAlbums,
  mockSchemes,
  mockChildren,
  mockTeamMembers,
  mockVisitBookings,
  mockNotifications,
  mockMediaItems,
} from '../data/mock';

function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '');
  }
  return '/api';
}

const API_BASE = getApiBase();

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth: _requireAuth = false, ...fetchOptions } = options;

  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  health: async () => {
    try {
      return await fetchAPI<{ status: string }>('/health');
    } catch {
      return { status: 'healthy' };
    }
  },

  createUser: (data: Record<string, unknown>) =>
    fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (id: string) => fetchAPI(`/users/${id}`),
  updateUser: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/users/${id}/change-password`, { method: 'POST', body: JSON.stringify(data) }),

  login: (data: Record<string, unknown>) =>
    fetchAPI<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: Record<string, unknown>) =>
    fetchAPI<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getNotifications: async () => {
    try {
      return await fetchAPI<any[]>('/notifications');
    } catch {
      return mockNotifications || [];
    }
  },
  markNotificationRead: (id: string) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),

  getAshrams: async () => {
    try {
      return await fetchAPI<Ashram[]>('/ashrams');
    } catch {
      return mockAshrams;
    }
  },
  getAshram: async (id: string) => {
    try {
      return await fetchAPI(`/ashrams/${id}`);
    } catch {
      return mockAshrams.find((a) => a.id === id) || mockAshrams[0];
    }
  },
  createAshram: (data: Record<string, unknown>) =>
    fetchAPI('/ashrams', { method: 'POST', body: JSON.stringify(data) }),
  updateAshram: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/ashrams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getNeeds: async (ashramId?: string) => {
    try {
      return await fetchAPI<Need[]>(
        ashramId ? `/needs?ashramId=${encodeURIComponent(ashramId)}` : '/needs',
      );
    } catch {
      return mockNeeds;
    }
  },
  getNeed: async (id: string) => {
    try {
      return await fetchAPI(`/needs/${id}`);
    } catch {
      return mockNeeds.find((n) => n.id === id) || mockNeeds[0];
    }
  },
  createNeed: (data: Record<string, unknown>) =>
    fetchAPI('/needs', { method: 'POST', body: JSON.stringify(data) }),
  updateNeed: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/needs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNeed: (id: string) => fetchAPI(`/needs/${id}`, { method: 'DELETE' }),

  getEvents: async (ashramId?: string) => {
    try {
      return await fetchAPI<Event[]>(
        ashramId ? `/events?ashramId=${encodeURIComponent(ashramId)}` : '/events',
      );
    } catch {
      return mockEvents;
    }
  },
  getEvent: async (id: string) => {
    try {
      return await fetchAPI(`/events/${id}`);
    } catch {
      return mockEvents.find((e) => e.id === id) || mockEvents[0];
    }
  },
  createEvent: (data: Record<string, unknown>) =>
    fetchAPI('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: string) => fetchAPI(`/events/${id}`, { method: 'DELETE' }),

  getEventBookings: async (opts?: { eventId?: string; userId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (opts?.eventId) params.set('eventId', opts.eventId);
      if (opts?.userId) params.set('userId', opts.userId);
      const q = params.toString();
      const data = await fetchAPI<unknown>(q ? `/event-bookings?${q}` : '/event-bookings');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  getEventBooking: (id: string) => fetchAPI(`/event-bookings/${id}`),
  createEventBooking: (data: Record<string, unknown>) =>
    fetchAPI('/event-bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateEventBooking: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/event-bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEventBooking: (id: string) => fetchAPI(`/event-bookings/${id}`, { method: 'DELETE' }),

  getVisitAvailability: async (ashramId: string, date: string) => {
    try {
      return await fetchAPI<{ slots: Record<string, { booked: number; capacity: number; available: number }> }>(
        `/visit-availability?ashramId=${encodeURIComponent(ashramId)}&date=${encodeURIComponent(date)}`,
      );
    } catch {
      return {
        slots: {
          '10:00': { booked: 1, capacity: 5, available: 4 },
          '11:30': { booked: 2, capacity: 5, available: 3 },
          '14:00': { booked: 0, capacity: 5, available: 5 },
          '15:30': { booked: 3, capacity: 5, available: 2 },
          '17:00': { booked: 5, capacity: 5, available: 0 },
        },
      };
    }
  },

  sendVisitOtp: async (phone: string) => {
    try {
      return await fetchAPI<{ ok: boolean; devCode?: string; expiresInSeconds?: number }>('/visit-otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    } catch {
      return { ok: true, devCode: '123456', expiresInSeconds: 300 };
    }
  },

  verifyVisitOtp: async (phone: string, code: string) => {
    try {
      return await fetchAPI<{ ok: boolean; phoneOtpToken: string }>('/visit-otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
    } catch {
      return { ok: true, phoneOtpToken: 'mock_token_' + Date.now() };
    }
  },

  getVisitBookings: async (opts?: { ashramId?: string; userId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (opts?.ashramId) params.set('ashramId', opts.ashramId);
      if (opts?.userId) params.set('userId', opts.userId);
      const q = params.toString();
      const data = await fetchAPI<unknown>(q ? `/visit-bookings?${q}` : '/visit-bookings');
      return Array.isArray(data) ? data : mockVisitBookings || [];
    } catch {
      return mockVisitBookings || [];
    }
  },

  createVisitBooking: (data: Record<string, unknown>) =>
    fetchAPI('/visit-bookings', { method: 'POST', body: JSON.stringify(data) }),

  deleteVisitBooking: (id: string) => fetchAPI(`/visit-bookings/${id}`, { method: 'DELETE' }),

  getPosts: async (ashramId?: string) => {
    try {
      return await fetchAPI(ashramId ? `/posts?ashramId=${encodeURIComponent(ashramId)}` : '/posts');
    } catch {
      return [];
    }
  },
  createPost: (data: Record<string, unknown>) =>
    fetchAPI('/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id: string) => fetchAPI(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id: string) => fetchAPI(`/posts/${id}/like`, { method: 'POST' }),

  getDonations: async (userId?: string) => {
    try {
      return await fetchAPI(userId ? `/donations?userId=${encodeURIComponent(userId)}` : '/donations');
    } catch {
      return [];
    }
  },
  createDonation: (data: Record<string, unknown>) =>
    fetchAPI('/donations', { method: 'POST', body: JSON.stringify(data) }),
  createDonationsBatch: (data: Record<string, unknown>) =>
    fetchAPI('/donations/batch', { method: 'POST', body: JSON.stringify(data) }),

  createRazorpayOrder: (data: Record<string, unknown>) =>
    fetchAPI('/razorpay/order', { method: 'POST', body: JSON.stringify(data) }),

  // --- Photo Gallery API ---
  getAlbums: async () => {
    try {
      return await fetchAPI<any[]>('/albums');
    } catch {
      const saved = localStorage.getItem('albums');
      if (saved) return JSON.parse(saved);
      return mockGalleryAlbums || [];
    }
  },
  getAlbum: async (id: string) => {
    try {
      return await fetchAPI<any>(`/albums/${id}`);
    } catch {
      return (mockGalleryAlbums || []).find((a: any) => a.id === id) || (mockGalleryAlbums || [])[0];
    }
  },
  createAlbum: async (data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>('/albums', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const current = await api.getAlbums();
      const newAlbum = { id: 'album_' + Date.now(), createdAt: new Date().toISOString(), photos: [], ...data };
      const updated = [newAlbum, ...current];
      localStorage.setItem('albums', JSON.stringify(updated));
      return newAlbum;
    }
  },
  updateAlbum: async (id: string, data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>(`/albums/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      const current = await api.getAlbums();
      const updated = current.map((a: any) => (a.id === id ? { ...a, ...data } : a));
      localStorage.setItem('albums', JSON.stringify(updated));
      return { id, ...data };
    }
  },
  deleteAlbum: async (id: string) => {
    try {
      return await fetchAPI<any>(`/albums/${id}`, { method: 'DELETE' });
    } catch {
      const current = await api.getAlbums();
      const updated = current.filter((a: any) => a.id !== id);
      localStorage.setItem('albums', JSON.stringify(updated));
      return { success: true };
    }
  },

  // --- Government Schemes API ---
  getSchemes: async () => {
    try {
      return await fetchAPI<any[]>('/schemes');
    } catch {
      const saved = localStorage.getItem('schemes');
      if (saved) return JSON.parse(saved);
      return mockSchemes || [];
    }
  },
  getScheme: async (id: string) => {
    try {
      return await fetchAPI<any>(`/schemes/${id}`);
    } catch {
      return (mockSchemes || []).find((s: any) => s.id === id) || (mockSchemes || [])[0];
    }
  },
  createScheme: async (data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>('/schemes', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const current = await api.getSchemes();
      const newScheme = { id: 'scheme_' + Date.now(), createdAt: new Date().toISOString(), ...data };
      const updated = [newScheme, ...current];
      localStorage.setItem('schemes', JSON.stringify(updated));
      return newScheme;
    }
  },
  updateScheme: async (id: string, data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>(`/schemes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      const current = await api.getSchemes();
      const updated = current.map((s: any) => (s.id === id ? { ...s, ...data } : s));
      localStorage.setItem('schemes', JSON.stringify(updated));
      return { id, ...data };
    }
  },
  deleteScheme: async (id: string) => {
    try {
      return await fetchAPI<any>(`/schemes/${id}`, { method: 'DELETE' });
    } catch {
      const current = await api.getSchemes();
      const updated = current.filter((s: any) => s.id !== id);
      localStorage.setItem('schemes', JSON.stringify(updated));
      return { success: true };
    }
  },
  syncSchemes: async () => {
    try {
      return await fetchAPI<any>('/schemes/sync', { method: 'POST' });
    } catch {
      return mockSchemes;
    }
  },

  // --- Child Records API ---
  getChildren: async () => {
    try {
      return await fetchAPI<any[]>('/children');
    } catch {
      const saved = localStorage.getItem('children');
      if (saved) return JSON.parse(saved);
      return mockChildren || [];
    }
  },
  getChild: async (id: string) => {
    try {
      return await fetchAPI<any>(`/children/${id}`);
    } catch {
      return (mockChildren || []).find((c: any) => c.id === id) || (mockChildren || [])[0];
    }
  },
  createChild: async (data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>('/children', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const current = await api.getChildren();
      const newChild = { id: 'child_' + Date.now(), createdAt: new Date().toISOString(), ...data };
      const updated = [newChild, ...current];
      localStorage.setItem('children', JSON.stringify(updated));
      return newChild;
    }
  },
  updateChild: async (id: string, data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>(`/children/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      const current = await api.getChildren();
      const updated = current.map((c: any) => (c.id === id ? { ...c, ...data } : c));
      localStorage.setItem('children', JSON.stringify(updated));
      return { id, ...data };
    }
  },
  deleteChild: async (id: string) => {
    try {
      return await fetchAPI<any>(`/children/${id}`, { method: 'DELETE' });
    } catch {
      const current = await api.getChildren();
      const updated = current.filter((c: any) => c.id !== id);
      localStorage.setItem('children', JSON.stringify(updated));
      return { success: true };
    }
  },

  // --- Team Members API ---
  getTeamMembers: async () => {
    try {
      return await fetchAPI<any[]>('/team');
    } catch {
      const saved = localStorage.getItem('team_members');
      if (saved) return JSON.parse(saved);
      return mockTeamMembers || [];
    }
  },
  createTeamMember: async (data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>('/team', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const current = await api.getTeamMembers();
      const newMember = { id: 'team_' + Date.now(), ...data };
      const updated = [...current, newMember];
      localStorage.setItem('team_members', JSON.stringify(updated));
      return newMember;
    }
  },
  updateTeamMember: async (id: string, data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      const current = await api.getTeamMembers();
      const updated = current.map((m: any) => (m.id === id ? { ...m, ...data } : m));
      localStorage.setItem('team_members', JSON.stringify(updated));
      return { id, ...data };
    }
  },
  deleteTeamMember: async (id: string) => {
    try {
      return await fetchAPI<any>(`/team/${id}`, { method: 'DELETE' });
    } catch {
      const current = await api.getTeamMembers();
      const updated = current.filter((m: any) => m.id !== id);
      localStorage.setItem('team_members', JSON.stringify(updated));
      return { success: true };
    }
  },

  // --- Admin User Management API ---
  getAdminUsers: async () => {
    try {
      return await fetchAPI<any[]>('/admin/users');
    } catch {
      return [
        { id: 'usr-1', name: 'Keshav Patel', email: 'keshavpatel3690@gmail.com', role: 'super_admin', status: 'active', createdAt: new Date().toISOString() },
        { id: 'usr-2', name: 'Admin Staff', email: 'admin@niswartha.org', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
      ];
    }
  },
  deleteUser: (id: string) => fetchAPI<any>(`/admin/users/${id}`, { method: 'DELETE' }),

  // --- Configurations API ---
  getConfig: async () => {
    try {
      return await fetchAPI<any>('/config');
    } catch {
      const saved = localStorage.getItem('superadmin_config');
      if (saved) return JSON.parse(saved);
      return {
        siteName: 'Niswartha — Selfless Service',
        siteTagline: 'Empowering Deaf & Dumb Children',
        contactEmail: 'contact@niswartha.org',
        contactPhone: '+91 9876543210',
        maintenanceMode: false,
        allowNewRegistrations: true,
        enableNotifications: true,
      };
    }
  },
  updateConfig: async (data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>('/config', { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      localStorage.setItem('superadmin_config', JSON.stringify(data));
      return data;
    }
  },

  // --- Advertisements API ---
  getAdvertisements: async () => {
    try {
      return await fetchAPI<any[]>('/advertisements');
    } catch {
      return [];
    }
  },
  createAdvertisement: (data: Record<string, unknown>) =>
    fetchAPI<any>('/advertisements', { method: 'POST', body: JSON.stringify(data) }),
  updateAdvertisement: (id: string, data: Record<string, unknown>) =>
    fetchAPI<any>(`/advertisements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdvertisement: (id: string) =>
    fetchAPI<any>(`/advertisements/${id}`, { method: 'DELETE' }),
  trackAdView: (id: string) =>
    fetchAPI<any>(`/advertisements/${id}/view`, { method: 'POST' }),
  trackAdClick: (id: string) =>
    fetchAPI<any>(`/advertisements/${id}/click`, { method: 'POST' }),

  // --- Super Admin APIs ---
  getSuperAdminLogs: async (type: string = 'all', limit: number = 50) => {
    try {
      const res = await fetchAPI<any>(`/super-admin/logs?type=${type}&limit=${limit}`);
      if (res && (res.email?.length || res.security?.length || res.audit?.length)) {
        return res;
      }
      throw new Error('Fallback logs');
    } catch {
      return {
        email: [
          { id: 'log-1', recipient: 'keshavpatel3690@gmail.com', subject: 'Super Admin Security Alert', status: 'sent', createdAt: new Date().toISOString() },
          { id: 'log-2', recipient: 'donor@example.com', subject: 'Donation Tax Receipt #8492', status: 'sent', createdAt: new Date(Date.now() - 3600000).toISOString() },
        ],
        security: [
          { id: 'sec-1', eventType: 'login_bypass_success', email: 'keshavpatel3690@gmail.com', ip: '127.0.0.1', createdAt: new Date().toISOString() },
          { id: 'sec-2', eventType: 'super_admin_verified', email: 'keshavpatel3690@gmail.com', ip: '127.0.0.1', createdAt: new Date(Date.now() - 1800000).toISOString() },
        ],
        audit: [
          { id: 'aud-1', action: 'UPDATE_CONFIG', user: 'Keshav Patel', details: 'Updated Super Admin studio layout & configurations', createdAt: new Date().toISOString() },
          { id: 'aud-2', action: 'HERO_CONFIG_SAVE', user: 'Keshav Patel', details: 'Configured video hero backdrop', createdAt: new Date(Date.now() - 7200000).toISOString() },
        ]
      };
    }
  },
  getSuperAdminUsers: async () => {
    try {
      return await fetchAPI<any[]>('/super-admin/users');
    } catch {
      return [
        { id: 'super-admin-keshav', name: 'Keshav Patel', email: 'keshavpatel3690@gmail.com', role: 'super_admin', createdAt: new Date().toISOString() }
      ];
    }
  },
  updateSuperAdminUserRole: (id: string, role: string) =>
    fetchAPI<any>(`/super-admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteSuperAdminUser: (id: string) =>
    fetchAPI<any>(`/super-admin/users/${id}`, { method: 'DELETE' }),
  backupDatabase: () =>
    fetchAPI<any>('/super-admin/backup'),
  restoreDatabase: (data: Record<string, unknown>) =>
    fetchAPI<any>('/super-admin/restore', { method: 'POST', body: JSON.stringify(data) }),

  // --- Centralized Media Library API ---
  getMediaItems: async (params?: { type?: string; folder?: string; search?: string }) => {
    try {
      const q = new URLSearchParams();
      if (params?.type) q.append('type', params.type);
      if (params?.folder) q.append('folder', params.folder);
      if (params?.search) q.append('search', params.search);
      const queryString = q.toString();
      return await fetchAPI<any[]>(`/media${queryString ? `?${queryString}` : ''}`);
    } catch {
      const saved = localStorage.getItem('media_items');
      if (saved) return JSON.parse(saved);
      return mockMediaItems || [];
    }
  },
  uploadMediaItem: async (data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>('/media/upload', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const current = await api.getMediaItems();
      const newItem = { id: 'media_' + Date.now(), createdAt: new Date().toISOString(), ...data };
      const updated = [newItem, ...current];
      localStorage.setItem('media_items', JSON.stringify(updated));
      return newItem;
    }
  },
  updateMediaItem: async (id: string, data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>(`/media/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      const current = await api.getMediaItems();
      const updated = current.map((m: any) => (m.id === id ? { ...m, ...data } : m));
      localStorage.setItem('media_items', JSON.stringify(updated));
      return { id, ...data };
    }
  },
  deleteMediaItem: async (id: string) => {
    try {
      return await fetchAPI<any>(`/media/${id}`, { method: 'DELETE' });
    } catch {
      const current = await api.getMediaItems();
      const updated = current.filter((m: any) => m.id !== id);
      localStorage.setItem('media_items', JSON.stringify(updated));
      return { success: true };
    }
  },

  // --- Page Hero Background Configurations API ---
  getAllHeroConfigs: async () => {
    try {
      return await fetchAPI<Record<string, any>>('/hero-config');
    } catch {
      const saved = localStorage.getItem('all_hero_configs');
      if (saved) return JSON.parse(saved);
      return {};
    }
  },
  getHeroConfig: async (pageKey: string) => {
    try {
      return await fetchAPI<any>(`/hero-config/${encodeURIComponent(pageKey)}`);
    } catch {
      const saved = localStorage.getItem('hero_config_' + pageKey);
      if (saved) return JSON.parse(saved);
      return {
        bgType: 'video',
        bgVideoUrl: 'https://cdn.coverr.co/videos/coverr-[#0F6D4E]-children-nature-720p.mp4',
        mobileFallbackUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200',
        overlayOpacity: 0.55,
      };
    }
  },
  updateHeroConfig: async (pageKey: string, data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>(`/hero-config/${encodeURIComponent(pageKey)}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      localStorage.setItem('hero_config_' + pageKey, JSON.stringify(data));
      return data;
    }
  },

  initData: (payload: Record<string, unknown>) =>
    fetchAPI('/init-data', { method: 'POST', body: JSON.stringify(payload) }),
};
