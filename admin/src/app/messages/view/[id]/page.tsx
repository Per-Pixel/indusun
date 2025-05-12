'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MessageSquare, 
  User, 
  Mail, 
  Phone, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

// Types
interface MessageDetail {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  status: 'delivered' | 'pending' | 'failed';
  type: 'sms' | 'email';
  sender: {
    id: string;
    name: string;
    image?: string;
    email: string;
    phone: string;
  };
  recipients: {
    total: number;
    delivered: number;
    failed: number;
    list: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      status: 'delivered' | 'pending' | 'failed';
      deliveredAt?: string;
      image?: string;
    }[];
  };
}

// Mock data for message details
const mockMessageDetails: Record<string, MessageDetail> = {
  'msg-001': {
    id: 'msg-001',
    subject: 'New Property Listing',
    content: 'Dear valued client,\n\nWe are excited to inform you about a new property listing that matches your preferences. This beautiful property is located in a prime area with excellent amenities nearby.\n\nProperty Details:\n- 3 Bedroom Luxury Villa\n- Located in Whitefield\n- Price: ₹1.5 Cr\n- Amenities: Swimming Pool, Gym, 24/7 Security\n\nPlease let us know if you would like to schedule a viewing or if you have any questions.\n\nBest regards,\nIndusun Real Estate Team',
    sentAt: '2023-12-15T10:30:00',
    status: 'delivered',
    type: 'email',
    sender: {
      id: 'admin-1',
      name: 'David Wilson',
      image: '/auth/Agents/admin-01.jpg',
      email: 'david.w@indusun.com',
      phone: '+1 (555) 678-9012'
    },
    recipients: {
      total: 45,
      delivered: 45,
      failed: 0,
      list: [
        {
          id: '1',
          name: 'Robert Johnson',
          email: 'robert.j@example.com',
          status: 'delivered',
          deliveredAt: '2023-12-15T10:31:00',
          image: '/auth/Agents/client-01.jpg'
        },
        {
          id: '2',
          name: 'Sarah Williams',
          email: 'sarah.w@example.com',
          status: 'delivered',
          deliveredAt: '2023-12-15T10:32:00',
          image: '/auth/Agents/client-02.jpg'
        },
        {
          id: '4',
          name: 'Priya Patel',
          email: 'priya.p@example.com',
          status: 'delivered',
          deliveredAt: '2023-12-15T10:33:00',
          image: '/auth/Agents/client-03.jpg'
        },
        {
          id: '6',
          name: 'Jessica Brown',
          email: 'jessica.b@example.com',
          status: 'delivered',
          deliveredAt: '2023-12-15T10:34:00',
          image: '/auth/Agents/client-04.jpg'
        },
        {
          id: '8',
          name: 'Emma Garcia',
          email: 'emma.g@example.com',
          status: 'delivered',
          deliveredAt: '2023-12-15T10:35:00',
          image: '/auth/Agents/client-05.jpg'
        }
      ]
    }
  },
  'msg-002': {
    id: 'msg-002',
    subject: 'Payment Reminder',
    content: 'This is a friendly reminder that your payment is due in 3 days. Please ensure timely payment to avoid any late fees. If you have already made the payment, please disregard this message.',
    sentAt: '2023-12-10T14:15:00',
    status: 'delivered',
    type: 'sms',
    sender: {
      id: 'admin-2',
      name: 'Jessica Adams',
      image: '/auth/Agents/admin-02.jpg',
      email: 'jessica.a@indusun.com',
      phone: '+1 (555) 234-5678'
    },
    recipients: {
      total: 12,
      delivered: 10,
      failed: 2,
      list: [
        {
          id: '1',
          name: 'Robert Johnson',
          phone: '+1 (555) 123-7890',
          status: 'delivered',
          deliveredAt: '2023-12-10T14:16:00',
          image: '/auth/Agents/client-01.jpg'
        },
        {
          id: '2',
          name: 'Sarah Williams',
          phone: '+1 (555) 987-6543',
          status: 'delivered',
          deliveredAt: '2023-12-10T14:17:00',
          image: '/auth/Agents/client-02.jpg'
        },
        {
          id: '4',
          name: 'Priya Patel',
          phone: '+1 (555) 876-5432',
          status: 'failed',
          image: '/auth/Agents/client-03.jpg'
        },
        {
          id: '6',
          name: 'Jessica Brown',
          phone: '+1 (555) 567-8901',
          status: 'delivered',
          deliveredAt: '2023-12-10T14:18:00',
          image: '/auth/Agents/client-04.jpg'
        },
        {
          id: '8',
          name: 'Emma Garcia',
          phone: '+1 (555) 789-0123',
          status: 'failed',
          image: '/auth/Agents/client-05.jpg'
        }
      ]
    }
  }
};

