import { NextResponse, NextRequest } from "next/server";
import { signInWithPassword } from "@/services/supabaseAuth";
import { canAccessAdmin } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('🔍 Admin login attempt for email:', email);

    // Use Supabase Auth for authentication
    const { user, error } = await signInWithPassword(email, password);

    if (error || !user) {
      console.log('❌ Login failed:', error?.message || 'Unknown error');
      return NextResponse.json(
        { error: error?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!canAccessAdmin(user)) {
      console.log('❌ User is not an admin:', user.email);
      return NextResponse.json(
        { error: "Unauthorized - Admin access only" },
        { status: 403 }
      );
    }

    console.log('✅ Admin authenticated via Supabase:', user.name);

    // Return success response
    // Note: Supabase automatically sets the session cookie via middleware
    return NextResponse.json({
      message: "Admin login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}