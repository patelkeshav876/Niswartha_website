import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mock';
import { initializeBackendData } from '../lib/initData';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  token: string | null;
  isAdmin: boolean;
  isDonor: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved && token) {
      try {
        const u = JSON.parse(saved);
        // Normalize: accept _id as fallback for id 
        if (u) {
          if (!u.id && u._id) u.id = String(u._id);
          if (u.id) {
            return u;
          }
        }
        // Session is corrupted — clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false); // No longer async loading by default

  const isAdmin = currentUser?.role === 'admin';
  const isDonor = currentUser?.role === 'donor';

  useEffect(() => {
    // Background data initialization
    initializeBackendData();
  }, []);

  const login = (user: User, newToken: string) => {
    // Normalize: ensure 'id' is always set
    const normalizedUser = { ...user };
    if (!normalizedUser.id && (normalizedUser as any)._id) {
      normalizedUser.id = String((normalizedUser as any)._id);
    }
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', newToken);
    setCurrentUser(normalizedUser);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setToken(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    // Guaranteed to keep the original ID even if updates lacks it
    const updatedUser = { ...currentUser, ...updates, id: currentUser.id };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, token, isAdmin, isDonor, loading, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}