'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions?: string[];
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      const client = createBrowserClient(supabaseUrl, supabaseKey);
      setSupabase(client);
    }
  }, []);

  useEffect(() => {
    if (supabase) {
      checkAuth();
    }
  }, [supabase]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'No user returned' };
      }

      // Fetch admin profile data
      const { data: profileData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const adminUser: AdminUser = {
        id: data.user.id,
        email: data.user.email || '',
        name: profileData?.name || data.user.user_metadata?.name || email.split('@')[0],
        role: profileData?.role || data.user.user_metadata?.role || 'admin',
        permissions: profileData?.permissions || data.user.user_metadata?.permissions || [],
      };

      // Check if user is admin
      if (adminUser.role !== 'admin' && adminUser.role !== 'super_admin') {
        await supabase.auth.signOut();
        toast.error('Unauthorized - Admin access only');
        return { success: false, error: 'Unauthorized - Admin access only' };
      }

      setUser(adminUser);
      toast.success('Admin login successful');
      return { success: true };

    } catch (err) {
      console.error('Login error:', err);
      toast.error('Login failed');
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }

      // Also call our API to ensure server-side cleanup
      await fetch('/api/auth/logout', {
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
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get user details
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Fetch admin profile data
      const { data: profileData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const adminUser: AdminUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: profileData?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        role: profileData?.role || authUser.user_metadata?.role || 'admin',
        permissions: profileData?.permissions || authUser.user_metadata?.permissions || [],
      };

      // Check if user is admin
      if (adminUser.role !== 'admin' && adminUser.role !== 'super_admin') {
        setUser(null);
        await supabase.auth.signOut();
      } else {
        setUser(adminUser);
      }

    } catch (error) {
      console.error('Authentication check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Permission checking function
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // If user has permissions array, check it
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions.includes(permission);
    }

    // Fallback: Grant permissions based on role
    // Super admin gets all permissions
    if (user.role === 'super_admin') {
      return true;
    }

    // Regular admin gets basic permissions
    if (user.role === 'admin') {
      const restrictedPermissions = [
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
