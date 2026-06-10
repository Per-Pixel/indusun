'use client';

import React, { useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import {
  Globe, FileText, Newspaper, Search, Tag, Image as ImageIcon,
  Edit, Eye, Plus, Trash2, ToggleLeft, ToggleRight, Save,
  Home, Star, MessageSquare, Settings, ChevronRight, ExternalLink,
  CheckCircle, Clock, XCircle,
} from 'lucide-react';

type CmsTab = 'pages' | 'blog' | 'seo' | 'banners';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'review';
  lastModified: string;
  modifiedBy: string;
  views: number;
}

interface BlogPost {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string;
  author: string;
  views: number;
  tags: string[];
}

interface SeoEntry {
  id: string;
  page: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  score: number;
}

interface Banner {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  linkTo: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

const MOCK_PAGES: CmsPage[] = [
  { id: '1', title: 'Homepage',          slug: '/',                 status: 'published', lastModified: '09 Jun 2026', modifiedBy: 'Amit Verma',  views: 12450 },
  { id: '2', title: 'Properties Listing', slug: '/properties',      status: 'published', lastModified: '08 Jun 2026', modifiedBy: 'Sneha Patel', views: 8920  },
  { id: '3', title: 'About Us',           slug: '/about',           status: 'published', lastModified: '05 Jun 2026', modifiedBy: 'Amit Verma',  views: 3210  },
  { id: '4', title: 'Contact Us',         slug: '/contact',         status: 'published', lastModified: '03 Jun 2026', modifiedBy: 'Sneha Patel', views: 2780  },
  { id: '5', title: 'Testimonials',       slug: '/testimonials',    status: 'draft',     lastModified: '01 Jun 2026', modifiedBy: 'Ravi Kumar',  views: 0     },
  { id: '6', title: 'Careers',            slug: '/careers',         status: 'review',    lastModified: '29 May 2026', modifiedBy: 'Sneha Patel', views: 0     },
];

const MOCK_BLOGS: BlogPost[] = [
  { id: '1', title: 'Top 5 Reasons to Invest in Gurukrupa Heights',    category: 'Investment',       status: 'published',  publishedAt: '08 Jun 2026', author: 'Sneha Patel', views: 1240, tags: ['investment', 'gurukrupa'] },
  { id: '2', title: 'A Complete Guide to Buying Your First Plot',       category: 'Buyer\'s Guide',  status: 'published',  publishedAt: '05 Jun 2026', author: 'Amit Verma',  views: 980,  tags: ['guide', 'first-time'] },
  { id: '3', title: 'Indusun Greens: New Phase Launch Announcement',    category: 'News',             status: 'scheduled',  publishedAt: '12 Jun 2026', author: 'Sneha Patel', views: 0,    tags: ['launch', 'greens'] },
  { id: '4', title: 'Understanding RERA and Property Registration',     category: 'Legal',            status: 'draft',      publishedAt: '—',           author: 'Ravi Kumar',  views: 0,    tags: ['rera', 'legal'] },
  { id: '5', title: 'Home Loan Tips for Real Estate Buyers in 2026',    category: 'Finance',          status: 'published',  publishedAt: '01 Jun 2026', author: 'Amit Verma',  views: 756,  tags: ['home-loan', 'finance'] },
];

const MOCK_SEO: SeoEntry[] = [
  { id: '1', page: 'Homepage',           metaTitle: 'Indusun Real Estate | Premium Plots & Properties',           metaDescription: 'Discover premium residential plots and properties by Indusun. Gurukrupa Heights, Indusun Greens & more.',           focusKeyword: 'real estate plots',    score: 88 },
  { id: '2', page: 'Properties Listing', metaTitle: 'Buy Residential Plots | Indusun Properties',                metaDescription: 'Browse our full inventory of residential plots. Multiple locations, competitive pricing, RERA approved.',              focusKeyword: 'residential plots',    score: 82 },
  { id: '3', page: 'About Us',           metaTitle: 'About Indusun — Trusted Real Estate Developer',              metaDescription: 'Learn about Indusun\'s story, mission and our commitment to quality real estate development.',                      focusKeyword: 'real estate developer', score: 74 },
  { id: '4', page: 'Contact Us',         metaTitle: 'Contact Indusun | Get in Touch With Our Sales Team',         metaDescription: 'Reach out to Indusun for property inquiries, site visit bookings and more. We\'re here to help.',                   focusKeyword: 'contact indusun',      score: 79 },
];

const MOCK_BANNERS: Banner[] = [
  { id: '1', title: 'Gurukrupa Heights Launch Banner', location: 'Homepage Hero',     imageUrl: '/banner-1.jpg', linkTo: '/properties/gurukrupa-heights', active: true,  startDate: '01 Jun 2026', endDate: '30 Jun 2026' },
  { id: '2', title: 'Limited Plots Offer',             location: 'Properties Sidebar', imageUrl: '/banner-2.jpg', linkTo: '/properties',                   active: true,  startDate: '05 Jun 2026', endDate: '20 Jun 2026' },
  { id: '3', title: 'New Phase Announcement',          location: 'Homepage Section',  imageUrl: '/banner-3.jpg', linkTo: '/blog/indusun-greens-launch',    active: false, startDate: '10 Jun 2026', endDate: '15 Jul 2026' },
];

const PAGE_STATUS_CONFIG = {
  published: { label: 'Published', class: 'badge-success', icon: <CheckCircle size={10} /> },
  draft:     { label: 'Draft',     class: 'badge-neutral', icon: <Edit size={10} /> },
  review:    { label: 'In Review', class: 'badge-warning', icon: <Clock size={10} /> },
};

const BLOG_STATUS_CONFIG = {
  published: { label: 'Published', class: 'badge-success', icon: <CheckCircle size={10} /> },
  draft:     { label: 'Draft',     class: 'badge-neutral', icon: <Edit size={10} /> },
  scheduled: { label: 'Scheduled', class: 'badge-info',    icon: <Clock size={10} /> },
};

function SeoScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const label = score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Poor';
  return (
    <div className="flex items-center gap-2">
      <div className="progress-bar" style={{ width: '60px' }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score} · {label}</span>
    </div>
  );
}

