// POST /api/admin-users/[id]/reset-password — super_admin resets another admin's password

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, resetAdminPassword } from '@/services/adminUserService';
import { requireStaff } from '@/lib/adminAccess';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaff('user_management');
  if (access.denied) return access.denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const { newPassword } = body;

    if (access.user.id === id) {
      return NextResponse.json(
        { success: false, error: 'Change your own password from Settings' },
        { status: 403 }
      );
    }

    const existing = await getAdminUser(id);
    if (existing.user?.role === 'super_admin' && access.user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only a super admin can reset a super admin password' },
        { status: 403 }
      );
    }

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const { error } = await resetAdminPassword(id, newPassword);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (err: any) {
    console.error('POST /api/admin-users/[id]/reset-password error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
