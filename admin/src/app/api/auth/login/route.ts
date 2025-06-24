import { NextResponse, NextRequest } from "next/server";
const bcrypt = require('bcrypt');
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt-utils';
<<<<<<< HEAD
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
=======
import { User } from '../../../../data/mockUsers';

interface LoginCredentials {
  [key: string]: {
    password: string;
    user: User | undefined;
  };
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('🔍 Admin login attempt for email:', email);

<<<<<<< HEAD
    // Get user from database (admin role only)
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email.toLowerCase(), 'admin']
    );

    console.log('📊 Database query result:', result.rows.length, 'users found');

    if (result.rows.length === 0) {
=======
    let user = null;    // First, try to authenticate with mock admin users
    try {
      const { mockAdminUsers } = await import('../../../../data/mockUsers');
      const mockLoginCredentials: LoginCredentials = {
        'amit.verma@indusun.com': {
          password: 'admin123',
          user: mockAdminUsers.find(u => u.email === 'amit.verma@indusun.com')
        },
        'sneha.patel@indusun.com': {
          password: 'admin123',
          user: mockAdminUsers.find(u => u.email === 'sneha.patel@indusun.com')
        }
      };

      const mockCredentials = mockLoginCredentials[email.toLowerCase()];
      if (mockCredentials?.user?.role === 'admin' && mockCredentials.password === password) {
        user = mockCredentials.user;
        console.log('✅ Mock admin authenticated:', user.name);
      } else {
        console.log('❌ Mock admin credentials not found or invalid for:', email.toLowerCase());
        console.log('Available admin emails:', Object.keys(mockLoginCredentials).filter(key =>
          mockLoginCredentials[key].user?.role === 'admin'
        ));
      }
    } catch (importError) {
      console.error('❌ Mock data import failed:', importError);
    }

    // If no mock user found, try database (but prioritize mock data for development)
    if (!user) {
      try {
        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1 AND role = $2',
          [email.toLowerCase(), 'admin']
        );

        if (result.rows.length === 0) {
          console.log('❌ No admin user found in database for:', email.toLowerCase());
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const dbUser = result.rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, dbUser.password);
        if (!passwordMatch) {
          console.log('❌ Database password mismatch for admin:', email.toLowerCase());
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        user = dbUser;
        console.log('✅ Database admin authenticated:', user.name);    } catch (error) {
      const dbError = error as Error;
      console.log('❌ Database not available for admin login:', dbError.message);
        return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
      }
    }

    // Final check - ensure we have a user
    if (!user) {
      console.log('❌ No admin user authenticated for:', email.toLowerCase());
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check JWT_SECRET before generating token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined for admin app');
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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