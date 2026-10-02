// POST /api/admin-users/[id]/reset-password — super_admin resets another admin's password

import { NextRequest, NextResponse } from 'next/server';
import { resetAdminPassword } from '@/services/adminUserService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { newPassword, callerRole, callerId } = body;

    // Only super_admin can reset passwords
    if (callerRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can reset passwords' },
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
