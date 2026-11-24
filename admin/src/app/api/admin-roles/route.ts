import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/adminAccess';
import { createAdminRole, listAdminRoles } from '@/services/adminRoleService';

export async function GET() {
  const access = await requireStaff();
  if (access.denied) return access.denied;

  const { roles, needsMigration, error } = await listAdminRoles();
  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
  return NextResponse.json({ success: true, roles, needsMigration });
}

export async function POST(req: NextRequest) {
  const access = await requireStaff('role_management');
  if (access.denied) return access.denied;

  try {
    const body = await req.json();
    const { role, error } = await createAdminRole({
      name: body.name,
      description: body.description,
      permissions: body.permissions,
    });
    if (error || !role) {
      return NextResponse.json({ success: false, error: error || 'Failed to create role' }, { status: 400 });
    }
    return NextResponse.json({ success: true, role }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin-roles error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create role' }, { status: 500 });
  }
}
