import { NextResponse, NextRequest } from "next/server";
import passport from "passport";
import { Strategy as FacebookStrategy, Profile } from "passport-facebook";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

// Initialize passport with Facebook strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID || "",
            clientSecret: process.env.FACEBOOK_APP_SECRET || "",
            callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
            profileFields: ['id', 'displayName', 'email'],
            passReqToCallback: true,
        },
        async (_req: any, accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
            try {
                // Facebook sometimes doesn't provide email directly
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`;
                const name = profile.displayName;

                // Check if user already exists
                const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                let user;
                if (existingUser.rows.length === 0) {
                    // Create new user
                    const newUser = await pool.query(
                        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
                        [name, email]
                    );
                    user = newUser.rows[0];
                } else {
                    user = existingUser.rows[0];
                }

                return done(null, user);
            } catch (error) {
                console.error("Facebook auth error:", error);
                return done(error, null);
            }
        }
    )
);

// Configure passport session handling (if not already configured in Google auth)
if (!passport._serializers || passport._serializers.length === 0) {
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
}

// Helper function to initialize passport middleware
const initializePassport = () => {
    return (req: any, res: any, next: any) => {
        passport.initialize()(req, res, next);
    };
};

export async function GET(request: NextRequest) {
    // Create a URL object from the request URL
    const url = new URL(request.url);
    
    // Create a custom handler for the passport authenticate
    return new Promise((resolve) => {
        const authenticate = passport.authenticate('facebook', { 
            scope: ['email'],
            session: false,
        }, (err: Error | null, user: any) => {
            if (err || !user) {
                // Redirect to login page with error
                return resolve(NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=facebook_auth_failed`));
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
        };
        
        // Initialize passport and run authenticate
        initializePassport()(req, res, () => {
            // Use type assertion to resolve the "not callable" error
            (authenticate as any)(req, res);
        });
    });
}