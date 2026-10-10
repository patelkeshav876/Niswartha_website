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
    let errorMsg = `API request failed: ${response.statusText}`;
    try {
      const errorText = await response.text();
      if (errorText.includes('NOT_FOUND') || errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
        errorMsg = `Server endpoint ${endpoint} is not available (${response.status}).`;
      } else if (errorText) {
        errorMsg = errorText;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export function applyThemeColor(themeColor?: string) {
  const mode = themeColor || (localStorage.getItem('primary_theme_color') || 'green');
  if (typeof document !== 'undefined') {
    if (themeColor) {
      localStorage.setItem('primary_theme_color', themeColor);
    }
    if (mode === 'blue') {
      document.documentElement.classList.add('theme-blue');
    } else {
      document.documentElement.classList.remove('theme-blue');
    }
  }
}

if (typeof window !== 'undefined') {
  applyThemeColor();
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
    let list: any[] = [];
    try {
      const serverList = await fetchAPI<any[]>('/notifications');
      if (Array.isArray(serverList)) {
        list = [...serverList];
      }
    } catch {
      list = [...(mockNotifications || [])];
    }

    // Merge any locally saved notifications (e.g. complaints or offline alerts)
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList)) {
          for (const item of localList) {
            if (!list.some((n) => n.id === item.id)) {
              list.unshift(item);
            }
          }
        }
      }
    } catch {}

    return list;
  },
  markNotificationRead: (id: string) => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
          localStorage.setItem('notifications', JSON.stringify(updated));
        }
      }
    } catch {}
    return fetchAPI(`/notifications/${id}/read`, { method: 'PUT' });
  },

  submitComplaint: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    category?: string;
    subject?: string;
    message: string;
    userId?: string;
  }) => {
    let result: any = null;
    try {
      result = await fetchAPI('/complaints', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('Backend complaint API failed, storing locally:', err);
    }

    const now = new Date().toISOString();
    const complaintNotif = {
      id: `notif-complaint-${Date.now()}`,
      userId: 'user-1',
      title: `🚨 User Complaint: ${data.subject || 'Website Feedback'}`,
      message: `From ${data.name || 'Anonymous User'} (${data.email || data.phone || 'No contact'}): "${data.message}" [Category: ${data.category || 'General'}]`,
      type: 'complaint',
      read: false,
      createdAt: now,
    };

    try {
      const stored = localStorage.getItem('notifications');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('notifications', JSON.stringify([complaintNotif, ...list]));
    } catch {}

    try {
      const storedComplaints = localStorage.getItem('admin_complaints');
      const compList = storedComplaints ? JSON.parse(storedComplaints) : [];
      localStorage.setItem(
        'admin_complaints',
        JSON.stringify([{ ...data, id: `complaint-${Date.now()}`, createdAt: now }, ...compList])
      );
    } catch {}

    return result || { success: true };
  },

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
    let apiData: Need[] | null = null;
    try {
      apiData = await fetchAPI<Need[]>(
        ashramId ? `/needs?ashramId=${encodeURIComponent(ashramId)}` : '/needs',
      );
    } catch {
      // Backend may be offline or Vercel edge without mongo
    }

    let localNeeds: Need[] = [];
    try {
      const stored = localStorage.getItem('admin_needs');
      if (stored) localNeeds = JSON.parse(stored);
    } catch {}

    const baseList = (apiData && apiData.length > 0) ? apiData : (mockNeeds || []);
    const combined = [...baseList];
    for (const ln of localNeeds) {
      const idx = combined.findIndex((n) => n.id === ln.id);
      if (idx >= 0) {
        combined[idx] = ln;
      } else {
        combined.unshift(ln);
      }
    }

    if (ashramId) {
      return combined.filter((n) => n.ashramId === ashramId);
    }
    return combined;
  },
  getNeed: async (id: string) => {
    try {
      return await fetchAPI(`/needs/${id}`);
    } catch {
      try {
        const stored = localStorage.getItem('admin_needs');
        if (stored) {
          const list: Need[] = JSON.parse(stored);
          const hit = list.find((n) => n.id === id);
          if (hit) return hit;
        }
      } catch {}
      return mockNeeds.find((n) => n.id === id) || mockNeeds[0];
    }
  },
  createNeed: async (data: Record<string, unknown>) => {
    let result: any = null;
    try {
      result = await fetchAPI('/needs', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('API createNeed failed, saving locally:', err);
    }
    const newNeed = result || {
      id: 'need_' + Date.now(),
      createdAt: new Date().toISOString(),
      quantityFulfilled: 0,
      ...data,
    };
    try {
      const stored = localStorage.getItem('admin_needs');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('admin_needs', JSON.stringify([newNeed, ...list]));
    } catch (e) {
      console.warn('localStorage quota warning for admin_needs:', e);
    }
    return newNeed;
  },
  updateNeed: async (id: string, data: Record<string, unknown>) => {
    let result: any = null;
    try {
      result = await fetchAPI(`/needs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('API updateNeed failed, updating locally:', err);
    }
    try {
      const stored = localStorage.getItem('admin_needs');
      const list = stored ? JSON.parse(stored) : [];
      const updated = list.map((n: any) => (n.id === id ? { ...n, ...data } : n));
      if (!list.some((n: any) => n.id === id)) {
        updated.unshift({ id, ...data });
      }
      localStorage.setItem('admin_needs', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota warning for admin_needs:', e);
    }
    return result || { id, ...data };
  },
  deleteNeed: async (id: string) => {
    try {
      await fetchAPI(`/needs/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteNeed failed, deleting locally:', err);
    }
    try {
      const stored = localStorage.getItem('admin_needs');
      if (stored) {
        const list = JSON.parse(stored);
        localStorage.setItem('admin_needs', JSON.stringify(list.filter((n: any) => n.id !== id)));
      }
    } catch {}
    return { success: true };
  },

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
    let list: any[] = [];
    try {
      const params = new URLSearchParams();
      if (opts?.ashramId) params.set('ashramId', opts.ashramId);
      if (opts?.userId) params.set('userId', opts.userId);
      const q = params.toString();
      const data = await fetchAPI<unknown>(q ? `/visit-bookings?${q}` : '/visit-bookings');
      if (Array.isArray(data)) list = data;
      else list = [...(mockVisitBookings || [])];
    } catch {
      list = [...(mockVisitBookings || [])];
    }

    try {
      const stored = localStorage.getItem('local_visit_bookings');
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList)) {
          for (const item of localList) {
            if (!list.some((b) => b.id === item.id)) {
              list.unshift(item);
            }
          }
        }
      }
    } catch {}

    if (opts?.ashramId) list = list.filter((b) => b.ashramId === opts.ashramId);
    if (opts?.userId) list = list.filter((b) => b.userId === opts.userId);
    return list;
  },

  getMyVisitBookings: async () => {
    let list: any[] = [];
    try {
      const res = await fetchAPI<any[]>('/visit-bookings');
      if (Array.isArray(res)) list = res;
      else list = [...(mockVisitBookings || [])];
    } catch {
      list = [...(mockVisitBookings || [])];
    }
    try {
      const stored = localStorage.getItem('local_visit_bookings');
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList)) {
          for (const item of localList) {
            if (!list.some((b) => b.id === item.id)) {
              list.unshift(item);
            }
          }
        }
      }
    } catch {}
    return list;
  },

  createVisitBooking: async (data: Record<string, unknown>) => {
    let result: any = null;
    try {
      result = await fetchAPI('/visit-bookings', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('API createVisitBooking failed (offline or Vercel edge), persisting locally:', err);
    }
    const newBooking = result || {
      id: 'visit-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      ...data,
    };
    try {
      const stored = localStorage.getItem('local_visit_bookings');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('local_visit_bookings', JSON.stringify([newBooking, ...list]));
    } catch (e) {
      console.warn('Could not store visit booking locally:', e);
    }
    return newBooking;
  },

  deleteVisitBooking: async (id: string) => {
    try {
      await fetchAPI(`/visit-bookings/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteVisitBooking failed, deleting locally:', err);
    }
    try {
      const stored = localStorage.getItem('local_visit_bookings');
      if (stored) {
        const list = JSON.parse(stored);
        localStorage.setItem(
          'local_visit_bookings',
          JSON.stringify(list.filter((b: any) => b.id !== id))
        );
      }
    } catch {}
    return { success: true };
  },

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

  // --- Physical Item Donations API ---
  getItemDonations: async (opts?: { userId?: string; ashramId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (opts?.userId) params.set('userId', opts.userId);
      if (opts?.ashramId) params.set('ashramId', opts.ashramId);
      const q = params.toString();
      const data = await fetchAPI<any[]>(q ? `/item-donations?${q}` : '/item-donations');
      if (Array.isArray(data)) return data;
    } catch {
      // offline fallback
    }
    const saved = localStorage.getItem('item_donations');
    let list: any[] = saved ? JSON.parse(saved) : [];
    if (opts?.userId) {
      list = list.filter((item) => item.userId === opts.userId || item.phone === opts.userId);
    }
    if (opts?.ashramId) {
      list = list.filter((item) => item.ashramId === opts.ashramId);
    }
    return list;
  },

  createItemDonation: async (data: Record<string, unknown>) => {
    let created: any = null;
    try {
      created = await fetchAPI<any>('/item-donations', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      // offline fallback
    }
    const saved = localStorage.getItem('item_donations');
    const current: any[] = saved ? JSON.parse(saved) : [];
    const newItem = created || {
      id: 'item_don_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...data,
    };
    const updated = [newItem, ...current.filter((x: any) => x.id !== newItem.id)];
    localStorage.setItem('item_donations', JSON.stringify(updated));
    return newItem;
  },

  updateItemDonationStatus: async (id: string, status: string, adminNotes?: string) => {
    let res: any = null;
    try {
      res = await fetchAPI<any>(`/item-donations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes }),
      });
    } catch {
      // offline fallback
    }
    const saved = localStorage.getItem('item_donations');
    const current: any[] = saved ? JSON.parse(saved) : [];
    let updatedTarget: any = null;
    const updated = current.map((item: any) => {
      if (item.id === id) {
        const isReceived = status === 'received' || status === 'verified';
        updatedTarget = {
          ...item,
          status,
          ...(adminNotes !== undefined ? { adminNotes } : {}),
          ...(isReceived ? { receivedAt: new Date().toISOString() } : {}),
        };
        return updatedTarget;
      }
      return item;
    });
    localStorage.setItem('item_donations', JSON.stringify(updated));

    // Send instant user notification when status is marked received or verified
    if (updatedTarget && (status === 'received' || status === 'verified')) {
      const notifs = localStorage.getItem('notifications');
      const notifList: any[] = notifs ? JSON.parse(notifs) : [];
      const newNotif = {
        id: 'notif_' + Date.now(),
        title: 'Item Donation Received & Acknowledged! 📦',
        message: `The admin of ${updatedTarget.ashramName || 'the ashram'} has verified and acknowledged receipt of your item donation (${updatedTarget.needTitle || 'Donated Item'}). Reference: ${updatedTarget.reference || updatedTarget.id}.${adminNotes ? ` Admin note: "${adminNotes}"` : ''}`,
        type: 'item_received',
        read: false,
        createdAt: new Date().toISOString(),
        userId: updatedTarget.userId,
      };
      localStorage.setItem('notifications', JSON.stringify([newNotif, ...notifList]));
    }

    return res || updatedTarget || { id, status, adminNotes };
  },

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
    let res: any = null;
    try {
      res = await fetchAPI<any>('/albums', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('API createAlbum failed, storing locally:', err);
    }
    const current = await api.getAlbums();
    const newAlbum = res || { id: 'album_' + Date.now(), createdAt: new Date().toISOString(), photos: [], ...data };
    const updated = [newAlbum, ...current.filter((a: any) => a.id !== newAlbum.id)];
    try {
      localStorage.setItem('albums', JSON.stringify(updated));
    } catch {
      // If local storage is full, keep only the most recent albums with trimmed photos
      try {
        const compact = updated.slice(0, 10).map((a: any) => ({
          ...a,
          images: (a.images || []).slice(0, 8),
        }));
        localStorage.setItem('albums', JSON.stringify(compact));
      } catch {}
    }
    return newAlbum;
  },
  updateAlbum: async (id: string, data: Record<string, unknown>) => {
    let res: any = null;
    try {
      res = await fetchAPI<any>(`/albums/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('API updateAlbum failed, storing locally:', err);
    }
    const current = await api.getAlbums();
    const updated = current.map((a: any) => (a.id === id ? { ...a, ...data } : a));
    try {
      localStorage.setItem('albums', JSON.stringify(updated));
    } catch {
      try {
        const compact = updated.slice(0, 10).map((a: any) => ({
          ...a,
          images: (a.images || []).slice(0, 8),
        }));
        localStorage.setItem('albums', JSON.stringify(compact));
      } catch {}
    }
    return res || { id, ...data };
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
      const cfg = await fetchAPI<any>('/config');
      if (cfg?.primaryThemeColor) applyThemeColor(cfg.primaryThemeColor);
      return cfg;
    } catch {
      const saved = localStorage.getItem('superadmin_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.primaryThemeColor) applyThemeColor(parsed.primaryThemeColor);
        return parsed;
      }
      return {
        siteName: 'Niswartha — Selfless Service',
        siteTagline: 'Empowering Deaf & Dumb Children',
        contactEmail: 'contact@niswartha.org',
        contactPhone: '+91 9876543210',
        maintenanceMode: false,
        allowNewRegistrations: true,
        enableNotifications: true,
        primaryThemeColor: 'green',
      };
    }
  },
  updateConfig: async (data: Record<string, unknown>) => {
    if (data.primaryThemeColor && typeof data.primaryThemeColor === 'string') {
      applyThemeColor(data.primaryThemeColor);
      localStorage.setItem('primary_theme_color', data.primaryThemeColor);
    }
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
  backupDatabase: async () => {
    try {
      return await fetchAPI<any>('/super-admin/backup');
    } catch {
      const [ashrams, needs, events, albums, schemes, children, team, bookings] = await Promise.all([
        api.getAshrams(),
        api.getNeeds(),
        api.getEvents(),
        api.getAlbums(),
        api.getSchemes(),
        api.getChildren(),
        api.getTeamMembers(),
        api.getVisitBookings(),
      ]);
      return {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ashrams,
        needs,
        events,
        albums,
        schemes,
        children,
        team,
        visitBookings: bookings,
      };
    }
  },
  restoreDatabase: async (data: Record<string, unknown>) => {
    let result: any = null;
    try {
      result = await fetchAPI<any>('/super-admin/restore', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('API restoreDatabase failed, restoring to local storage:', err);
    }
    try {
      if (data.needs && Array.isArray(data.needs)) {
        localStorage.setItem('admin_needs', JSON.stringify(data.needs));
      }
      if (data.albums && Array.isArray(data.albums)) {
        localStorage.setItem('albums', JSON.stringify(data.albums));
      }
      if (data.schemes && Array.isArray(data.schemes)) {
        localStorage.setItem('schemes', JSON.stringify(data.schemes));
      }
      if (data.children && Array.isArray(data.children)) {
        localStorage.setItem('children', JSON.stringify(data.children));
      }
      if (data.team && Array.isArray(data.team)) {
        localStorage.setItem('team_members', JSON.stringify(data.team));
      }
      if (data.visitBookings && Array.isArray(data.visitBookings)) {
        localStorage.setItem('local_visit_bookings', JSON.stringify(data.visitBookings));
      }
    } catch (e) {
      console.warn('Failed restoring some local tables:', e);
    }
    return result || { success: true };
  },

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
        bgVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-children-playing-in-a-park-41544-large.mp4',
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
