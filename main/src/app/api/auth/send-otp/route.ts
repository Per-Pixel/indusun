import { NextRequest, NextResponse } from 'next/server';
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
  }
}
