import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get the admin token from cookies
    const adminToken = request.cookies.get("admin_token")?.value;
    
    // If no token, user is not authenticated
    if (!adminToken) {
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
      const decoded = jwt.verify(adminToken, jwtSecret) as { 
        id: string; 
        email: string; 
        name: string;
        role: string;
      };
      
      // Verify the user is an admin or super_admin
      if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
        return NextResponse.json(
          { authenticated: false, message: "Unauthorized" },
          { status: 403 }
        );
      }

      // Get user from database to ensure they still exist and get latest data
      const userResult = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = $1 AND (role = $2 OR role = $3)',
        [decoded.id, 'admin', 'super_admin']
      );
      
      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { authenticated: false, message: "User not found or not an admin" },
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
          email: user.email,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error("Token verification error:", error);
      
      // Token is invalid or expired
      return NextResponse.json(
        { authenticated: false, message: "Session expired" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Authentication check error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Authentication error" },
      { status: 500 }
    );
  }
}
