import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      // Get the user's broker application
      const result = await pool.query(
        'SELECT * FROM broker_applications WHERE user_id = $1 ORDER BY application_date DESC LIMIT 1',
        [user.id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          hasApplication: false,
          message: "No broker application found"
        });
      }
      
      const application = result.rows[0];
      
      return NextResponse.json({
        hasApplication: true,
        application: {
          id: application.id,
          status: application.status,
          applicationDate: application.application_date,
          reviewDate: application.review_date,
          notes: application.notes
        }
      });
    } catch (error) {
      console.error("Error checking broker application status:", error);
      return NextResponse.json({ error: "Failed to check application status" }, { status: 500 });
    }
  });
}
