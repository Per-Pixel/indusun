'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  User,
  Reply,
  Trash2,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

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

// Mock data for received messages (same as in the list page)
const mockReceivedMessages: ReceivedMessage[] = [
  {
    id: 'msg-r001',
    subject: 'Property Inquiry',
    content: 'I am interested in the 3BHK property in Whitefield. Can you provide more details? I would like to know about the pricing, amenities, and availability. Also, is there a possibility to schedule a viewing this weekend?\n\nThank you,\nRobert Johnson',
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
    content: 'I would like to discuss a potential partnership with your agency. I have been in the real estate business for over 10 years and have a strong client base in the northern suburbs. I believe a collaboration could be mutually beneficial.\n\nPlease let me know if you would be interested in discussing this further.\n\nBest regards,\nMichael Chen',
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
    content: 'I would like to schedule a viewing for the property listed on your website. The property ID is #P12345. I am available on weekdays after 5 PM and anytime during the weekend.\n\nPlease contact me to confirm a suitable time.\n\nRegards,\nEmily Rodriguez',
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
    content: 'What is the best price you can offer for the property in HSR Layout? I am seriously interested in purchasing it but would like to negotiate on the listed price.\n\nI am a pre-approved buyer and can proceed quickly if we reach an agreement.\n\nThank you,\nSarah Williams',
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
    content: 'What documents do I need to provide for the property registration? I am planning to complete the purchase next month and want to ensure I have all the necessary paperwork ready.\n\nCould you please provide a checklist?\n\nThank you,\nPriya Patel',
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
    content: 'I would like to get my property valued. What is the process? The property is a 2BHK apartment in Electronic City, approximately 1200 sq ft.\n\nPlease let me know the fees for valuation and how long the process typically takes.\n\nRegards,\nDavid Wilson',
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
    content: 'I visited the property yesterday and wanted to share my feedback. The location is excellent, but I have some concerns about the condition of the bathrooms and kitchen. Would it be possible to discuss some renovations before finalizing the deal?\n\nLooking forward to your response,\nJessica Brown',
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

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState<ReceivedMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

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
        return <Globe size={20} className="text-blue-600" />;
      case 'contact_form':
        return <MessageSquare size={20} className="text-green-600" />;
      case 'email':
        return <Mail size={20} className="text-purple-600" />;
      case 'message':
        return <Phone size={20} className="text-orange-600" />;
      default:
        return <MessageSquare size={20} className="text-gray-600" />;
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

  // Handle reply
  const handleReply = () => {
    if (replyText.trim() === '') {
      toast.error('Please enter a reply message');
      return;
    }

    // Simulate sending reply
    toast.success('Reply sent successfully');
    setReplyText('');
    setShowReplyForm(false);
  };

  // Mark as read/unread
  const toggleReadStatus = () => {
    if (!message) return;

    const newStatus = message.status === 'read' ? 'unread' : 'read';
    setMessage({
      ...message,
      status: newStatus
    });

    toast.success(`Message marked as ${newStatus}`);
  };

  // Delete message
  const deleteMessage = () => {
    toast.success('Message deleted successfully');
    router.push('/messages/received');
  };

  // Load message data
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setTimeout(() => {
        const foundMessage = mockReceivedMessages.find(msg => msg.id === id);
        if (foundMessage) {
          setMessage(foundMessage.status === 'unread' ? { ...foundMessage, status: 'read' } : foundMessage);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="page-container">
          <div className="card p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto" /></div>
        </div>
      </CRMLayout>
    );
  }

  if (!message) {
    return (
      <CRMLayout>
        <div className="page-container">
          <button onClick={() => router.push('/messages/received')} className="btn btn-ghost btn-sm mb-4">
            <ArrowLeft size={16} /> Back to Messages
          </button>
          <div className="card p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Message Not Found</h2>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>The message you are looking for does not exist or has been deleted.</p>
            <button onClick={() => router.push('/messages/received')} className="btn btn-primary btn-sm">Return to Messages</button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/messages/received')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Received Messages</span>
            </button>

            {/* Message Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Message Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <h1 className="text-xl font-semibold text-gray-900">{message.subject}</h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleReadStatus}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      title={message.status === 'read' ? 'Mark as unread' : 'Mark as read'}
                    >
                      {message.status === 'read' ? (
                        <MessageSquare size={18} />
                      ) : (
                        <MessageSquare size={18} className="text-blue-600" />
                      )}
                    </button>
                    <button
                      onClick={deleteMessage}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"
                      title="Delete message"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="relative">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                        title="More options"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>{formatDate(message.receivedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{formatTime(message.receivedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    {getSourceIcon(message.source)}
                    <span className="ml-1">{getSourceLabel(message.source)}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    message.status === 'read'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.status === 'read' ? 'Read' : 'Unread'}
                  </div>
                </div>
              </div>

              {/* Sender Info */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 relative">
                    {message.sender.image ? (
                      <Image
                        src={message.sender.image}
                        alt={message.sender.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={24} className="text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{message.sender.name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      {message.sender.email && (
                        <div className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          <a href={`mailto:${message.sender.email}`} className="hover:text-blue-600">
                            {message.sender.email}
                          </a>
                        </div>
                      )}
                      {message.sender.phone && (
                        <div className="flex items-center">
                          <Phone size={14} className="mr-1" />
                          <a href={`tel:${message.sender.phone}`} className="hover:text-blue-600">
                            {message.sender.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        <span className="capitalize">{message.sender.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6">
                <div className="prose max-w-none text-gray-800">
                  {message.content.split('\n').map((paragraph, index) => (
                    <p key={index} className={paragraph.trim() === '' ? 'h-4' : 'mb-4'}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Reply Button */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Reply size={16} className="mr-2" />
                  Reply
                </button>
              </div>

              {/* Reply Form */}
              {showReplyForm && (
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reply to {message.sender.name}</h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={6}
                  ></textarea>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowReplyForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReply}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </CRMLayout>
  );
}