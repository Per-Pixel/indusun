import { NextResponse, NextRequest } from "next/server";
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email.toLowerCase(), 'admin']
    );

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