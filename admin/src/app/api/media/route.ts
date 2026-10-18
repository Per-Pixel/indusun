import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { getUniqueSocieties } from '@/services/masterDataService';
import path from 'node:path';
import { readdir, stat } from 'node:fs/promises';

const MEDIA_SLUG = '_media_library';
const MEDIA_KEY = 'items';

type MediaCategoryType = 'images' | 'documents' | 'videos' | 'floor_plans';

interface MediaLibraryItem {
  id: string;
  name: string;
  category: MediaCategoryType;
  project: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  tags: string[];
  source?: 'custom' | 'system' | 'internal_comms' | 'bills' | 'uploads';
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function inferCategory(nameOrMime: string): MediaCategoryType {
  const lower = nameOrMime.toLowerCase();
  if (lower.includes('plan') || lower.includes('layout') || lower.includes('blueprint')) return 'floor_plans';
  if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm') || lower.startsWith('video/')) return 'videos';
  if (lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx') || lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) return 'documents';
  return 'images';
}

const SYSTEM_ASSETS: Array<{
  filename: string;
  title: string;
  category: MediaCategoryType;
  project: string;
  tags: string[];
}> = [
  {
    filename: 'gurukrupa-qr-card.png',
    title: 'gurukrupa-qr-card.png',
    category: 'images',
    project: 'Gurukrupa Corporation',
    tags: ['qr-code', 'karnataka-bank', 'payment'],
  },
  {
    filename: 'gurukrupa-qr.png',
    title: 'gurukrupa-qr.png',
    category: 'images',
    project: 'Gurukrupa Corporation',
    tags: ['upi', 'qr', 'receipt'],
  },
  {
    filename: 'indusun-logo.png',
    title: 'indusun-logo.png',
    category: 'images',
    project: 'All Projects',
    tags: ['brand', 'logo', 'official'],
  },
  {
    filename: 'gurukrupa-emblem-left.png',
    title: 'gurukrupa-emblem-left.png',
    category: 'images',
    project: 'Gurukrupa Corporation',
    tags: ['emblem', 'receipt', 'header'],
  },
  {
    filename: 'gurukrupa-emblem-right.png',
    title: 'gurukrupa-emblem-right.png',
    category: 'images',
    project: 'Gurukrupa Corporation',
    tags: ['emblem', 'receipt', 'header'],
  },
  {
    filename: 'gurukrupa-sign.png',
    title: 'gurukrupa-sign.png',
    category: 'images',
    project: 'Gurukrupa Corporation',
    tags: ['signature', 'authorised-signatory'],
  },
];

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [
      { data: storedRow },
      { data: internalMsgs },
      { data: billsWithAttachments },
      societies,
    ] = await Promise.all([
      supabase
        .from('page_content')
        .select('data')
        .eq('page_slug', MEDIA_SLUG)
        .eq('section_key', MEDIA_KEY)
        .maybeSingle(),
      supabase
        .from('internal_messages')
        .select('id,subject,attachments,created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('bills')
        .select('id,bill_number,society_name,attachments,created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      getUniqueSocieties().catch(() => ({ societies: [] as string[], error: null })),
    ]);

    const customItems: MediaLibraryItem[] = Array.isArray((storedRow?.data as any)?.items)
      ? ((storedRow?.data as any).items as MediaLibraryItem[])
      : [];

    const deletedIds: Set<string> = new Set(
      Array.isArray((storedRow?.data as any)?.deletedIds)
        ? ((storedRow?.data as any).deletedIds as string[])
        : []
    );

    const seenUrls = new Set(customItems.map((i) => i.url));
    const discovered: MediaLibraryItem[] = [];

    // 1. Official files in public/
    const publicDir = path.join(process.cwd(), 'public');
    for (const asset of SYSTEM_ASSETS) {
      const id = `sys-${asset.filename}`;
      const url = `/${asset.filename}`;
      if (deletedIds.has(id) || seenUrls.has(url)) continue;
      try {
        const st = await stat(path.join(publicDir, asset.filename));
        discovered.push({
          id,
          name: asset.title,
          category: asset.category,
          project: asset.project,
          size: formatBytes(st.size),
          uploadedBy: 'System',
          uploadedAt: st.mtime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          url,
          tags: asset.tags,
          source: 'system',
        });
        seenUrls.add(url);
      } catch {
        // Ignore if file missing
      }
    }

    // 2. Uploaded files in public/uploads/
    try {
      const uploadsDir = path.join(publicDir, 'uploads');
      const files = await readdir(uploadsDir);
      for (const f of files) {
        const url = `/uploads/${f}`;
        const id = `upload-${f}`;
        if (deletedIds.has(id) || seenUrls.has(url)) continue;
        const st = await stat(path.join(uploadsDir, f));
        if (!st.isFile()) continue;
        discovered.push({
          id,
          name: f,
          category: inferCategory(f),
          project: 'Uploaded Assets',
          size: formatBytes(st.size),
          uploadedBy: 'Admin',
          uploadedAt: st.mtime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          url,
          tags: ['upload'],
          source: 'uploads',
        });
        seenUrls.add(url);
      }
    } catch {
      // Directory may not exist yet
    }

    // 3. Attachments from internal_messages
    for (const msg of internalMsgs || []) {
      const atts = Array.isArray(msg.attachments) ? msg.attachments : [];
      atts.forEach((att: any, idx: number) => {
        const url = att.url || att.publicUrl;
        if (!url || seenUrls.has(url)) return;
        const id = `ic-${msg.id}-${idx}`;
        if (deletedIds.has(id)) return;
        discovered.push({
          id,
          name: att.name || `Attachment-${idx + 1}`,
          category: inferCategory(att.type || att.name || ''),
          project: msg.subject || 'Internal Comms',
          size: typeof att.size === 'number' ? formatBytes(att.size) : (att.size || '—'),
          uploadedBy: 'Internal Comms',
          uploadedAt: msg.created_at
            ? new Date(msg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          url,
          tags: ['internal-comms', 'attachment'],
          source: 'internal_comms',
        });
        seenUrls.add(url);
      });
    }

    // 4. Attachments from bills
    for (const bill of billsWithAttachments || []) {
      const atts = Array.isArray(bill.attachments) ? bill.attachments : [];
      atts.forEach((att: any, idx: number) => {
        const url = att.url || att.dataUrl;
        if (!url || seenUrls.has(url)) return;
        const id = `bill-${bill.id}-${idx}`;
        if (deletedIds.has(id)) return;
        discovered.push({
          id,
          name: att.name || `${bill.bill_number}-attachment`,
          category: inferCategory(att.type || att.name || ''),
          project: bill.society_name || `Bill ${bill.bill_number}`,
          size: typeof att.size === 'number' ? formatBytes(att.size) : '—',
          uploadedBy: 'Billing',
          uploadedAt: bill.created_at
            ? new Date(bill.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          url,
          tags: ['bill', bill.bill_number || 'receipt'],
          source: 'bills',
        });
        seenUrls.add(url);
      });
    }

    const items = [...customItems.filter((i) => !deletedIds.has(i.id)), ...discovered];
    return NextResponse.json({
      items,
      societies: ['Gurukrupa Corporation', 'All Projects', ...societies.societies],
    });
  } catch (err: any) {
    console.error('[api/media GET] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, project, size, uploadedBy, url, tags } = body as Partial<MediaLibraryItem>;
    if (!name || !url) {
      return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from('page_content')
      .select('data')
      .eq('page_slug', MEDIA_SLUG)
      .eq('section_key', MEDIA_KEY)
      .maybeSingle();

    const prevItems: MediaLibraryItem[] = Array.isArray((existing?.data as any)?.items)
      ? (existing?.data as any).items
      : [];
    const deletedIds: string[] = Array.isArray((existing?.data as any)?.deletedIds)
      ? (existing?.data as any).deletedIds
      : [];

    const newItem: MediaLibraryItem = {
      id: `media-${Date.now()}`,
      name,
      category: category || inferCategory(name),
      project: project || 'Gurukrupa Corporation',
      size: size || '—',
      uploadedBy: uploadedBy || 'Admin',
      uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      url,
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['uploaded'],
      source: 'custom',
    };

    const updatedItems = [newItem, ...prevItems];
    const { error } = await supabase.from('page_content').upsert(
      {
        page_slug: MEDIA_SLUG,
        section_key: MEDIA_KEY,
        data: { items: updatedItems, deletedIds },
        visible: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'page_slug,section_key' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: newItem });
  } catch (err: any) {
    console.error('[api/media POST] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from('page_content')
      .select('data')
      .eq('page_slug', MEDIA_SLUG)
      .eq('section_key', MEDIA_KEY)
      .maybeSingle();

    const prevItems: MediaLibraryItem[] = Array.isArray((existing?.data as any)?.items)
      ? (existing?.data as any).items
      : [];
    const prevDeleted: string[] = Array.isArray((existing?.data as any)?.deletedIds)
      ? (existing?.data as any).deletedIds
      : [];

    const updatedItems = prevItems.filter((i) => i.id !== id);
    const updatedDeleted = Array.from(new Set([...prevDeleted, id]));

    const { error } = await supabase.from('page_content').upsert(
      {
        page_slug: MEDIA_SLUG,
        section_key: MEDIA_KEY,
        data: { items: updatedItems, deletedIds: updatedDeleted },
        visible: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'page_slug,section_key' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err: any) {
    console.error('[api/media DELETE] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
