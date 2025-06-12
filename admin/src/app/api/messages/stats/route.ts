import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get total message count
    const totalResult = await pool.query('SELECT COUNT(*) FROM messages');
    const total = parseInt(totalResult.rows[0].count);

    // Get unread message count
    const unreadResult = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE status = $1',
      ['unread']
    );
    const unread = parseInt(unreadResult.rows[0].count);

    // Get read message count
    const readResult = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE status = $1',
      ['read']
    );
    const read = parseInt(readResult.rows[0].count);

    // Get replied message count
    const repliedResult = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE status = $1',
      ['replied']
    );
    const replied = parseInt(repliedResult.rows[0].count);

    // Get messages by source
    const sourceResult = await pool.query(`
      SELECT 
        source,
        COUNT(*) as count
      FROM messages 
      GROUP BY source
      ORDER BY count DESC
    `);

    // Get recent messages (last 24 hours)
    const recentResult = await pool.query(`
      SELECT COUNT(*) FROM messages 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);
    const recent24h = parseInt(recentResult.rows[0].count);

    // Get messages from last 7 days
    const weekResult = await pool.query(`
      SELECT COUNT(*) FROM messages 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const recent7d = parseInt(weekResult.rows[0].count);

    // Get messages from last 30 days
    const monthResult = await pool.query(`
      SELECT COUNT(*) FROM messages 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    const recent30d = parseInt(monthResult.rows[0].count);

    // Get daily message counts for the last 7 days
    const dailyStatsResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM messages 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Calculate sent messages (this would be for outgoing messages if implemented)
    const sent = 0; // Placeholder for now
    const pending = 0; // Placeholder for now
    const failed = 0; // Placeholder for now

    return NextResponse.json({
      success: true,
      stats: {
        total,
        sent, // For compatibility with existing admin UI
        received: total, // All messages are received from forms
        unread,
        read,
        replied,
        pending, // Placeholder
        failed, // Placeholder
        recent: {
          last24h: recent24h,
          last7d: recent7d,
          last30d: recent30d
        },
        bySource: sourceResult.rows.reduce((acc: any, row: any) => {
          acc[row.source] = parseInt(row.count);
          return acc;
        }, {}),
        dailyStats: dailyStatsResult.rows.map((row: any) => ({
          date: row.date,
          count: parseInt(row.count)
        }))
      }
    });

  } catch (error: any) {
    console.error('Error retrieving message statistics:', error);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === '42P01') {
      return NextResponse.json({
        error: "Database connection failed",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }

    return NextResponse.json({
      error: "Failed to retrieve message statistics",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
