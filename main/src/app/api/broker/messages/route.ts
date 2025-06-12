import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      // Only allow brokers to access this endpoint
      if (user.role !== 'broker') {
        return NextResponse.json({
          error: "Access denied. Broker role required."
        }, { status: 403 });
      }

      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');
      const status = searchParams.get('status'); // 'read', 'unread', or null for all

      let query = `
        SELECT 
          id,
          sender_name,
          sender_email,
          sender_phone,
          subject,
          message_content,
          source,
          source_page,
          status,
          created_at,
          read_at,
          replied_at
        FROM messages
      `;
      
      const conditions = [];
      const params = [];
      let paramCount = 0;

      // Filter by status if provided
      if (status) {
        paramCount++;
        conditions.push(`status = $${paramCount}`);
        params.push(status);
      }

      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM messages';
      const countParams = [];
      let countParamCount = 0;

      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
        if (status) {
          countParamCount++;
          countParams.push(status);
        }
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      return NextResponse.json({
        success: true,
        messages: result.rows,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      });

    } catch (error: any) {
      console.error('Error retrieving broker messages:', error);
      return NextResponse.json({
        error: "Failed to retrieve messages",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }
  });
}

// PUT endpoint to update message status (mark as read/replied)
export async function PUT(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      // Only allow brokers to access this endpoint
      if (user.role !== 'broker') {
        return NextResponse.json({
          error: "Access denied. Broker role required."
        }, { status: 403 });
      }

      const body = await req.json();
      const { messageId, status } = body;

      if (!messageId || !status) {
        return NextResponse.json({
          error: "Message ID and status are required"
        }, { status: 400 });
      }

      const updateFields = ['status = $2'];
      const params = [messageId, status];
      let paramCount = 2;

      if (status === 'read') {
        updateFields.push('read_at = NOW()');
      }

      if (status === 'replied') {
        updateFields.push('replied_at = NOW()');
      }

      const query = `
        UPDATE messages 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return NextResponse.json({
          error: "Message not found"
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: result.rows[0]
      });

    } catch (error: any) {
      console.error('Error updating message:', error);
      return NextResponse.json({
        error: "Failed to update message",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }
  });
}
