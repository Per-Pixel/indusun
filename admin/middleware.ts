// admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function middleware(req: NextRequest) {
  // Always allow through if Supabase credentials are not configured
  // (prevents hard lockout during initial setup)
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Middleware: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing — skipping auth check');
    return NextResponse.next({ request: { headers: req.headers } });
  }

  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session so it stays alive
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // No active session → redirect to login
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirected', '1');
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     * - /auth/login (the login page itself)
     * - /api/auth/* (auth API endpoints)
     * - /_next/* (Next.js internals)
     * - /favicon.ico and static image files
     */
    '/((?!auth/login|api/auth|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}