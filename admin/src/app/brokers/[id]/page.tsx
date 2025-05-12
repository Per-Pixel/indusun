'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserForm from '@/components/users/UserForm';
import { User } from '@/components/users/UserList';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Clock, FileText, Users, Home, DollarSign, BarChart2 } from 'lucide-react';
import AgentDetailsForm from '@/components/users/AgentDetailsForm';
import AgentEditForm from '@/components/users/AgentEditForm';

// Mock data for brokers (same as in the brokers page)
const mockBrokers: User[] = [
  {
    id: '1',
    name: 'Arshir Patel',
    email: 'arshir.p@indusun.com',
    phone: '+91 98765 43210',
    role: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-03.jpg',
    location: 'Mumbai, India',
    lastActive: '2023-12-20',
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.s@indusun.com',
    phone: '+91 87654 32109',
    role: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-02.jpg',
    location: 'Delhi, India',
    lastActive: '2023-12-19',
    createdAt: '2023-07-22',
  },
  {
    id: '3',
    name: 'Rahul Verma',
    email: 'rahul.v@indusun.com',
    phone: '+91 76543 21098',
    role: 'broker',
    status: 'inactive',
    image: '/auth/Agents/agent-01.jpg',
    location: 'Bangalore, India',
    lastActive: '2023-11-30',
    createdAt: '2023-05-10',
  },
  {
    id: '4',
    name: 'Ananya Desai',
    email: 'ananya.d@indusun.com',
    phone: '+91 65432 10987',
    role: 'broker',
    status: 'pending',
    image: '/auth/Agents/agent-04.jpg',
    location: 'Pune, India',
    lastActive: '2023-12-15',
    createdAt: '2023-11-05',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.s@indusun.com',
    phone: '+91 54321 09876',
    role: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-05.jpg',
    location: 'Chennai, India',
    lastActive: '2023-12-18',
    createdAt: '2023-08-30',
  },
];

// Mock broker performance data
const mockBrokerPerformance = {
  totalSales: 12,
  totalRevenue: 4850000,
  activeListings: 8,
  clientsManaged: 15,
  recentSales: [
    {
      id: '1',
      property: 'Luxury Villa in Bandra',
      price: 1250000,
      date: '2023-12-15',
      client: 'Robert Johnson',
    },
    {
      id: '2',
      property: 'Apartment in Andheri',
      price: 750000,
      date: '2023-11-28',
      client: 'Sarah Williams',
    },
    {
      id: '3',
      property: 'Commercial Space in BKC',
      price: 2000000,
      date: '2023-10-10',
      client: 'Michael Brown',
    },
  ],
};

export default function BrokerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brokerId = params.id as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [broker, setBroker] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [brokerPerformance, setBrokerPerformance] = useState(mockBrokerPerformance);
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    // In a real app, you would fetch the broker data from an API
    const foundBroker = mockBrokers.find(b => b.id === brokerId);

    if (foundBroker) {
      setBroker(foundBroker);
      // Initialize form data with broker data
      setFormData({
        name: foundBroker.name,
        email: foundBroker.email,
        phone: foundBroker.phone,
        status: foundBroker.status,
        location: foundBroker.location,
        title: 'Real Estate Agent',
        practice: 'Residential',
        branch: 'Mumbai',
        contract: 'Employee',
        grade: 'Senior',
        division: 'Sales',
        division_manager: 'Vikram Singh',
        login: foundBroker.id
      });
    } else {
      toast.error('Broker not found');
      router.push('/brokers');
    }

    setIsLoading(false);
  }, [brokerId, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${broker?.name}?`)) {
      // In a real app, you would call an API to delete the broker
      toast.success(`${broker?.name} has been deleted`);
      router.push('/brokers');
    }
  };

  const handleFormSubmit = (brokerData: Partial<User>) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (broker) {
        // Update broker
        setBroker({ ...broker, ...brokerData });
        toast.success(`${brokerData.name} has been updated`);
      }

      setIsLoading(false);
      setShowEditForm(false);
    }, 1000);
  };

  const handleFormCancel = () => {
    setShowEditForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Broker Not Found</h2>
          <p className="text-gray-500 mb-4">The broker you are looking for does not exist or has been deleted.</p>
          <button
            onClick={() => router.push('/brokers')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Brokers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/brokers')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Brokers</span>
            </button>

            {showEditForm ? (
              <AgentEditForm
                agent={{
                  id: broker?.id || '',
                  name: broker?.name || '',
                  title: broker?.title || 'Real Estate Agent',
                  email: broker?.email || '',
                  phone: broker?.phone || '',
                  image: broker?.image,
                  practice: 'Residential',
                  branch: 'Mumbai',
                  contract: 'Employee',
                  grade: 'Senior',
                  division: 'Sales',
                  division_manager: 'Vikram Singh',
                  login: broker?.id,
                  status: 'Activated',
                  status_history: [{ status: 'Activated', date: '13/05/2009' }]
                }}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <>
                <AgentDetailsForm
                  agent={{
                    id: broker?.id || '',
                    name: broker?.name || '',
                    title: broker?.title || 'Real Estate Agent',
                    email: broker?.email || '',
                    phone: broker?.phone || '',
                    image: broker?.image,
                    practice: 'Residential',
                    branch: 'Mumbai',
                    contract: 'Employee',
                    grade: 'Senior',
                    division: 'Sales',
                    division_manager: 'Vikram Singh',
                    login: broker?.id,
                    status: 'Activated',
                    status_history: [{ status: 'Activated', date: '13/05/2009' }]
                  }}
                  onEdit={handleEdit}
                  readOnly={false}
                />

                {/* Broker Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                      <DollarSign className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{brokerPerformance.totalSales}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                      <BarChart2 className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(brokerPerformance.totalRevenue)}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">Active Listings</h3>
                      <Home className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{brokerPerformance.activeListings}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">Clients Managed</h3>
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{brokerPerformance.clientsManaged}</p>
                  </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Sales</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {brokerPerformance.recentSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.property}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.client}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(sale.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.date}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
