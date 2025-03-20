import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const accessToken = request.cookies.get("access_token")?.value;
    
    // If no token, user is not authenticated
    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Verify the token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json(
        { authenticated: false, message: "Server configuration error" },
        { status: 500 }
      );
    }
    
    try {
      // Decode and verify the token
      const decoded = jwt.verify(accessToken, jwtSecret) as { id: string; email: string; name: string };
      
      // Get user from database to ensure they still exist and get latest data
      const userResult = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
      
      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { authenticated: false, message: "User not found" },
          { status: 401 }
        );
      }
      
      const user = userResult.rows[0];
      
      // Return user data
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
      
    } catch (error) {
      // Token verification failed
      if (error instanceof jwt.JsonWebTokenError) {
        // Try to use refresh token
        const refreshToken = request.cookies.get("refresh_token")?.value;
        
        if (refreshToken) {
          try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, jwtSecret) as { id: string };
            
            // Get user from database
            const userResult = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
            
            if (userResult.rows.length === 0) {
              return NextResponse.json(
                { authenticated: false, message: "User not found" },
                { status: 401 }
              );
            }
            
            const user = userResult.rows[0];
            
            // Generate new access token
            const newAccessToken = jwt.sign(
              { id: user.id, email: user.email, name: user.name },
              jwtSecret,
              { expiresIn: "1h" }
            );
            
            // Create response with new access token
            const response = NextResponse.json({
              authenticated: true,
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              }
            });
            
            // Set new access token cookie
            response.cookies.set("access_token", newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60, // 1 hour in seconds
            });
            
            return response;
          } catch (refreshError) {
            // Refresh token is also invalid
            return NextResponse.json(
              { authenticated: false, message: "Session expired" },
              { status: 401 }
            );
          }
        } else {
          // No refresh token available
          return NextResponse.json(
            { authenticated: false, message: "Session expired" },
            { status: 401 }
          );
        }
      }
      
      // Other errors
      console.error("Error verifying token:", error);
      return NextResponse.json(
        { authenticated: false, message: "Authentication error" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Server error in /api/auth/me:", error);
    return NextResponse.json(
      { authenticated: false, message: "Server error" },
      { status: 500 }
    );
  }
}
