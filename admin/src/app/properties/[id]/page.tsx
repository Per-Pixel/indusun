'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Users,
  Phone,
  Mail,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Clock4,
  Home,
  Tag
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

// Mock data for property sales (same as in the listing page)
interface PropertySale {
  id: string;
  title: string;
  address: string;
  price: string;
  profit: string;
  image: string;
  status: 'Sold' | 'On Installment' | 'Pending' | 'Cancelled';
  date: string;
  broker?: {
    id: string;
    name: string;
    image: string;
    phone?: string;
    email?: string;
    commission?: string;
  };
  client: {
    id: string;
    name: string;
    image: string;
    phone?: string;
    email?: string;
  };
  type: 'Residential' | 'Commercial' | 'Plot';
  description?: string;
  features?: string[];
  area?: string;
  documents?: {
    id: string;
    name: string;
    date: string;
    type: string;
  }[];
  transactions?: {
    id: string;
    date: string;
    amount: string;
    type: 'Payment' | 'Refund' | 'Commission';
    status: 'Completed' | 'Pending' | 'Failed';
  }[];
}

const mockPropertySales: PropertySale[] = [
  {
    id: '1',
    title: 'Luxury Villa in Whitefield',
    address: '123 Palm Avenue, Whitefield, Bangalore',
    price: '₹1.5 Cr',
    profit: '₹15 Lakhs',
    image: '/properties/property-01.jpg',
    status: 'Sold',
    date: '2023-12-15',
    broker: {
      id: 'b1',
      name: 'Rahul Sharma',
      image: '/auth/Agents/agent-01.jpg',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@indusun.com',
      commission: '₹7.5 Lakhs',
    },
    client: {
      id: 'c1',
      name: 'Priya Patel',
      image: '/auth/Agents/client-01.jpg',
      phone: '+91 98765 12345',
      email: 'priya.patel@example.com',
    },
    type: 'Residential',
    description: 'Luxurious 4-bedroom villa with modern amenities, spacious garden, and premium interiors. Located in a gated community with 24/7 security.',
    features: ['4 Bedrooms', '3 Bathrooms', 'Swimming Pool', 'Garden', 'Double Garage', 'Smart Home System'],
    area: '3500 sq ft',
    documents: [
      { id: 'd1', name: 'Sale Agreement', date: '2023-12-10', type: 'PDF' },
      { id: 'd2', name: 'Property Deed', date: '2023-12-15', type: 'PDF' },
      { id: 'd3', name: 'Tax Documents', date: '2023-12-16', type: 'PDF' },
    ],
    transactions: [
      { id: 't1', date: '2023-11-25', amount: '₹15 Lakhs', type: 'Payment', status: 'Completed' },
      { id: 't2', date: '2023-12-05', amount: '₹1.35 Cr', type: 'Payment', status: 'Completed' },
      { id: 't3', date: '2023-12-15', amount: '₹7.5 Lakhs', type: 'Commission', status: 'Completed' },
    ],
  },
  {
    id: '2',
    title: 'Commercial Space in Tech Park',
    address: '456 Tech Avenue, Electronic City, Bangalore',
    price: '₹2.8 Cr',
    profit: '₹28 Lakhs',
    image: '/properties/property-02.jpg',
    status: 'On Installment',
    date: '2023-11-20',
    broker: {
      id: 'b2',
      name: 'Amit Kumar',
      image: '/auth/Agents/agent-02.jpg',
      phone: '+91 98765 43211',
      email: 'amit.kumar@indusun.com',
      commission: '₹14 Lakhs',
    },
    client: {
      id: 'c2',
      name: 'Vikram Singh',
      image: '/auth/Agents/client-02.jpg',
      phone: '+91 98765 12346',
      email: 'vikram.singh@example.com',
    },
    type: 'Commercial',
    description: 'Premium commercial space in a prime tech park location. Ideal for IT companies, startups, or corporate offices. Modern infrastructure with all amenities.',
    features: ['5000 sq ft Space', 'Conference Rooms', 'Cafeteria', 'Parking', '24/7 Access', 'High-speed Internet'],
    area: '5000 sq ft',
    documents: [
      { id: 'd1', name: 'Lease Agreement', date: '2023-11-15', type: 'PDF' },
      { id: 'd2', name: 'Property Documents', date: '2023-11-20', type: 'PDF' },
    ],
    transactions: [
      { id: 't1', date: '2023-10-25', amount: '₹56 Lakhs', type: 'Payment', status: 'Completed' },
      { id: 't2', date: '2023-11-25', amount: '₹56 Lakhs', type: 'Payment', status: 'Completed' },
      { id: 't3', date: '2023-12-25', amount: '₹56 Lakhs', type: 'Payment', status: 'Pending' },
      { id: 't4', date: '2023-11-25', amount: '₹14 Lakhs', type: 'Commission', status: 'Completed' },
    ],
  },
  // Add more mock data for other properties...
];

