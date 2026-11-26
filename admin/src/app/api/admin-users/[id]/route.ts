// GET /api/admin-users/[id] — get a single admin user
// PUT /api/admin-users/[id] — update an admin user
// DELETE /api/admin-users/[id] — delete an admin user

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, updateAdminUser, deleteAdminUser } from '@/services/adminUserService';
import { requireStaff } from '@/lib/adminAccess';
import { assertRoleAssignable } from '@/services/adminRoleService';
import { ALL_PERMISSION_KEYS } from '@/lib/permissions';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaff('user_management');
  if (access.denied) return access.denied;

  try {
    const { id } = await params;
    const { user, error } = await getAdminUser(id);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error('GET /api/admin-users/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to get admin user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaff('user_management');
  if (access.denied) return access.denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const { callerRole: _callerRole, callerId: _callerId, callerPermissions: _callerPermissions, ...updateData } = body;

    if (updateData.email !== undefined && access.user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only a super admin can change an email address' },
        { status: 403 }
      );
    }

    if (access.user.id === id && updateData.role && updateData.role !== access.user.role) {
      return NextResponse.json(
        { success: false, error: 'You cannot change your own role' },
        { status: 403 }
      );
    }

    if (updateData.role === 'super_admin' && access.user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only a super admin can grant the Super Admin role' },
        { status: 403 }
      );
    }

    if (updateData.role) {
      const roleError = await assertRoleAssignable(updateData.role);
      if (roleError) {
        return NextResponse.json({ success: false, error: roleError }, { status: 400 });
      }
      if (updateData.role === 'super_admin') updateData.permissions = ALL_PERMISSION_KEYS;
    }

    const { user, error } = await updateAdminUser(id, updateData);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error('PUT /api/admin-users/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaff('user_management');
  if (access.denied) return access.denied;

  try {
    const { id } = await params;

    if (access.user.id === id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    const existing = await getAdminUser(id);
    if (existing.user?.role === 'super_admin' && access.user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only a super admin can delete a super admin account' },
        { status: 403 }
      );
    }

    const { error } = await deleteAdminUser(id);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admin-users/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin user' },
      { status: 500 }
    );
  }
}
