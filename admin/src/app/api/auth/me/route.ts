import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/supabaseAuth";

export async function GET(request: NextRequest) {
  try {
    // Get current user from Supabase Auth
    const { user, error } = await getCurrentUser();

    if (error || !user) {
      return NextResponse.json(
        { authenticated: false, message: error?.message || "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the user is an admin or super_admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { authenticated: false, message: "Unauthorized - Admin access only" },
        { status: 403 }
      );
    }

    // Return user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error("Authentication check error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Authentication error" },
      { status: 500 }
    );
  }
}
