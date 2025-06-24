import { NextResponse, NextRequest } from "next/server";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

// Add debug logging
console.log("Google auth route loaded");
console.log("Environment variables check:", {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
    clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length
});

// Initialize passport with Google strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
            passReqToCallback: true,
            prompt: 'consent',
        },
        async (_req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                console.log("Google auth callback received profile:", { 
                    id: profile.id,
                    displayName: profile.displayName,
                    hasEmails: !!profile.emails && profile.emails.length > 0 
                });
                
                // Ensure emails array exists and has at least one entry
                if (!profile.emails || profile.emails.length === 0) {
                    console.error("No email found in profile");
                    return done(new Error("No email found in profile"), undefined);
                }
                
                const email = profile.emails[0].value;
                const name = profile.displayName;

                // Check if user already exists
                const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                let user;
                if (existingUser.rows.length === 0) {
                    console.log("Creating new user with email:", email);
                    // Create new user
                    const newUser = await pool.query(
                        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
                        [name, email]
                    );
                    user = newUser.rows[0];
                } else {
                    console.log("Found existing user with email:", email);
                    user = existingUser.rows[0];
                }

                return done(null, user);
            } catch (error) {
                console.error("Google auth error:", error);
                return done(error as Error, undefined);
            }
        }
    )
);

// Configure passport session handling
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (error) {
        done(error, null);
    }
});

// Helper function to initialize passport middleware
const initializePassport = () => {
    return (req: any, res: any, next: any) => {
        passport.initialize()(req, res, next);
    };
};

export async function GET(request: NextRequest): Promise<Response> {
    console.log("Google auth GET request received");
    // Create a URL object from the request URL
    const url = new URL(request.url);
    console.log("Request URL:", url.toString());

    // Create a custom handler for the passport authenticate
    return new Promise<Response>((resolve) => {
        console.log("Creating passport authenticate handler");
        const authenticate = passport.authenticate('google', { 
            scope: ['profile', 'email'],
            session: false,
            accessType: 'offline',
            prompt: 'consent',
        }, (err: Error | null, user: any) => {
            console.log("Google auth callback result:", { error: !!err, hasUser: !!user });
            if (err || !user) {
                console.error("Authentication error:", err);
                // Redirect to login page with error
                return resolve(NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_auth_failed`));
            }
            
            // Generate JWT tokens
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                console.error("JWT_SECRET is not defined");
                return resolve(NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`));
            }
            
            const accessToken = jwt.sign(
                { id: user.id, email: user.email, name: user.name }, 
                jwtSecret, 
                { expiresIn: "1h" }
            );
            
            const refreshToken = jwt.sign(
                { id: user.id }, 
                jwtSecret, 
                { expiresIn: "7d" }
            );
            
            // Create response with redirect
            const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
            
            // Set cookies
            response.cookies.set("access_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60, // 1 hour in seconds
            });
            
            response.cookies.set("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
            });
            
            return resolve(response);
        });
        
        // Create mock request and response objects that passport can work with
        console.log("Creating mock request and response objects");
        const req: any = {
            url: url.toString(),
            method: request.method,
            headers: Object.fromEntries(request.headers),
            body: null,
            query: Object.fromEntries(url.searchParams),
        };
        
        const res: any = {
            statusCode: 200,
            setHeader: () => {},
            end: () => {},
            getHeader: () => {},
            redirect: (url: string) => {
                console.log("Redirect called with URL:", url);
                resolve(NextResponse.redirect(url));
            }
        };
        
        // Initialize passport and run authenticate
        try {
            console.log("Initializing passport and running authenticate");
            initializePassport()(req, res, () => {
                // Use type assertion to resolve the "not callable" error
                console.log("Calling authenticate function");
                (authenticate as any)(req, res);
            });
        } catch (error) {
            console.error("Error during passport initialization:", error);
            resolve(NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`));
        }
    });
}