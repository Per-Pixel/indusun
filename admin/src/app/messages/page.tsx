'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
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
  MessageCircle,
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
  unread: number;
  replied: number;
}

// Mock admin data - Adding Sarika Singh as requested
const mockAdminData: MessageRecipient[] = [
  {
    id: 'admin-1',
    name: 'Sarika Singh',
    email: 'sarika.singh@indusun.com',
    phone: '+91 98765 43210',
    type: 'admin',
    status: 'active',
    image: '/auth/Agents/admin-01.jpg',
    lastActive: 'Just now'
  }
];

// Real message stats will be fetched from API

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, bgColor, onClick }) => {
  return (
    <div
      className={`p-4 rounded-lg border border-gray-200 ${bgColor} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
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
  const [activeTab, setActiveTab] = useState<'clients' | 'brokers' | 'admins'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [isSending, setIsSending] = useState(false);
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for real clients and brokers data with pagination
  const [clients, setClients] = useState<MessageRecipient[]>([]);
  const [brokers, setBrokers] = useState<MessageRecipient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [brokersLoading, setBrokersLoading] = useState(false); // Start as false since we load on demand
  const [clientsPage, setClientsPage] = useState(1);
  const [brokersPage, setBrokersPage] = useState(1);
  const [hasMoreClients, setHasMoreClients] = useState(true);
  const [hasMoreBrokers, setHasMoreBrokers] = useState(true);
  const [totalClients, setTotalClients] = useState(0);
  const [totalBrokers, setTotalBrokers] = useState(0);

  // Fetch message statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/messages/stats');
        const data = await response.json();
        if (data.success) {
          setMessageStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching message stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  // Fetch clients from API with pagination and search
  useEffect(() => {
    const fetchClients = async () => {
      if (!hasMoreClients && clientsPage > 1) return;
      
      try {
        setClientsLoading(true);
        // Build URL with pagination and search parameters
        const url = new URL('/api/clients', window.location.origin);
        url.searchParams.append('page', clientsPage.toString());
        url.searchParams.append('limit', '50'); // Load 50 clients at a time
        
        // Add search term if present
        if (debouncedSearchTerm) {
          url.searchParams.append('search', debouncedSearchTerm);
        }
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (data.clients) {
          // Map the client data to the MessageRecipient interface
          const formattedClients = data.clients.map((client: any) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            type: 'client',
            status: client.status,
            image: client.image,
            lastActive: client.lastActive
          }));
          
          // Append new clients to existing list if not on first page
          if (clientsPage === 1) {
            setClients(formattedClients);
          } else {
            setClients(prev => [...prev, ...formattedClients]);
          }
          
          // Update pagination state
          setTotalClients(data.totalClients || 0);
          // Check if there are more clients to load
          setHasMoreClients(formattedClients.length === 50);
        } else {
          setClients([]);
          setHasMoreClients(false);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, [debouncedSearchTerm, clientsPage]);
  
  // Fetch brokers from API only when broker tab is selected
  useEffect(() => {
    // Only fetch brokers when the brokers tab is active
    if (activeTab !== 'brokers') return;
    
    const fetchBrokers = async () => {
      if (!hasMoreBrokers && brokersPage > 1) return;
      
      try {
        setBrokersLoading(true);
        // Build URL with pagination and search parameters
        const url = new URL('/api/brokers', window.location.origin);
        url.searchParams.append('page', brokersPage.toString());
        url.searchParams.append('limit', '50'); // Load 50 brokers at a time
        
        // Add search term if present
        if (debouncedSearchTerm) {
          url.searchParams.append('search', debouncedSearchTerm);
        }
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (data.brokers) {
          // Map the broker data to the MessageRecipient interface
          const formattedBrokers = data.brokers.map((broker: any) => ({
            id: broker.id,
            name: broker.name,
            email: broker.email,
            phone: broker.phone,
            type: 'broker',
            status: broker.status,
            image: broker.image,
            lastActive: broker.lastActive
          }));
          
          // Append new brokers to existing list if not on first page
          if (brokersPage === 1) {
            setBrokers(formattedBrokers);
          } else {
            setBrokers(prev => [...prev, ...formattedBrokers]);
          }
          
          // Update pagination state
          setTotalBrokers(data.totalBrokers || 0);
          // Check if there are more brokers to load
          setHasMoreBrokers(formattedBrokers.length === 50);
        } else {
          setBrokers([]);
          setHasMoreBrokers(false);
        }
      } catch (error) {
        console.error('Error fetching brokers:', error);
      } finally {
        setBrokersLoading(false);
      }
    };

    fetchBrokers();
  }, [activeTab, debouncedSearchTerm, brokersPage]);

  // Debounce search term and reset pagination when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset pagination when search term changes
      setClientsPage(1);
      setBrokersPage(1);
      setClients([]);
      setBrokers([]);
      setHasMoreClients(true);
      setHasMoreBrokers(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Combine all recipients based on the active tab
  const getAllRecipients = () => {
    const allRecipients: MessageRecipient[] = [];
    
    // Add clients if needed
    if (!clientsLoading && clients.length > 0) {
      allRecipients.push(...clients);
    }
    
    // Add brokers if needed
    if (!brokersLoading && brokers.length > 0) {
      allRecipients.push(...brokers);
    }
    
    // Add admin data
    allRecipients.push(...mockAdminData);
    
    return allRecipients;
  };
  
  // Filter recipients based on active tab and filters
  // Search is now handled by the backend API
  const getFilteredRecipients = () => {
    let filteredList: MessageRecipient[] = [];
    
    // Get recipients based on active tab
    if (activeTab === 'clients') {
      filteredList = [...clients];
    } else if (activeTab === 'brokers') {
      filteredList = [...brokers];
    } else if (activeTab === 'admins') {
      filteredList = [...mockAdminData];
    }
    
    // Apply additional filters (type and status)
    return filteredList.filter(recipient => {
      // Check if recipient matches filter type
      const matchesType = 
        filterType === 'All' || 
        recipient.type.toLowerCase() === filterType.toLowerCase();
      
      // Check if recipient matches filter status
      const matchesStatus = 
        filterStatus === 'All' || 
        recipient.status.toLowerCase() === filterStatus.toLowerCase();
      
      return matchesType && matchesStatus;
    });
  };

  // Filter recipients based on search term, type, and status
  const filteredRecipients = React.useMemo(() => {
    return getFilteredRecipients();
  }, [debouncedSearchTerm, filterType, filterStatus, activeTab, clients, brokers, clientsLoading, brokersLoading]);

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
    <CRMLayout>
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
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : messageStats ? (
                <>
                  <StatsCard
                    title="Total Messages"
                    value={messageStats.total}
                    icon={<MessageSquare size={20} className="text-blue-600" />}
                    bgColor="bg-blue-50"
                    onClick={() => router.push('/messages/received')}
                  />
                  <StatsCard
                    title="Sent"
                    value={messageStats.sent}
                    icon={<CheckCircle size={20} className="text-green-600" />}
                    bgColor="bg-green-50"
                    onClick={() => router.push('/messages/history')}
                  />
                  <StatsCard
                    title="Received"
                    value={messageStats.received}
                    icon={<MessageSquare size={20} className="text-purple-600" />}
                    bgColor="bg-purple-50"
                    onClick={() => router.push('/messages/received')}
                  />
                  <StatsCard
                    title="Unread"
                    value={messageStats.unread}
                    icon={<Clock size={20} className="text-yellow-600" />}
                    bgColor="bg-yellow-50"
                    onClick={() => router.push('/messages/received?status=unread')}
                  />
                  <StatsCard
                    title="Replied"
                    value={messageStats.replied}
                    icon={<CheckCircle size={20} className="text-green-600" />}
                    bgColor="bg-green-50"
                    onClick={() => router.push('/messages/received?status=replied')}
                  />
                </>
              ) : (
                // Error state
                <div className="col-span-5 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Failed to load message statistics</p>
                </div>
              )}
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8 text-gray-900"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="All" className="text-gray-900">All Status</option>
                        <option value="active" className="text-gray-900">Active</option>
                        <option value="inactive" className="text-gray-900">Inactive</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <select
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8 text-gray-900"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="All" className="text-gray-900">All Types</option>
                        <option value="client" className="text-gray-900">Client</option>
                        <option value="broker" className="text-gray-900">Broker</option>
                        <option value="admin" className="text-gray-900">Admin</option>
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
                    
                    {/* Load More Button */}
                    {(activeTab === 'clients' && hasMoreClients && !clientsLoading) && (
                      <div className="p-2 text-center">
                        <button 
                          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => setClientsPage(prev => prev + 1)}
                        >
                          Load More Clients
                        </button>
                      </div>
                    )}
                    
                    {(activeTab === 'brokers' && hasMoreBrokers && !brokersLoading) && (
                      <div className="p-2 text-center">
                        <button 
                          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => setBrokersPage(prev => prev + 1)}
                        >
                          Load More Brokers
                        </button>
                      </div>
                    )}
                    
                    {/* Loading Indicator */}
                    {(activeTab === 'clients' && clientsLoading) || (activeTab === 'brokers' && brokersLoading) ? (
                      <div className="p-4 text-center">
                        <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                        <span className="text-gray-600">Loading...</span>
                      </div>
                    ) : null}
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
                          const recipient = getAllRecipients().find((r: MessageRecipient) => r.id === id);
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
                    <div className="flex gap-4 flex-wrap">
                      <button
                        onClick={() => setMessageType('sms')}
                        className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          messageType === 'sms'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          color: messageType === 'sms' ? 'white' : '#374151'
                        }}
                      >
                        <Phone size={16} className="mr-2" />
                        <span>Send SMS</span>
                      </button>
                      <button
                        onClick={() => setMessageType('email')}
                        className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          messageType === 'email'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          color: messageType === 'email' ? 'white' : '#374151'
                        }}
                      >
                        <Mail size={16} className="mr-2" />
                        <span>Send Email</span>
                      </button>
                      <button
                        onClick={() => setMessageType('whatsapp')}
                        className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          messageType === 'whatsapp'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          color: messageType === 'whatsapp' ? 'white' : '#374151'
                        }}
                      >
                        <MessageCircle size={16} className="mr-2" />
                        <span>Send to WhatsApp</span>
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
    </CRMLayout>
  );
}
