import { NextResponse, NextRequest } from "next/server";
import { z as zod } from "zod";
import { findUserByPhone } from '@/lib/mock-auth-data';

// Schema validation with zod
const sendOTPSchema = zod.object({
    phone: zod.string().min(10, "Phone number must be at least 10 digits"),
});

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

// Generate random 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received OTP request for:', body.phone);

        // Validate input data
        const parsedBody = sendOTPSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
        }

        const { phone } = parsedBody.data;

        // Check if user exists with this phone number
        const user = findUserByPhone(phone);
        if (!user) {
            return NextResponse.json({ error: "No account found with this phone number" }, { status: 404 });
        }

        // Check rate limiting (max 3 attempts per 15 minutes)
        const existingOTP = otpStore.get(phone);
        if (existingOTP && existingOTP.attempts >= 3 && Date.now() < existingOTP.expires) {
            return NextResponse.json({ 
                error: "Too many OTP requests. Please try again later." 
            }, { status: 429 });
        }

        // Generate new OTP
        const otp = generateOTP();
        const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
        const attempts = existingOTP ? existingOTP.attempts + 1 : 1;

        // Store OTP
        otpStore.set(phone, { otp, expires, attempts });

        // In production, send OTP via SMS service
        console.log(`OTP for ${phone}: ${otp}`);

        return NextResponse.json({
            message: "OTP sent successfully",
            // In development, return OTP for testing (remove in production)
            otp: process.env.NODE_ENV === 'development' ? otp : undefined,
            expires: expires
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, otp } = body;

        if (!phone || !otp) {
            return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
        }

        // Get stored OTP
        const storedOTP = otpStore.get(phone);
        if (!storedOTP) {
            return NextResponse.json({ error: "No OTP found for this phone number" }, { status: 404 });
        }

        // Check if OTP expired
        if (Date.now() > storedOTP.expires) {
            otpStore.delete(phone);
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

        // Verify OTP
        if (storedOTP.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // OTP verified successfully, remove from store
        otpStore.delete(phone);

        return NextResponse.json({
            message: "OTP verified successfully",
            verified: true
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
    }
}
