'use client';

import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import Image from 'next/image';

// Types
interface MessageHistory {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  status: 'delivered' | 'pending' | 'failed';
  type: 'sms' | 'email';
  recipients: {
    total: number;
    delivered: number;
    failed: number;
  };
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}

// Mock data for message history
const mockMessageHistory: MessageHistory[] = [
  {
    id: 'msg-001',
    subject: 'New Property Listing',
    content: 'We have a new property listing that matches your preferences. Check it out!',
    sentAt: '2023-12-15T10:30:00',
    status: 'delivered',
    type: 'email',
    recipients: {
      total: 45,
      delivered: 45,
      failed: 0
    },
    sender: {
      id: 'admin-1',
      name: 'David Wilson',
      image: '/auth/Agents/admin-01.jpg'
    }
  },
  {
    id: 'msg-002',
    subject: 'Payment Reminder',
    content: 'This is a friendly reminder that your payment is due in 3 days.',
    sentAt: '2023-12-10T14:15:00',
    status: 'delivered',
    type: 'sms',
    recipients: {
      total: 12,
      delivered: 10,
      failed: 2
    },
    sender: {
      id: 'admin-2',
      name: 'Jessica Adams',
      image: '/auth/Agents/admin-02.jpg'
    }
  },
  {
    id: 'msg-003',
    subject: 'Holiday Office Hours',
    content: 'Please note our office hours during the upcoming holiday season.',
    sentAt: '2023-12-05T09:45:00',
    status: 'delivered',
    type: 'email',
    recipients: {
      total: 120,
      delivered: 118,
      failed: 2
    },
    sender: {
      id: 'admin-1',
      name: 'David Wilson',
      image: '/auth/Agents/admin-01.jpg'
    }
  },
  {
    id: 'msg-004',
    subject: 'Property Viewing Confirmation',
    content: 'Your property viewing has been scheduled for tomorrow at 2 PM.',
    sentAt: '2023-12-01T16:20:00',
    status: 'delivered',
    type: 'sms',
    recipients: {
      total: 1,
      delivered: 1,
      failed: 0
    },
    sender: {
      id: 'broker-1',
      name: 'Amit Kumar',
      image: '/auth/Agents/agent-01.jpg'
    }
  },
  {
    id: 'msg-005',
    subject: 'System Maintenance',
    content: 'Our system will be undergoing maintenance this weekend.',
    sentAt: '2023-11-28T11:00:00',
    status: 'failed',
    type: 'email',
    recipients: {
      total: 200,
      delivered: 0,
      failed: 200
    },
    sender: {
      id: 'admin-3',
      name: 'System',
    }
  },
  {
    id: 'msg-006',
    subject: 'New Feature Announcement',
    content: 'We are excited to announce new features on our platform!',
    sentAt: '2023-11-25T13:30:00',
    status: 'delivered',
    type: 'email',
    recipients: {
      total: 150,
      delivered: 145,
      failed: 5
    },
    sender: {
      id: 'admin-1',
      name: 'David Wilson',
      image: '/auth/Agents/admin-01.jpg'
    }
  },
  {
    id: 'msg-007',
    subject: 'Appointment Cancellation',
    content: 'Your appointment for property viewing has been cancelled.',
    sentAt: '2023-11-20T15:45:00',
    status: 'pending',
    type: 'sms',
    recipients: {
      total: 1,
      delivered: 0,
      failed: 0
    },
    sender: {
      id: 'broker-2',
      name: 'Michael Chen',
      image: '/auth/Agents/agent-02.jpg'
    }
  }
];

export default function MessageHistoryPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const messagesPerPage = 5;

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter messages based on search term, type, and status
  const filteredMessages = mockMessageHistory.filter(message => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'All' || message.type === filterType;
    const matchesStatus = filterStatus === 'All' || message.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  // Get status color
  const getStatusColor = (status: MessageHistory['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <h1 className="text-2xl font-bold text-gray-900">Message History</h1>
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
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search messages..."
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
                    <option value="All" className="text-gray-900">All Status</option>
                    <option value="delivered" className="text-gray-900">Delivered</option>
                    <option value="pending" className="text-gray-900">Pending</option>
                    <option value="failed" className="text-gray-900">Failed</option>
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
                    <option value="All" className="text-gray-900">All Types</option>
                    <option value="email" className="text-gray-900">Email</option>
                    <option value="sms" className="text-gray-900">SMS</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900">
                    <ChevronDown size={16} />
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
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Sent By</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Recipients</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {message.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {message.sender.image ? (
                                <Image
                                  src={message.sender.image}
                                  alt={message.sender.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600">
                                  {message.sender.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="ml-2">{message.sender.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(message.sentAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            message.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {message.type === 'email' ? 'Email' : 'SMS'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <span className="font-medium">{message.recipients.total}</span> total
                          </div>
                          <div className="text-xs">
                            <span className="text-green-600">{message.recipients.delivered}</span> delivered,
                            <span className="text-red-600 ml-1">{message.recipients.failed}</span> failed
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => router.push(`/messages/view/${message.id}`)}
                            className="text-blue-600 hover:text-blue-900"
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
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-900">
                        Showing <span className="font-medium">{indexOfFirstMessage + 1}</span> to{' '}
                        <span className="font-medium">
                          {indexOfLastMessage > filteredMessages.length
                            ? filteredMessages.length
                            : indexOfLastMessage}
                        </span>{' '}
                        of <span className="font-medium">{filteredMessages.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
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
