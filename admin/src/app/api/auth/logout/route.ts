import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { blacklistToken } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    // Get the admin token from cookies
    const adminToken = request.cookies.get("admin_token")?.value;

    // If token exists, blacklist it
    if (adminToken) {
      try {
        // Decode token without verification to get payload
        const decoded = jwt.decode(adminToken) as {
          jti?: string;
          exp?: number;
        };

        // If token has jti and exp, blacklist it
        if (decoded && decoded.jti && decoded.exp) {
          await blacklistToken(decoded.jti, decoded.exp);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // Continue with logout even if blacklisting fails
      }
    }

    // Create response
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear the admin token cookie
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
