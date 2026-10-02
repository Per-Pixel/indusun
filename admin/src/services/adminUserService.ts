// Admin Users Service — Supabase-backed CRUD for admin user management
// All write operations use the service-role client to bypass RLS.

import { createServiceClient } from '@/utils/supabase/service';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'super_admin';
  permissions?: string[];
}

export interface UpdateAdminInput {
  name?: string;
  phone?: string;
  role?: 'admin' | 'super_admin';
  status?: 'active' | 'inactive' | 'pending';
  permissions?: string[];
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  language?: string;
  timezone?: string;
}

/**
 * List all admin users, ordered by created_at desc.
 */
export async function listAdminUsers(): Promise<{
  users: AdminUserRow[];
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('listAdminUsers error:', error.message);
      return { users: [], error: error.message };
    }

    return { users: (data as AdminUserRow[]) || [], error: null };
  } catch (err: any) {
    console.error('listAdminUsers unexpected error:', err);
    return { users: [], error: err.message || 'Unknown error' };
  }
}

/**
 * Get a single admin user by ID.
 */
export async function getAdminUser(id: string): Promise<{
  user: AdminUserRow | null;
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data as AdminUserRow, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Create a new admin user.
 * 1. Creates a Supabase Auth user via admin API
 * 2. Inserts the corresponding admin_users row
 */
export async function createAdminUser(input: CreateAdminInput): Promise<{
  user: AdminUserRow | null;
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true, // auto-confirm so admin can log in immediately
      user_metadata: {
        name: input.name,
        role: input.role,
      },
    });

    if (authError || !authData.user) {
      return { user: null, error: authError?.message || 'Failed to create auth user' };
    }

    // Step 2: Insert admin_users profile row
    const { data: profileData, error: profileError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        role: input.role,
        status: 'active',
        permissions: input.permissions || [],
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: delete the auth user we just created
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { user: null, error: 'Failed to create admin profile: ' + profileError.message };
    }

    return { user: profileData as AdminUserRow, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Update an admin user's profile data.
 */
export async function updateAdminUser(
  id: string,
  input: UpdateAdminInput
): Promise<{ user: AdminUserRow | null; error: string | null }> {
  try {
    const supabase = createServiceClient();

    // Build the update payload, omitting undefined fields
    const updates: Record<string, any> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.role !== undefined) updates.role = input.role;
    if (input.status !== undefined) updates.status = input.status;
    if (input.permissions !== undefined) updates.permissions = input.permissions;
    if (input.avatar_url !== undefined) updates.avatar_url = input.avatar_url;
    if (input.bio !== undefined) updates.bio = input.bio;
    if (input.location !== undefined) updates.location = input.location;
    if (input.website !== undefined) updates.website = input.website;
    if (input.language !== undefined) updates.language = input.language;
    if (input.timezone !== undefined) updates.timezone = input.timezone;

    if (Object.keys(updates).length === 0) {
      return { user: null, error: 'No fields to update' };
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    // Also sync the name/role to auth.users metadata if changed
    if (input.name || input.role) {
      const metaUpdate: Record<string, any> = {};
      if (input.name) metaUpdate.name = input.name;
      if (input.role) metaUpdate.role = input.role;
      await supabase.auth.admin.updateUserById(id, {
        user_metadata: metaUpdate,
      });
    }

    return { user: data as AdminUserRow, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Delete an admin user (removes auth user + profile row via CASCADE).
 */
export async function deleteAdminUser(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = createServiceClient();

    // Delete from auth.users — CASCADE will remove admin_users row
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

/**
 * Reset an admin user's password (super_admin operation).
 */
export async function resetAdminPassword(
  userId: string,
  newPassword: string
): Promise<{ error: string | null }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}
