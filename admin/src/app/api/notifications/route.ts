import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const NOTIF_SLUG = '_notifications_state';
const NOTIF_KEY = 'state';

type NotifType = 'lead' | 'visit' | 'payment' | 'booking' | 'system' | 'alert';
type NotifPriority = 'high' | 'medium' | 'low';

interface LiveNotification {
  id: string;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  description: string;
  time: string;
  read: boolean;
  action?: { label: string; href: string };
}

function formatINR(val: string | number | null | undefined): string {
  const num = typeof val === 'number' ? val : parseFloat(String(val || '').replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num) || num <= 0) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [
      { data: stateRow },
      { data: recentMaster },
      { data: recentCancelled },
      { data: recentBills },
      { data: recentMsgs },
      { data: recentInternal },
    ] = await Promise.all([
      supabase
        .from('page_content')
        .select('data')
        .eq('page_slug', NOTIF_SLUG)
        .eq('section_key', NOTIF_KEY)
        .maybeSingle(),
      supabase
        .from('Master Data Of Gurukrupa')
        .select('id,client_name,society_name,block_name,plot_no,plot_amount,paid_amount,emi_amount,r_no,registration_no,date_of_form,emi_paid_date,broker_code,ba_code')
        .is('cancel_date', null)
        .order('id', { ascending: false })
        .limit(8),
      supabase
        .from('Master Data Of Gurukrupa')
        .select('id,client_name,society_name,plot_no,cancel_date,r_no,registration_no,paid_amount')
        .not('cancel_date', 'is', null)
        .neq('cancel_date', '')
        .order('id', { ascending: false })
        .limit(3),
      supabase
        .from('bills')
        .select('id,bill_number,client_name,society_name,plot_no,amount,date,status')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('messages')
        .select('id,sender_name,sender_phone,subject,message_content,source,status,created_at')
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('internal_messages')
        .select('id,subject,body,visibility,created_at')
        .order('created_at', { ascending: false })
        .limit(4),
    ]);

    const readIds = new Set<string>(
      Array.isArray((stateRow?.data as any)?.readIds) ? (stateRow?.data as any).readIds : []
    );
    const deletedIds = new Set<string>(
      Array.isArray((stateRow?.data as any)?.deletedIds) ? (stateRow?.data as any).deletedIds : []
    );

    const items: LiveNotification[] = [];

    // 1. Custom Bills
    for (const b of recentBills || []) {
      const id = `bill-${b.id}`;
      if (deletedIds.has(id)) continue;
      items.push({
        id,
        type: 'payment',
        priority: 'high',
        title: `Bill ${b.bill_number} — ${formatINR(b.amount)} (${b.status || 'Recorded'})`,
        description: `Issued to ${b.client_name || 'Client'}${b.society_name ? ` for ${b.society_name}` : ''}${b.plot_no ? ` Plot ${b.plot_no}` : ''}.`,
        time: b.date || 'Recent',
        read: readIds.has(id),
        action: { label: 'View Bill', href: `/invoices/b${b.id}` },
      });
    }

    // 2. Recent Master Data Bookings & EMI Payments
    for (const r of recentMaster || []) {
      const regLabel = r.registration_no || r.r_no || `#${r.id}`;
      const bookId = `booking-${r.id}`;
      if (!deletedIds.has(bookId)) {
        const isAppForm = Boolean(r.registration_no);
        items.push({
          id: bookId,
          type: isAppForm ? 'booking' : 'payment',
          priority: isAppForm ? 'high' : 'medium',
          title: isAppForm
            ? `Application Form #${regLabel} Registered — ${r.client_name}`
            : `EMI Receipt ${regLabel} — ${formatINR(r.emi_amount || r.paid_amount)}`,
          description: `${r.client_name || 'Applicant'} · ${r.society_name || 'Society'}${r.block_name && r.block_name !== 'Main' ? ` (${r.block_name})` : ''}, Plot ${r.plot_no || '—'}. Paid: ${formatINR(r.paid_amount || r.emi_amount)}${r.plot_amount ? ` / Plot: ${formatINR(r.plot_amount)}` : ''}.`,
          time: r.emi_paid_date || r.date_of_form || `Record #${r.id.toLocaleString('en-IN')}`,
          read: readIds.has(bookId),
          action: { label: 'View Customer', href: `/customers/${r.id}` },
        });
      }
    }

    // 3. Internal Comms
    for (const im of recentInternal || []) {
      const id = `internal-${im.id}`;
      if (deletedIds.has(id)) continue;
      items.push({
        id,
        type: 'system',
        priority: 'medium',
        title: `Internal Comms: ${im.subject}`,
        description: (im.body || '').slice(0, 140) || 'New internal team message posted.',
        time: im.created_at
          ? new Date(im.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Recent',
        read: readIds.has(id),
        action: { label: 'Open Internal Comms', href: '/internal-comms' },
      });
    }

    // 4. Outbound / Inbound Messages
    for (const m of recentMsgs || []) {
      const id = `msg-${m.id}`;
      if (deletedIds.has(id)) continue;
      items.push({
        id,
        type: m.status === 'failed' ? 'alert' : 'lead',
        priority: m.status === 'failed' ? 'high' : 'low',
        title: `${(m.source || 'SMS').toUpperCase()} ${m.status === 'failed' ? 'Delivery Alert' : 'Message'} — ${m.subject || 'Notification'}`,
        description: `${m.message_content || ''} (${m.sender_phone || m.sender_name || 'Contact'})`,
        time: m.created_at
          ? new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Recent',
        read: readIds.has(id),
        action: { label: 'Message History', href: '/messages/history' },
      });
    }

    // 5. Recent Cancellations / Alerts
    for (const c of recentCancelled || []) {
      const id = `cancel-${c.id}`;
      if (deletedIds.has(id)) continue;
      items.push({
        id,
        type: 'alert',
        priority: 'high',
        title: `Plot Cancellation Recorded — ${c.society_name || 'Society'} Plot ${c.plot_no || '—'}`,
        description: `Client ${c.client_name || '—'} (Reg/R. No. ${c.registration_no || c.r_no || c.id}) marked cancelled (${c.cancel_date}).`,
        time: String(c.cancel_date || 'Recorded'),
        read: readIds.has(id),
        action: { label: 'View Record', href: `/customers/${c.id}` },
      });
    }

    return NextResponse.json({ notifications: items });
  } catch (err: any) {
    console.error('[api/notifications GET] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, allIds } = body as {
      action: 'toggle_read' | 'mark_all_read' | 'delete';
      id?: string;
      allIds?: string[];
    };

    const supabase = createServiceClient();
    const { data: stateRow } = await supabase
      .from('page_content')
      .select('data')
      .eq('page_slug', NOTIF_SLUG)
      .eq('section_key', NOTIF_KEY)
      .maybeSingle();

    const readIds = new Set<string>(
      Array.isArray((stateRow?.data as any)?.readIds) ? (stateRow?.data as any).readIds : []
    );
    const deletedIds = new Set<string>(
      Array.isArray((stateRow?.data as any)?.deletedIds) ? (stateRow?.data as any).deletedIds : []
    );

    if (action === 'toggle_read' && id) {
      if (readIds.has(id)) readIds.delete(id);
      else readIds.add(id);
    } else if (action === 'mark_all_read' && Array.isArray(allIds)) {
      allIds.forEach((item) => readIds.add(item));
    } else if (action === 'delete' && id) {
      deletedIds.add(id);
    }

    const { error } = await supabase.from('page_content').upsert(
      {
        page_slug: NOTIF_SLUG,
        section_key: NOTIF_KEY,
        data: {
          readIds: Array.from(readIds),
          deletedIds: Array.from(deletedIds),
        },
        visible: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'page_slug,section_key' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      readIds: Array.from(readIds),
      deletedIds: Array.from(deletedIds),
    });
  } catch (err: any) {
    console.error('[api/notifications PUT] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
