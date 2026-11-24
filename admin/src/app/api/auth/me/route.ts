import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/supabaseAuth";
import { canAccessAdmin } from "@/lib/permissions";

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

    if (!canAccessAdmin(user)) {
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
