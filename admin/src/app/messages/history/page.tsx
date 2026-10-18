'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import {
  Search,
  ChevronDown,
  Download,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types — mapped from the real `messages` table via /api/messages
interface MessageHistory {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  status: 'delivered' | 'pending' | 'failed';
  type: 'sms' | 'email' | 'whatsapp';
  recipients: {
    total: number;
    delivered: number;
    failed: number;
    phone?: string;
  };
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}

function mapStatus(status: string | null | undefined): MessageHistory['status'] {
  const s = (status || '').toLowerCase();
  if (s === 'failed' || s === 'error') return 'failed';
  if (s === 'pending' || s === 'new' || s === 'queued') return 'pending';
  return 'delivered';
}

function mapType(source: string | null | undefined): MessageHistory['type'] {
  const s = (source || '').toLowerCase();
  if (s === 'whatsapp') return 'whatsapp';
  if (s === 'email') return 'email';
  return 'sms';
}

export default function MessageHistoryPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<MessageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<MessageHistory | null>(null);

  const messagesPerPage = 10;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages?limit=200');
      const json = await res.json();
      const rows: MessageHistory[] = (json.messages || []).map((m: any) => {
        const status = mapStatus(m.status);
        return {
          id: m.id,
          subject: m.subject || (m.source || 'SMS'),
          content: m.message_content || '',
          sentAt: m.created_at,
          status,
          type: mapType(m.source),
          recipients: {
            total: 1,
            delivered: status === 'delivered' ? 1 : 0,
            failed: status === 'failed' ? 1 : 0,
            phone: m.sender_phone || undefined,
          },
          sender: {
            id: m.id,
            name: m.sender_name || 'Admin',
          },
        };
      });
      setMessages(rows);
    } catch (err) {
      console.error('Message history fetch error:', err);
      toast.error('Failed to load message history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType, filterStatus]);

  const filteredMessages = React.useMemo(() => {
    return messages.filter((message) => {
      const q = debouncedSearchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        message.subject.toLowerCase().includes(q) ||
        message.content.toLowerCase().includes(q) ||
        message.sender.name.toLowerCase().includes(q);
      const matchesType = filterType === 'All' || message.type === filterType.toLowerCase();
      const matchesStatus = filterStatus === 'All' || message.status === filterStatus.toLowerCase();
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [messages, debouncedSearchTerm, filterType, filterStatus]);

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  const getStatusColor = (status: MessageHistory['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending':   return 'bg-yellow-100 text-yellow-800';
      case 'failed':    return 'bg-red-100 text-red-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const exportCsv = () => {
    const header = 'Subject,Sender,Date,Type,Status,Recipient,Content\n';
    const body = filteredMessages
      .map((m) =>
        [
          `"${m.subject.replace(/"/g, '""')}"`,
          `"${m.sender.name.replace(/"/g, '""')}"`,
          `"${m.sentAt}"`,
          m.type,
          m.status,
          `"${(m.recipients.phone || '').replace(/"/g, '""')}"`,
          `"${m.content.replace(/"/g, '""').slice(0, 300)}"`,
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <button
                  onClick={() => router.push('/messages')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2 md:mb-0"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span>Back to Messages</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Message History</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Live delivery log from the <code>messages</code> table — includes SMS dispatches, contact-form messages, and failures.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-3 md:mt-0">
                <button
                  onClick={fetchMessages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search subject, content or sender..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8 text-gray-900"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="delivered">Delivered</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900">
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8 text-gray-900"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Sent By</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Recipient</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading && messages.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">Loading message history…</td></tr>
                    ) : currentMessages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <MessageSquare size={28} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">No messages found. Send an SMS from /messages to populate this log.</p>
                        </td>
                      </tr>
                    ) : currentMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[220px]">
                          <span className="block truncate" title={message.subject}>{message.subject}</span>
                          <span className="block text-xs text-gray-400 truncate" title={message.content}>{message.content}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {(message.sender.name || 'A').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="ml-2">{message.sender.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(message.sentAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {message.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {message.recipients.phone || `${message.recipients.total} recipient`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelected(message)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstMessage + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastMessage, filteredMessages.length)}</span> of{' '}
                      <span className="font-medium">{filteredMessages.length.toLocaleString('en-IN')}</span> messages
                    </p>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let page = i + 1;
                        if (totalPages > 7) {
                          if (currentPage > 4) page = currentPage - 3 + i;
                          if (page > totalPages) page = totalPages - 6 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">{selected.subject}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${getStatusColor(selected.status)}`}>{selected.status}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold capitalize">{selected.type}</span>
              <span className="text-gray-500">{formatDate(selected.sentAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.content || '—'}</p>
            <p className="text-xs text-gray-500">Sent by {selected.sender.name} · {selected.recipients.delivered} delivered / {selected.recipients.failed} failed</p>
          </div>
        </div>
      )}
    </div>
  );
}
