import { NextResponse, NextRequest } from "next/server";
const bcrypt = require('bcrypt');
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt-utils';
import { AdminPermissions } from '@/lib/mock-auth-data';

// Generate permissions based on user role
function generatePermissions(role: string): AdminPermissions {
  const basePermissions: AdminPermissions = {
    // Dashboard permissions
    can_view_dashboard: true,
    can_view_analytics: role === 'super_admin',

    // User management permissions
    can_view_users: true,
    can_edit_users: true,
    can_delete_users: role === 'super_admin',
    can_create_users: true,

    // Admin management permissions
    can_view_admins: role === 'super_admin',
    can_edit_admins: role === 'super_admin',
    can_delete_admins: role === 'super_admin',
    can_create_admins: role === 'super_admin',
    can_view_admin_details: role === 'super_admin',

    // Transaction permissions
    can_view_transactions: true,
    can_edit_transactions: true,
    can_delete_transactions: role === 'super_admin',
    can_create_transactions: true,

    // Property permissions
    can_view_properties: true,
    can_edit_properties: true,
    can_delete_properties: role === 'super_admin',
    can_create_properties: true,

    // System permissions
    can_export_data: role === 'super_admin',
    can_import_data: role === 'super_admin',
    can_view_logs: role === 'super_admin',
    can_manage_settings: role === 'super_admin'
  };

  return basePermissions;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('🔍 Admin login attempt for email:', email);

    // Get user from database (admin role only)
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email.toLowerCase(), 'admin']
    );

    console.log('📊 Database query result:', result.rows.length, 'users found');

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate admin token
    const adminToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }, '4h'); // Longer session for admins

    // Create response
    const response = NextResponse.json({
      message: "Admin login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // Set admin token cookie
    response.cookies.set("admin_token", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      path: '/',
      maxAge: 4 * 60 * 60 // 4 hours in seconds
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}