import { NextRequest, NextResponse } from 'next/server';
import { z as zod } from 'zod';
import pool from '@/lib/db';
import { generateOTP, storeOTP, hasTooManyAttempts } from '@/lib/auth-utils';

// Schema validation
const sendOTPSchema = zod.object({
  phone: zod.string().min(10, "Phone number must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 OTP endpoint called');
    const body = await request.json();
    console.log('📱 Received OTP request for phone:', body.phone);

    // Validate input data
    const parsedBody = sendOTPSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
    }

    const { phone } = parsedBody.data;

    // Prevent brute-force attacks
    if (hasTooManyAttempts(phone)) {
      return NextResponse.json(
        { error: "Too many OTP requests. Try again later." },
        { status: 429 }
      );
    }

    // Check if user exists with this phone number
    console.log('🔍 Checking database for phone:', phone);
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND role = $2',
      [phone, 'customer']
    );

    console.log('📊 Database query result:', existingUser.rows.length, 'users found');

    if (existingUser.rows.length === 0) {
      console.log('❌ No user found with phone:', phone);
      return NextResponse.json({
        error: "No account found with this phone number"
      }, { status: 404 });
    }

    const user = existingUser.rows[0];

    // Generate OTP
    console.log('🎲 Generating OTP...');
    const otp = generateOTP();
    console.log('✅ OTP generated:', otp);

    // Store OTP (in production, this would be stored in Redis or database)
    console.log('💾 Storing OTP...');
    storeOTP(phone, otp);
    console.log('✅ OTP stored successfully');

    // In development, log the OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Development OTP for ${phone}: ${otp}`);
    }

    // In production, you would send SMS here
    // await sendSMS(phone, `Your Indusun login OTP is: ${otp}. Valid for 10 minutes.`);

    return NextResponse.json({
      message: "OTP sent successfully",
      // In development, include OTP in response for testing
      ...(process.env.NODE_ENV === 'development' && { 
        otp: otp,
        debug: true,
        note: "OTP included in response for development testing"
      })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
