// GET /api/admin-users/[id] — get a single admin user
// PUT /api/admin-users/[id] — update an admin user
// DELETE /api/admin-users/[id] — delete an admin user

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, updateAdminUser, deleteAdminUser } from '@/services/adminUserService';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  try {
    const { id } = await params;
    const body = await req.json();
    const { callerRole, callerId, ...updateData } = body;

    // Prevent self-role-escalation
    if (callerId === id && updateData.role) {
      return NextResponse.json(
        { success: false, error: 'You cannot change your own role' },
        { status: 403 }
      );
    }

    // Only super_admin can change roles
    if (updateData.role && callerRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can change user roles' },
        { status: 403 }
      );
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
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const callerRole = searchParams.get('callerRole');
    const callerId = searchParams.get('callerId');

    // Prevent self-deletion
    if (callerId === id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    // Only super_admin can delete admins
    if (callerRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can delete admin accounts' },
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
