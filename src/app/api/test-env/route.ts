import { NextResponse } from "next/server";

export async function GET() {
  // Test environment variables
  const envVars = {
    googleClientId: {
      value: process.env.GOOGLE_CLIENT_ID || "Not set",
      hasQuotes: process.env.GOOGLE_CLIENT_ID?.includes('"') || false,
      isValid: process.env.GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com') || false
    },
    googleClientSecret: {
      value: process.env.GOOGLE_CLIENT_SECRET ? "Set (not showing full value)" : "Not set",
      hasQuotes: process.env.GOOGLE_CLIENT_SECRET?.includes('"') || false
    },
    facebookClientId: {
      value: process.env.FACEBOOK_CLIENT_ID || "Not set",
      hasQuotes: process.env.FACEBOOK_CLIENT_ID?.includes('"') || false
    },
    facebookClientSecret: {
      value: process.env.FACEBOOK_CLIENT_SECRET ? "Set (not showing full value)" : "Not set",
      hasQuotes: process.env.FACEBOOK_CLIENT_SECRET?.includes('"') || false
    },
    jwtSecret: {
      value: process.env.JWT_SECRET ? "Set (not showing for security)" : "Not set",
      hasQuotes: process.env.JWT_SECRET?.includes('"') || false
    },
    appUrl: {
      value: process.env.NEXT_PUBLIC_APP_URL || "Not set",
      hasQuotes: process.env.NEXT_PUBLIC_APP_URL?.includes('"') || false,
      isValid: process.env.NEXT_PUBLIC_APP_URL?.startsWith('http') || false
    },
    callbackUrls: {
      google: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      facebook: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`
    }
  };

  // Return the environment variables as JSON
  return NextResponse.json(envVars);
}
