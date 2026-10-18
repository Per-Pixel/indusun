'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
import toast from 'react-hot-toast';
import {
  Globe, FileText, Newspaper, Search, Tag, Image as ImageIcon,
  Edit, Eye, Plus, Trash2, ToggleLeft, ToggleRight, Save,
  Home, ChevronRight, ExternalLink, CheckCircle, Clock, X, RefreshCw,
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
  editorSlug?: string;
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
  excerpt?: string;
}

interface SeoEntry {
  id: string;
  page: string;
  slug: string;
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

function computeClientSeoScore(metaTitle: string, metaDescription: string, focusKeyword: string): number {
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CmsTab>('pages');
  const [loading, setLoading] = useState(true);

  const [pages, setPages] = useState<CmsPage[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [seoList, setSeoList] = useState<SeoEntry[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // SEO inline edit state
  const [seoEditing, setSeoEditing] = useState<string | null>(null);
  const [seoDraft, setSeoDraft] = useState<{ metaTitle: string; metaDescription: string; focusKeyword: string }>({
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
  });

  // Modals for Blog & Banner & Custom Page
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Investment',
    status: 'published' as BlogPost['status'],
    author: 'Gurukrupa Editorial',
    tags: '',
  });

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    location: 'Homepage Hero',
    imageUrl: '/indusun-logo.png',
    linkTo: '/properties',
    startDate: '01 Oct 2026',
    endDate: '31 Dec 2026',
  });

  const [showPageModal, setShowPageModal] = useState(false);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '/',
    status: 'published' as CmsPage['status'],
  });

  const fetchCmsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms');
      if (!res.ok) throw new Error('Failed to load CMS data');
      const data = await res.json();
      setPages(data.pages || []);
      setBlogs(data.blogs || []);
      setSeoList(data.seo || []);
      setBanners(data.banners || []);
    } catch (err: any) {
      console.error('CMS fetch error:', err);
      toast.error('Failed to load CMS records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  const persistSection = async (section: 'custom_pages' | 'blogs' | 'seo' | 'banners', items: unknown[], msg?: string) => {
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, items }),
      });
      if (!res.ok) throw new Error('Save failed');
      if (msg) toast.success(msg);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    }
  };

  // Banner handlers
  const toggleBanner = async (id: string) => {
    const next = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setBanners(next);
    await persistSection('banners', next, 'Banner status updated');
  };

  const deleteBanner = async (id: string) => {
    const next = banners.filter((b) => b.id !== id);
    setBanners(next);
    await persistSection('banners', next, 'Banner deleted');
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) return;
    let next: Banner[];
    if (editingBanner) {
      next = banners.map((b) => (b.id === editingBanner.id ? { ...b, ...bannerForm } : b));
    } else {
      next = [
        {
          id: `banner-${Date.now()}`,
          ...bannerForm,
          active: true,
        },
        ...banners,
      ];
    }
    setBanners(next);
    setShowBannerModal(false);
    setEditingBanner(null);
    await persistSection('banners', next, editingBanner ? 'Banner updated' : 'Banner created');
  };

  // Blog handlers
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim()) return;
    const tagsArr = blogForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    let next: BlogPost[];
    if (editingBlog) {
      next = blogs.map((b) =>
        b.id === editingBlog.id
          ? {
              ...b,
              title: blogForm.title.trim(),
              category: blogForm.category,
              status: blogForm.status,
              author: blogForm.author,
              tags: tagsArr,
            }
          : b
      );
    } else {
      next = [
        {
          id: `blog-${Date.now()}`,
          title: blogForm.title.trim(),
          category: blogForm.category,
          status: blogForm.status,
          publishedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          author: blogForm.author || 'Admin',
          views: 1,
          tags: tagsArr.length > 0 ? tagsArr : ['news'],
        },
        ...blogs,
      ];
    }
    setBlogs(next);
    setShowBlogModal(false);
    setEditingBlog(null);
    await persistSection('blogs', next, editingBlog ? 'Blog post updated' : 'Blog post published');
  };

  const deleteBlog = async (id: string) => {
    const next = blogs.filter((b) => b.id !== id);
    setBlogs(next);
    await persistSection('blogs', next, 'Blog post removed');
  };

  // SEO handlers
  const startEditSeo = (entry: SeoEntry) => {
    setSeoEditing(entry.id);
    setSeoDraft({
      metaTitle: entry.metaTitle,
      metaDescription: entry.metaDescription,
      focusKeyword: entry.focusKeyword,
    });
  };

  const saveSeoEntry = async (id: string) => {
    const next = seoList.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            metaTitle: seoDraft.metaTitle,
            metaDescription: seoDraft.metaDescription,
            focusKeyword: seoDraft.focusKeyword,
            score: computeClientSeoScore(seoDraft.metaTitle, seoDraft.metaDescription, seoDraft.focusKeyword),
          }
        : entry
    );
    setSeoList(next);
    setSeoEditing(null);
    await persistSection('seo', next, 'SEO metadata saved to Supabase');
  };

  // Custom Page handlers
  const handleSaveCustomPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.title.trim()) return;
    const newPage: CmsPage = {
      id: `custom-${Date.now()}`,
      title: pageForm.title.trim(),
      slug: pageForm.slug.startsWith('/') ? pageForm.slug.trim() : `/${pageForm.slug.trim()}`,
      status: pageForm.status,
      lastModified: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      modifiedBy: 'Admin',
      views: 0,
    };
    const nextAll = [...pages, newPage];
    const customOnly = nextAll.filter((p) => !p.editorSlug);
    setPages(nextAll);
    setShowPageModal(false);
    setPageForm({ title: '', slug: '/', status: 'published' });
    await persistSection('custom_pages', customOnly, 'Page registered in CMS');
  };

  const deleteCustomPage = async (id: string) => {
    const nextAll = pages.filter((p) => p.id !== id);
    const customOnly = nextAll.filter((p) => !p.editorSlug);
    setPages(nextAll);
    await persistSection('custom_pages', customOnly, 'Page removed');
  };

  const tabs: { key: CmsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'pages',   label: 'Pages',        icon: <FileText size={15} /> },
    { key: 'blog',    label: 'Blog / News',  icon: <Newspaper size={15} /> },
    { key: 'seo',     label: 'SEO Settings', icon: <Search size={15} /> },
    { key: 'banners', label: 'Banners',      icon: <ImageIcon size={15} /> },
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
            <p className="page-subtitle">
              Live Supabase-backed content manager for public website pages, blog posts, SEO metadata, and promotional banners
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchCmsData} className="btn btn-secondary btn-sm" title="Refresh from Supabase">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => router.push('/pages/homepage')}
              className="btn btn-primary btn-sm"
            >
              <Edit size={14} /> Edit Homepage Sections
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Published Pages', value: pages.filter((p) => p.status === 'published').length, icon: <Globe size={18} style={{ color: '#10B981' }} />,    bg: 'bg-emerald-50' },
            { label: 'Blog Posts',      value: blogs.length,                                          icon: <Newspaper size={18} style={{ color: '#3B82F6' }} />, bg: 'bg-blue-50' },
            { label: 'Active Banners',  value: banners.filter((b) => b.active).length,                icon: <ImageIcon size={18} style={{ color: '#C9A84C' }} />, bg: 'bg-amber-50' },
            { label: 'SEO Pages',       value: seoList.length,                                        icon: <Search size={18} style={{ color: '#8B5CF6' }} />,    bg: 'bg-purple-50' },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {s.value.toLocaleString('en-IN')}
                </p>
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
              <div>
                <h3 className="text-h3">Website Pages</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Synced with Supabase <code>page_content</code> table. Click Edit on core pages to open the live section editor.
                </p>
              </div>
              <button onClick={() => setShowPageModal(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> New Page
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Page Title</th>
                    <th>Slug / URL</th>
                    <th>Status</th>
                    <th>Last Modified</th>
                    <th>Source</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => {
                    const st = PAGE_STATUS_CONFIG[page.status] || PAGE_STATUS_CONFIG.published;
                    return (
                      <tr key={page.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            {page.slug === '/' ? (
                              <Home size={14} style={{ color: 'var(--gold)' }} />
                            ) : (
                              <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                            )}
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {page.title}
                            </span>
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
                        <td className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{page.lastModified}</td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{page.modifiedBy}</td>
                        <td className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {page.views > 0 ? page.views.toLocaleString('en-IN') : '—'}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {page.editorSlug ? (
                              <button
                                onClick={() => router.push(`/pages/${page.editorSlug}`)}
                                className="btn btn-secondary btn-sm"
                                title="Open Section Editor"
                              >
                                <Edit size={13} /> Edit Sections
                              </button>
                            ) : (
                              <button
                                onClick={() => deleteCustomPage(page.id)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Delete Custom Page"
                              >
                                <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                              </button>
                            )}
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
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setBlogForm({ title: '', category: 'Investment', status: 'published', author: 'Gurukrupa Editorial', tags: '' });
                  setShowBlogModal(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} /> New Post
              </button>
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
                  {blogs.map((post) => {
                    const st = BLOG_STATUS_CONFIG[post.status] || BLOG_STATUS_CONFIG.published;
                    return (
                      <tr key={post.id}>
                        <td>
                          <p className="text-sm font-semibold max-w-[260px] truncate" style={{ color: 'var(--text-primary)' }} title={post.title}>
                            {post.title}
                          </p>
                        </td>
                        <td>
                          <span className="badge badge-neutral text-xs">{post.category}</span>
                        </td>
                        <td><span className={`badge ${st.class}`}>{st.icon} {st.label}</span></td>
                        <td className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{post.publishedAt}</td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{post.author}</td>
                        <td className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {post.views > 0 ? post.views.toLocaleString('en-IN') : '—'}
                        </td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            {(post.tags || []).map((t) => (
                              <span key={t} className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
                                <Tag size={8} /> {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingBlog(post);
                                setBlogForm({
                                  title: post.title,
                                  category: post.category,
                                  status: post.status,
                                  author: post.author,
                                  tags: (post.tags || []).join(', '),
                                });
                                setShowBlogModal(true);
                              }}
                              className="btn btn-ghost btn-icon btn-sm"
                              title="Edit Post"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => deleteBlog(post.id)}
                              className="btn btn-ghost btn-icon btn-sm"
                              title="Delete Post"
                            >
                              <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                            </button>
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
                Manage meta titles, descriptions, and focus keywords for each page. Changes are persisted in Supabase <code>page_content</code> and SEO scores recalculate automatically.
              </p>
            </div>
            {seoList.map((entry) => (
              <div key={entry.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.page}</h4>
                  <div className="flex items-center gap-2">
                    <SeoScorePill score={entry.score} />
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => (seoEditing === entry.id ? setSeoEditing(null) : startEditSeo(entry))}
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
                {seoEditing === entry.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Meta Title</label>
                      <input
                        value={seoDraft.metaTitle}
                        onChange={(e) => setSeoDraft({ ...seoDraft, metaTitle: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Meta Description</label>
                      <textarea
                        value={seoDraft.metaDescription}
                        onChange={(e) => setSeoDraft({ ...seoDraft, metaDescription: e.target.value })}
                        className="input"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="label">Focus Keyword</label>
                      <input
                        value={seoDraft.focusKeyword}
                        onChange={(e) => setSeoDraft({ ...seoDraft, focusKeyword: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={() => saveSeoEntry(entry.id)}>
                        <Save size={14} /> Save to Database
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
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage promotional banners across the website (stored in Supabase)</p>
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setBannerForm({
                    title: '',
                    location: 'Homepage Hero',
                    imageUrl: '/indusun-logo.png',
                    linkTo: '/properties',
                    startDate: '01 Oct 2026',
                    endDate: '31 Dec 2026',
                  });
                  setShowBannerModal(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} /> Add Banner
              </button>
            </div>
            {banners.map((banner) => (
              <div key={banner.id} className="card p-5 flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-24 h-16 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, var(--sidebar-bg), #1E293B)', border: '1px solid var(--gold-border)' }}
                >
                  <ImageIcon size={20} style={{ color: 'var(--gold)' }} />
                </div>
                <div className="flex-1 min-w-0">
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
                      <button
                        onClick={() => {
                          setEditingBanner(banner);
                          setBannerForm({
                            title: banner.title,
                            location: banner.location,
                            imageUrl: banner.imageUrl,
                            linkTo: banner.linkTo,
                            startDate: banner.startDate,
                            endDate: banner.endDate,
                          });
                          setShowBannerModal(true);
                        }}
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Edit Banner"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Delete Banner"
                      >
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: New Custom Page */}
        {showPageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Register Website Page</h3>
                <button onClick={() => setShowPageModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveCustomPage} className="space-y-3">
                <div>
                  <label className="label">Page Title</label>
                  <input
                    required
                    className="input"
                    placeholder="e.g. Royal City Brochure"
                    value={pageForm.title}
                    onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Slug / Path</label>
                  <input
                    required
                    className="input"
                    placeholder="/royal-city"
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input select"
                    value={pageForm.status}
                    onChange={(e) => setPageForm({ ...pageForm, status: e.target.value as CmsPage['status'] })}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowPageModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Page</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Blog Post */}
        {showBlogModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{editingBlog ? 'Edit Blog Post' : 'New Blog Post'}</h3>
                <button onClick={() => setShowBlogModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveBlog} className="space-y-3">
                <div>
                  <label className="label">Post Title</label>
                  <input
                    required
                    className="input"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Category</label>
                    <input
                      className="input"
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input select"
                      value={blogForm.status}
                      onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as BlogPost['status'] })}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Author</label>
                  <input
                    className="input"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input
                    className="input"
                    placeholder="royal-city, investment, plots"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowBlogModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Post</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Banner */}
        {showBannerModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{editingBanner ? 'Edit Banner' : 'Add Promotional Banner'}</h3>
                <button onClick={() => setShowBannerModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveBanner} className="space-y-3">
                <div>
                  <label className="label">Banner Title</label>
                  <input
                    required
                    className="input"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Placement Location</label>
                    <input
                      className="input"
                      value={bannerForm.location}
                      onChange={(e) => setBannerForm({ ...bannerForm, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Link To URL</label>
                    <input
                      className="input"
                      value={bannerForm.linkTo}
                      onChange={(e) => setBannerForm({ ...bannerForm, linkTo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      className="input"
                      value={bannerForm.startDate}
                      onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      className="input"
                      value={bannerForm.endDate}
                      onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowBannerModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Banner</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
