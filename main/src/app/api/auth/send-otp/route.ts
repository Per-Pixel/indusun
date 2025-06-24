import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
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
=======
import { sendOTP, isValidPhoneNumber, formatPhoneNumber } from '@/data/mockOTP';
import { getUserByPhone } from '@/data/mockUsers';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate input
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd
      );
    }

    // Check if user exists with this phone number
<<<<<<< HEAD
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
=======
    const user = getUserByPhone(phone);
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
        { status: 404 }
      );
    }

    // Send OTP
    const result = await sendOTP(phone);

    if (result.success) {
      // In development, include the OTP in response for testing
      const responseData: any = {
        message: result.message,
        phone: formatPhoneNumber(phone)
      };

      if (process.env.NODE_ENV === 'development') {
        // Get the OTP for development purposes
        const { getOTPForDevelopment } = await import('@/data/mockOTP');
        const otp = getOTPForDevelopment(phone);
        if (otp) {
          responseData.otp = otp;
        }
      }

      return NextResponse.json(responseData, { status: 200 });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Send OTP API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd
  }
}
