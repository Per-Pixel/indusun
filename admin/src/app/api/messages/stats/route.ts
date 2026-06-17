import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const EMPTY_STATS = {
  total: 0, sent: 0, received: 0, unread: 0, read: 0, replied: 0,
  pending: 0, failed: 0,
  recent: { last24h: 0, last7d: 0, last30d: 0 },
  bySource: {},
  dailyStats: [],
};

export async function GET() {
  try {
    const supabase = createServiceClient();

    const now = new Date();
    const ago24h  = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const ago7d   = new Date(now.getTime() -  7 * 86400 * 1000).toISOString();
    const ago30d  = new Date(now.getTime() - 30 * 86400 * 1000).toISOString();

    const [totalRes, unreadRes, readRes, repliedRes, recent24hRes, recent7dRes, recent30dRes, sourceRes] =
      await Promise.all([
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'read'),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'replied'),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', ago24h),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', ago7d),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', ago30d),
        supabase.from('messages').select('source,created_at').gte('created_at', ago30d),
      ]);

    if (totalRes.error) {
      console.warn('messages table not accessible:', totalRes.error.message);
      return NextResponse.json({ success: true, stats: EMPTY_STATS, _warning: 'messages table not found' });
    }

    const bySource: Record<string, number> = {};
    for (const row of (sourceRes.data || [])) {
      const s = (row as any).source || 'unknown';
      bySource[s] = (bySource[s] || 0) + 1;
    }

    const total = totalRes.count || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        sent: 0,
        received: total,
        unread:  unreadRes.count  || 0,
        read:    readRes.count    || 0,
        replied: repliedRes.count || 0,
        pending: 0,
        failed:  0,
        recent: {
          last24h: recent24hRes.count || 0,
          last7d:  recent7dRes.count  || 0,
          last30d: recent30dRes.count || 0,
        },
        bySource,
        dailyStats: [],
      },
    });

  } catch (error: any) {
    console.error('Error retrieving message statistics:', error);
    return NextResponse.json({
      error: 'Failed to retrieve message statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 });
  }
}
