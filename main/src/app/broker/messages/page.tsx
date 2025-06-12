'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';
import {
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Types
interface Message {
  id: string;
  sender_name: string;
  sender_email?: string;
  sender_phone?: string;
  subject?: string;
  message_content: string;
  source: string;
  source_page?: string;
  status: 'read' | 'unread' | 'replied';
  created_at: string;
  read_at?: string;
  replied_at?: string;
}

interface MessageStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

export default function BrokerMessages() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<MessageStats>({ total: 0, unread: 0, read: 0, replied: 0 });

  const messagesPerPage = 10;

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'broker')) {
      router.push('/broker/login');
    }
  }, [user, isLoading, router]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', messagesPerPage.toString());
      params.append('offset', ((currentPage - 1) * messagesPerPage).toString());
      
      if (filterStatus !== 'All') {
        params.append('status', filterStatus.toLowerCase());
      }

      const response = await fetch(`/api/broker/messages?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setTotalCount(data.pagination.total);
        
        // Calculate stats
        const unread = data.messages.filter((m: Message) => m.status === 'unread').length;
        const read = data.messages.filter((m: Message) => m.status === 'read').length;
        const replied = data.messages.filter((m: Message) => m.status === 'replied').length;
        
        setStats({
          total: data.pagination.total,
          unread,
          read,
          replied
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'broker') {
      fetchMessages();
    }
  }, [currentPage, filterStatus, user]);

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch('/api/broker/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status: 'read'
        }),
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter(message => {
    if (searchTerm === '') return true;
    
    return (
      message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.subject && message.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'contact_page':
        return <Globe size={16} className="text-blue-600" />;
      case 'contact_form':
        return <MessageSquare size={16} className="text-green-600" />;
      case 'about_page':
        return <MessageSquare size={16} className="text-purple-600" />;
      case 'email':
        return <Mail size={16} className="text-purple-600" />;
      default:
        return <MessageSquare size={16} className="text-gray-600" />;
    }
  };

  // Get source label
  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'contact_page':
        return 'Contact Page';
      case 'contact_form':
        return 'Contact Form';
      case 'about_page':
        return 'About Page';
      case 'email':
        return 'Email';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const totalPages = Math.ceil(totalCount / messagesPerPage);

  return (
    <BrokerDashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">Manage your client messages and inquiries</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <MessageSquare size={20} className="text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <AlertCircle size={20} className="text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.unread}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircle size={20} className="text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Read</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.read}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircle size={20} className="text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Replied</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.replied}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-black"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All" className="text-black">All Status</option>
                  <option value="Unread" className="text-black">Unread</option>
                  <option value="Read" className="text-black">Read</option>
                  <option value="Replied" className="text-black">Replied</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Sender</th>
                    <th className="px-6 py-3">Message</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-64"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="h-5 bg-gray-200 rounded w-5 ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No messages found
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((message) => (
                      <tr key={message.id} className={`hover:bg-gray-50 ${message.status === 'unread' ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {message.sender_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {message.sender_email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {message.subject || 'No Subject'}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {message.message_content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSourceIcon(message.source)}
                            <span className="ml-1.5 text-sm text-gray-900">
                              {getSourceLabel(message.source)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(message.created_at)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(message.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            message.status === 'read' 
                              ? 'bg-green-100 text-green-800' 
                              : message.status === 'replied'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.status === 'read' ? 'Read' : message.status === 'replied' ? 'Replied' : 'Unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => markAsRead(message.id)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                            disabled={message.status !== 'unread'}
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((currentPage - 1) * messagesPerPage) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * messagesPerPage, totalCount)}
                      </span>{' '}
                      of <span className="font-medium">{totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
}
