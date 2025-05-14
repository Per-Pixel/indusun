'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import {
  MessageSquare,
  Search,
  ChevronDown,
  Download,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  Filter,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import Image from 'next/image';

// Types
interface ReceivedMessage {
  id: string;
  subject: string;
  content: string;
  receivedAt: string;
  status: 'read' | 'unread';
  source: 'contact_page' | 'contact_form' | 'email' | 'message';
  sender: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: 'client' | 'broker' | 'guest';
    image?: string;
  };
}

// Mock data for received messages
const mockReceivedMessages: ReceivedMessage[] = [
  {
    id: 'msg-r001',
    subject: 'Property Inquiry',
    content: 'I am interested in the 3BHK property in Whitefield. Can you provide more details?',
    receivedAt: '2023-12-18T09:30:00',
    status: 'unread',
    source: 'contact_page',
    sender: {
      id: 'client-1',
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      phone: '+1 (555) 123-7890',
      type: 'client',
      image: '/auth/Agents/client-01.jpg'
    }
  },
  {
    id: 'msg-r002',
    subject: 'Broker Partnership',
    content: 'I would like to discuss a potential partnership with your agency.',
    receivedAt: '2023-12-17T14:15:00',
    status: 'read',
    source: 'email',
    sender: {
      id: 'broker-1',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 456-7890',
      type: 'broker',
      image: '/auth/Agents/agent-03.jpg'
    }
  },
  {
    id: 'msg-r003',
    subject: 'Viewing Request',
    content: 'I would like to schedule a viewing for the property listed on your website.',
    receivedAt: '2023-12-16T11:45:00',
    status: 'read',
    source: 'contact_form',
    sender: {
      id: 'guest-1',
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      phone: '+1 (555) 234-5678',
      type: 'guest'
    }
  },
  {
    id: 'msg-r004',
    subject: 'Price Inquiry',
    content: 'What is the best price you can offer for the property in HSR Layout?',
    receivedAt: '2023-12-15T16:20:00',
    status: 'unread',
    source: 'message',
    sender: {
      id: 'client-2',
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      phone: '+1 (555) 987-6543',
      type: 'client',
      image: '/auth/Agents/client-02.jpg'
    }
  },
  {
    id: 'msg-r005',
    subject: 'Documentation Requirements',
    content: 'What documents do I need to provide for the property registration?',
    receivedAt: '2023-12-14T10:00:00',
    status: 'read',
    source: 'contact_page',
    sender: {
      id: 'client-3',
      name: 'Priya Patel',
      email: 'priya.p@example.com',
      phone: '+1 (555) 876-5432',
      type: 'client',
      image: '/auth/Agents/client-03.jpg'
    }
  },
  {
    id: 'msg-r006',
    subject: 'Property Valuation',
    content: 'I would like to get my property valued. What is the process?',
    receivedAt: '2023-12-13T13:30:00',
    status: 'read',
    source: 'email',
    sender: {
      id: 'guest-2',
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '+1 (555) 876-5432',
      type: 'guest'
    }
  },
  {
    id: 'msg-r007',
    subject: 'Feedback on Property Visit',
    content: 'I visited the property yesterday and wanted to share my feedback.',
    receivedAt: '2023-12-12T15:45:00',
    status: 'unread',
    source: 'message',
    sender: {
      id: 'client-4',
      name: 'Jessica Brown',
      email: 'jessica.b@example.com',
      phone: '+1 (555) 567-8901',
      type: 'client',
      image: '/auth/Agents/client-04.jpg'
    }
  }
];

export default function ReceivedMessagesPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const messagesPerPage = 5;

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterSource, filterStatus]);

  // Filter messages based on search term, source, and status
  const filteredMessages = React.useMemo(() => {
    return mockReceivedMessages.filter(message => {
      // Search in subject, content, and sender name
      const matchesSearch = debouncedSearchTerm === '' ? true : (
        message.subject.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        message.sender.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );

      // Filter by source
      const matchesSource = filterSource === 'All' ? true : (
        filterSource === 'Contact Page' ? message.source === 'contact_page' :
        filterSource === 'Contact Form' ? message.source === 'contact_form' :
        filterSource === 'Email' ? message.source === 'email' :
        filterSource === 'Message' ? message.source === 'message' : true
      );

      // Filter by status
      const matchesStatus = filterStatus === 'All' ? true : (
        filterStatus === 'Read' ? message.status === 'read' :
        filterStatus === 'Unread' ? message.status === 'unread' : true
      );

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [debouncedSearchTerm, filterSource, filterStatus]);

  // Pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

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
      case 'email':
        return <Mail size={16} className="text-purple-600" />;
      case 'message':
        return <Phone size={16} className="text-orange-600" />;
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
      case 'email':
        return 'Email';
      case 'message':
        return 'Message';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button and Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <button
                  onClick={() => router.push('/messages')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2 md:mb-0"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span>Back to Messages</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Received Messages</h1>
              </div>

              <button
                onClick={() => router.push('/messages/export')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
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
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                  >
                    <option value="All">All Sources</option>
                    <option value="Contact Page">Contact Page</option>
                    <option value="Contact Form">Contact Form</option>
                    <option value="Email">Email</option>
                    <option value="Message">Message</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
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
                    <option value="All">All Status</option>
                    <option value="Read">Read</option>
                    <option value="Unread">Unread</option>
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
                    {currentMessages.map((message) => (
                      <tr key={message.id} className={`hover:bg-gray-50 ${message.status === 'unread' ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              {message.sender.image ? (
                                <Image
                                  src={message.sender.image}
                                  alt={message.sender.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
                                    {message.sender.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {message.sender.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {message.sender.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {message.subject}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {message.content}
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
                            {formatDate(message.receivedAt)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(message.receivedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            message.status === 'read' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {message.status === 'read' ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/messages/received/${message.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
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
                        Showing <span className="font-medium">{indexOfFirstMessage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastMessage, filteredMessages.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredMessages.length}</span> results
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
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
