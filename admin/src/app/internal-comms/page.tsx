'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'react-hot-toast';
import {
  MessageSquare, Send, Paperclip, Search, Pin, PinOff,
  Trash2, Eye, FileText, Image as ImageIcon, File, Download,
  X, ChevronDown, Loader2, Plus, Clock, CheckCheck,
  Shield, Crown, Users, Lock, Filter, RefreshCw,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface InternalMessage {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  attachments: Attachment[];
  visibility: 'admins_only' | 'super_admins_only' | 'custom';
  allowed_user_ids: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  sender_name: string;
  sender_email: string;
  sender_avatar: string | null;
  is_read: boolean;
  read_at: string | null;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon size={16} className="text-green-500" />;
  if (type.includes('pdf')) return <FileText size={16} className="text-red-500" />;
  if (type.includes('word') || type.includes('document')) return <FileText size={16} className="text-blue-500" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileText size={16} className="text-emerald-500" />;
  return <File size={16} className="text-gray-500" />;
}

function getVisibilityLabel(v: string): { label: string; icon: React.ReactNode; color: string } {
  switch (v) {
    case 'super_admins_only':
      return { label: 'Super Admins Only', icon: <Crown size={12} />, color: 'bg-purple-100 text-purple-700' };
    case 'custom':
      return { label: 'Selected Members', icon: <Users size={12} />, color: 'bg-amber-100 text-amber-700' };
    default:
      return { label: 'All Admins', icon: <Shield size={12} />, color: 'bg-blue-100 text-blue-700' };
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function InternalCommsPage() {
  const { user } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Messages state
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');

  // Selected message (detail view)
  const [selectedMessage, setSelectedMessage] = useState<InternalMessage | null>(null);

  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [composing, setComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    subject: '',
    body: '',
    visibility: 'admins_only' as 'admins_only' | 'super_admins_only' | 'custom',
    allowed_user_ids: [] as string[],
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Admin users (for custom visibility picker)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch messages
  const fetchMessages = useCallback(async (showRefresh = false) => {
    if (!user) return;
    if (showRefresh) setRefreshing(true); else setLoading(true);

    try {
      const url = new URL('/api/internal-messages', window.location.origin);
      url.searchParams.set('userId', user.id);
      url.searchParams.set('userRole', user.role);
      url.searchParams.set('limit', '100');
      if (debouncedSearch) url.searchParams.set('search', debouncedSearch);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.success) {
        let msgs = data.messages as InternalMessage[];

        // Client-side visibility filter
        if (filterVisibility !== 'all') {
          msgs = msgs.filter(m => m.visibility === filterVisibility);
        }

        setMessages(msgs);
        setTotal(data.pagination?.total || msgs.length);
      } else {
        console.error('Failed to load messages:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch internal messages:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, debouncedSearch, filterVisibility]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fetch admin users (for the recipient picker in compose)
  const fetchAdminUsers = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch('/api/admin-users');
      const data = await res.json();
      if (data.success) {
        setAdminUsers((data.users || []).filter((u: AdminUser) => u.id !== user?.id));
      }
    } catch {
      // silently fail — the picker just won't show other admins
    } finally {
      setLoadingAdmins(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (showCompose) fetchAdminUsers();
  }, [showCompose, fetchAdminUsers]);

  // Mark message as read
  const markRead = async (msg: InternalMessage) => {
    if (msg.is_read || msg.sender_id === user?.id) return;
    try {
      await fetch(`/api/internal-messages/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', userId: user?.id }),
      });
      setMessages(prev =>
        prev.map(m => m.id === msg.id ? { ...m, is_read: true, read_at: new Date().toISOString() } : m)
      );
    } catch {
      // non-critical
    }
  };

  // Open message detail
  const openMessage = (msg: InternalMessage) => {
    setSelectedMessage(msg);
    markRead(msg);
  };

  // Toggle pin
  const togglePin = async (msg: InternalMessage) => {
    try {
      const res = await fetch(`/api/internal-messages/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', isPinned: !msg.is_pinned }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev =>
          prev.map(m => m.id === msg.id ? { ...m, is_pinned: !m.is_pinned } : m)
        );
        toast.success(msg.is_pinned ? 'Unpinned' : 'Pinned');
      }
    } catch {
      toast.error('Failed to update pin');
    }
  };

  // Delete message
  const handleDelete = async (msgId: string) => {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    try {
      const res = await fetch(
        `/api/internal-messages/${msgId}?callerId=${user?.id}&callerRole=${user?.role}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        if (selectedMessage?.id === msgId) setSelectedMessage(null);
        toast.success('Message deleted');
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete message');
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Limit: 10 files, 10MB each
    const valid = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });
    setPendingFiles(prev => [...prev, ...valid].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove pending file
  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSend = async () => {
    if (!composeData.subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!composeData.body.trim() && pendingFiles.length === 0) {
      toast.error('Add a message or attach a file');
      return;
    }
    if (composeData.visibility === 'custom' && composeData.allowed_user_ids.length === 0) {
      toast.error('Select at least one recipient for custom visibility');
      return;
    }

    setComposing(true);
    try {
      // Upload files first (if any)
      const uploadedAttachments: Attachment[] = [];

      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('senderId', user?.id || '');

        // For simplicity, we'll base64-encode and include in the message body
        // In production, use a proper upload endpoint
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        uploadedAttachments.push({
          name: file.name,
          url: base64, // In production, this would be a Supabase Storage URL
          type: file.type,
          size: file.size,
        });
      }

      const res = await fetch('/api/internal-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user?.id,
          subject: composeData.subject,
          body: composeData.body,
          attachments: uploadedAttachments,
          visibility: composeData.visibility,
          allowed_user_ids: composeData.visibility === 'custom' ? composeData.allowed_user_ids : [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Message shared');
        setShowCompose(false);
        setComposeData({ subject: '', body: '', visibility: 'admins_only', allowed_user_ids: [] });
        setPendingFiles([]);
        fetchMessages();
      } else {
        toast.error(data.error || 'Failed to send');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setComposing(false);
    }
  };

  // Toggle recipient in custom visibility
  const toggleRecipient = (id: string) => {
    setComposeData(prev => ({
      ...prev,
      allowed_user_ids: prev.allowed_user_ids.includes(id)
        ? prev.allowed_user_ids.filter(uid => uid !== id)
        : [...prev.allowed_user_ids, id],
    }));
  };

  const unreadCount = messages.filter(m => !m.is_read && m.sender_id !== user?.id).length;
  const pinnedMessages = messages.filter(m => m.is_pinned);
  const regularMessages = messages.filter(m => !m.is_pinned);

  return (
    <CRMLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Internal Communications</h1>
              <p className="text-sm text-gray-500 mt-1">
                Share messages, documents, and files with the admin team
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchMessages(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setShowCompose(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
              >
                <Plus size={16} />
                New Message
              </button>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={filterVisibility}
                onChange={e => setFilterVisibility(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-8 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="all">All Messages</option>
                <option value="admins_only">All Admins</option>
                <option value="super_admins_only">Super Admins Only</option>
                <option value="custom">Selected Members</option>
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Message List */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700">
                  {total} message{total !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-400">Loading…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <MessageSquare size={32} className="text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Share something with your team</p>
                  </div>
                ) : (
                  <>
                    {/* Pinned */}
                    {pinnedMessages.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                            <Pin size={11} /> Pinned
                          </p>
                        </div>
                        {pinnedMessages.map(msg => (
                          <MessageRow
                            key={msg.id}
                            msg={msg}
                            isSelected={selectedMessage?.id === msg.id}
                            currentUserId={user?.id || ''}
                            onClick={() => openMessage(msg)}
                          />
                        ))}
                      </div>
                    )}
                    {/* Regular */}
                    {regularMessages.map(msg => (
                      <MessageRow
                        key={msg.id}
                        msg={msg}
                        isSelected={selectedMessage?.id === msg.id}
                        currentUserId={user?.id || ''}
                        onClick={() => openMessage(msg)}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Message Detail / Compose */}
            <div className="lg:col-span-3">
              {showCompose ? (
                /* ─── Compose Form ─── */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">New Message</h2>
                    <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={composeData.subject}
                        onChange={e => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="What's this about?"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Visibility */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Who can see this?</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'admins_only', label: 'All Admins', icon: <Shield size={14} />, color: 'blue' },
                          ...(isSuperAdmin ? [{ value: 'super_admins_only', label: 'Super Admins Only', icon: <Crown size={14} />, color: 'purple' }] : []),
                          { value: 'custom', label: 'Select Members', icon: <Users size={14} />, color: 'amber' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setComposeData(prev => ({ ...prev, visibility: opt.value as any }))}
                            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                              composeData.visibility === opt.value
                                ? `border-${opt.color}-500 bg-${opt.color}-50 text-${opt.color}-700`
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom recipients */}
                    {composeData.visibility === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select recipients</label>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-48 overflow-y-auto">
                          {loadingAdmins ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 size={16} className="text-blue-500 animate-spin" />
                            </div>
                          ) : adminUsers.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-2">No other admins found</p>
                          ) : (
                            adminUsers.map(admin => (
                              <label
                                key={admin.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={composeData.allowed_user_ids.includes(admin.id)}
                                  onChange={() => toggleRecipient(admin.id)}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                                  {admin.avatar_url ? (
                                    <img src={admin.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-white text-xs font-bold">
                                      {admin.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                                </div>
                                {admin.role === 'super_admin' && (
                                  <Crown size={12} className="text-purple-500 flex-shrink-0" />
                                )}
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Message body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        rows={6}
                        value={composeData.body}
                        onChange={e => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="Write your message here…"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* File attachments */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Attachments</label>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Paperclip size={14} />
                          Add Files
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </div>

                      {pendingFiles.length > 0 && (
                        <div className="space-y-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
                          {pendingFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100">
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                              </div>
                              <button onClick={() => removePendingFile(idx)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {pendingFiles.length === 0 && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-lg p-6 flex flex-col items-center cursor-pointer transition-colors group"
                        >
                          <Paperclip size={20} className="text-gray-300 group-hover:text-blue-400 mb-1.5" />
                          <p className="text-xs font-medium text-gray-400 group-hover:text-blue-500">
                            Click to attach files or drag & drop
                          </p>
                          <p className="text-[11px] text-gray-300 mt-0.5">Up to 10 files, 10MB each</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Send */}
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      onClick={() => { setShowCompose(false); setPendingFiles([]); }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white"
                      disabled={composing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={composing}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 shadow-sm"
                    >
                      {composing ? (
                        <><Loader2 size={15} className="animate-spin" />Sending…</>
                      ) : (
                        <><Send size={15} />Share Message</>
                      )}
                    </button>
                  </div>
                </div>
              ) : selectedMessage ? (
                /* ─── Message Detail ─── */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {selectedMessage.is_pinned && <Pin size={14} className="text-amber-500 flex-shrink-0" />}
                          <h2 className="text-lg font-semibold text-gray-900 truncate">{selectedMessage.subject}</h2>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">{selectedMessage.sender_name}</span>
                          <span>·</span>
                          <span>{timeAgo(selectedMessage.created_at)}</span>
                          <span>·</span>
                          {(() => {
                            const vis = getVisibilityLabel(selectedMessage.visibility);
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${vis.color}`}>
                                {vis.icon} {vis.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isSuperAdmin && (
                          <button
                            onClick={() => togglePin(selectedMessage)}
                            className="p-2 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-gray-50"
                            title={selectedMessage.is_pinned ? 'Unpin' : 'Pin'}
                          >
                            {selectedMessage.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                          </button>
                        )}
                        {(selectedMessage.sender_id === user?.id || isSuperAdmin) && (
                          <button
                            onClick={() => handleDelete(selectedMessage.id)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMessage(null)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {selectedMessage.body || <span className="text-gray-400 italic">No message body</span>}
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="px-5 pb-5">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Attachments ({selectedMessage.attachments.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedMessage.attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            {getFileIcon(att.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{att.name}</p>
                              <p className="text-xs text-gray-400">{formatFileSize(att.size)}</p>
                            </div>
                            <a
                              href={att.url}
                              download={att.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors flex-shrink-0"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        ))}
                      </div>

                      {/* Image previews */}
                      {selectedMessage.attachments.filter(a => a.type.startsWith('image/')).length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedMessage.attachments
                            .filter(a => a.type.startsWith('image/'))
                            .map((att, idx) => (
                              <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer"
                                className="rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors">
                                <img src={att.url} alt={att.name} className="w-full h-32 object-cover" />
                              </a>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* ─── Empty state ─── */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <MessageSquare size={28} className="text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Select a message</h3>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Choose a message from the list to view its contents, or create a new one to share with your team.
                  </p>
                  <button
                    onClick={() => setShowCompose(true)}
                    className="mt-5 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    New Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}

// ─── Message Row Component ─────────────────────────────────────────────────
const MessageRow = React.memo(function MessageRow({
  msg,
  isSelected,
  currentUserId,
  onClick,
}: {
  msg: InternalMessage;
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const isUnread = !msg.is_read && msg.sender_id !== currentUserId;
  const vis = getVisibilityLabel(msg.visibility);

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'
      } ${isUnread ? 'bg-blue-50/40' : ''}`}
    >
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        {msg.sender_avatar ? (
          <img src={msg.sender_avatar} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-white text-xs font-bold">
            {msg.sender_name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {msg.sender_name}
          </p>
          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(msg.created_at)}</span>
        </div>
        <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
          {msg.subject}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${vis.color}`}>
            {vis.icon} {vis.label}
          </span>
          {msg.attachments && msg.attachments.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
              <Paperclip size={10} />
              {msg.attachments.length}
            </span>
          )}
          {msg.is_pinned && <Pin size={10} className="text-amber-400" />}
          {msg.is_read && msg.sender_id === currentUserId && (
            <CheckCheck size={12} className="text-blue-400" />
          )}
        </div>
      </div>

      {isUnread && (
        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
});
