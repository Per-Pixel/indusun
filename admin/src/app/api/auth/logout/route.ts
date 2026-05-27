import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/services/supabaseAuth";

export async function POST(request: NextRequest) {
  try {
    // Sign out using Supabase Auth
    const { error } = await signOut();

    if (error) {
      console.error("Supabase logout error:", error);
      // Continue anyway - we'll clear cookies client-side too
    }

    // Create response
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Supabase middleware handles cookie clearing, but we'll ensure it's cleared
    // Note: The session cookie is managed by Supabase SSR

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
