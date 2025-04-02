import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import pool from '@/lib/db';
import { z as zod } from "zod";

const updateRoleSchema = zod.object({
  userId: zod.number(),
  role: zod.enum(['customer', 'broker', 'admin'])
});

export async function PUT(req: NextRequest) {
  return withRole(req, ['admin'], async (req, user) => {
    try {
      const body = await req.json();
      
      // Validate input
      const parsedBody = updateRoleSchema.safeParse(body);
      if (!parsedBody.success) {
        return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
      }
      
      const { userId, role } = parsedBody.data;
      
      // Update user role
      const result = await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
        [role, userId]
      );
      
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        message: 'User role updated successfully',
        user: result.rows[0]
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
  });
}
