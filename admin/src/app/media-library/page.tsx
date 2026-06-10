'use client';

import React, { useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import {
  Image as ImageIcon, FileText, Video, Layout, Upload,
  Search, Download, Trash2, Grid3x3, List, Filter,
  Building2, Eye, MoreVertical, FolderOpen, Plus, XCircle,
} from 'lucide-react';

type MediaCategory = 'all' | 'images' | 'documents' | 'videos' | 'floor_plans';
type ViewMode = 'grid' | 'list';

interface MediaItem {
  id: string;
  name: string;
  category: Exclude<MediaCategory, 'all'>;
  project: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  thumbnail?: string;
  tags: string[];
}

const MOCK_MEDIA: MediaItem[] = [
  { id: '1',  name: 'gurukrupa-heights-aerial.jpg',      category: 'images',      project: 'Gurukrupa Heights',       size: '2.4 MB', uploadedBy: 'Sneha Patel',   uploadedAt: '10 Jun 2026', url: '#', tags: ['aerial', 'hero'] },
  { id: '2',  name: 'indusun-greens-entrance.jpg',       category: 'images',      project: 'Indusun Greens',          size: '1.8 MB', uploadedBy: 'Amit Verma',    uploadedAt: '09 Jun 2026', url: '#', tags: ['entrance', 'exterior'] },
  { id: '3',  name: 'brochure-gurukrupa-heights.pdf',    category: 'documents',   project: 'Gurukrupa Heights',       size: '4.2 MB', uploadedBy: 'Sneha Patel',   uploadedAt: '08 Jun 2026', url: '#', tags: ['brochure', 'marketing'] },
  { id: '4',  name: 'floor-plan-type-a-3bhk.pdf',       category: 'floor_plans', project: 'Gurukrupa Heights',       size: '1.1 MB', uploadedBy: 'Amit Verma',    uploadedAt: '07 Jun 2026', url: '#', tags: ['3bhk', 'type-a'] },
  { id: '5',  name: 'walkthrough-indusun-greens.mp4',    category: 'videos',      project: 'Indusun Greens',          size: '48 MB',  uploadedBy: 'Sneha Patel',   uploadedAt: '05 Jun 2026', url: '#', tags: ['walkthrough', '3d'] },
  { id: '6',  name: 'clubhouse-amenities.jpg',           category: 'images',      project: 'Gurukrupa Residency',     size: '3.1 MB', uploadedBy: 'Ravi Kumar',    uploadedAt: '04 Jun 2026', url: '#', tags: ['clubhouse', 'amenities'] },
  { id: '7',  name: 'price-list-june-2026.pdf',         category: 'documents',   project: 'All Projects',            size: '0.5 MB', uploadedBy: 'Amit Verma',    uploadedAt: '03 Jun 2026', url: '#', tags: ['pricing', 'current'] },
  { id: '8',  name: 'floor-plan-type-b-2bhk.pdf',       category: 'floor_plans', project: 'Indusun Greens',          size: '0.9 MB', uploadedBy: 'Sneha Patel',   uploadedAt: '02 Jun 2026', url: '#', tags: ['2bhk', 'type-b'] },
  { id: '9',  name: 'swimming-pool-facility.jpg',        category: 'images',      project: 'Gurukrupa Heights',       size: '2.2 MB', uploadedBy: 'Ravi Kumar',    uploadedAt: '01 Jun 2026', url: '#', tags: ['pool', 'amenity'] },
  { id: '10', name: 'sales-presentation-q2.pptx',       category: 'documents',   project: 'All Projects',            size: '8.7 MB', uploadedBy: 'Amit Verma',    uploadedAt: '30 May 2026', url: '#', tags: ['presentation', 'sales'] },
  { id: '11', name: 'drone-footage-project.mp4',         category: 'videos',      project: 'Gurukrupa Heights',       size: '124 MB', uploadedBy: 'Sneha Patel',   uploadedAt: '28 May 2026', url: '#', tags: ['drone', 'aerial'] },
  { id: '12', name: 'master-layout-plan.pdf',            category: 'floor_plans', project: 'Gurukrupa Residency',     size: '2.6 MB', uploadedBy: 'Amit Verma',    uploadedAt: '25 May 2026', url: '#', tags: ['layout', 'master'] },
  { id: '13', name: 'garden-landscape.jpg',              category: 'images',      project: 'Indusun Greens',          size: '1.6 MB', uploadedBy: 'Ravi Kumar',    uploadedAt: '22 May 2026', url: '#', tags: ['landscape', 'garden'] },
  { id: '14', name: 'noc-certificate.pdf',               category: 'documents',   project: 'Gurukrupa Heights',       size: '0.3 MB', uploadedBy: 'Amit Verma',    uploadedAt: '20 May 2026', url: '#', tags: ['legal', 'noc'] },
  { id: '15', name: 'amenities-overview.mp4',            category: 'videos',      project: 'Gurukrupa Residency',     size: '32 MB',  uploadedBy: 'Sneha Patel',   uploadedAt: '18 May 2026', url: '#', tags: ['amenities', 'overview'] },
  { id: '16', name: 'penthouse-floor-plan.pdf',          category: 'floor_plans', project: 'Gurukrupa Heights',       size: '1.4 MB', uploadedBy: 'Ravi Kumar',    uploadedAt: '15 May 2026', url: '#', tags: ['penthouse', 'premium'] },
];

const CATEGORY_CONFIG: Record<Exclude<MediaCategory, 'all'>, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  images:      { icon: <ImageIcon size={16} />,  color: '#3B82F6', bg: 'bg-blue-50',    label: 'Images' },
  documents:   { icon: <FileText size={16} />,   color: '#EF4444', bg: 'bg-red-50',     label: 'Documents' },
  videos:      { icon: <Video size={16} />,       color: '#8B5CF6', bg: 'bg-purple-50',  label: 'Videos' },
  floor_plans: { icon: <Layout size={16} />,     color: '#10B981', bg: 'bg-emerald-50', label: 'Floor Plans' },
};

