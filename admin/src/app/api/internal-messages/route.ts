// GET /api/internal-messages — list messages visible to the current user
// POST /api/internal-messages — create a new internal message

import { NextRequest, NextResponse } from 'next/server';
import {
  listInternalMessages,
  createInternalMessage,
} from '@/services/internalMessageService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole') as 'admin' | 'super_admin';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || undefined;

    if (!userId || !userRole) {
      return NextResponse.json(
        { success: false, error: 'userId and userRole are required' },
        { status: 400 }
      );
    }

    const { messages, total, error } = await listInternalMessages(userId, userRole, {
      limit,
      offset,
      search,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: any) {
    console.error('GET /api/internal-messages error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to list messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sender_id, subject, body: messageBody, attachments, visibility, allowed_user_ids } = body;

    if (!sender_id || !subject) {
      return NextResponse.json(
        { success: false, error: 'sender_id and subject are required' },
        { status: 400 }
      );
    }

    if (visibility === 'custom' && (!allowed_user_ids || allowed_user_ids.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Custom visibility requires at least one allowed user' },
        { status: 400 }
      );
    }

    const { message, error } = await createInternalMessage({
      sender_id,
      subject,
      body: messageBody || '',
      attachments: attachments || [],
      visibility: visibility || 'admins_only',
      allowed_user_ids: allowed_user_ids || [],
    });

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/internal-messages error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
