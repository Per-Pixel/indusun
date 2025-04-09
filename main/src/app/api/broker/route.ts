import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  return withRole(req, ['broker', 'admin'], async (req, user) => {
    // This will only execute if the user has role 'broker' or 'admin'
    return NextResponse.json({
      message: 'Broker dashboard data',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      // Add broker-specific data here
    });
  });
}