const CATEGORY_ICON_BIG: Record<Exclude<MediaCategory, 'all'>, React.ReactNode> = {
  images:      <ImageIcon size={32} style={{ color: '#3B82F6' }} />,
  documents:   <FileText size={32} style={{ color: '#EF4444' }} />,
  videos:      <Video size={32} style={{ color: '#8B5CF6' }} />,
  floor_plans: <Layout size={32} style={{ color: '#10B981' }} />,
};

function MediaCard({ item }: { item: MediaItem }) {
  const cfg = CATEGORY_CONFIG[item.category];
  return (
    <div className="card overflow-hidden group hover:shadow-md transition-all">
      {/* Thumbnail area */}
      <div
        className={`h-36 flex items-center justify-center ${cfg.bg} relative`}
      >
        {CATEGORY_ICON_BIG[item.category]}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button className="btn btn-secondary btn-sm btn-icon" title="Preview">
            <Eye size={15} />
          </button>
          <button className="btn btn-secondary btn-sm btn-icon" title="Download">
            <Download size={15} />
          </button>
        </div>
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`badge`} style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
            {cfg.label}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }} title={item.name}>
          {item.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Building2 size={11} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.project}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>{item.size}</span>
          <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>{item.uploadedAt}</span>
        </div>
      </div>
    </div>
  );
}

