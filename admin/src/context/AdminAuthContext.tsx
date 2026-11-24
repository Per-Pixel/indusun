'use client';

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';
import { canAccessAdmin, resolvePermissions, userHasPermission } from '@/lib/permissions';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  status?: string;
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

async function buildAdminUser(supabase: any, authUser: any, profileData: any): Promise<AdminUser | 'inactive' | null> {
  if (profileData?.status === 'inactive') return 'inactive';
  const role = profileData?.role || authUser.user_metadata?.role || 'admin';
  if (!canAccessAdmin({ role, hasProfile: !!profileData, status: profileData?.status })) return null;

  let stored: string[] = profileData?.permissions || authUser.user_metadata?.permissions || [];
  if (role !== 'super_admin' && stored.length === 0) {
    const { data } = await supabase.from('admin_roles').select('permissions').eq('slug', role).maybeSingle();
    if (Array.isArray(data?.permissions)) stored = data.permissions;
  }

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: profileData?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
    role,
    status: profileData?.status,
    permissions: resolvePermissions(role, stored),
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const ADMIN_CACHE_KEY = 'indusun.adminUser';
const PROFILE_COLS = 'name,role,status,permissions';

function readCachedAdmin(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminUser;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedAdmin(user: AdminUser | null) {
  if (typeof window === 'undefined') return;
  if (!user) sessionStorage.removeItem(ADMIN_CACHE_KEY);
  else sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(user));
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client
  useEffect(() => {
    const cached = readCachedAdmin();
    if (cached) {
      setUser(cached);
      setIsLoading(false);
    }
    if (supabaseUrl && supabaseKey) {
      const client = createBrowserClient(supabaseUrl, supabaseKey);
      setSupabase(client);
    } else {
      setIsLoading(false);
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
        .select(PROFILE_COLS)
        .eq('id', data.user.id)
        .single();

      const adminUser = await buildAdminUser(supabase, data.user, profileData);

      if (adminUser === 'inactive') {
        await supabase.auth.signOut();
        toast.error('This account is inactive');
        return { success: false, error: 'This account is inactive' };
      }
      if (!adminUser) {
        await supabase.auth.signOut();
        toast.error('Unauthorized - Admin access only');
        return { success: false, error: 'Unauthorized - Admin access only' };
      }

      writeCachedAdmin(adminUser);
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

      writeCachedAdmin(null);
      setUser(null);
      toast.success('Logged out successfully');

      // Redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      writeCachedAdmin(null);
      setUser(null);
      window.location.href = '/auth/login';
    }
  };

  const checkAuth = async () => {
    const hadCache = !!readCachedAdmin();
    if (!hadCache) setIsLoading(true);
    try {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // Cookie session is enough here. getUser() would add a network round trip on every load.
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;

      if (!authUser) {
        writeCachedAdmin(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('admin_users')
        .select(PROFILE_COLS)
        .eq('id', authUser.id)
        .maybeSingle();

      const adminUser = await buildAdminUser(supabase, authUser, profileData);

      if (!adminUser || adminUser === 'inactive') {
        writeCachedAdmin(null);
        setUser(null);
        await supabase.auth.signOut();
      } else {
        writeCachedAdmin(adminUser);
        setUser(adminUser);
      }

    } catch (error) {
      console.error('Authentication check error:', error);
      if (!hadCache) setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return userHasPermission(user.role, user.permissions, permission);
  }, [user]);

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
