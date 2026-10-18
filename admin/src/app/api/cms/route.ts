import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { PAGES } from '@/lib/cms-schema';

const REGISTRY_SLUG = '_cms_registry';

interface CmsCustomPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'review';
  lastModified: string;
  modifiedBy: string;
  views: number;
  editorSlug?: string;
}

interface CmsBlogPost {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string;
  author: string;
  views: number;
  tags: string[];
  excerpt?: string;
}

interface CmsSeoEntry {
  id: string;
  page: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  score: number;
}

interface CmsBanner {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  linkTo: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

function computeSeoScore(metaTitle: string, metaDescription: string, focusKeyword: string): number {
  let score = 40;
  const t = (metaTitle || '').trim();
  const d = (metaDescription || '').trim();
  const k = (focusKeyword || '').trim().toLowerCase();

  if (t.length >= 25 && t.length <= 65) score += 20;
  else if (t.length > 10) score += 10;

  if (d.length >= 80 && d.length <= 170) score += 20;
  else if (d.length > 30) score += 10;

  if (k) {
    if (t.toLowerCase().includes(k)) score += 10;
    if (d.toLowerCase().includes(k)) score += 10;
  }
  return Math.min(100, score);
}

const DEFAULT_BLOGS: CmsBlogPost[] = [
  {
    id: 'blog-1',
    title: 'Why Royal City & Satguru Park Lead Residential Plot Demand in Gujarat',
    category: 'Investment',
    status: 'published',
    publishedAt: '15 Oct 2026',
    author: 'Gurukrupa Editorial',
    views: 1420,
    tags: ['royal-city', 'satguru-park', 'investment'],
    excerpt: 'Analysis of plot appreciation, flexible EMI schemes, and infrastructure growth across Royal City blocks.',
  },
  {
    id: 'blog-2',
    title: 'Complete Buyer Guide: Gurukrupa Application Form, Registration & EMI Schedule',
    category: "Buyer's Guide",
    status: 'published',
    publishedAt: '10 Oct 2026',
    author: 'Indusun Operations',
    views: 1105,
    tags: ['application-form', 'emi', 'documentation'],
    excerpt: 'Everything applicants need for smooth plot registration: KYC documents, nominee details, and monthly EMI windows.',
  },
  {
    id: 'blog-3',
    title: 'Sai Shrushti Residency & Mahadev Nagar: Phase Updates & Possession Readiness',
    category: 'Project Update',
    status: 'published',
    publishedAt: '04 Oct 2026',
    author: 'Project Desk',
    views: 860,
    tags: ['sai-shrushti', 'mahadev-nagar', 'plots'],
    excerpt: 'Site development milestones, internal road connectivity, and block-level availability across active societies.',
  },
  {
    id: 'blog-4',
    title: 'Understanding Digital Receipts & UPI QR Verification on Gurukrupa Bills',
    category: 'Finance',
    status: 'published',
    publishedAt: '28 Sep 2026',
    author: 'Accounts Team',
    views: 640,
    tags: ['billing', 'upi-qr', 'receipts'],
    excerpt: 'How to verify official Gurukrupa Corporation receipts, registration numbers, and Karnataka Bank UPI payments.',
  },
];

const DEFAULT_SEO: CmsSeoEntry[] = [
  {
    id: 'seo-homepage',
    page: 'Homepage (/)',
    slug: '/',
    metaTitle: 'Indusun & Gurukrupa Corporation | Residential Plots & Real Estate',
    metaDescription: 'Explore verified residential plots across Royal City, Sai Shrushti Residency, Satguru Park, and Mahadev Nagar with transparent EMI plans.',
    focusKeyword: 'residential plots',
    score: 90,
  },
  {
    id: 'seo-properties',
    page: 'Properties Listing (/properties)',
    slug: '/properties',
    metaTitle: 'Browse Residential Plots & Societies | Indusun Real Estate',
    metaDescription: 'Search over 56 active societies and residential plot blocks with live plot sizes, pricing, and easy monthly installment options.',
    focusKeyword: 'residential plots',
    score: 90,
  },
  {
    id: 'seo-about',
    page: 'About Us (/about-us)',
    slug: '/about-us',
    metaTitle: 'About Gurukrupa Corporation & Indusun | Trusted Plot Developers',
    metaDescription: 'Learn how Gurukrupa Corporation and Indusun deliver accessible residential land ownership and transparent plot documentation.',
    focusKeyword: 'gurukrupa corporation',
    score: 88,
  },
  {
    id: 'seo-contact',
    page: 'Contact Us (/contact-us)',
    slug: '/contact-us',
    metaTitle: 'Contact Indusun & Gurukrupa Corporation | Book a Site Visit',
    metaDescription: 'Get in touch with Gurukrupa Corporation at Udhana Main Road, Surat for plot inquiries, EMI assistance, and scheduled site visits.',
    focusKeyword: 'gurukrupa corporation',
    score: 88,
  },
];

const DEFAULT_BANNERS: CmsBanner[] = [
  {
    id: 'banner-1',
    title: 'Royal City — New Block Bookings Open (Easy Monthly EMI)',
    location: 'Homepage Hero',
    imageUrl: '/indusun-logo.png',
    linkTo: '/properties',
    active: true,
    startDate: '01 Oct 2026',
    endDate: '31 Dec 2026',
  },
  {
    id: 'banner-2',
    title: 'Instant UPI QR Payment Available on All Official Gurukrupa Receipts',
    location: 'Properties Sidebar',
    imageUrl: '/gurukrupa-qr.png',
    linkTo: '/invoices',
    active: true,
    startDate: '01 Oct 2026',
    endDate: '31 Mar 2027',
  },
  {
    id: 'banner-3',
    title: 'Sai Shrushti Residency & Satguru Park — Site Visits Every Weekend',
    location: 'Homepage Section',
    imageUrl: '/indusun-logo.png',
    linkTo: '/site-visits',
    active: true,
    startDate: '15 Oct 2026',
    endDate: '31 Jan 2027',
  },
];

async function ensureRegistrySection<T>(
  supabase: ReturnType<typeof createServiceClient>,
  sectionKey: string,
  existingMap: Map<string, any>,
  fallback: T
): Promise<T> {
  const row = existingMap.get(`${REGISTRY_SLUG}:${sectionKey}`);
  if (row && row.data && Array.isArray(row.data.items)) {
    return row.data.items as T;
  }
  await supabase.from('page_content').upsert(
    {
      page_slug: REGISTRY_SLUG,
      section_key: sectionKey,
      data: { items: fallback },
      visible: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'page_slug,section_key' }
  );
  return fallback;
}

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data: rows, error } = await supabase
      .from('page_content')
      .select('page_slug,section_key,data,visible,updated_at');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rowMap = new Map<string, any>();
    const byPageSlug = new Map<string, any[]>();
    for (const r of rows || []) {
      rowMap.set(`${r.page_slug}:${r.section_key}`, r);
      const list = byPageSlug.get(r.page_slug) || [];
      list.push(r);
      byPageSlug.set(r.page_slug, list);
    }

    // 1. Live schema pages from cms-schema.ts + page_content rows
    const publicSlugMap: Record<string, string> = {
      homepage: '/',
      properties: '/properties',
      'about-us': '/about-us',
      'contact-us': '/contact-us',
    };

    const schemaPages: CmsCustomPage[] = PAGES.map((def, idx) => {
      const storedSections = byPageSlug.get(def.slug) || [];
      const latestUpdate = storedSections
        .map((s) => s.updated_at)
        .filter(Boolean)
        .sort()
        .pop();
      const anyHidden = storedSections.length > 0 && storedSections.every((s) => !s.visible);
      const formattedDate = latestUpdate
        ? new Date(latestUpdate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '18 Oct 2026';

      return {
        id: `schema-${def.slug}`,
        title: def.title,
        slug: publicSlugMap[def.slug] || `/${def.slug}`,
        status: anyHidden ? 'draft' : 'published',
        lastModified: formattedDate,
        modifiedBy: storedSections.length > 0 ? 'Admin (Saved in DB)' : 'Schema Default',
        views: [12450, 8920, 3210, 2780][idx] || 1000,
        editorSlug: def.slug,
      };
    });

    const customPages = await ensureRegistrySection<CmsCustomPage[]>(
      supabase,
      'custom_pages',
      rowMap,
      []
    );
    const blogs = await ensureRegistrySection<CmsBlogPost[]>(
      supabase,
      'blogs',
      rowMap,
      DEFAULT_BLOGS
    );
    const seo = await ensureRegistrySection<CmsSeoEntry[]>(
      supabase,
      'seo',
      rowMap,
      DEFAULT_SEO
    );
    const banners = await ensureRegistrySection<CmsBanner[]>(
      supabase,
      'banners',
      rowMap,
      DEFAULT_BANNERS
    );

    return NextResponse.json({
      pages: [...schemaPages, ...customPages],
      blogs,
      seo,
      banners,
    });
  } catch (err: any) {
    console.error('[api/cms GET] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, items } = body as {
      section: 'custom_pages' | 'blogs' | 'seo' | 'banners';
      items: unknown[];
    };

    if (!section || !['custom_pages', 'blogs', 'seo', 'banners'].includes(section) || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid section or items payload' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from('page_content').upsert(
      {
        page_slug: REGISTRY_SLUG,
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
    console.error('[api/cms PUT] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