function MediaRow({ item }: { item: MediaItem }) {
  const cfg = CATEGORY_CONFIG[item.category];
  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cfg.bg}`} style={{ color: cfg.color }}>
            {CATEGORY_CONFIG[item.category].icon}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {item.tags.map((t) => (
                <span key={t} className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td>
        <span className={`badge`} style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
      </td>
      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.project}</td>
      <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.size}</td>
      <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.uploadedBy}</td>
      <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.uploadedAt}</td>
      <td>
        <div className="flex items-center gap-1">
          <button className="btn btn-ghost btn-icon btn-sm" title="Preview"><Eye size={14} /></button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Download"><Download size={14} /></button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Delete"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function MediaLibraryPage() {
  const [category, setCategory] = useState<MediaCategory>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('');

  const projects = Array.from(new Set(MOCK_MEDIA.map((m) => m.project)));

  const filtered = MOCK_MEDIA.filter((m) => {
    if (category !== 'all' && m.category !== category) return false;
    if (project && m.project !== project) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: MOCK_MEDIA.length,
    images: MOCK_MEDIA.filter((m) => m.category === 'images').length,
    documents: MOCK_MEDIA.filter((m) => m.category === 'documents').length,
    videos: MOCK_MEDIA.filter((m) => m.category === 'videos').length,
    floor_plans: MOCK_MEDIA.filter((m) => m.category === 'floor_plans').length,
  };

  return (
    <CRMLayout>
      <div className="page-container space-y-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="breadcrumb">
              <span>Properties</span><span className="sep">/</span>
              <span className="current">Media Library</span>
            </p>
            <h1 className="page-title">Media Library</h1>
            <p className="page-subtitle">Manage project images, brochures, floor plans and videos</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm">
              <FolderOpen size={14} /> Manage Folders
            </button>
            <button className="btn btn-primary btn-sm">
              <Upload size={14} /> Upload Files
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'total' as const, label: 'All Files', icon: <FolderOpen size={18} style={{ color: '#C9A84C' }} />, bg: 'bg-amber-50', val: stats.total },
            { key: 'images' as const, label: 'Images', icon: <ImageIcon size={18} style={{ color: '#3B82F6' }} />, bg: 'bg-blue-50', val: stats.images },
            { key: 'documents' as const, label: 'Documents', icon: <FileText size={18} style={{ color: '#EF4444' }} />, bg: 'bg-red-50', val: stats.documents },
            { key: 'videos' as const, label: 'Videos', icon: <Video size={18} style={{ color: '#8B5CF6' }} />, bg: 'bg-purple-50', val: stats.videos },
            { key: 'floor_plans' as const, label: 'Floor Plans', icon: <Layout size={18} style={{ color: '#10B981' }} />, bg: 'bg-emerald-50', val: stats.floor_plans },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setCategory(s.key === 'total' ? 'all' : s.key)}
              className={`card p-4 flex items-center gap-3 transition-all hover:shadow-md ${(s.key === 'total' ? category === 'all' : category === s.key) ? 'ring-2 ring-amber-300' : ''}`}
            >
              <div className={`p-2 rounded-xl ${s.bg}`}>{s.icon}</div>
              <div className="text-left">
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.val}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="card p-4 flex items-center gap-3 flex-wrap">
          <div className="search-wrapper flex-1 min-w-[200px]">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search file name..."
              className="input input-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input input-sm select w-auto"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {(search || project || category !== 'all') && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); setProject(''); setCategory('all'); }}
            >
              <XCircle size={14} /> Clear
            </button>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setView('grid')}
              className={`btn btn-sm btn-icon ${view === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Grid3x3 size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`btn btn-sm btn-icon ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Count */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} file{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state py-16">
              <div className="empty-state-icon">
                <ImageIcon size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="font-semibold mt-2" style={{ color: 'var(--text-secondary)' }}>No files found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting filters or upload new files</p>
              <button className="btn btn-primary btn-sm mt-4"><Upload size={14} /> Upload Files</button>
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Upload placeholder card */}
            <div
              className="card overflow-hidden flex flex-col items-center justify-center h-[200px] border-dashed border-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all"
              style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}
            >
              <Plus size={24} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>Upload files</p>
            </div>
            {filtered.map((item) => <MediaCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Project</th>
                    <th>Size</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => <MediaRow key={item.id} item={item} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
