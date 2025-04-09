'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (userData: AdminUser) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: AdminUser) => {
    setUser(userData);
    toast.success('Admin login successful');
  };

  const logout = async () => {
    try {
      // Call logout API
      await fetch('/admin/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setUser(null);
      toast.success('Logged out successfully');
      
      // Redirect to login page
      window.location.href = '/admin/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/admin/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
