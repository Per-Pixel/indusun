import { NextRequest, NextResponse } from 'next/server';
import { getPageDef } from '@/lib/cms-schema';
import { getPageSections, upsertSection } from '@/lib/page-content';

// GET  /api/page-content/[slug]
//   -> { slug, sections: { [sectionKey]: { data, visible } } }
//   Sections without a stored row fall back to schema defaults so the
//   editor opens with the live-site copy pre-filled.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const def = getPageDef(slug);
    if (!def) return NextResponse.json({ error: 'Unknown page' }, { status: 404 });

    const rows = await getPageSections(slug);
    const byKey = new Map(rows.map((r) => [r.section_key, r]));

    const sections: Record<string, { data: Record<string, unknown>; visible: boolean }> = {};
    for (const s of def.sections) {
      const stored = byKey.get(s.key);
      sections[s.key] = stored
        ? { data: stored.data, visible: stored.visible }
        : { data: { ...s.defaults }, visible: true };
    }

    return NextResponse.json({ slug, sections });
  } catch (err) {
    console.error('[api/page-content GET] failed:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Server error' },
      { status: 500 },
    );
  }
}

// PUT  /api/page-content/[slug]
// body: { sections: { [sectionKey]: { data, visible } } }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const def = getPageDef(slug);
    if (!def) return NextResponse.json({ error: 'Unknown page' }, { status: 404 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const sections = (body as { sections?: Record<string, { data: unknown; visible: boolean }> } | null)?.sections;
    if (!sections || typeof sections !== 'object') {
      return NextResponse.json({ error: 'Missing "sections"' }, { status: 400 });
    }

    for (const sectionDef of def.sections) {
      const incoming = sections[sectionDef.key];
      if (!incoming) continue;
      await upsertSection({
        pageSlug: slug,
        sectionKey: sectionDef.key,
        data: (incoming.data as Record<string, unknown>) ?? {},
        visible: Boolean(incoming.visible),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/page-content PUT] failed:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Server error' },
      { status: 500 },
    );
  }
}
