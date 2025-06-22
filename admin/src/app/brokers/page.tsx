'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Award,
  Clock,
  Building,
  DollarSign,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Enhanced broker data from main application
const mockBrokers = [
  {
    id: 'broker_001',
    name: 'Amit Sharma',
    email: 'amit.sharma@indusun.com',
    phone: '+91 98765 11111',
    profile_picture: '/brokers/amit_sharma.jpg',
    specialization: ['Residential', 'Luxury Apartments', 'Investment Properties'],
    experience_years: 8,
    rating: 4.7,
    total_reviews: 156,
    office_address: 'Office 301, Brigade Road, Bangalore, Karnataka 560025',
    license_number: 'RERA/KA/2016/001234',
    languages: ['English', 'Hindi', 'Kannada'],
    areas_covered: ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City'],
    properties_sold: 89,
    total_sales_value: 450000000,
    certifications: ['RERA Certified', 'Real Estate Excellence Award 2023'],
    about: 'Experienced real estate professional specializing in premium residential properties in Bangalore. Known for transparent dealings and excellent customer service.',
    working_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    response_time: 'Within 2 hours',
    commission_rate: 2.5,
    status: 'active',
    joined_date: '2016-03-15',
    last_active: '2024-12-22T10:30:00Z',
  },
  {
    id: 'broker_002',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@indusun.com',
    phone: '+91 98765 22222',
    profile_picture: '/brokers/rajesh_kumar.jpg',
    specialization: ['Villas', 'Plots', 'Commercial Properties'],
    experience_years: 12,
    rating: 4.9,
    total_reviews: 203,
    office_address: 'Suite 205, MG Road, Bangalore, Karnataka 560001',
    license_number: 'RERA/KA/2012/005678',
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    areas_covered: ['Whitefield', 'Thanisandra', 'Hebbal', 'Yelahanka'],
    properties_sold: 134,
    total_sales_value: 780000000,
    certifications: ['RERA Certified', 'Top Performer 2022', 'Customer Choice Award 2023'],
    about: 'Senior real estate consultant with over a decade of experience in luxury villas and premium plots. Specializes in North Bangalore properties.',
    working_hours: 'Mon-Sun: 8:00 AM - 8:00 PM',
    response_time: 'Within 1 hour',
    commission_rate: 2.0,
    status: 'active',
    joined_date: '2012-08-20',
    last_active: '2024-12-22T09:15:00Z',
  },
  {
    id: 'broker_003',
    name: 'Priya Reddy',
    email: 'priya.reddy@indusun.com',
    phone: '+91 98765 33333',
    profile_picture: '/brokers/priya_reddy.jpg',
    specialization: ['First-time Buyers', 'Affordable Housing', 'Investment Guidance'],
    experience_years: 5,
    rating: 4.6,
    total_reviews: 98,
    office_address: 'Floor 2, Jayanagar 4th Block, Bangalore, Karnataka 560011',
    license_number: 'RERA/KA/2019/009876',
    languages: ['English', 'Hindi', 'Kannada', 'Telugu'],
    areas_covered: ['Jayanagar', 'BTM Layout', 'Banashankari', 'JP Nagar'],
    properties_sold: 67,
    total_sales_value: 280000000,
    certifications: ['RERA Certified', 'Rising Star Award 2023'],
    about: 'Dedicated to helping first-time home buyers navigate the real estate market. Known for patient guidance and honest advice.',
    working_hours: 'Mon-Sat: 10:00 AM - 6:00 PM',
    response_time: 'Within 3 hours',
    commission_rate: 2.2,
    status: 'active',
    joined_date: '2019-01-10',
    last_active: '2024-12-22T08:45:00Z',
  },
];

// Summary data
const summaryData = [
  {
    title: 'Total Brokers',
    value: '3',
    icon: <Users size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Active Brokers',
    value: '3',
    icon: <TrendingUp size={20} className="text-green-600" />,
    bgColor: 'bg-green-50'
  },
  {
    title: 'Total Sales',
    value: '₹151 Cr',
    icon: <DollarSign size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Properties Sold',
    value: '290',
    icon: <Building size={20} className="text-orange-600" />,
    bgColor: 'bg-orange-50'
  }
];

export default function BrokersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const brokersPerPage = 6;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter brokers based on search and filters
  const filteredBrokers = mockBrokers.filter(broker => {
    const matchesSearch = broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.phone.includes(searchTerm);

    const matchesStatus = filterStatus === 'All' || broker.status === filterStatus.toLowerCase();

    const matchesSpecialization = filterSpecialization === 'All' ||
                                 broker.specialization.some(spec =>
                                   spec.toLowerCase().includes(filterSpecialization.toLowerCase())
                                 );

    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBrokers.length / brokersPerPage);
  const startIndex = (currentPage - 1) * brokersPerPage;
  const currentBrokers = filteredBrokers.slice(startIndex, startIndex + brokersPerPage);

  const handleViewBroker = (brokerId: string) => {
    router.push(`/brokers/${brokerId}`);
  };

  const handleEditBroker = (brokerId: string) => {
    router.push(`/brokers/${brokerId}/edit`);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };



  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <Sidebar />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  Add Broker
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryData.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border border-gray-200 ${item.bgColor}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{item.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white">
                      {item.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search brokers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <select
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Specializations</option>
                    <option value="Residential">Residential</option>
                    <option value="Villas">Villas</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plots">Plots</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Brokers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {currentBrokers.map((broker) => (
                <div key={broker.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{broker.name}</h3>
                        <p className="text-sm text-gray-500">{broker.experience_years} years experience</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewBroker(broker.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditBroker(broker.id)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Broker"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {renderStars(broker.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          {broker.rating} ({broker.total_reviews} reviews)
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        broker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{broker.phone}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{broker.email}</span>
                    </div>

                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-0.5" />
                      <span className="line-clamp-2">{broker.office_address}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Properties Sold</p>
                          <p className="font-semibold text-gray-900">{broker.properties_sold}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Sales</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(broker.total_sales_value)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {broker.specialization.slice(0, 2).map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                      {broker.specialization.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{broker.specialization.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
