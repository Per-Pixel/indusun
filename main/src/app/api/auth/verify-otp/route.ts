import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, clearOTPSession, isValidPhoneNumber } from '@/data/mockOTP';
import { getUserByPhone } from '@/data/mockUsers';
import { generateToken } from '@/lib/jwt-utils';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    // Validate input
    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Check if user exists with this phone number
    const user = getUserByPhone(phone);
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
        { status: 404 }
      );
    }

    // Verify OTP
    const result = await verifyOTP(phone, otp);

    if (result.success) {
      // Clear OTP session after successful verification
      clearOTPSession(phone);

      // Generate JWT tokens
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
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
        message: "OTP verified successfully",
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
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
