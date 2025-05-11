'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Tag,
  User,
  DollarSign,
  Calendar,
  Clock,
  Building,
  Home,
  CheckCircle,
  AlertCircle,
  Clock4
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

// Mock data for property sales
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
  };
  client: {
    id: string;
    name: string;
    image: string;
  };
  type: 'Residential' | 'Commercial' | 'Plot';
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
    },
    client: {
      id: 'c1',
      name: 'Priya Patel',
      image: '/auth/Agents/client-01.jpg',
    },
    type: 'Residential'
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
    },
    client: {
      id: 'c2',
      name: 'Vikram Singh',
      image: '/auth/Agents/client-02.jpg',
    },
    type: 'Commercial'
  },
  {
    id: '3',
    title: 'Residential Plot in Sarjapur',
    address: '789 Green Valley, Sarjapur Road, Bangalore',
    price: '₹85 Lakhs',
    profit: '₹7.5 Lakhs',
    image: '/properties/property-03.jpg',
    status: 'Pending',
    date: '2023-12-05',
    client: {
      id: 'c3',
      name: 'Ananya Reddy',
      image: '/auth/Agents/client-03.jpg',
    },
    type: 'Plot'
  },
  {
    id: '4',
    title: 'Premium Apartment in Indiranagar',
    address: '101 Elite Heights, Indiranagar, Bangalore',
    price: '₹1.2 Cr',
    profit: '₹12 Lakhs',
    image: '/properties/property-04.jpg',
    status: 'Sold',
    date: '2023-10-30',
    broker: {
      id: 'b3',
      name: 'Neha Gupta',
      image: '/auth/Agents/agent-03.jpg',
    },
    client: {
      id: 'c4',
      name: 'Rajesh Khanna',
      image: '/auth/Agents/client-04.jpg',
    },
    type: 'Residential'
  },
  {
    id: '5',
    title: 'Office Space in Central Business District',
    address: '555 Business Hub, MG Road, Bangalore',
    price: '₹3.5 Cr',
    profit: '₹35 Lakhs',
    image: '/properties/property-05.jpg',
    status: 'Cancelled',
    date: '2023-09-15',
    broker: {
      id: 'b4',
      name: 'Suresh Menon',
      image: '/auth/Agents/agent-04.jpg',
    },
    client: {
      id: 'c5',
      name: 'Kiran Rao',
      image: '/auth/Agents/client-05.jpg',
    },
    type: 'Commercial'
  },
  {
    id: '6',
    title: 'Farmhouse in Devanahalli',
    address: '888 Rural Retreat, Devanahalli, Bangalore',
    price: '₹2.1 Cr',
    profit: '₹21 Lakhs',
    image: '/properties/property-06.jpg',
    status: 'On Installment',
    date: '2023-11-10',
    broker: {
      id: 'b1',
      name: 'Rahul Sharma',
      image: '/auth/Agents/agent-01.jpg',
    },
    client: {
      id: 'c6',
      name: 'Meera Iyer',
      image: '/auth/Agents/client-06.jpg',
    },
    type: 'Residential'
  },
];

// Summary data
const summaryData = [
  {
    title: 'Total Sales',
    value: '₹11.95 Cr',
    icon: <DollarSign size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Total Profit',
    value: '₹118.5 Lakhs',
    icon: <DollarSign size={20} className="text-green-600" />,
    bgColor: 'bg-green-50'
  },
  {
    title: 'Properties Sold',
    value: '6',
    icon: <Building size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Pending Sales',
    value: '1',
    icon: <Clock size={20} className="text-yellow-600" />,
    bgColor: 'bg-yellow-50'
  }
];

// Mock data for property sales chart
const propertySalesData = [
  { name: 'Jan', value: 3 },
  { name: 'Feb', value: 5 },
  { name: 'Mar', value: 4 },
  { name: 'Apr', value: 7 },
  { name: 'May', value: 6 },
  { name: 'Jun', value: 8 },
  { name: 'Jul', value: 10 },
];

// Mock data for property types pie chart
const propertyTypesData = [
  { name: 'Residential', value: 65, color: '#0088FE' },
  { name: 'Commercial', value: 25, color: '#00C49F' },
  { name: 'Plot', value: 10, color: '#FFBB28' },
];

export default function PropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filter properties based on search term and filters
  const filteredProperties = mockPropertySales.filter(property => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.broker?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = filterStatus === 'All' || property.status === filterStatus;
    const matchesType = filterType === 'All' || property.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

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

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-sm font-semibold text-black">
            Properties Sold: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Property Sales</h1>
              <button
                onClick={() => router.push('/properties/export')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryData.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border border-gray-200 ${item.bgColor}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">{item.title}</p>
                      <p className="text-xl font-semibold mt-1 text-black">{item.value}</p>
                    </div>
                    <div className="p-2 rounded-full bg-white">
                      {item.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search properties, clients, or brokers..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Sold">Sold</option>
                    <option value="On Installment">On Installment</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Property Sales Chart */}
              <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-4">Property Sales Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={propertySalesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        domain={[0, 'dataMax + 2']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Property Types Chart */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-4">Property Types</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {propertyTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Property Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/properties/${property.id}`)}
                >
                  <div className="relative h-48">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {getStatusIcon(property.status)}
                        {property.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{property.address}</p>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="text-base font-semibold text-gray-900">{property.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Profit</p>
                        <p className="text-base font-semibold text-green-600">{property.profit}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {property.broker && (
                            <div className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                              <div className="flex items-center justify-center h-full w-full text-xs font-medium bg-blue-100 text-blue-800">
                                B
                              </div>
                            </div>
                          )}
                          <div className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                            <div className="flex items-center justify-center h-full w-full text-xs font-medium bg-purple-100 text-purple-800">
                              C
                            </div>
                          </div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {property.broker ? 'Broker & Client' : 'Direct Client'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(property.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
