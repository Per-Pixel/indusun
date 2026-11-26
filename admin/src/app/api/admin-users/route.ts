// GET /api/admin-users — list all admin users
// POST /api/admin-users — create a new admin (super_admin only)

import { NextRequest, NextResponse } from 'next/server';
import { listAdminUsers, createAdminUser } from '@/services/adminUserService';
import { requireStaff } from '@/lib/adminAccess';
import { assertRoleAssignable } from '@/services/adminRoleService';
import { ALL_PERMISSION_KEYS } from '@/lib/permissions';

export async function GET() {
  const access = await requireStaff('user_management');
  if (access.denied) return access.denied;

  try {
    const { users, error } = await listAdminUsers();

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (err: any) {
    console.error('GET /api/admin-users error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to list admin users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const access = await requireStaff('user_management');
  if (access.denied) return access.denied;

  try {
    const body = await req.json();
    const { name, email, password, phone, permissions } = body;
    const role = (body.role as string) || 'admin';

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (body.accountKind === 'staff' && (role === 'admin' || role === 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Staff accounts cannot use the Admin role. Choose another role.' },
        { status: 400 }
      );
    }

    if (role === 'super_admin' && access.user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only a super admin can create another super admin' },
        { status: 403 }
      );
    }

    const roleError = await assertRoleAssignable(role);
    if (roleError) {
      return NextResponse.json({ success: false, error: roleError }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const { user, error } = await createAdminUser({
      name,
      email,
      password,
      phone,
      role,
      permissions: role === 'super_admin' ? ALL_PERMISSION_KEYS : (permissions || []),
    });

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin-users error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
