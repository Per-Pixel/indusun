// Supabase Authentication Service

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions?: string[];
}

/**
 * Sign in with email and password using Supabase Auth
 */
export async function signInWithPassword(
  email: string, 
  password: string
): Promise<{ user: AuthUser | null; error: Error | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      return { user: null, error: new Error(error.message) };
    }

    if (!data.user) {
      return { user: null, error: new Error('No user returned') };
    }

    // Fetch additional user data from your custom table if needed
    const { data: profileData, error: profileError } = await supabase
      .from('admin_users') // You can create this table for admin-specific data
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('No admin profile found, using basic auth data');
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      name: profileData?.name || data.user.user_metadata?.name || email.split('@')[0],
      role: profileData?.role || data.user.user_metadata?.role || 'admin',
      permissions: profileData?.permissions || data.user.user_metadata?.permissions || [],
    };

    return { user, error: null };
  } catch (err) {
    console.error('Unexpected error in signInWithPassword:', err);
    return { user: null, error: err as Error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: error ? new Error(error.message) : null };
    }

    // Fetch additional admin data
    const { data: profileData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single();

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      name: profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: profileData?.role || user.user_metadata?.role || 'admin',
      permissions: profileData?.permissions || user.user_metadata?.permissions || [],
    };

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: err as Error };
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { session }, error } = await supabase.auth.getSession();

    return { session, error };
  } catch (err) {
    return { session: null, error: err };
  }
}
