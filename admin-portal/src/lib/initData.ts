import { mockAshrams, mockEvents, mockNeeds, mockPosts, mockUsers } from '../data/mock';
import { api } from './api';

let initialized = false;

export async function initializeBackendData() {
  if (initialized) {
    return;
  }

  try {
    await api.health();
    await api.initData({
      users: mockUsers,
      ashrams: mockAshrams,
      needs: mockNeeds,
      events: mockEvents,
      posts: mockPosts,
    });
    initialized = true;
  } catch {
    // Backend unavailable — app uses local mock data
  }
}
