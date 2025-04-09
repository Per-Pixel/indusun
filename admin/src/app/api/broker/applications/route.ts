import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    
    // Get broker applications with user information
    const result = await pool.query(
      `SELECT ba.*, u.name, u.email 
       FROM broker_applications ba
       JOIN users u ON ba.user_id = u.id
       WHERE ba.status = $1
       ORDER BY ba.application_date DESC`,
      [status]
    );
    
    return NextResponse.json({
      applications: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        userName: row.name,
        userEmail: row.email,
        applicationDate: row.application_date,
        status: row.status,
        documents: row.documents,
        notes: row.notes,
        reviewedBy: row.reviewed_by,
        reviewDate: row.review_date
      }))
    });
  } catch (error) {
    console.error("Error fetching broker applications:", error);
    return NextResponse.json({ error: "Failed to fetch broker applications" }, { status: 500 });
  }
}
