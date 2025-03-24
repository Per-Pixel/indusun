import { NextResponse, NextRequest } from "next/server";
import passport from "passport";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

// Helper function to initialize passport middleware
const initializePassport = () => {
  return (req: any, res: any, next: any) => {
    passport.initialize()(req, res, next);
  };
};

// Add debug logging
console.log("Facebook callback route loaded");
console.log("Environment variables check:", {
  hasClientId: !!process.env.FACEBOOK_CLIENT_ID,
  hasClientSecret: !!process.env.FACEBOOK_CLIENT_SECRET,
  hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
  hasJwtSecret: !!process.env.JWT_SECRET
});

export async function GET(request: NextRequest) {
  // Create a URL object from the request URL
  const url = new URL(request.url);
  console.log("Facebook callback URL:", url.toString());
  
  // Create a custom handler for the passport authenticate
  return new Promise((resolve) => {
    const authenticate = passport.authenticate('facebook', { 
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
      session: false,
    }, async (err: Error | null, user: any) => {
      if (err || !user) {
        // Redirect to login page with error
        console.error("Facebook callback authentication error:", err);
        return resolve(NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=facebook_auth_failed`));
      }
      
      try {
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
      } catch (error) {
        console.error("Error in Facebook callback:", error);
        return resolve(NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`));
      }
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
    try {
      console.log("Initializing passport and running authenticate in callback");
      initializePassport()(req, res, () => {
        // Use type assertion to resolve the "not callable" error
        console.log("Calling authenticate function in callback");
        (authenticate as any)(req, res);
      });
    } catch (error) {
      console.error("Error during passport initialization in callback:", error);
      resolve(NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`));
    }
  });
}
