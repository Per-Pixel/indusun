import { NextRequest, NextResponse } from 'next/server';
import { z as zod } from 'zod';
import pool from '@/lib/db';
import { verifyOTP, clearFailedAttempts } from '@/lib/auth-utils';
import { generateToken } from '@/lib/jwt-utils';
const jwt = require('jsonwebtoken');

// Schema validation
const verifyOTPSchema = zod.object({
  phone: zod.string().min(10, "Phone number must be at least 10 characters"),
  otp: zod.string().length(6, "OTP must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received OTP verification for phone:', body.phone);

    // Validate input data
    const parsedBody = verifyOTPSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
    }

    const { phone, otp } = parsedBody.data;

    // Verify OTP with detailed logging
    console.log('🔐 Verifying OTP for phone:', phone, 'with code:', otp);
    const isValidOTP = verifyOTP(phone, otp);
    console.log('✅ OTP verification result:', isValidOTP);

    if (!isValidOTP) {
      console.log('❌ OTP verification failed for phone:', phone);
      return NextResponse.json({
        error: "Invalid or expired OTP"
      }, { status: 401 });
    }

    // Get user from database
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND role = $2',
      [phone, 'customer']
    );
    
    if (existingUser.rows.length === 0) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    const user = existingUser.rows[0];

    // Clear any failed login attempts for this user
    clearFailedAttempts(phone);

    // Generate JWT tokens
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Generate short-lived access token
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }, '1h');

    // Generate long-lived refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      message: "OTP verification successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer'
      }
    });

    // Set cookies in the response
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 // 1 hour in seconds
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });

    return response;

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: "OTP verification failed" }, { status: 500 });
  }
}