const getStatusColor = (status: PropertySale['status']) => {
  switch (status) {
    case 'Sold':
      return 'bg-green-100 text-green-800';
    case 'On Installment':
      return 'bg-blue-100 text-blue-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: PropertySale['status']) => {
  switch (status) {
    case 'Sold':
      return <CheckCircle size={16} className="mr-1" />;
    case 'On Installment':
      return <Clock4 size={16} className="mr-1" />;
    case 'Pending':
      return <Clock size={16} className="mr-1" />;
    case 'Cancelled':
      return <AlertCircle size={16} className="mr-1" />;
    default:
      return null;
  }
};

const getTransactionStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'transactions'>('details');

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Find the property by ID
  const property = mockPropertySales.find(p => p.id === params.id);

  if (!property) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <button
            onClick={() => router.push('/properties')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Properties
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
            {/* Back Button and Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <button
                  onClick={() => router.push('/properties')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2 md:mb-0"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span>Back to Properties</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin size={16} className="mr-1" />
                  <span>{property.address}</span>
                </div>
              </div>

              <div className="flex items-center mt-4 md:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                  {getStatusIcon(property.status)}
                  {property.status}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Property Details
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Property Image and Details */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="relative h-64">
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <Home className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Property Type</h3>
                          <p className="text-base font-medium">{property.type}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Area</h3>
                          <p className="text-base font-medium">{property.area || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Sale Price</h3>
                          <p className="text-base font-medium">{property.price}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Sale Date</h3>
                          <p className="text-base font-medium">{new Date(property.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Profit</h3>
                          <p className="text-base font-medium text-green-600">{property.profit}</p>
                        </div>
                        {property.broker && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Broker Commission</h3>
                            <p className="text-base font-medium">{property.broker.commission}</p>
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                        <p className="text-sm text-gray-700">{property.description || 'No description available.'}</p>
                      </div>

                      {property.features && property.features.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Features</h3>
                          <div className="flex flex-wrap gap-2">
                            {property.features.map((feature, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Tag size={12} className="mr-1" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client and Broker Info */}
                <div className="md:col-span-1">
                  {/* Client Card */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-medium">Client Information</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <User size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{property.client.name}</h4>
                          <p className="text-sm text-gray-500">Client</p>
                        </div>
                      </div>

                      {property.client.phone && (
                        <div className="flex items-center text-sm mb-2">
                          <Phone size={16} className="mr-2 text-gray-400" />
                          <span>{property.client.phone}</span>
                        </div>
                      )}

                      {property.client.email && (
                        <div className="flex items-center text-sm">
                          <Mail size={16} className="mr-2 text-gray-400" />
                          <span>{property.client.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Broker Card (if exists) */}
                  {property.broker && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-medium">Broker Information</h3>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Users size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{property.broker.name}</h4>
                            <p className="text-sm text-gray-500">Broker</p>
                          </div>
                        </div>

                        {property.broker.phone && (
                          <div className="flex items-center text-sm mb-2">
                            <Phone size={16} className="mr-2 text-gray-400" />
                            <span>{property.broker.phone}</span>
                          </div>
                        )}

                        {property.broker.email && (
                          <div className="flex items-center text-sm mb-4">
                            <Mail size={16} className="mr-2 text-gray-400" />
                            <span>{property.broker.email}</span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Commission</span>
                            <span className="font-medium">{property.broker.commission}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-medium">Property Documents</h3>
                </div>

                {property.documents && property.documents.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {property.documents.map((doc) => (
                      <div key={doc.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center mr-3">
                            <FileText size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-sm text-gray-500">{doc.type} • {new Date(doc.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <Download size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No documents available for this property.</p>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium">Transaction History</h3>
                </div>

                {property.transactions && property.transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {property.transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {transaction.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {transaction.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No transactions available for this property.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
