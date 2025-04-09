// admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt-utils';

export async function middleware(req: NextRequest) {
  // Get token from cookies or Authorization header
  const token = req.cookies.get('admin_token')?.value 
    || req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.redirect(new URL('/admin/auth/login', req.url));
  }
  
  // Verify the token
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/admin/auth/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
  // Exclude login page and API routes
  exclude: ['/admin/auth/login', '/admin/api/auth/:path*']
};