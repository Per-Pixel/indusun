import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withRole } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    // Get total users count
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);
    
    // Get pending broker applications count
    const applicationsResult = await pool.query(
      'SELECT COUNT(*) FROM broker_applications WHERE status = $1',
      ['pending']
    );
    const pendingBrokerApplications = parseInt(applicationsResult.rows[0]?.count || '0');
    
    // For now, return placeholder values for properties and payments
    // These will be implemented when those features are added
    
    return NextResponse.json({
      totalUsers,
      totalProperties: 0, // Placeholder
      pendingBrokerApplications,
      recentPayments: 0 // Placeholder
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
