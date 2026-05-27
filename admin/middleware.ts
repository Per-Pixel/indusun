// admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Simplified token verification for middleware
async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing');
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };

    // Check if user has admin role
    return decoded.role === 'admin';
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  // TEMPORARY: Bypass authentication check for development
  console.log('Middleware bypassed for development');

  // Create a response object
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase client for session refreshing
  // This keeps the user session alive
  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
            })
            res = NextResponse.next({
              request: req,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    );

    // This will refresh the session if needed
    await supabase.auth.getSession();
  }

  return res;
}

export const config = {
  // Updated matcher to match all paths in the admin app
  matcher: ['/:path*'],
  // Exclude login page and API routes with updated paths
  exclude: ['/auth/login', '/api/auth/:path*']
}