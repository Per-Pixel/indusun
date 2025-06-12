import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Simple validation function
function validateMessageData(data: any) {
  const errors: string[] = [];

  if (!data.senderName || typeof data.senderName !== 'string' || data.senderName.trim().length === 0) {
    errors.push("Name is required");
  }
  if (data.senderName && data.senderName.length > 255) {
    errors.push("Name must be less than 255 characters");
  }
  if (data.senderEmail && typeof data.senderEmail === 'string' && data.senderEmail.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.senderEmail)) {
      errors.push("Invalid email address");
    }
  }
  if (data.senderPhone && data.senderPhone.length > 50) {
    errors.push("Phone number must be less than 50 characters");
  }
  if (data.subject && data.subject.length > 500) {
    errors.push("Subject must be less than 500 characters");
  }
  if (!data.messageContent || typeof data.messageContent !== 'string' || data.messageContent.trim().length === 0) {
    errors.push("Message is required");
  }
  if (!data.source || typeof data.source !== 'string' || data.source.trim().length === 0) {
    errors.push("Source is required");
  }

  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validationErrors = validateMessageData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: "Validation failed",
        details: validationErrors
      }, { status: 400 });
    }

    const {
      senderName,
      senderEmail,
      senderPhone,
      subject,
      messageContent,
      source,
      sourcePage
    } = body;

    // Insert message into database
    const result = await pool.query(
      `INSERT INTO messages (
        sender_name, 
        sender_email, 
        sender_phone, 
        subject, 
        message_content, 
        source, 
        source_page
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, created_at`,
      [senderName, senderEmail, senderPhone, subject, messageContent, source, sourcePage]
    );

    const newMessage = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "Message submitted successfully",
      messageId: newMessage.id,
      submittedAt: newMessage.created_at
    });

  } catch (error: any) {
    console.error('Error submitting message:', error);

    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({
        error: "Database connection failed. Please ensure PostgreSQL is running and try again.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }

    // Check if it's a table not found error
    if (error.code === '42P01') {
      return NextResponse.json({
        error: "Database table not found. Please contact support.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }

    return NextResponse.json({
      error: "Failed to submit message. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// GET endpoint to retrieve messages (for admin use)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // 'read', 'unread', or null for all
    const source = searchParams.get('source'); // filter by source

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

    if (status) {
      paramCount++;
      conditions.push(`status = $${paramCount}`);
      params.push(status);
    }

    if (source) {
      paramCount++;
      conditions.push(`source = $${paramCount}`);
      params.push(source);
    }

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
      if (source) {
        countParamCount++;
        countParams.push(source);
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
    console.error('Error retrieving messages:', error);
    return NextResponse.json({
      error: "Failed to retrieve messages",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