export default function WebsiteCmsPage() {
  const [activeTab, setActiveTab] = useState<CmsTab>('pages');
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [seoEditing, setSeoEditing] = useState<string | null>(null);

  const toggleBanner = (id: string) =>
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));

  const tabs: { key: CmsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'pages',   label: 'Pages',      icon: <FileText size={15} /> },
    { key: 'blog',    label: 'Blog / News', icon: <Newspaper size={15} /> },
    { key: 'seo',     label: 'SEO Settings', icon: <Search size={15} /> },
    { key: 'banners', label: 'Banners',    icon: <ImageIcon size={15} /> },
  ];

  return (
    <CRMLayout>
      <div className="page-container space-y-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="breadcrumb">
              <span>CMS</span><span className="sep">/</span>
              <span className="current">Website CMS</span>
            </p>
            <h1 className="page-title">Website CMS</h1>
            <p className="page-subtitle">Manage website content, blog posts, SEO settings and promotional banners</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://indusun.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={14} /> View Website
            </a>
            <button className="btn btn-primary btn-sm">
              <Plus size={14} /> New Content
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Published Pages', value: MOCK_PAGES.filter((p) => p.status === 'published').length, icon: <Globe size={18} style={{ color: '#10B981' }} />,    bg: 'bg-emerald-50' },
            { label: 'Blog Posts',       value: MOCK_BLOGS.length,                                          icon: <Newspaper size={18} style={{ color: '#3B82F6' }} />, bg: 'bg-blue-50' },
            { label: 'Active Banners',   value: banners.filter((b) => b.active).length,                    icon: <ImageIcon size={18} style={{ color: '#C9A84C' }} />, bg: 'bg-amber-50' },
            { label: 'SEO Pages',        value: MOCK_SEO.length,                                            icon: <Search size={18} style={{ color: '#8B5CF6' }} />,    bg: 'bg-purple-50' },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-item flex items-center gap-1.5 ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── PAGES TAB ──────────────────────────────────── */}
        {activeTab === 'pages' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-h3">Website Pages</h3>
              <button className="btn btn-primary btn-sm"><Plus size={14} /> New Page</button>
            </div>
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Page Title</th>
                    <th>Slug / URL</th>
                    <th>Status</th>
                    <th>Last Modified</th>
                    <th>Modified By</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PAGES.map((page) => {
                    const st = PAGE_STATUS_CONFIG[page.status];
                    return (
                      <tr key={page.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            {page.slug === '/' ? <Home size={14} style={{ color: 'var(--gold)' }} /> : <FileText size={14} style={{ color: 'var(--text-muted)' }} />}
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{page.title}</span>
                          </div>
                        </td>
                        <td>
                          <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                            {page.slug}
                          </code>
                        </td>
                        <td>
                          <span className={`badge ${st.class}`}>{st.icon} {st.label}</span>
                        </td>
                        <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{page.lastModified}</td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{page.modifiedBy}</td>
                        <td className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {page.views > 0 ? page.views.toLocaleString('en-IN') : '—'}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit size={14} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Preview"><Eye size={14} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Delete"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BLOG TAB ──────────────────────────────────── */}
        {activeTab === 'blog' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-h3">Blog / News Posts</h3>
              <button className="btn btn-primary btn-sm"><Plus size={14} /> New Post</button>
            </div>
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th>Author</th>
                    <th>Views</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_BLOGS.map((post) => {
                    const st = BLOG_STATUS_CONFIG[post.status];
                    return (
                      <tr key={post.id}>
                        <td>
                          <p className="text-sm font-semibold max-w-[220px] truncate" style={{ color: 'var(--text-primary)' }} title={post.title}>
                            {post.title}
                          </p>
                        </td>
                        <td>
                          <span className="badge badge-neutral text-xs">{post.category}</span>
                        </td>
                        <td><span className={`badge ${st.class}`}>{st.icon} {st.label}</span></td>
                        <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{post.publishedAt}</td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{post.author}</td>
                        <td className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {post.views > 0 ? post.views.toLocaleString('en-IN') : '—'}
                        </td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            {post.tags.map((t) => (
                              <span key={t} className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
                                <Tag size={8} /> {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button className="btn btn-ghost btn-icon btn-sm"><Edit size={14} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm"><Eye size={14} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SEO TAB ──────────────────────────────────── */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div className="card p-4" style={{ background: 'var(--surface-2)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Manage meta titles, descriptions and focus keywords for each page to improve search engine visibility.
              </p>
            </div>
            {MOCK_SEO.map((entry) => (
              <div key={entry.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.page}</h4>
                  <div className="flex items-center gap-2">
                    <SeoScorePill score={entry.score} />
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setSeoEditing(seoEditing === entry.id ? null : entry.id)}
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
                {seoEditing === entry.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Meta Title</label>
                      <input defaultValue={entry.metaTitle} className="input" />
                    </div>
                    <div>
                      <label className="label">Meta Description</label>
                      <textarea defaultValue={entry.metaDescription} className="input" rows={2} />
                    </div>
                    <div>
                      <label className="label">Focus Keyword</label>
                      <input defaultValue={entry.focusKeyword} className="input" />
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={() => setSeoEditing(null)}>
                        <Save size={14} /> Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSeoEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Meta Title</span>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{entry.metaTitle}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Meta Description</span>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{entry.metaDescription}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Focus Keyword:</span>
                      <span className="badge badge-gold text-xs"><Tag size={9} /> {entry.focusKeyword}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── BANNERS TAB ──────────────────────────────────── */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage promotional banners across the website</p>
              <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Banner</button>
            </div>
            {banners.map((banner) => (
              <div key={banner.id} className="card p-5 flex items-start gap-4">
                {/* Color block preview */}
                <div
                  className="flex-shrink-0 w-24 h-16 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--sidebar-bg), #1E293B)', border: '1px solid var(--gold-border)' }}
                >
                  <ImageIcon size={20} style={{ color: 'var(--gold)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{banner.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="badge badge-neutral text-xs">{banner.location}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {banner.startDate} → {banner.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <ChevronRight size={11} />
                        <span>Links to: <code className="px-1 py-0.5 rounded" style={{ background: 'var(--surface-2)' }}>{banner.linkTo}</code></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBanner(banner.id)}
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: banner.active ? 'var(--success)' : 'var(--text-muted)' }}
                      >
                        {banner.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        {banner.active ? 'Active' : 'Inactive'}
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm"><Edit size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
