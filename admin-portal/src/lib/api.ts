function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:4000/api';
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
    const error = await response.text();
    throw new Error(error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  health: () => fetchAPI<{ status: string }>('/health'),

  createUser: (data: Record<string, unknown>) =>
    fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (id: string) => fetchAPI(`/users/${id}`),
  updateUser: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/users/${id}/change-password`, { method: 'POST', body: JSON.stringify(data) }),

  getUsers: () => fetchAPI<any[]>('/users/list'),
  deleteUser: (id: string) => fetchAPI<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),

  getAshrams: () => fetchAPI<any[]>('/ashrams'),
  getAshram: (id: string) => fetchAPI<any>(`/ashrams/${id}`),
  createAshram: (data: Record<string, unknown>) =>
    fetchAPI('/ashrams', { method: 'POST', body: JSON.stringify(data) }),
  updateAshram: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/ashrams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getNeeds: (ashramId?: string) =>
    fetchAPI<any[]>(`/needs${ashramId ? `?ashramId=${ashramId}` : ''}`),
  createNeed: (data: Record<string, unknown>) =>
    fetchAPI('/needs', { method: 'POST', body: JSON.stringify(data) }),
  updateNeed: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/needs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNeed: (id: string) => fetchAPI<{ success: boolean }>(`/needs/${id}`, { method: 'DELETE' }),

  getEvents: (ashramId?: string) =>
    fetchAPI<any[]>(`/events${ashramId ? `?ashramId=${ashramId}` : ''}`),
  getPublicEvents: () => fetchAPI<any[]>('/events/public'),
  createEvent: (data: Record<string, unknown>) =>
    fetchAPI('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: string) => fetchAPI<{ success: boolean }>(`/events/${id}`, { method: 'DELETE' }),

  getConfig: () => fetchAPI<any>('/config'),
  updateConfig: (data: Record<string, unknown>) =>
    fetchAPI('/config', { method: 'PUT', body: JSON.stringify(data) }),

  getAlbums: (ashramId?: string) =>
    fetchAPI<any[]>(`/gallery/albums${ashramId ? `?ashramId=${ashramId}` : ''}`),
  createAlbum: (data: Record<string, unknown>) =>
    fetchAPI('/gallery/albums', { method: 'POST', body: JSON.stringify(data) }),
  addPhotoToAlbum: (albumId: string, photo: Record<string, unknown>) =>
    fetchAPI(`/gallery/albums/${albumId}/photos`, { method: 'POST', body: JSON.stringify(photo) }),
  addMultiplePhotosToAlbum: (albumId: string, photos: Record<string, unknown>[]) =>
    fetchAPI(`/gallery/albums/${albumId}/photos/batch`, { method: 'POST', body: JSON.stringify({ photos }) }),

  getGovSchemes: () => fetchAPI<any[]>('/schemes'),
  createGovScheme: (data: Record<string, unknown>) =>
    fetchAPI('/schemes', { method: 'POST', body: JSON.stringify(data) }),
  updateGovScheme: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/schemes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGovScheme: (id: string) => fetchAPI<{ success: boolean }>(`/schemes/${id}`, { method: 'DELETE' }),

  getTeamMembers: () => fetchAPI<any[]>('/team'),
  createTeamMember: (data: Record<string, unknown>) =>
    fetchAPI('/team', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamMember: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeamMember: (id: string) => fetchAPI<{ success: boolean }>(`/team/${id}`, { method: 'DELETE' }),

  getChildren: () => fetchAPI<any[]>('/children'),
  createChild: (data: Record<string, unknown>) =>
    fetchAPI('/children', { method: 'POST', body: JSON.stringify(data) }),
  updateChild: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/children/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChild: (id: string) => fetchAPI<{ success: boolean }>(`/children/${id}`, { method: 'DELETE' }),

  getPosts: () => fetchAPI<any[]>('/posts'),
  createPost: (data: Record<string, unknown>) =>
    fetchAPI('/posts', { method: 'POST', body: JSON.stringify(data) }),
  deletePost: (id: string) => fetchAPI<{ success: boolean }>(`/posts/${id}`, { method: 'DELETE' }),

  getVisitBookings: () => fetchAPI<any[]>('/visit-bookings'),
  updateVisitBookingStatus: (id: string, status: string) =>
    fetchAPI(`/visit-bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};