export default function MessageViewPage() {
  const router = useRouter();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'delivered' | 'failed'>('all');

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  // Get status color
  const getStatusColor = (status: 'delivered' | 'pending' | 'failed') => {
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

  // Get status icon
  const getStatusIcon = (status: 'delivered' | 'pending' | 'failed') => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} className="mr-1 text-green-600" />;
      case 'pending':
        return <Clock size={16} className="mr-1 text-yellow-600" />;
      case 'failed':
        return <XCircle size={16} className="mr-1 text-red-600" />;
      default:
        return <AlertCircle size={16} className="mr-1 text-gray-600" />;
    }
  };

  // Filter recipients based on active tab
  const filteredRecipients = message?.recipients.list.filter(recipient => {
    if (activeTab === 'all') return true;
    return recipient.status === activeTab;
  }) || [];

  // Load message data
  useEffect(() => {
    if (params.id) {
      const messageId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      // Simulate API call
      setTimeout(() => {
        const messageData = mockMessageDetails[messageId];
        if (messageData) {
          setMessage(messageData);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
          <div className="sticky top-0 z-10">
            <AdminTopNavbar toggleSidebar={toggleSidebar} />
          </div>
          <div className="p-6 flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
          <div className="sticky top-0 z-10">
            <AdminTopNavbar toggleSidebar={toggleSidebar} />
          </div>
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <button
                onClick={() => router.push('/messages/history')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>Back to Message History</span>
              </button>
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message Not Found</h2>
                <p className="text-gray-600 mb-4">The message you are looking for does not exist or has been deleted.</p>
                <button
                  onClick={() => router.push('/messages/history')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Return to Message History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Back Button */}
            <button
              onClick={() => router.push('/messages/history')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Message History</span>
            </button>

            {/* Message Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Message Content */}
              <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="font-medium text-gray-900">Message Details</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                    {getStatusIcon(message.status)}
                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                  </span>
                </div>

                <div className="p-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-4">{message.subject}</h1>
                  
                  <div className="flex items-center mb-6">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {message.sender.image ? (
                        <Image
                          src={message.sender.image}
                          alt={message.sender.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600">
                          {message.sender.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{message.sender.name}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>{formatDate(message.sentAt)}</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        message.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {message.type === 'email' ? 'Email' : 'SMS'}
                      </span>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    {message.content.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sender and Recipients Info */}
              <div className="md:col-span-1">
                {/* Sender Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-medium text-gray-900">Sender Information</h2>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {message.sender.image ? (
                          <Image
                            src={message.sender.image}
                            alt={message.sender.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600">
                            {message.sender.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{message.sender.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail size={16} className="mr-2 text-gray-500" />
                        <span>{message.sender.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone size={16} className="mr-2 text-gray-500" />
                        <span>{message.sender.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipients Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-medium text-gray-900">Recipients</h2>
                    <div className="flex items-center mt-2 text-sm">
                      <div className="flex items-center mr-4">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        <span>{message.recipients.delivered} Delivered</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                        <span>{message.recipients.failed} Failed</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      <button
                        className={`py-3 px-4 text-sm font-medium ${
                          activeTab === 'all'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('all')}
                      >
                        All ({message.recipients.total})
                      </button>
                      <button
                        className={`py-3 px-4 text-sm font-medium ${
                          activeTab === 'delivered'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('delivered')}
                      >
                        Delivered ({message.recipients.delivered})
                      </button>
                      <button
                        className={`py-3 px-4 text-sm font-medium ${
                          activeTab === 'failed'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('failed')}
                      >
                        Failed ({message.recipients.failed})
                      </button>
                    </nav>
                  </div>

                  <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                    {filteredRecipients.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {filteredRecipients.map((recipient) => (
                          <div key={recipient.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {recipient.image ? (
                                  <Image
                                    src={recipient.image}
                                    alt={recipient.name}
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600">
                                    {recipient.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                                <p className="text-xs text-gray-500">
                                  {recipient.email || recipient.phone}
                                </p>
                              </div>
                              <div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recipient.status)}`}>
                                  {recipient.status}
                                </span>
                              </div>
                            </div>
                            {recipient.deliveredAt && (
                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <Clock size={12} className="mr-1" />
                                Delivered at: {formatDate(recipient.deliveredAt)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No recipients found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
