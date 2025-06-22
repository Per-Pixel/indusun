import { NextResponse, NextRequest } from "next/server";
import jwt from 'jsonwebtoken';
import { z as zod } from "zod";
import { generateToken } from "@/lib/jwt-utils";
import { authenticateCustomer } from '@/lib/mock-auth-data';

// schema validation with zod
const emailLoginSchema = zod.object({
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});

const phoneLoginSchema = zod.object({
    phone: zod.string().min(10, "Phone number must be at least 10 digits"),
    otp: zod.string().length(6, "OTP must be 6 digits"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received login request for:', body.email || body.phone);

        let parsedBody;
        let authResponse;

        // Determine authentication method and validate accordingly
        if (body.email && body.password) {
            // Email + Password authentication
            parsedBody = emailLoginSchema.safeParse(body);
            if (!parsedBody.success) {
                return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
            }

            const { email, password } = parsedBody.data;
            authResponse = await authenticateCustomer({ email, password });
        } else if (body.phone && body.otp) {
            // Phone + OTP authentication
            parsedBody = phoneLoginSchema.safeParse(body);
            if (!parsedBody.success) {
                return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
            }

            const { phone, otp } = parsedBody.data;
            authResponse = await authenticateCustomer({ phone, otp });
        } else {
            return NextResponse.json({ error: "Invalid authentication method" }, { status: 400 });
        }

        if (!authResponse.success || !authResponse.user) {
            return NextResponse.json({
                error: authResponse.message || "Invalid credentials"
            }, { status: 401 });
        }

        const user = authResponse.user;

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
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                customer_data: user.customer_data
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
        console.error('Login error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
