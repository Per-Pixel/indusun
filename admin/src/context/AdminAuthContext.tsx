'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import {
  AdminUser,
  authenticateAdmin,
  getAdminById,
  updateAdminLastActive,
  logoutAdmin,
  AdminPermissions
} from '../lib/mock-auth-data';

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  permissions: AdminPermissions | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authenticateAdmin({ email, password });

      if (response.success && response.user) {
        setUser(response.user);
        setPermissions(response.permissions || null);
        updateAdminLastActive(response.user.id);

        // Store token in localStorage for persistence (in production, use secure storage)
        if (response.token) {
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('admin_user', JSON.stringify(response.user));
        }

        toast.success('Admin login successful');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');

      if (token) {
        await logoutAdmin(token);
      }

      // Clear stored data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');

      setUser(null);
      setPermissions(null);
      toast.success('Logged out successfully');

      // Redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Check for stored token and user data
      const token = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');

      if (token && storedUser) {
        const userData = JSON.parse(storedUser) as AdminUser;

        // Verify user still exists and is active
        const currentUser = getAdminById(userData.id);
        if (currentUser && currentUser.status === 'active') {
          setUser(currentUser);
          setPermissions(currentUser.permissions);
          updateAdminLastActive(currentUser.id);
        } else {
          // User no longer exists or is inactive, clear storage
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setUser(null);
          setPermissions(null);
        }
      } else {
        setUser(null);
        setPermissions(null);
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      setUser(null);
      setPermissions(null);
      // Clear potentially corrupted storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    return permissions ? permissions[permission] : false;
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      isLoading,
      permissions,
      login,
      logout,
      checkAuth,
      hasPermission
    }}>
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
