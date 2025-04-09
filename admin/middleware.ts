// admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
  return NextResponse.next();

  // ORIGINAL CODE (commented out for now)
  /*
  // Get token from cookies or Authorization header
  const token = req.cookies.get('admin_token')?.value
    || req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.redirect(new URL('/admin/auth/login', req.url));
  }

  // Verify the token
  const isValidAdmin = await verifyAdminToken(token);
  if (!isValidAdmin) {
    return NextResponse.redirect(new URL('/admin/auth/login', req.url));
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: ['/admin/:path*'],
  // Exclude login page and API routes
  exclude: ['/admin/auth/login', '/admin/api/auth/:path*']
}