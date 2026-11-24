// admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const REFRESH_MARGIN_MS = 60_000;

function decodeBase64Url(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64').toString('utf8');
}

/** Read the Supabase auth cookie (including chunked base64 values) without a network call. */
function readAuthPayload(req: NextRequest): string | null {
  const authCookies = req.cookies.getAll().filter((c) => c.name.includes('auth-token'));
  if (authCookies.length === 0) return null;

  const groups = new Map<string, { index: number; value: string }[]>();
  for (const cookie of authCookies) {
    const chunk = cookie.name.match(/^(.*)\.(\d+)$/);
    const base = chunk ? chunk[1] : cookie.name;
    const index = chunk ? Number(chunk[2]) : -1;
    const list = groups.get(base) ?? [];
    list.push({ index, value: cookie.value });
    groups.set(base, list);
  }

  const parts = [...groups.values()][0];
  if (!parts?.length) return null;
  const chunked = parts.some((p) => p.index >= 0);
  return chunked
    ? parts.filter((p) => p.index >= 0).sort((a, b) => a.index - b.index).map((p) => p.value).join('')
    : parts[0].value;
}

/** 'allow' skips Supabase. 'login' redirects. 'refresh' falls through to getSession(). */
function sessionGate(req: NextRequest): 'allow' | 'login' | 'refresh' {
  const raw = readAuthPayload(req);
  if (!raw) return 'login';

  try {
    const text = raw.startsWith('base64-') ? decodeBase64Url(raw.slice('base64-'.length)) : raw;
    const session = JSON.parse(text) as { expires_at?: number; access_token?: string };
    let expiresAtMs = typeof session.expires_at === 'number' ? session.expires_at * 1000 : 0;
    if (!expiresAtMs && session.access_token) {
      const payloadSeg = session.access_token.split('.')[1];
      if (payloadSeg) {
        const payload = JSON.parse(decodeBase64Url(payloadSeg)) as { exp?: number };
        if (typeof payload.exp === 'number') expiresAtMs = payload.exp * 1000;
      }
    }
    if (!expiresAtMs) return 'refresh';
    return expiresAtMs - Date.now() > REFRESH_MARGIN_MS ? 'allow' : 'refresh';
  } catch {
    return 'refresh';
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth/login') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Always allow through if Supabase credentials are not configured
  // (prevents hard lockout during initial setup)
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Middleware: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing — skipping auth check');
    return NextResponse.next({ request: { headers: req.headers } });
  }

  const gate = sessionGate(req);
  if (gate === 'allow') {
    return NextResponse.next({ request: { headers: req.headers } });
  }
  if (gate === 'login') {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirected', '1');
    return NextResponse.redirect(loginUrl);
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

  // Token is missing, unreadable, or near expiry — refresh it.
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirected', '1');
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Run middleware on page routes EXCEPT:
     * - /auth/login (the login page itself)
     * - /api/* (API endpoints handle their own auth/service client)
     * - /_next/* (Next.js internals)
     * - /favicon.ico and static image files
     */
    '/((?!auth/login|api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
