'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'react-hot-toast';
import {
  MessageSquare, Send, Paperclip, Pin, PinOff,
  Trash2, FileText, Image as ImageIcon, File, Download,
  X, Loader2, Plus, Shield, Crown, Users, ChevronLeft, RefreshCw,
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

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function formatClock(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatListTime(dateStr: string): string {
  const d = new Date(dateStr);
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (days <= 0) return formatClock(dateStr);
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDayChip(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-IN', { weekday: 'long' });
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

function avatarTone(seed: string): string {
  const tones = [
    'bg-blue-700 text-white',
    'bg-[#DCE6F5] text-blue-800',
    'bg-[#F3EBDA] text-[#6B5418]',
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return tones[Math.abs(h) % tones.length];
}

function fileExt(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.slice(0, 4).toUpperCase() : 'FILE';
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon size={16} className="text-emerald-600" />;
  if (type.includes('pdf')) return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-gray-500" />;
}

function getVisibilityLabel(v: string): { label: string; icon: React.ReactNode; color: string } {
  switch (v) {
    case 'super_admins_only':
      return { label: 'Super Admins Only', icon: <Crown size={12} />, color: 'bg-purple-100 text-purple-700' };
    case 'custom':
      return { label: 'Selected Members', icon: <Users size={12} />, color: 'bg-[#F3EBDA] text-[#6B5418]' };
    default:
      return { label: 'All Admins', icon: <Shield size={12} />, color: 'bg-[#E9F0FA] text-blue-800' };
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function InternalCommsPage() {
  const { user } = useAdminAuth();
  const composeFileRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

  // Messages state
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [tab, setTab] = useState<'all' | 'unread' | 'pinned'>('all');

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

  // Quick reply state
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replying, setReplying] = useState(false);

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
        if (filterVisibility !== 'all') {
          msgs = msgs.filter(m => m.visibility === filterVisibility);
        }
        setMessages(msgs);
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

  // Keep the detail pane in sync with refreshed data
  useEffect(() => {
    if (selectedMessage) {
      const fresh = messages.find(m => m.id === selectedMessage.id);
      if (fresh && fresh !== selectedMessage) setSelectedMessage(fresh);
      if (!fresh && messages.length > 0) setSelectedMessage(null);
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setShowCompose(false);
    setPendingFiles([]);
    setSelectedMessage(msg);
    setReplyText('');
    setReplyFiles([]);
    markRead(msg);
  };

  const openCompose = () => {
    setSelectedMessage(null);
    setReplyText('');
    setReplyFiles([]);
    setPendingFiles([]);
    setShowCompose(true);
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

  // Encode files as attachments (base64 — same approach as before)
  const encodeFiles = async (files: File[]): Promise<Attachment[]> => {
    const out: Attachment[] = [];
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      out.push({ name: file.name, url: base64, type: file.type, size: file.size });
    }
    return out;
  };

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });
    setter(prev => [...prev, ...valid].slice(0, 10));
    e.target.value = '';
  };

  // Send full compose message
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
      const uploadedAttachments = await encodeFiles(pendingFiles);

      const res = await fetch('/api/internal-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user?.id,
          subject: composeData.subject,
          body: composeData.body,
          attachments: uploadedAttachments,
          visibility: composeData.visibility,
          // Sender must be in allowed_user_ids or the post is invisible to them
          allowed_user_ids: composeData.visibility === 'custom'
            ? [...new Set([...composeData.allowed_user_ids, user?.id || ''])]
            : [],
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
    } catch {
      toast.error('Network error');
    } finally {
      setComposing(false);
    }
  };

  // Quick reply — private reply to the sender (custom visibility), or a quick
  // broadcast when viewing your own message.
  const isOwnSelected = selectedMessage?.sender_id === user?.id;

  const handleReply = async () => {
    if (!selectedMessage || !user) return;
    const text = replyText.trim();
    if (!text && replyFiles.length === 0) return;

    setReplying(true);
    try {
      const attachments = await encodeFiles(replyFiles);
      const firstName = selectedMessage.sender_name.split(' ')[0];

      const payload = isOwnSelected
        ? {
            subject: (text || 'Shared files').slice(0, 80),
            visibility: 'admins_only' as const,
            allowed_user_ids: [] as string[],
          }
        : {
            subject: `Re: ${selectedMessage.subject}`.slice(0, 90),
            visibility: 'custom' as const,
            allowed_user_ids: [selectedMessage.sender_id, user.id],
          };

      const res = await fetch('/api/internal-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          body: text,
          attachments,
          ...payload,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isOwnSelected ? 'Message shared' : `Reply sent to ${firstName}`);
        setReplyText('');
        setReplyFiles([]);
        if (replyBoxRef.current) replyBoxRef.current.style.height = 'auto';
        fetchMessages(true);
      } else {
        toast.error(data.error || 'Failed to send');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setReplying(false);
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

  const visibleMessages = messages.filter(m => {
    if (tab === 'unread') return !m.is_read && m.sender_id !== user?.id;
    if (tab === 'pinned') return m.is_pinned;
    return true;
  });

  const paneActive = showCompose || !!selectedMessage;

  const inputCls = 'w-full h-10 px-3 text-sm border border-[#B7C6DC] rounded-lg bg-white text-[#14243D] placeholder:text-[#4F5B6B]/70 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600';
  const iconBtnCls = 'flex items-center justify-center w-10 h-10 rounded-lg border border-[#B7C6DC] bg-white text-[#14243D] hover:bg-[#FBF6EC] transition-colors flex-shrink-0';

  return (
    <CRMLayout>
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1400px] grid md:grid-cols-[320px_minmax(0,1fr)] h-[calc(100dvh-94px)] sm:h-[calc(100dvh-118px)] min-h-[540px] rounded-xl border border-[#D5DEEB] bg-white overflow-hidden text-[#14243D]">
          {/* ── Rail: thread list ─────────────────────────────────────── */}
          <aside className={`${paneActive ? 'hidden md:flex' : 'flex'} flex-col border-r border-[#D5DEEB] bg-[#FBF6EC] min-w-0`}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h1 className="text-xl font-semibold">Admin messages</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchMessages(true)}
                  aria-label="Refresh"
                  className={iconBtnCls}
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={openCompose}
                  aria-label="New message"
                  className={`${iconBtnCls} text-blue-700 text-xl leading-none`}
                >
                  +
                </button>
              </div>
            </div>

            <div className="px-5 pb-3">
              <label htmlFor="thread-search" className="sr-only">Search conversations</label>
              <input
                id="thread-search"
                type="search"
                placeholder="Search admins or messages"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={inputCls}
              />
            </div>

            <div role="tablist" className="flex gap-2 px-5 pb-3">
              {([
                { key: 'all', label: 'All' },
                { key: 'unread', label: unreadCount > 0 ? `Unread ${unreadCount}` : 'Unread' },
                { key: 'pinned', label: 'Pinned' },
              ] as const).map(t => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`h-8 px-3 rounded-full border text-sm transition-colors ${
                    tab === t.key
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-[#B7C6DC] bg-white text-[#14243D] hover:bg-[#E9F0FA]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-5 pb-3">
              <select
                value={filterVisibility}
                onChange={e => setFilterVisibility(e.target.value)}
                aria-label="Filter by audience"
                className={`${inputCls} h-9 text-[#4F5B6B]`}
              >
                <option value="all">All audiences</option>
                <option value="admins_only">All Admins</option>
                <option value="super_admins_only">Super Admins Only</option>
                <option value="custom">Selected Members</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={24} className="text-blue-600 animate-spin mb-2" />
                  <p className="text-sm text-[#4F5B6B]">Loading…</p>
                </div>
              ) : visibleMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <MessageSquare size={30} className="text-[#B7C6DC] mb-3" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs text-[#4F5B6B] mt-1">Share something with your team</p>
                </div>
              ) : (
                visibleMessages.map(msg => (
                  <ThreadRow
                    key={msg.id}
                    msg={msg}
                    isSelected={selectedMessage?.id === msg.id && !showCompose}
                    currentUserId={user?.id || ''}
                    onClick={() => openMessage(msg)}
                  />
                ))
              )}
            </div>
          </aside>

          {/* ── Pane: detail / compose / empty ────────────────────────── */}
          <section className={`${paneActive ? 'flex' : 'hidden'} md:flex flex-col min-w-0 bg-white`}>
            {showCompose ? (
              /* ─── Compose ─── */
              <>
                <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#D5DEEB]">
                  <button
                    onClick={() => setShowCompose(false)}
                    aria-label="Back"
                    className={`${iconBtnCls} md:hidden`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-[17px] font-semibold">New message</h2>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 bg-[#FBF6EC]">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={e => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="What's this about?"
                      className={inputCls}
                    />
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Who can see this?</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'admins_only', label: 'All Admins', icon: <Shield size={14} />, active: 'border-blue-600 bg-blue-50 text-blue-700' },
                        ...(isSuperAdmin ? [{ value: 'super_admins_only', label: 'Super Admins Only', icon: <Crown size={14} />, active: 'border-purple-500 bg-purple-50 text-purple-700' }] : []),
                        { value: 'custom', label: 'Select Members', icon: <Users size={14} />, active: 'border-amber-500 bg-amber-50 text-amber-700' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setComposeData(prev => ({ ...prev, visibility: opt.value as typeof prev.visibility }))}
                          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all bg-white ${
                            composeData.visibility === opt.value
                              ? opt.active
                              : 'border-[#D5DEEB] text-[#4F5B6B] hover:border-[#B7C6DC]'
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
                      <label className="block text-sm font-medium mb-2">Select recipients</label>
                      <div className="bg-white rounded-lg border border-[#D5DEEB] p-3 max-h-48 overflow-y-auto">
                        {loadingAdmins ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="text-blue-600 animate-spin" />
                          </div>
                        ) : adminUsers.length === 0 ? (
                          <p className="text-sm text-[#4F5B6B] text-center py-2">No other admins found</p>
                        ) : (
                          adminUsers.map(admin => (
                            <label
                              key={admin.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FBF6EC] cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={composeData.allowed_user_ids.includes(admin.id)}
                                onChange={() => toggleRecipient(admin.id)}
                                className="h-4 w-4 accent-blue-600 rounded border-gray-300"
                              />
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarTone(admin.id)}`}>
                                {admin.avatar_url ? (
                                  <img src={admin.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-xs font-semibold">{initials(admin.name)}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{admin.name}</p>
                                <p className="text-xs text-[#4F5B6B] truncate">{admin.email}</p>
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
                    <label className="block text-sm font-medium mb-1.5">Message</label>
                    <textarea
                      rows={6}
                      value={composeData.body}
                      onChange={e => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Write your message here…"
                      className={`${inputCls} h-auto py-2.5 resize-none`}
                    />
                  </div>

                  {/* File attachments */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Attachments</label>
                      <button
                        type="button"
                        onClick={() => composeFileRef.current?.click()}
                        className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800 font-medium"
                      >
                        <Paperclip size={14} />
                        Add Files
                      </button>
                      <input
                        ref={composeFileRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={e => pickFiles(e, setPendingFiles)}
                      />
                    </div>

                    {pendingFiles.length > 0 ? (
                      <div className="space-y-2 bg-white rounded-lg border border-[#D5DEEB] p-3">
                        {pendingFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-[#FBF6EC] rounded-lg p-2 border border-[#D5DEEB]">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-[#4F5B6B]">{formatFileSize(file.size)}</p>
                            </div>
                            <button onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))} className="text-[#4F5B6B] hover:text-red-500 flex-shrink-0">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        onClick={() => composeFileRef.current?.click()}
                        className="border-2 border-dashed border-[#B7C6DC] hover:border-blue-500 rounded-lg p-6 flex flex-col items-center cursor-pointer transition-colors bg-white group"
                      >
                        <Paperclip size={20} className="text-[#B7C6DC] group-hover:text-blue-500 mb-1.5" />
                        <p className="text-xs font-medium text-[#4F5B6B] group-hover:text-blue-600">
                          Click to attach files or drag & drop
                        </p>
                        <p className="text-[11px] text-[#9AA7B8] mt-0.5">Up to 10 files, 10MB each</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Send */}
                <div className="px-4 sm:px-6 py-4 border-t border-[#D5DEEB] flex justify-end gap-3">
                  <button
                    onClick={() => { setShowCompose(false); setPendingFiles([]); }}
                    className="px-4 py-2.5 text-sm font-medium border border-[#B7C6DC] rounded-lg hover:bg-[#FBF6EC]"
                    disabled={composing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={composing}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {composing ? (
                      <><Loader2 size={15} className="animate-spin" />Sending…</>
                    ) : (
                      <><Send size={15} />Share Message</>
                    )}
                  </button>
                </div>
              </>
            ) : selectedMessage ? (
              /* ─── Conversation view ─── */
              <>
                <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-[#D5DEEB]">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      aria-label="Back to messages"
                      className={`${iconBtnCls} md:hidden`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className={`w-11 h-11 rounded-full flex items-center justify-center font-medium flex-shrink-0 ${avatarTone(selectedMessage.sender_id)}`}>
                      {selectedMessage.sender_avatar ? (
                        <img src={selectedMessage.sender_avatar} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        initials(selectedMessage.sender_name)
                      )}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[17px] font-semibold truncate">{selectedMessage.sender_name}</h2>
                      <p className="text-[13px] text-[#4F5B6B] truncate">
                        {isOwnSelected ? 'You' : selectedMessage.sender_email || 'Admin'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSuperAdmin && (
                      <button
                        onClick={() => togglePin(selectedMessage)}
                        className={iconBtnCls}
                        title={selectedMessage.is_pinned ? 'Unpin' : 'Pin'}
                        aria-label={selectedMessage.is_pinned ? 'Unpin message' : 'Pin message'}
                      >
                        {selectedMessage.is_pinned ? <PinOff size={16} className="text-amber-600" /> : <Pin size={16} />}
                      </button>
                    )}
                    {(selectedMessage.sender_id === user?.id || isSuperAdmin) && (
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className={`${iconBtnCls} hover:text-red-600`}
                        title="Delete"
                        aria-label="Delete message"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className={iconBtnCls}
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </header>

                {/* Message body area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col gap-3.5 bg-[#FBF6EC]">
                  <div className="self-center text-xs text-[#4F5B6B] px-3 py-1 rounded-xl bg-[#F3EBDA]">
                    {formatDayChip(selectedMessage.created_at)}
                  </div>

                  <div className="self-center text-[13px] text-[#4F5B6B] py-1">
                    {isOwnSelected ? 'You' : selectedMessage.sender_name} shared with{' '}
                    {getVisibilityLabel(selectedMessage.visibility).label}
                    {selectedMessage.is_pinned ? ' · Pinned' : ''}
                  </div>

                  {isOwnSelected ? (
                    /* Own message — right-aligned bubble */
                    <div className="self-end max-w-[70%] text-right">
                      <div className="px-3.5 py-2.5 rounded-xl rounded-br-[4px] bg-blue-600 text-white text-[15px] leading-relaxed text-left">
                        <p className="font-semibold mb-0.5">{selectedMessage.subject}</p>
                        {selectedMessage.body && (
                          <p className="whitespace-pre-wrap opacity-95">{selectedMessage.body}</p>
                        )}
                      </div>
                      <AttachmentCards
                        attachments={selectedMessage.attachments}
                        align="right"
                      />
                      <p className="mt-1 text-xs text-[#4F5B6B]">You · {formatClock(selectedMessage.created_at)}</p>
                    </div>
                  ) : (
                    /* Incoming message — left-aligned bubble */
                    <div className="self-start max-w-[70%]">
                      <p className="mb-1 text-xs text-[#4F5B6B]">
                        {selectedMessage.sender_name} · {formatClock(selectedMessage.created_at)}
                      </p>
                      <div className="px-3.5 py-2.5 rounded-xl rounded-bl-[4px] bg-white border border-[#D5DEEB] text-[15px] leading-relaxed">
                        <p className="font-semibold mb-0.5">{selectedMessage.subject}</p>
                        {selectedMessage.body ? (
                          <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                        ) : (
                          <p className="text-[#4F5B6B] italic">No message body</p>
                        )}
                      </div>
                      <AttachmentCards
                        attachments={selectedMessage.attachments}
                        align="left"
                      />
                    </div>
                  )}
                </div>

                {/* Composer */}
                <div className="px-4 sm:px-6 pt-3 pb-4 border-t border-[#D5DEEB]">
                  {replyFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {replyFiles.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg border border-[#B7C6DC] bg-white text-xs">
                          <Paperclip size={11} className="text-[#4F5B6B]" />
                          <span className="max-w-[160px] truncate">{f.name}</span>
                          <button
                            onClick={() => setReplyFiles(prev => prev.filter((_, x) => x !== i))}
                            className="text-[#4F5B6B] hover:text-red-500"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2.5">
                    <button
                      onClick={() => replyFileRef.current?.click()}
                      aria-label="Attach file"
                      className={`${iconBtnCls} w-11 h-11`}
                    >
                      <Paperclip size={17} />
                    </button>
                    <input
                      ref={replyFileRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={e => pickFiles(e, setReplyFiles)}
                    />
                    <label htmlFor="composer" className="sr-only">
                      {isOwnSelected ? 'Share an update' : `Reply privately to ${selectedMessage.sender_name}`}
                    </label>
                    <textarea
                      id="composer"
                      ref={replyBoxRef}
                      rows={1}
                      value={replyText}
                      onChange={e => {
                        setReplyText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                      placeholder={isOwnSelected ? 'Share a quick update with all admins…' : `Reply privately to ${selectedMessage.sender_name.split(' ')[0]}…`}
                      className="flex-1 min-h-[44px] px-3.5 py-[11px] border border-[#B7C6DC] rounded-lg resize-none text-[15px] text-[#14243D] placeholder:text-[#4F5B6B]/70 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                    <button
                      onClick={handleReply}
                      disabled={replying || (!replyText.trim() && replyFiles.length === 0)}
                      className="flex-none h-11 px-5 rounded-lg bg-blue-600 text-white text-[15px] font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {replying ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ─── Empty state ─── */
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#E9F0FA] flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-blue-600" />
                </div>
                <h3 className="text-base font-semibold mb-1">Select a message</h3>
                <p className="text-sm text-[#4F5B6B] max-w-xs">
                  Choose a message from the list to view its contents, or start a new one for your team.
                </p>
                <button
                  onClick={openCompose}
                  className="mt-5 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  New Message
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </CRMLayout>
  );
}

// ─── Attachment cards (design: ext chip + name + size) ──────────────────────
function AttachmentCards({ attachments, align }: { attachments: Attachment[]; align: 'left' | 'right' }) {
  if (!attachments || attachments.length === 0) return null;
  const images = attachments.filter(a => a.type.startsWith('image/'));

  return (
    <div className={`mt-1.5 space-y-1.5 ${align === 'right' ? 'flex flex-col items-end' : ''}`}>
      {attachments.map((att, idx) => (
        <a
          key={idx}
          href={att.url}
          download={att.name}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 border border-[#B7C6DC] rounded-lg bg-white max-w-[280px] w-full hover:border-blue-500 transition-colors group"
        >
          <span className="w-9 h-9 rounded-md bg-[#E9F0FA] text-blue-800 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
            {fileExt(att.name)}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-medium truncate text-[#14243D]">{att.name}</span>
            <span className="block text-xs text-[#4F5B6B]">{formatFileSize(att.size)}</span>
          </span>
          <Download size={15} className="text-[#4F5B6B] group-hover:text-blue-600 flex-shrink-0" />
        </a>
      ))}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 w-full">
          {images.map((att, idx) => (
            <a
              key={idx}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg overflow-hidden border border-[#D5DEEB] hover:border-blue-500 transition-colors"
            >
              <img src={att.url} alt={att.name} className="w-full h-28 object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Thread row (design: avatar, name + time, subtitle, preview, unread) ────
const ThreadRow = React.memo(function ThreadRow({
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
    <button
      onClick={onClick}
      className={`flex gap-3 w-full px-5 py-3.5 border-0 text-left transition-colors ${
        isSelected ? 'bg-[#E9F0FA]' : 'bg-transparent hover:bg-[#F3EFE6]'
      }`}
    >
      <span className={`flex-none w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${avatarTone(msg.sender_id)}`}>
        {msg.sender_avatar ? (
          <img src={msg.sender_avatar} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          initials(msg.sender_name)
        )}
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex justify-between items-center gap-2">
          <span className={`text-[15px] truncate ${isUnread ? 'font-semibold' : 'font-medium'}`}>
            {msg.sender_id === currentUserId ? `${msg.sender_name} (you)` : msg.sender_name}
          </span>
          <span className="text-xs text-[#4F5B6B] flex-shrink-0 flex items-center gap-1">
            {msg.is_pinned && <Pin size={11} className="text-amber-600" />}
            {formatListTime(msg.created_at)}
          </span>
        </span>
        <span className="block text-xs text-[#4F5B6B] mt-0.5">{vis.label}</span>
        <span className={`block text-sm mt-1 truncate ${isUnread ? 'text-[#14243D] font-medium' : 'text-[#4F5B6B]'}`}>
          {msg.subject}
        </span>
      </span>

      {isUnread && (
        <span className="flex-none self-center w-2.5 h-2.5 rounded-full bg-blue-600" aria-label="Unread" />
      )}
    </button>
  );
});
