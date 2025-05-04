// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt-utils';

// Middleware to verify authentication
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  // Get token from cookies or Authorization header
  const token = req.cookies.get('access_token')?.value 
    || req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  // Verify the token
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  
  // Pass the user data to the handler
  return handler(req, payload);
}

// Role-based access control middleware
export async function withRole(
  req: NextRequest,
  allowedRoles: ('customer' | 'broker' | 'admin')[],
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(req, async (req, user) => {
    // Check if user has an allowed role
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to access this resource' }, 
        { status: 403 }
      );
    }
    
    // User has permission, proceed with handler
    return handler(req, user);
  });
}