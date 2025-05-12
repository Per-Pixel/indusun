'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import {
  MessageSquare,
  Users,
  User,
  Building,
  Search,
  Filter,
  ChevronDown,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Download,
  X
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

// Types
interface MessageRecipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'client' | 'broker' | 'admin';
  image?: string;
  status: 'active' | 'inactive';
  lastActive?: string;
}

interface MessageStats {
  total: number;
  sent: number;
  received: number;
  pending: number;
  failed: number;
}

// Mock data for recipients
const mockRecipients: MessageRecipient[] = [
  {
    id: '1',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 (555) 123-7890',
    type: 'client',
    status: 'active',
    image: '/auth/Agents/client-01.jpg',
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '+1 (555) 987-6543',
    type: 'client',
    status: 'active',
    image: '/auth/Agents/client-02.jpg',
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.k@example.com',
    phone: '+1 (555) 234-5678',
    type: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-01.jpg',
    lastActive: '3 hours ago'
  },
  {
    id: '4',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    phone: '+1 (555) 876-5432',
    type: 'client',
    status: 'inactive',
    image: '/auth/Agents/client-03.jpg',
    lastActive: '5 days ago'
  },
  {
    id: '5',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '+1 (555) 345-6789',
    type: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-02.jpg',
    lastActive: 'Just now'
  },
  {
    id: '6',
    name: 'Jessica Brown',
    email: 'jessica.b@example.com',
    phone: '+1 (555) 567-8901',
    type: 'client',
    status: 'active',
    image: '/auth/Agents/client-04.jpg',
    lastActive: '4 hours ago'
  },
  {
    id: '7',
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+1 (555) 678-9012',
    type: 'admin',
    status: 'active',
    image: '/auth/Agents/admin-01.jpg',
    lastActive: '1 hour ago'
  },
  {
    id: '8',
    name: 'Emma Garcia',
    email: 'emma.g@example.com',
    phone: '+1 (555) 789-0123',
    type: 'client',
    status: 'inactive',
    image: '/auth/Agents/client-05.jpg',
    lastActive: '1 week ago'
  }
];

