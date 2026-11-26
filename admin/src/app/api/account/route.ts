// PUT /api/account — the signed-in person updates their own profile.
// Office staff may change name, phone, and photo. Email and password stay with a super admin.

import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/adminAccess';
import { isOfficeStaff } from '@/lib/permissions';
import { updateAdminUser, type UpdateAdminInput } from '@/services/adminUserService';

const STAFF_FIELDS = ['name', 'phone', 'avatar_url'] as const;
const FULL_FIELDS = ['name', 'phone', 'avatar_url', 'bio', 'location', 'website', 'language', 'timezone'] as const;

export async function PUT(req: NextRequest) {
  const access = await requireStaff();
  if (access.denied) return access.denied;

  try {
    const body = await req.json();
    const limited = isOfficeStaff(access.user.role);

    if (limited && (body.email !== undefined || body.password !== undefined || body.role !== undefined)) {
      return NextResponse.json(
        { success: false, error: 'You can change your name, photo, and phone number. Email and password are set by a super admin.' },
        { status: 403 }
      );
    }

    const allowed = limited ? STAFF_FIELDS : FULL_FIELDS;
    const input: UpdateAdminInput = {};
    for (const key of allowed) {
      if (body[key] !== undefined) (input as Record<string, unknown>)[key] = body[key];
    }

    if (typeof input.name === 'string' && !input.name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (Object.keys(input).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const { user, error } = await updateAdminUser(access.user.id, input);
    if (error || !user) {
      return NextResponse.json({ success: false, error: error || 'Could not save profile' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('PUT /api/account error:', err);
    return NextResponse.json({ success: false, error: 'Could not save profile' }, { status: 500 });
  }
}
