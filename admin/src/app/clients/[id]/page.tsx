'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserForm from '@/components/users/UserForm';
import { User } from '@/components/users/UserList';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Clock, FileText } from 'lucide-react';

// Mock data for clients (same as in the clients page)
const mockClients: User[] = [
  {
    id: '1',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 (555) 123-7890',
    role: 'client',
    status: 'active',
    image: '/auth/Agents/client-01.jpg',
    location: 'New York, NY',
    lastActive: '2023-12-18',
    createdAt: '2023-10-15',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '+1 (555) 987-6543',
    role: 'client',
    status: 'active',
    image: '/auth/Agents/client-02.jpg',
    location: 'Los Angeles, CA',
    lastActive: '2023-12-20',
    createdAt: '2023-11-05',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '+1 (555) 456-7890',
    role: 'client',
    status: 'inactive',
    image: '/auth/Agents/client-03.jpg',
    location: 'Chicago, IL',
    lastActive: '2023-11-30',
    createdAt: '2023-09-22',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '+1 (555) 234-5678',
    role: 'client',
    status: 'pending',
    image: '/auth/Agents/client-04.jpg',
    location: 'Houston, TX',
    lastActive: '2023-12-15',
    createdAt: '2023-12-01',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+1 (555) 876-5432',
    role: 'client',
    status: 'active',
    image: '/auth/Agents/client-05.jpg',
    location: 'Miami, FL',
    lastActive: '2023-12-19',
    createdAt: '2023-08-15',
  },
];

// Mock client activity data
const mockClientActivity = [
  {
    id: '1',
    type: 'property_view',
    description: 'Viewed 3 properties in Brooklyn',
    date: '2023-12-20T10:45:00Z',
  },
  {
    id: '2',
    type: 'saved_property',
    description: 'Saved "Luxury Apartment in Manhattan" to favorites',
    date: '2023-12-19T14:30:00Z',
  },
  {
    id: '3',
    type: 'contact_broker',
    description: 'Contacted broker Arshir Patel about a property',
    date: '2023-12-18T09:15:00Z',
  },
  {
    id: '4',
    type: 'payment',
    description: 'Made a payment of $2,500 for property booking',
    date: '2023-12-15T16:20:00Z',
  },
  {
    id: '5',
    type: 'document',
    description: 'Uploaded verification documents',
    date: '2023-12-10T11:05:00Z',
  },
];

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [client, setClient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [clientActivity, setClientActivity] = useState(mockClientActivity);

  useEffect(() => {
    // In a real app, you would fetch the client data from an API
    const foundClient = mockClients.find(c => c.id === clientId);

    if (foundClient) {
      setClient(foundClient);
    } else {
      toast.error('Client not found');
      router.push('/clients');
    }

    setIsLoading(false);
  }, [clientId, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${client?.name}?`)) {
      // In a real app, you would call an API to delete the client
      toast.success(`${client?.name} has been deleted`);
      router.push('/clients');
    }
  };

  const handleFormSubmit = (clientData: Partial<User>) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (client) {
        // Update client
        setClient({ ...client, ...clientData });
        toast.success(`${clientData.name} has been updated`);
      }

      setIsLoading(false);
      setShowEditForm(false);
    }, 1000);
  };

  const handleFormCancel = () => {
    setShowEditForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-500 mb-4">The client you are looking for does not exist or has been deleted.</p>
          <button
            onClick={() => router.push('/clients')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Clients
          </button>
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
              onClick={() => router.push('/clients')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Clients</span>
            </button>

            {showEditForm ? (
              <UserForm
                user={client}
                userType="client"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <>
                {/* Client Profile */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Client Profile</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Profile Image */}
                      <div className="flex flex-col items-center">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                          {client.image ? (
                            <Image
                              src={client.image}
                              alt={client.name}
                              width={128}
                              height={128}
                              className="h-32 w-32 object-cover"
                            />
                          ) : (
                            <div className="h-32 w-32 flex items-center justify-center bg-blue-100 text-blue-800 text-4xl font-semibold">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </div>
                      </div>

                      {/* Client Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{client.name}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start">
                            <Mail className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p className="text-gray-900">{client.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Phone className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="text-gray-900">{client.phone}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Location</p>
                              <p className="text-gray-900">{client.location || 'Not specified'}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Member Since</p>
                              <p className="text-gray-900">{client.createdAt}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Clock className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Last Active</p>
                              <p className="text-gray-900">{client.lastActive || 'Unknown'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Activity */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      {clientActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
