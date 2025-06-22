import { NextResponse, NextRequest } from "next/server";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { z as zod } from "zod";
import { hasTooManyAttempts, recordFailedAttempt } from "@/lib/auth-utils";
import { generateToken } from "@/lib/jwt-utils";
import { getUserByEmail, getUserByPhone, mockLoginCredentials } from "@/data/mockUsers";

// Enhanced schema validation to support both email and phone login
const emailLoginSchema = zod.object({
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});

const phoneLoginSchema = zod.object({
    phone: zod.string().min(10, "Invalid phone number"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received login request:', body);

        // Determine login method (email or phone)
        const isEmailLogin = !!body.email;
        const isPhoneLogin = !!body.phone;

        if (!isEmailLogin && !isPhoneLogin) {
            return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
        }

        let user;
        let identifier;

        if (isEmailLogin) {
            // Validate email login
            const parsedBody = emailLoginSchema.safeParse(body);
            if (!parsedBody.success) {
                return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
            }

            const { email, password } = parsedBody.data;
            identifier = email.toLowerCase();

            // Check mock users first (for development)
            const mockCredentials = mockLoginCredentials[identifier];
            if (mockCredentials && mockCredentials.password === password) {
                user = mockCredentials.user;
                console.log('✅ Mock user authenticated:', user.name);
            } else {
                // Fallback to database only if no mock user found
                try {
                    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [identifier]);
                    if (existingUser.rows.length === 0) {
                        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                    }

                    const dbUser = existingUser.rows[0];
                    const passwordMatch = await bcrypt.compare(password, dbUser.password);
                    if (!passwordMatch) {
                        recordFailedAttempt(identifier);
                        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                    }
                    user = dbUser;
                } catch (dbError) {
                    console.log('Database not available, using mock data only');
                    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                }
            }
        } else {
            // Validate phone login
            const parsedBody = phoneLoginSchema.safeParse(body);
            if (!parsedBody.success) {
                return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
            }

            const { phone, password } = parsedBody.data;
            identifier = phone;

            // Check mock users first (for development)
            const mockCredentials = mockLoginCredentials[phone];
            if (mockCredentials && mockCredentials.password === password) {
                user = mockCredentials.user;
                console.log('✅ Mock user authenticated via phone:', user.name);
            } else {
                // Fallback to database only if no mock user found
                try {
                    const existingUser = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
                    if (existingUser.rows.length === 0) {
                        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                    }

                    const dbUser = existingUser.rows[0];
                    const passwordMatch = await bcrypt.compare(password, dbUser.password);
                    if (!passwordMatch) {
                        recordFailedAttempt(phone);
                        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                    }
                    user = dbUser;
                } catch (dbError) {
                    console.log('Database not available, using mock data only');
                    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                }
            }
        }

        // Prevent brute-force attacks
        if (hasTooManyAttempts && hasTooManyAttempts(identifier)) {
            return NextResponse.json(
                { error: "Too many failed attempts. Try again later." },
                { status: 429 }
            );
        }

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
                phone: user.phone,
                role: user.role || 'customer' // Default to customer if role is not set
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
