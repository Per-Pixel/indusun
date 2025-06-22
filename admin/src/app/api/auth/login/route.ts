import { NextResponse, NextRequest } from "next/server";
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt-utils';
import { User } from '../../../../data/mockUsers';

interface LoginCredentials {
  [key: string]: {
    password: string;
    user: User | undefined;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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