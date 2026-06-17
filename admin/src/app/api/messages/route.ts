import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit  = Math.max(1, parseInt(searchParams.get('limit')  || '50'));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    const supabase = createServiceClient();

    let query = supabase
      .from('messages')
      .select('id,sender_name,sender_email,sender_phone,subject,message_content,source,source_page,status,created_at,read_at,replied_at,admin_notes', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Messages table error:', error.message);
      return NextResponse.json({
        success: true,
        messages: [],
        pagination: { total: 0, limit, offset, hasMore: false },
        _warning: 'messages table not found or inaccessible',
      });
    }

    const totalCount = count || 0;
    return NextResponse.json({
      success: true,
      messages: data || [],
      pagination: { total: totalCount, limit, offset, hasMore: offset + limit < totalCount },
    });

  } catch (error: any) {
    console.error('Error retrieving messages:', error);
    return NextResponse.json({
      error: 'Failed to retrieve messages',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId, status, adminNotes } = body;

    if (!messageId || !status) {
      return NextResponse.json({ error: 'Message ID and status are required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const updates: Record<string, any> = { status };
    if (status === 'read' && adminNotes === undefined) updates.read_at = new Date().toISOString();
    if (status === 'replied') updates.replied_at = new Date().toISOString();
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: data });

  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json({
      error: 'Failed to update message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 });
  }
}
