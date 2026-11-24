import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/adminAccess';
import { deleteAdminRole, updateAdminRole } from '@/services/adminRoleService';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaff('role_management');
  if (access.denied) return access.denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const { role, error } = await updateAdminRole(id, {
      name: body.name,
      description: body.description,
      permissions: body.permissions,
    });
    if (error || !role) {
      return NextResponse.json({ success: false, error: error || 'Failed to update role' }, { status: 400 });
    }
    return NextResponse.json({ success: true, role });
  } catch (err: any) {
    console.error('PUT /api/admin-roles/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaff('role_management');
  if (access.denied) return access.denied;

  try {
    const { id } = await params;
    const { error } = await deleteAdminRole(id);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admin-roles/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete role' }, { status: 500 });
  }
}
