'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { AdminPermissions } from '@/lib/mock-auth-data';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: AdminPermissions;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (userData: AdminUser) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
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
      // Call logout API to clear cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setUser(null);
      toast.success('Logged out successfully');

      // Redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      setUser(null);
      window.location.href = '/auth/login';
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
=======
      // Mock authentication for development using our mock admin users
      // In production, this would be a real API call

      // Import mock admin users dynamically to avoid build issues
      const { mockAdminUsers } = await import('../data/mockUsers');

      // Use the first admin user as the logged-in user for development
      const mockAdmin = mockAdminUsers[0]; // Super admin

      const mockUser: AdminUser = {
        id: mockAdmin.id,
        name: mockAdmin.name,
        email: mockAdmin.email,
        role: mockAdmin.role
      };
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      // Fallback to basic mock user if import fails
      const fallbackUser: AdminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@indusun.com',
        role: 'admin'
      };
      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Permission checking function
  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (!user) return false;

    // If user has permissions object, check it
    if (user.permissions) {
      return user.permissions[permission] === true;
    }

    // Fallback: Grant permissions based on role
    // Super admin gets all permissions
    if (user.role === 'super_admin') {
      return true;
    }

    // Regular admin gets most permissions except sensitive ones
    if (user.role === 'admin') {
      const restrictedPermissions: (keyof AdminPermissions)[] = [
        'can_delete_users',
        'can_delete_admins',
        'can_view_admin_details',
        'can_export_data'
      ];
      return !restrictedPermissions.includes(permission);
    }

    return false;
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout, checkAuth, hasPermission }}>
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
