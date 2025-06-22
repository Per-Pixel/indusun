import { NextResponse, NextRequest } from "next/server";
import { generateToken } from '@/lib/jwt-utils';
import { authenticateAdmin } from '@/lib/mock-auth-data';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Use mock authentication
    const authResponse = await authenticateAdmin({ email, password });

    if (!authResponse.success || !authResponse.user) {
      return NextResponse.json({
        error: authResponse.message || "Invalid credentials"
      }, { status: 401 });
    }

    const user = authResponse.user;

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
        role: user.role,
        permissions: user.permissions,
        department: user.department,
        employee_id: user.employee_id
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