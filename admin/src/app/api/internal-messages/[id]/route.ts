// PUT /api/internal-messages/[id]/read — mark a message as read
// DELETE /api/internal-messages/[id] — delete a message

import { NextRequest, NextResponse } from 'next/server';
import {
  markMessageRead,
  deleteInternalMessage,
  getInternalMessage,
  toggleMessagePin,
} from '@/services/internalMessageService';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, userId, isPinned } = body;

    if (action === 'read') {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'userId is required' },
          { status: 400 }
        );
      }

      const { error } = await markMessageRead(id, userId);
      if (error) {
        return NextResponse.json({ success: false, error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'pin') {
      const { error } = await toggleMessagePin(id, isPinned);
      if (error) {
        return NextResponse.json({ success: false, error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "read" or "pin".' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('PUT /api/internal-messages/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const callerId = searchParams.get('callerId');
    const callerRole = searchParams.get('callerRole');

    if (!callerId) {
      return NextResponse.json(
        { success: false, error: 'callerId is required' },
        { status: 400 }
      );
    }

    // Verify the caller is the sender or a super_admin
    const { message, error: fetchError } = await getInternalMessage(id, callerId);
    if (fetchError || !message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.sender_id !== callerId && callerRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only the sender or a super admin can delete this message' },
        { status: 403 }
      );
    }

    const { error } = await deleteInternalMessage(id);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/internal-messages/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';

    const { message, error } = await getInternalMessage(id, userId);

    if (error || !message) {
      return NextResponse.json(
        { success: false, error: error || 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error('GET /api/internal-messages/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to get message' },
      { status: 500 }
    );
  }
}
