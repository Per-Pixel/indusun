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
      // Mock logout for development
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 300));

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
      // Mock authentication for development
      // In production, this would be a real API call
      const mockUser: AdminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@indusun.com',
        role: 'admin'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setUser(mockUser);
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
