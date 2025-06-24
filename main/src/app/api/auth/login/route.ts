import { NextResponse, NextRequest } from "next/server";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import pool from '@/lib/db';
import { z as zod } from "zod";
import { hasTooManyAttempts, recordFailedAttempt, clearFailedAttempts } from "@/lib/auth-utils";
import { generateToken } from "@/lib/jwt-utils";

// schema validation with zod - support both email and phone login
const emailLoginSchema = zod.object({
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});

const phoneLoginSchema = zod.object({
    phone: zod.string().min(10, "Phone number must be at least 10 characters"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received login request for:', body.email || body.phone);

        // Validate input data - support both email and phone login
        let parsedBody;
        let loginField;
        let loginValue;

        if (body.email) {
            parsedBody = emailLoginSchema.safeParse(body);
            loginField = 'email';
            loginValue = body.email;
        } else if (body.phone) {
            parsedBody = phoneLoginSchema.safeParse(body);
            loginField = 'phone';
            loginValue = body.phone;
        } else {
            return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
        }

        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
        }

        const { password } = parsedBody.data;

        // Prevent brute-force attacks
        if (hasTooManyAttempts(loginValue)) {
            return NextResponse.json(
                { error: "Too many failed attempts. Try again later." },
                { status: 429 }
            );
        }

        // check if the user exists (support both email and phone lookup)
        const existingUser = await pool.query(
            `SELECT * FROM users WHERE ${loginField} = $1 AND role = $2`,
            [loginValue, 'customer']
        );
        if (existingUser.rows.length === 0) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        const user = existingUser.rows[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            recordFailedAttempt(loginValue);
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Clear any failed login attempts for this user
        clearFailedAttempts(loginValue);

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
