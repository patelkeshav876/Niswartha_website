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
  mockAlumni,
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

  const token = localStorage.getItem('token') || 'demo-token';
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
        try {
          const parsed = JSON.parse(errorText);
          errorMsg = parsed.error || parsed.message || errorText;
        } catch {
          errorMsg = errorText;
        }
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

  sendAuthOtp: (data: { email: string; name?: string }) =>
    fetchAPI<{ success: boolean; message: string; otpToken?: string }>('/auth/send-otp', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: Record<string, unknown>) =>
    fetchAPI<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: Record<string, unknown>) =>
    fetchAPI<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleAuth: (data: { email: string; name?: string; avatarUrl?: string; googleId?: string }) =>
    fetchAPI<{ user: any; token: string }>('/auth/google', { method: 'POST', body: JSON.stringify(data) }),

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
      if (typeof window !== 'undefined' && (window as any).__PRELOADED_API__?.ashrams) {
        const preloaded = (window as any).__PRELOADED_API__.ashrams;
        (window as any).__PRELOADED_API__.ashrams = null;
        const res = await preloaded;
        if (res && Array.isArray(res) && res.length > 0) return res;
      }
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
      if (!ashramId && typeof window !== 'undefined' && (window as any).__PRELOADED_API__?.needs) {
        const preloaded = (window as any).__PRELOADED_API__.needs;
        (window as any).__PRELOADED_API__.needs = null;
        const res = await preloaded;
        if (res && Array.isArray(res) && res.length > 0) apiData = res;
      }
      if (!apiData) {
        apiData = await fetchAPI<Need[]>(
          ashramId ? `/needs?ashramId=${encodeURIComponent(ashramId)}` : '/needs',
        );
      }
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
      if (!ashramId && typeof window !== 'undefined' && (window as any).__PRELOADED_API__?.events) {
        const preloaded = (window as any).__PRELOADED_API__.events;
        (window as any).__PRELOADED_API__.events = null;
        const res = await preloaded;
        if (res && Array.isArray(res) && res.length > 0) return res;
      }
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
  // In-flight deduplication promise and in-memory cache for /api/config
  getConfig: (() => {
    let _configPromise: Promise<any> | null = null;
    let _cachedConfig: any = null;
    let _lastConfigFetch = 0;
    const CONFIG_CACHE_TTL_MS = 60 * 1000; // 60 seconds

    const fn = async (forceRefresh = false) => {
      const now = Date.now();
      if (!forceRefresh && _cachedConfig && (now - _lastConfigFetch < CONFIG_CACHE_TTL_MS)) {
        return _cachedConfig;
      }

      if (!forceRefresh && _configPromise) {
        return _configPromise;
      }

      _configPromise = (async () => {
        let remoteCfg: any = null;
        try {
          // Check if Frame 0 prefetch in index.html is available
          if (typeof window !== 'undefined') {
            const preloaded = (window as any).__PRELOADED_API__?.config || (window as any).__CONFIG_PROMISE__;
            if (preloaded) {
              if ((window as any).__PRELOADED_API__) (window as any).__PRELOADED_API__.config = null;
              (window as any).__CONFIG_PROMISE__ = null;
              remoteCfg = await preloaded;
            }
          }

          if (!remoteCfg) {
            remoteCfg = await fetchAPI<any>('/config');
          }
        } catch {
          // Offline fallback
        }

        let localCfg: any = null;
        try {
          const saved = localStorage.getItem('superadmin_config');
          if (saved) localCfg = JSON.parse(saved);
        } catch {}

        const defaults = {
          siteName: 'Niswartha — Selfless Service',
          siteTagline: 'Empowering Deaf & Dumb Children',
          contactEmail: 'contact@niswartha.org',
          contactPhone: '+91 91312 01107',
          ashramPhone: '+91 91312 01107',
          whatsappNumber: '+91 91312 01107',
          whatsappWelcomeMessage: 'Hello! I would like to learn more about support options for the Niswartha Ashram.',
          maintenanceMode: false,
          allowNewRegistrations: true,
          enableNotifications: true,
          globalAnnouncement: '',
          primaryThemeColor: 'green',
        };

        const merged = {
          ...defaults,
          ...(remoteCfg || {}),
          ...(localCfg || {}),
        };

        if (merged?.primaryThemeColor) applyThemeColor(merged.primaryThemeColor);
        _cachedConfig = merged;
        _lastConfigFetch = Date.now();
        return merged;
      })().finally(() => {
        _configPromise = null;
      });

      return _configPromise;
    };

    // Attach invalidation helper
    (fn as any).invalidate = () => {
      _cachedConfig = null;
      _lastConfigFetch = 0;
      _configPromise = null;
    };

    return fn;
  })(),

  getProfileConfig: async () => {
    try {
      return await fetchAPI<any>('/config/profiles');
    } catch {
      return {};
    }
  },

  updateConfig: async (data: Record<string, unknown>) => {
    // Invalidate config cache immediately so updates reflect instantly everywhere
    if (typeof (api?.getConfig as any)?.invalidate === 'function') {
      (api.getConfig as any).invalidate();
    }
    const cleanData = { ...data };
    delete (cleanData as any)._id;
    delete (cleanData as any).__v;

    if (cleanData.primaryThemeColor && typeof cleanData.primaryThemeColor === 'string') {
      applyThemeColor(cleanData.primaryThemeColor);
      try {
        localStorage.setItem('primary_theme_color', cleanData.primaryThemeColor);
      } catch {}
    }

    // Always immediately sync to local storage and broadcast to open browser components
    try {
      localStorage.setItem('superadmin_config', JSON.stringify(cleanData));
    } catch (e) {
      console.warn('localStorage quota warning:', e);
    }
    window.dispatchEvent(new CustomEvent('niswartha_config_updated', { detail: cleanData }));

    try {
      const res = await fetchAPI<any>('/config', { method: 'PUT', body: JSON.stringify(cleanData) });
      const merged = { ...cleanData, ...(res && typeof res === 'object' ? res : {}) };
      delete (merged as any)._id;
      delete (merged as any).__v;
      try {
        localStorage.setItem('superadmin_config', JSON.stringify(merged));
      } catch {}
      return merged;
    } catch (err) {
      console.warn('api.updateConfig remote fallback:', err);
      return cleanData;
    }
  },


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
      const data = await fetchAPI<any[]>('/super-admin/users');
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('superadmin_users', JSON.stringify(data));
        return data;
      }
    } catch {
      // offline fallback
    }
    const saved = localStorage.getItem('superadmin_users');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'super-admin-keshav', name: 'Keshav Patel', email: 'keshavpatel3690@gmail.com', role: 'super_admin', createdAt: new Date().toISOString() },
      { id: 'user-demo-1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'donor', createdAt: new Date().toISOString() },
      { id: 'user-demo-2', name: 'Priya Verma', email: 'priya@example.com', role: 'admin', createdAt: new Date().toISOString() }
    ];
  },
  updateSuperAdminUserRole: async (id: string, role: string) => {
    let res: any = null;
    try {
      res = await fetchAPI<any>(`/super-admin/users/${encodeURIComponent(id)}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      console.warn('API updateSuperAdminUserRole fallback:', err);
    }
    try {
      const saved = localStorage.getItem('superadmin_users');
      const list = saved ? JSON.parse(saved) : [];
      const updated = list.map((u: any) => (u.id === id || u._id === id || u.email === id ? { ...u, role } : u));
      localStorage.setItem('superadmin_users', JSON.stringify(updated));
    } catch {}
    try {
      const registered = localStorage.getItem('registered_users');
      if (registered) {
        const rList = JSON.parse(registered);
        const rUpdated = rList.map((u: any) => (u.id === id || u._id === id || u.email === id ? { ...u, role } : u));
        localStorage.setItem('registered_users', JSON.stringify(rUpdated));
      }
    } catch {}
    return res || { success: true, role };
  },
  deleteSuperAdminUser: async (id: string) => {
    let res: any = null;
    try {
      res = await fetchAPI<any>(`/super-admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteSuperAdminUser fallback:', err);
    }
    try {
      const saved = localStorage.getItem('superadmin_users');
      if (saved) {
        const list = JSON.parse(saved);
        localStorage.setItem('superadmin_users', JSON.stringify(list.filter((u: any) => u.id !== id && u._id !== id)));
      }
    } catch {}
    return res || { success: true };
  },

  // --- Alumni API ---
  getAlumni: async () => {
    try {
      return await fetchAPI<any[]>('/alumni');
    } catch {
      const saved = localStorage.getItem('niswartha_alumni');
      if (saved) return JSON.parse(saved);
      return mockAlumni || [];
    }
  },
  createAlumni: async (data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>('/alumni', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const current = await api.getAlumni();
      const newAlumni = { id: 'alumni_' + Date.now(), createdAt: new Date().toISOString(), ...data };
      const updated = [newAlumni, ...current];
      localStorage.setItem('niswartha_alumni', JSON.stringify(updated));
      return newAlumni;
    }
  },
  updateAlumni: async (id: string, data: Record<string, unknown>) => {
    try {
      return await fetchAPI<any>(`/alumni/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      const current = await api.getAlumni();
      const updated = current.map((a: any) => (a.id === id ? { ...a, ...data } : a));
      localStorage.setItem('niswartha_alumni', JSON.stringify(updated));
      return { id, ...data };
    }
  },
  deleteAlumni: async (id: string) => {
    try {
      return await fetchAPI<any>(`/alumni/${id}`, { method: 'DELETE' });
    } catch {
      const current = await api.getAlumni();
      const updated = current.filter((a: any) => a.id !== id);
      localStorage.setItem('niswartha_alumni', JSON.stringify(updated));
      return { success: true };
    }
  },

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
  getHeroConfig: (() => {
    const _heroCache = new Map<string, { data: any; ts: number }>();
    const HERO_TTL = 60 * 1000;

    const fn = async (pageKey: string, forceRefresh = false) => {
      const now = Date.now();
      const cached = _heroCache.get(pageKey);
      if (!forceRefresh && cached && now - cached.ts < HERO_TTL) {
        return cached.data;
      }

      let conf: any = null;
      try {
        conf = await fetchAPI<any>(`/hero-config/${encodeURIComponent(pageKey)}`);
      } catch {
        const saved = localStorage.getItem('hero_config_' + pageKey);
        if (saved) conf = JSON.parse(saved);
        else {
          conf = {
            bgType: pageKey === 'about' ? 'gradient' : 'image',
            bgUrl: pageKey === 'about' ? '' : '/hero-bg.webp',
            overlayOpacity: 0.55,
          };
        }
      }

      if (conf) {
        _heroCache.set(pageKey, { data: conf, ts: Date.now() });
      }
      return conf;
    };

    (fn as any).invalidate = (pageKey?: string) => {
      if (pageKey) _heroCache.delete(pageKey);
      else _heroCache.clear();
    };

    return fn;
  })(),
  updateHeroConfig: async (pageKey: string, data: Record<string, unknown>) => {
    if (typeof (api?.getHeroConfig as any)?.invalidate === 'function') {
      (api.getHeroConfig as any).invalidate(pageKey);
    }
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