// Mock message stats
const mockMessageStats: MessageStats = {
  total: 1250,
  sent: 850,
  received: 400,
  pending: 15,
  failed: 5
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`p-4 rounded-lg border border-gray-200 ${bgColor}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-semibold mt-1 text-black">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function MessagesPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'brokers' | 'admins'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [isSending, setIsSending] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter recipients based on search term, type, and status
  const filteredRecipients = React.useMemo(() => {
    return mockRecipients.filter(recipient => {
      // Only search if there's a search term
      const matchesSearch = searchTerm === '' ? true : (
        recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesType = filterType === 'All' || recipient.type === filterType;
      const matchesStatus = filterStatus === 'All' || recipient.status === filterStatus;
      const matchesTab =
        (activeTab === 'clients' && recipient.type === 'client') ||
        (activeTab === 'brokers' && recipient.type === 'broker') ||
        (activeTab === 'admins' && recipient.type === 'admin');

      return matchesSearch && matchesType && matchesStatus && matchesTab;
    });
  }, [searchTerm, filterType, filterStatus, activeTab]);

  // Toggle recipient selection
  const toggleRecipientSelection = (id: string) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter(recipientId => recipientId !== id));
    } else {
      setSelectedRecipients([...selectedRecipients, id]);
    }
  };

  // Select all visible recipients
  const selectAllRecipients = () => {
    const visibleRecipientIds = filteredRecipients.map(recipient => recipient.id);

    // Check if all visible recipients are already selected
    const allSelected = visibleRecipientIds.every(id => selectedRecipients.includes(id));

    if (allSelected) {
      // Deselect all visible recipients
      const newSelected = selectedRecipients.filter(id => !visibleRecipientIds.includes(id));
      setSelectedRecipients(newSelected);
    } else {
      // Select all visible recipients (keeping any previously selected that aren't visible)
      const newSelected = [...new Set([...selectedRecipients, ...visibleRecipientIds])];
      setSelectedRecipients(newSelected);
    }
  };

  // Send message
  const sendMessage = () => {
    if (messageText.trim() === '') {
      toast.error('Please enter a message');
      return;
    }

    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setIsSending(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSending(false);

      // Use the messageType state for the redirect

      // Navigate to the confirmation page with count and type parameters
      router.push(`/messages/sent?count=${selectedRecipients.length}&type=${messageType}`);

      // Reset form state
      setMessageText('');
      setSelectedRecipients([]);
    }, 1500);
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <button
                onClick={() => router.push('/messages/history')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} />
                <span>Export History</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <StatsCard
                title="Total Messages"
                value={mockMessageStats.total}
                icon={<MessageSquare size={20} className="text-blue-600" />}
                bgColor="bg-blue-50"
              />
              <StatsCard
                title="Sent"
                value={mockMessageStats.sent}
                icon={<CheckCircle size={20} className="text-green-600" />}
                bgColor="bg-green-50"
              />
              <StatsCard
                title="Received"
                value={mockMessageStats.received}
                icon={<MessageSquare size={20} className="text-purple-600" />}
                bgColor="bg-purple-50"
              />
              <StatsCard
                title="Pending"
                value={mockMessageStats.pending}
                icon={<Clock size={20} className="text-yellow-600" />}
                bgColor="bg-yellow-50"
              />
              <StatsCard
                title="Failed"
                value={mockMessageStats.failed}
                icon={<AlertCircle size={20} className="text-red-600" />}
                bgColor="bg-red-50"
              />
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === 'clients'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('clients')}
                  >
                    <Users className="inline-block mr-2 h-5 w-5" />
                    Clients
                  </button>
                  <button
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === 'brokers'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('brokers')}
                  >
                    <User className="inline-block mr-2 h-5 w-5" />
                    Brokers
                  </button>
                  <button
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === 'admins'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('admins')}
                  >
                    <Building className="inline-block mr-2 h-5 w-5" />
                    Admins
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recipients List */}
              <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-medium text-gray-900">Recipients</h2>
                </div>

                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search recipients..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipients List */}
                <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                  <div className="p-2">
                    <div className="flex items-center p-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedRecipients.length === filteredRecipients.length && filteredRecipients.length > 0}
                        onChange={selectAllRecipients}
                      />
                      <span className="ml-2 text-sm text-gray-700">Select All ({filteredRecipients.length})</span>
                    </div>

                    {filteredRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => toggleRecipientSelection(recipient.id)}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedRecipients.includes(recipient.id)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="ml-3 flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {recipient.image ? (
                              <Image
                                src={recipient.image}
                                alt={recipient.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600">
                                {recipient.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${recipient.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              <span>{recipient.status === 'active' ? 'Active' : 'Inactive'}</span>
                              {recipient.lastActive && (
                                <span className="ml-2">· {recipient.lastActive}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredRecipients.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No recipients found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Composition */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-medium text-gray-900">Compose Message</h2>
                  </div>

                  {/* Selected Recipients */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipients.length > 0 ? (
                        selectedRecipients.map((id) => {
                          const recipient = mockRecipients.find(r => r.id === id);
                          if (!recipient) return null;
                          return (
                            <div
                              key={id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {recipient.name}
                              <button
                                type="button"
                                className="ml-1 text-blue-500 hover:text-blue-700"
                                onClick={() => toggleRecipientSelection(id)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-sm text-gray-500">No recipients selected</span>
                      )}
                    </div>
                  </div>

                  {/* Message Options */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setMessageType('sms')}
                        className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          messageType === 'sms'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Phone size={16} className="mr-2" />
                        <span>Send SMS</span>
                      </button>
                      <button
                        onClick={() => setMessageType('email')}
                        className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          messageType === 'email'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Mail size={16} className="mr-2" />
                        <span>Send Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4">
                    <textarea
                      placeholder="Type your message here..."
                      className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    ></textarea>

                    <div className="mt-4 flex justify-end">
                      <button
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        onClick={sendMessage}
                        disabled={isSending || messageText.trim() === '' || selectedRecipients.length === 0}
                      >
                        {isSending ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} className="mr-2" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
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
