'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CRMLayout from '@/components/CRMLayout';
import toast from 'react-hot-toast';
import {
  Image as ImageIcon, FileText, Video, Layout, Upload,
  Search, Download, Trash2, Grid3x3, List,
  Building2, Eye, FolderOpen, Plus, XCircle, X, RefreshCw,
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
  tags: string[];
}

const CATEGORY_CONFIG: Record<Exclude<MediaCategory, 'all'>, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  images:      { icon: <ImageIcon size={16} />,  color: '#3B82F6', bg: 'bg-blue-50',    label: 'Images' },
  documents:   { icon: <FileText size={16} />,   color: '#EF4444', bg: 'bg-red-50',     label: 'Documents' },
  videos:      { icon: <Video size={16} />,      color: '#8B5CF6', bg: 'bg-purple-50',  label: 'Videos' },
  floor_plans: { icon: <Layout size={16} />,     color: '#10B981', bg: 'bg-emerald-50', label: 'Floor Plans' },
};

const CATEGORY_ICON_BIG: Record<Exclude<MediaCategory, 'all'>, React.ReactNode> = {
  images:      <ImageIcon size={32} style={{ color: '#3B82F6' }} />,
  documents:   <FileText size={32} style={{ color: '#EF4444' }} />,
  videos:      <Video size={32} style={{ color: '#8B5CF6' }} />,
  floor_plans: <Layout size={32} style={{ color: '#10B981' }} />,
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [societies, setSocieties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<MediaCategory>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Exclude<MediaCategory, 'all'>>('images');
  const [uploadProject, setUploadProject] = useState('Gurukrupa Corporation');
  const [uploadTags, setUploadTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (!res.ok) throw new Error('Failed to load media library');
      const data = await res.json();
      setItems(data.items || []);
      setSocieties(data.societies || []);
    } catch (err) {
      console.error('Media fetch error:', err);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const upRes = await fetch('/api/uploads', { method: 'POST', body: formData });
      const upJson = await upRes.json();
      if (!upRes.ok || !upJson.url) {
        throw new Error(upJson.error || 'Upload failed');
      }

      const tagsArr = uploadTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const saveRes = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          category: uploadCategory,
          project: uploadProject || 'Gurukrupa Corporation',
          size: formatFileSize(file.size),
          uploadedBy: 'Admin',
          url: upJson.url,
          tags: tagsArr.length > 0 ? tagsArr : [uploadCategory],
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save media record');
      toast.success('File uploaded to Media Library');
      setShowUploadModal(false);
      setUploadTags('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Removed from Media Library');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const projects = Array.from(new Set([...items.map((m) => m.project), ...societies])).filter(Boolean);

  const filtered = items.filter((m) => {
    if (category !== 'all' && m.category !== category) return false;
    if (project && m.project !== project) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: items.length,
    images: items.filter((m) => m.category === 'images').length,
    documents: items.filter((m) => m.category === 'documents').length,
    videos: items.filter((m) => m.category === 'videos').length,
    floor_plans: items.filter((m) => m.category === 'floor_plans').length,
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
            <p className="page-subtitle">
              Live asset repository indexing uploaded files, official Gurukrupa QR/receipt assets, bill attachments, and internal comms documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchMedia} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowUploadModal(true)} className="btn btn-primary btn-sm">
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
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.val.toLocaleString('en-IN')}</p>
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
            className="input input-sm select w-auto max-w-[240px]"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">All Projects / Societies</option>
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

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length.toLocaleString('en-IN')} file{filtered.length !== 1 ? 's' : ''} found
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
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary btn-sm mt-4">
                <Upload size={14} /> Upload Files
              </button>
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            <div
              onClick={() => setShowUploadModal(true)}
              className="card overflow-hidden flex flex-col items-center justify-center h-[210px] border-dashed border-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all"
              style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}
            >
              <Plus size={24} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>Upload files</p>
            </div>
            {filtered.map((item) => {
              const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.images;
              return (
                <div key={item.id} className="card overflow-hidden group hover:shadow-md transition-all">
                  <div className={`h-36 flex items-center justify-center ${cfg.bg} relative overflow-hidden`}>
                    {item.category === 'images' && item.url && item.url !== '#' ? (
                      <img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      CATEGORY_ICON_BIG[item.category]
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm btn-icon"
                        title="Preview"
                      >
                        <Eye size={15} />
                      </a>
                      <a
                        href={item.url}
                        download={item.name}
                        className="btn btn-secondary btn-sm btn-icon"
                        title="Download"
                      >
                        <Download size={15} />
                      </a>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-secondary btn-sm btn-icon"
                        title="Delete"
                      >
                        <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
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
            })}
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
                    <th>Source</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.images;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cfg.bg}`} style={{ color: cfg.color }}>
                              {cfg.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                {(item.tags || []).map((t) => (
                                  <span key={t} className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.project}</td>
                        <td className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{item.size}</td>
                        <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.uploadedBy}</td>
                        <td className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{item.uploadedAt}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Preview">
                              <Eye size={14} />
                            </a>
                            <a href={item.url} download={item.name} className="btn btn-ghost btn-icon btn-sm" title="Download">
                              <Download size={14} />
                            </a>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-icon btn-sm" title="Delete">
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Upload File to Media Library</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleUploadFile} className="space-y-3">
                <div>
                  <label className="label">Select File (Image or PDF)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    className="input py-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input select"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as Exclude<MediaCategory, 'all'>)}
                    >
                      <option value="images">Images</option>
                      <option value="documents">Documents</option>
                      <option value="floor_plans">Floor Plans</option>
                      <option value="videos">Videos</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Project / Society</label>
                    <input
                      list="media-societies-list"
                      className="input"
                      value={uploadProject}
                      onChange={(e) => setUploadProject(e.target.value)}
                    />
                    <datalist id="media-societies-list">
                      {societies.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input
                    className="input"
                    placeholder="brochure, layout, royal-city"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" disabled={uploading} className="btn btn-primary btn-sm">
                    {uploading ? 'Uploading…' : 'Upload & Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
