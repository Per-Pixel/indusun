import { NextResponse } from 'next/server';
import { getCurrentUser, type AuthUser } from '@/services/supabaseAuth';
import { canAccessAdmin, userHasPermission } from '@/lib/permissions';

export async function requireStaff(permission?: string): Promise<
  { user: AuthUser; denied: null } | { user: null; denied: NextResponse }
> {
  const { user, error } = await getCurrentUser();
  if (error || !user || !canAccessAdmin(user)) {
    return {
      user: null,
      denied: NextResponse.json({ success: false, error: 'Not signed in' }, { status: 401 }),
    };
  }
  if (user.status === 'inactive') {
    return {
      user: null,
      denied: NextResponse.json({ success: false, error: 'This account is inactive' }, { status: 403 }),
    };
  }
  if (permission && !userHasPermission(user.role, user.permissions, permission)) {
    return {
      user: null,
      denied: NextResponse.json(
        { success: false, error: 'You do not have permission for this action' },
        { status: 403 }
      ),
    };
  }
  return { user, denied: null };
}

/** 403 when the signed-in user has none of the listed permissions. */
export function forbidUnless(user: AuthUser, ...permissions: string[]): NextResponse | null {
  if (permissions.some((key) => userHasPermission(user.role, user.permissions, key))) return null;
  return NextResponse.json(
    { success: false, error: 'You do not have permission for this action' },
    { status: 403 }
  );
}
