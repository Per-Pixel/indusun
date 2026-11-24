// Admin roles — reusable permission sets assigned by slug on admin_users.role.

import { createServiceClient } from '@/utils/supabase/service';
import {
  ALL_PERMISSION_KEYS,
  BUILTIN_ROLES,
  isRoleSlug,
  slugifyRole,
  type RoleTemplate,
} from '@/lib/permissions';

export interface AdminRoleRow extends RoleTemplate {
  created_at: string;
  updated_at: string;
  user_count: number;
}

export interface RoleWriteInput {
  name: string;
  description?: string;
  permissions?: string[];
  slug?: string;
}

const MIGRATION_HINT =
  'Roles are not in the database yet. Run admin/sql/admin_roles.sql in the Supabase SQL editor, then try again.';

const BILLER_ROLE = {
  slug: 'biller',
  name: 'Biller',
  description: 'Create, view, and print bills. No sales totals, reports, user management, or settings.',
  permissions: ['billing_management'],
  is_system: true,
};

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === '42P01' || error.code === 'PGRST205') return true;
  const message = error.message || '';
  return /admin_roles/i.test(message) && /does not exist|schema cache|could not find/i.test(message);
}

function cleanPermissions(keys: string[] | undefined, slug: string): string[] {
  if (slug === 'super_admin') return [...ALL_PERMISSION_KEYS];
  const allowed = new Set(ALL_PERMISSION_KEYS);
  return [...new Set((keys || []).filter((key) => allowed.has(key)))];
}

function builtinAsRows(): AdminRoleRow[] {
  const now = new Date(0).toISOString();
  return BUILTIN_ROLES.map((role) => ({
    ...role,
    permissions: [...role.permissions],
    created_at: now,
    updated_at: now,
    user_count: 0,
  }));
}

async function userCounts(supabase: ReturnType<typeof createServiceClient>): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const { data, error } = await supabase.from('admin_users').select('role');
  if (error || !data) return counts;
  for (const row of data as { role: string }[]) {
    if (!row.role) continue;
    counts[row.role] = (counts[row.role] || 0) + 1;
  }
  return counts;
}

export async function listAdminRoles(): Promise<{
  roles: AdminRoleRow[];
  needsMigration: boolean;
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('is_system', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      if (isMissingTable(error)) {
        return { roles: builtinAsRows(), needsMigration: true, error: null };
      }
      return { roles: [], needsMigration: false, error: error.message };
    }

    let rows = data || [];
    if (!rows.some((row) => (row as { slug?: string }).slug === 'biller')) {
      await supabase.from('admin_roles').insert(BILLER_ROLE);
      const again = await supabase
        .from('admin_roles')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name', { ascending: true });
      if (!again.error && again.data) rows = again.data;
    }

    const counts = await userCounts(supabase);
    const roles = (rows as Omit<AdminRoleRow, 'user_count'>[]).map((row) => ({
      ...row,
      permissions: Array.isArray(row.permissions) ? row.permissions : [],
      user_count: counts[row.slug] || 0,
    }));

    return { roles, needsMigration: false, error: null };
  } catch (err: any) {
    return { roles: [], needsMigration: false, error: err.message || 'Unknown error' };
  }
}

export async function getRoleBySlug(slug: string): Promise<AdminRoleRow | null> {
  const { roles } = await listAdminRoles();
  return roles.find((role) => role.slug === slug) || null;
}

/** null when the slug can be stored on an admin user. */
export async function assertRoleAssignable(slug: string): Promise<string | null> {
  if (!isRoleSlug(slug)) return 'Invalid role';
  const { roles, needsMigration, error } = await listAdminRoles();
  if (error) return error;
  if (!roles.some((role) => role.slug === slug)) {
    if (needsMigration) return MIGRATION_HINT;
    return 'Unknown role. Create it under Roles first.';
  }
  if (needsMigration && slug !== 'admin' && slug !== 'super_admin') return MIGRATION_HINT;
  return null;
}

export async function createAdminRole(input: RoleWriteInput): Promise<{
  role: AdminRoleRow | null;
  error: string | null;
}> {
  const name = input.name?.trim();
  if (!name) return { role: null, error: 'Role name is required' };

  const slug = (input.slug?.trim() || slugifyRole(name));
  if (!isRoleSlug(slug)) {
    return { role: null, error: 'Use a name with letters or numbers' };
  }
  if (slug === 'super_admin' || slug === 'admin') {
    return { role: null, error: 'That role already exists' };
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('admin_roles')
      .insert({
        slug,
        name,
        description: input.description?.trim() || '',
        permissions: cleanPermissions(input.permissions, slug),
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      if (isMissingTable(error)) return { role: null, error: MIGRATION_HINT };
      if (/duplicate|unique/i.test(error.message)) return { role: null, error: 'A role with that name already exists' };
      return { role: null, error: error.message };
    }

    return {
      role: { ...(data as AdminRoleRow), permissions: data.permissions || [], user_count: 0 },
      error: null,
    };
  } catch (err: any) {
    return { role: null, error: err.message || 'Unknown error' };
  }
}

export async function updateAdminRole(
  id: string,
  input: RoleWriteInput
): Promise<{ role: AdminRoleRow | null; error: string | null }> {
  try {
    const supabase = createServiceClient();
    const { data: existing, error: loadError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (loadError || !existing) {
      if (isMissingTable(loadError)) return { role: null, error: MIGRATION_HINT };
      return { role: null, error: 'Role not found' };
    }

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) return { role: null, error: 'Role name is required' };
      updates.name = name;
    }
    if (input.description !== undefined) updates.description = input.description.trim();
    if (input.permissions !== undefined) {
      updates.permissions = cleanPermissions(input.permissions, existing.slug);
    }

    if (Object.keys(updates).length === 0) {
      return { role: null, error: 'No fields to update' };
    }

    const { data, error } = await supabase
      .from('admin_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { role: null, error: error.message };

    if (updates.permissions) {
      await supabase
        .from('admin_users')
        .update({ permissions: updates.permissions })
        .eq('role', existing.slug);
    }

    const counts = await userCounts(supabase);
    return {
      role: {
        ...(data as AdminRoleRow),
        permissions: data.permissions || [],
        user_count: counts[existing.slug] || 0,
      },
      error: null,
    };
  } catch (err: any) {
    return { role: null, error: err.message || 'Unknown error' };
  }
}

export async function deleteAdminRole(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = createServiceClient();
    const { data: existing, error: loadError } = await supabase
      .from('admin_roles')
      .select('id, slug, is_system')
      .eq('id', id)
      .single();

    if (loadError || !existing) {
      if (isMissingTable(loadError)) return { error: MIGRATION_HINT };
      return { error: 'Role not found' };
    }
    if (existing.is_system || existing.slug === 'super_admin' || existing.slug === 'admin') {
      return { error: 'Built-in roles cannot be deleted' };
    }

    const { count } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', existing.slug);

    if ((count || 0) > 0) {
      return { error: `Reassign ${count} user${count === 1 ? '' : 's'} before deleting this role` };
    }

    const { error } = await supabase.from('admin_roles').delete().eq('id', id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}
