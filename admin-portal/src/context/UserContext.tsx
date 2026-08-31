import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  token: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  logout: () => void;
}

const defaultSuperAdmin: User = {
  id: 'super-admin-keshav',
  name: 'Keshav Patel',
  email: 'keshavpatel3690@gmail.com',
  role: 'super_admin',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u) return u;
      } catch {
        /* fallback */
      }
    }
    return defaultSuperAdmin;
  });

  const [token] = useState<string | null>(() => localStorage.getItem('token') || 'demo-token');
  const [loading] = useState(false);

  const isSuperAdmin = true; // SuperAdmin portal always grants Super Admin access
  const isAdmin = true;

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, token, isAdmin, isSuperAdmin, loading, logout }}>
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
