import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const WORKSPACE_SLUG = '_workspace';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const supabase = createServiceClient();

    const [
      { data: wsRows },
      { data: recentMaster },
      { data: admins },
    ] = await Promise.all([
      supabase
        .from('page_content')
        .select('section_key,data')
        .eq('page_slug', WORKSPACE_SLUG),
      supabase
        .from('Master Data Of Gurukrupa')
        .select('id,client_name,contact_no,society_name,block_name,plot_no,plot_size,plot_amount,paid_amount,emi_amount,emi_date,r_no,registration_no,date_of_form,emi_paid_date,remarks,broker_name_clean,"broker\'s_name"')
        .is('cancel_date', null)
        .order('id', { ascending: false })
        .limit(12),
      supabase
        .from('admin_users')
        .select('id,name,email,role')
        .limit(10),
    ]);

    const byKey = new Map<string, any>();
    for (const r of wsRows || []) {
      byKey.set(r.section_key, r.data);
    }

    const primaryAdmin = (admins && admins[0])
      ? { id: String(admins[0].id), name: admins[0].name || 'Admin' }
      : { id: 'admin-1', name: 'Admin' };

    // 1. Calendar Events: combine live CRM events + custom saved events
    const customEvents = Array.isArray(byKey.get('calendar_events')?.items)
      ? byKey.get('calendar_events').items
      : [];

    const derivedEvents = (recentMaster || []).slice(0, 6).map((r: any, idx: number) => {
      const rawDate = r.date_of_form || r.emi_paid_date || '';
      const isoMatch = String(rawDate).match(/^(\d{4}-\d{2}-\d{2})/);
      const dmyMatch = String(rawDate).match(/^(\d{2})-(\d{2})-(\d{4})/);
      const eventDate = isoMatch
        ? isoMatch[1]
        : dmyMatch
        ? `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`
        : new Date().toISOString().split('T')[0];

      return {
        id: `crm-evt-${r.id}`,
        title: r.registration_no
          ? `Application #${r.registration_no} — ${r.client_name}`
          : `EMI / Plot Review — ${r.client_name}`,
        date: eventDate,
        time: ['10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM', '05:15 PM'][idx % 6],
        type: r.registration_no ? 'closing' : 'meeting',
        location: `${r.society_name || 'Gurukrupa Site'}${r.block_name && r.block_name !== 'Main' ? ` (${r.block_name})` : ''}`,
        client: {
          id: String(r.id),
          name: r.client_name || 'Applicant',
        },
        property: {
          id: String(r.id),
          title: `${r.society_name || 'Society'} – Plot ${r.plot_no || '—'}`,
          address: `${r.society_name || ''}, Plot ${r.plot_no || ''}${r.plot_size ? ` (${r.plot_size})` : ''}`,
        },
        notes: `Reg/R. No.: ${r.registration_no || r.r_no || r.id} · EMI: ₹${Number(r.emi_amount || r.paid_amount || 0).toLocaleString('en-IN')}${r.emi_date ? ` · EMI Window: ${r.emi_date}` : ''}`,
      };
    });

    // 2. Notes: persisted in page_content, seeded from real master data if empty
    let notes = Array.isArray(byKey.get('notes')?.items) ? byKey.get('notes').items : null;
    if (!notes) {
      notes = (recentMaster || []).slice(0, 4).map((r: any, idx: number) => ({
        id: `note-${r.id}`,
        title: `${r.society_name || 'Plot'} #${r.plot_no || '—'} — ${r.client_name || 'Client'}`,
        content: `Registration/R. No.: ${r.registration_no || r.r_no || r.id}. Plot Size: ${r.plot_size || 'Standard'}. Paid Amount: ₹${Number(r.paid_amount || r.emi_amount || 0).toLocaleString('en-IN')} / Total Plot Amount: ₹${Number(r.plot_amount || 0).toLocaleString('en-IN')}. ${r.emi_date ? `Monthly EMI cycle: ${r.emi_date}.` : ''} ${r.remarks || ''}`.trim(),
        category: idx === 0 ? 'client' : idx === 1 ? 'property' : 'meeting',
        color: (['blue', 'green', 'yellow', 'purple'] as const)[idx % 4],
        pinned: idx < 2,
        client: r.client_name ? { id: String(r.id), name: r.client_name } : undefined,
        property: r.society_name
          ? { id: String(r.id), title: `${r.society_name} – Plot ${r.plot_no || '—'}` }
          : undefined,
        createdAt: r.date_of_form || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }));
      await supabase.from('page_content').upsert(
        {
          page_slug: WORKSPACE_SLUG,
          section_key: 'notes',
          data: { items: notes },
          visible: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug,section_key' }
      );
    }

    // 3. Tasks: persisted in page_content, seeded from real master data if empty
    let tasks = Array.isArray(byKey.get('tasks')?.items) ? byKey.get('tasks').items : null;
    if (!tasks) {
      tasks = (recentMaster || []).slice(0, 5).map((r: any, idx: number) => ({
        id: `task-${r.id}`,
        title: r.registration_no
          ? `Verify KYC & Nominee dossier for Reg #${r.registration_no} (${r.client_name})`
          : `Confirm EMI receipt ${r.r_no || `#${r.id}`} for ${r.client_name}`,
        description: `${r.society_name || 'Society'} Plot ${r.plot_no || '—'} · Contact: ${r.contact_no || 'N/A'} · Broker: ${r.broker_name_clean || r["broker's_name"] || 'Direct'}`,
        dueDate: new Date(Date.now() + (idx + 1) * 86400000).toISOString().split('T')[0],
        priority: idx === 0 ? 'high' : idx < 3 ? 'medium' : 'low',
        status: idx === 4 ? 'completed' : idx === 1 ? 'in-progress' : 'todo',
        category: idx % 2 === 0 ? 'client' : 'property',
        assignedTo: primaryAdmin,
        client: r.client_name ? { id: String(r.id), name: r.client_name } : undefined,
        property: r.society_name
          ? { id: String(r.id), title: `${r.society_name} – Plot ${r.plot_no || '—'}` }
          : undefined,
        createdAt: new Date().toISOString().split('T')[0],
      }));
      await supabase.from('page_content').upsert(
        {
          page_slug: WORKSPACE_SLUG,
          section_key: 'tasks',
          data: { items: tasks },
          visible: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug,section_key' }
      );
    }

    if (type === 'calendar') return NextResponse.json({ events: [...customEvents, ...derivedEvents] });
    if (type === 'notes') return NextResponse.json({ notes });
    if (type === 'tasks') return NextResponse.json({ tasks });

    return NextResponse.json({
      events: [...customEvents, ...derivedEvents],
      notes,
      tasks,
    });
  } catch (err: any) {
    console.error('[api/workspace GET] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, items } = body as {
      section: 'calendar_events' | 'notes' | 'tasks';
      items: unknown[];
    };

    if (!section || !['calendar_events', 'notes', 'tasks'].includes(section) || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid section or items' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from('page_content').upsert(
      {
        page_slug: WORKSPACE_SLUG,
        section_key: section,
        data: { items },
        visible: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'page_slug,section_key' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, section, items });
  } catch (err: any) {
    console.error('[api/workspace PUT] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
