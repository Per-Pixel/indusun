'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  Tag,
  User,
  DollarSign,
  Calendar,
  Clock,
  Building,
  Home,
  CheckCircle,
  AlertCircle,
  Clock4,
  Plus,
  Edit,
  Trash,
  Copy,
  MoreHorizontal,
  X,
  Upload,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import ExportDropdown from '@/components/ui/ExportDropdown';

// Enhanced property interface for management
interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  status: 'Listed' | 'Unlisted' | 'Sold' | 'Pending';
  isDraft: boolean; // New: Draft status
  images: PropertyImage[]; // Enhanced: Image with order
  targetedLocation: string; // Private - admin/broker only
  actualLocation: string; // Public - visible to website visitors
  listedBy: {
    id: string;
    name: string;
    type: 'Admin' | 'Broker';
    email: string;
    phone: string;
  };
  bedrooms: number;
  bathrooms: number;
  squareFootage: string;
  propertyType: 'House' | 'Villa' | 'Apartment' | 'Plot' | 'Commercial'; // Updated to match main website
  categories: string[]; // New: Multiple categories
  displayPages: DisplayPage[]; // New: Page display settings
  dateAdded: string;
  dateModified: string;
  // Legacy fields for compatibility
  address?: string;
  profit?: string;
  image?: string;
  date?: string;
  broker?: {
    id: string;
    name: string;
    image: string;
  };
  client?: {
    id: string;
    name: string;
    image: string;
  };
  type?: 'Residential' | 'Commercial' | 'Plot';
}

// New interfaces for enhanced features
interface PropertyImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

interface DisplayPage {
  page: 'homepage' | 'search' | 'listing' | 'category';
  enabled: boolean;
}

// Property categories matching main website
const PROPERTY_CATEGORIES = [
  'Featured',
  'New Launch',
  'Premium',
  'Budget Friendly',
  'Ready to Move',
  'Under Construction',
  'Investment',
  'Luxury',
  'Gated Community',
  'Near Metro',
  'School Nearby',
  'Hospital Nearby'
];

// Display pages options
const DISPLAY_PAGES = [
  { id: 'homepage', label: 'Homepage (Featured Properties)', description: 'Show in homepage featured section' },
  { id: 'search', label: 'Search Page Results', description: 'Include in search results' },
  { id: 'listing', label: 'Property Listing Page', description: 'Show in main property listings' },
  { id: 'category', label: 'Category-Specific Pages', description: 'Show in category-based pages' }
];

// Property form data interface
interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  status: 'Listed' | 'Unlisted';
  isDraft: boolean;
  targetedLocation: string;
  actualLocation: string;
  listedBy: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: string;
  propertyType: 'House' | 'Villa' | 'Apartment' | 'Plot' | 'Commercial';
  categories: string[];
  displayPages: DisplayPage[];
  images: File[];
  existingImages: PropertyImage[];
}

// Mock property data for management
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa in Whitefield',
    description: 'Stunning 4-bedroom villa with modern amenities, spacious garden, and premium interiors. Located in a gated community with 24/7 security.',
    price: '₹1.5 Cr',
    status: 'Listed',
    isDraft: false,
    images: [
      { id: 'img1', url: '/properties/property-01.jpg', order: 1, isPrimary: true },
      { id: 'img2', url: '/properties/property-02.jpg', order: 2, isPrimary: false }
    ],
    targetedLocation: 'Whitefield Premium Sector, Near Tech Parks',
    actualLocation: '123 Palm Avenue, Whitefield, Bangalore',
    listedBy: {
      id: 'admin1',
      name: 'Admin User',
      type: 'Admin',
      email: 'admin@indusun.com',
      phone: '+91 98765 43210'
    },
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: '3500 sq ft',
    propertyType: 'Villa',
    categories: ['Featured', 'Luxury', 'Gated Community'],
    displayPages: [
      { page: 'homepage', enabled: true },
      { page: 'search', enabled: true },
      { page: 'listing', enabled: true },
      { page: 'category', enabled: true }
    ],
    dateAdded: '2023-12-15',
    dateModified: '2023-12-15',
    // Legacy compatibility
    address: '123 Palm Avenue, Whitefield, Bangalore',
    profit: '₹15 Lakhs',
    image: '/properties/property-01.jpg',
    date: '2023-12-15',
    type: 'Residential'
  },
  {
    id: '2',
    title: 'Commercial Space in Tech Park',
    description: 'Premium commercial space in a prime tech park location. Ideal for IT companies, startups, or corporate offices.',
    price: '₹2.8 Cr',
    status: 'Listed',
    isDraft: false,
    images: [
      { id: 'img3', url: '/properties/property-02.jpg', order: 1, isPrimary: true }
    ],
    targetedLocation: 'Electronic City Tech Hub, IT Corridor',
    actualLocation: '456 Tech Avenue, Electronic City, Bangalore',
    listedBy: {
      id: 'broker1',
      name: 'Amit Kumar',
      type: 'Broker',
      email: 'amit@indusun.com',
      phone: '+91 98765 43211'
    },
    bedrooms: 0,
    bathrooms: 4,
    squareFootage: '5000 sq ft',
    propertyType: 'Commercial',
    categories: ['Premium', 'Investment'],
    displayPages: [
      { page: 'homepage', enabled: false },
      { page: 'search', enabled: true },
      { page: 'listing', enabled: true },
      { page: 'category', enabled: true }
    ],
    dateAdded: '2023-11-20',
    dateModified: '2023-11-25',
    // Legacy compatibility
    address: '456 Tech Avenue, Electronic City, Bangalore',
    profit: '₹28 Lakhs',
    image: '/properties/property-02.jpg',
    date: '2023-11-20',
    type: 'Commercial'
  },
  {
    id: '3',
    title: 'Residential Plot in Sarjapur',
    description: 'Prime residential plot in developing area with excellent connectivity and future growth potential.',
    price: '₹85 Lakhs',
    status: 'Listed',
    isDraft: false,
    images: [
      { id: 'img4', url: '/properties/property-03.jpg', order: 1, isPrimary: true }
    ],
    targetedLocation: 'Sarjapur Road Development Zone',
    actualLocation: '789 Green Valley, Sarjapur Road, Bangalore',
    listedBy: {
      id: 'admin1',
      name: 'Admin User',
      type: 'Admin',
      email: 'admin@indusun.com',
      phone: '+91 98765 43210'
    },
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: '2400 sq ft',
    propertyType: 'Plot',
    categories: ['Investment', 'Budget Friendly'],
    displayPages: [
      { page: 'homepage', enabled: false },
      { page: 'search', enabled: true },
      { page: 'listing', enabled: true },
      { page: 'category', enabled: true }
    ],
    dateAdded: '2023-12-05',
    dateModified: '2023-12-05',
    // Legacy compatibility
    address: '789 Green Valley, Sarjapur Road, Bangalore',
    profit: '₹7.5 Lakhs',
    image: '/properties/property-03.jpg',
    date: '2023-12-05',
    type: 'Plot'
  },
  {
    id: '4',
    title: 'Modern Apartment in Indiranagar',
    description: 'Contemporary 2BHK apartment with premium amenities and excellent connectivity.',
    price: '₹95 Lakhs',
    status: 'Unlisted',
    isDraft: true,
    images: [
      { id: 'img5', url: '/properties/property-04.jpg', order: 1, isPrimary: true }
    ],
    targetedLocation: 'Indiranagar Premium Area',
    actualLocation: '456 Metro Heights, Indiranagar, Bangalore',
    listedBy: {
      id: 'admin1',
      name: 'Admin User',
      type: 'Admin',
      email: 'admin@indusun.com',
      phone: '+91 98765 43210'
    },
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: '1200 sq ft',
    propertyType: 'Apartment',
    categories: ['New Launch', 'Near Metro'],
    displayPages: [
      { page: 'homepage', enabled: true },
      { page: 'search', enabled: false },
      { page: 'listing', enabled: false },
      { page: 'category', enabled: false }
    ],
    dateAdded: '2023-12-10',
    dateModified: '2023-12-10',
    // Legacy compatibility
    address: '456 Metro Heights, Indiranagar, Bangalore',
    profit: '₹9.5 Lakhs',
    image: '/properties/property-04.jpg',
    date: '2023-12-10',
    type: 'Residential'
  }
];

// Summary data for property management
const getSummaryData = (properties: Property[]) => [
  {
    title: 'Total Properties',
    value: properties.length.toString(),
    icon: <Building size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Listed Properties',
    value: properties.filter(p => p.status === 'Listed').length.toString(),
    icon: <Eye size={20} className="text-green-600" />,
    bgColor: 'bg-green-50'
  },
  {
    title: 'Unlisted Properties',
    value: properties.filter(p => p.status === 'Unlisted').length.toString(),
    icon: <EyeOff size={20} className="text-gray-600" />,
    bgColor: 'bg-gray-50'
  },
  {
    title: 'Sold Properties',
    value: properties.filter(p => p.status === 'Sold').length.toString(),
    icon: <CheckCircle size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50'
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
  const [mounted, setMounted] = useState(false);

  // Property management state
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced filtering with better search capabilities
  const filteredProperties = properties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      property.title.toLowerCase().includes(searchLower) ||
      property.description.toLowerCase().includes(searchLower) ||
      property.actualLocation.toLowerCase().includes(searchLower) ||
      property.targetedLocation.toLowerCase().includes(searchLower) ||
      property.listedBy.name.toLowerCase().includes(searchLower) ||
      property.listedBy.type.toLowerCase().includes(searchLower) ||
      property.price.toLowerCase().includes(searchLower) ||
      property.propertyType.toLowerCase().includes(searchLower) ||
      property.squareFootage.toLowerCase().includes(searchLower) ||
      (property.bedrooms > 0 && property.bedrooms.toString().includes(searchLower)) ||
      (property.bathrooms > 0 && property.bathrooms.toString().includes(searchLower));

    const matchesStatus = filterStatus === 'All' || property.status === filterStatus;
    const matchesType = filterType === 'All' || property.propertyType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Property management functions

  const handleAddProperty = () => {
    router.push('/properties/add');
  };

  const handleEditProperty = (property: Property) => {
    router.push(`/properties/${property.id}/edit`);
    setShowActionMenu(null);
  };

  const handleDuplicateProperty = (property: Property) => {
    // Navigate to add page with pre-filled data via URL params
    const params = new URLSearchParams({
      duplicate: 'true',
      sourceId: property.id,
      title: `Copy of ${property.title}`,
      description: property.description,
      price: property.price,
      status: 'Unlisted',
      targetedLocation: property.targetedLocation,
      actualLocation: property.actualLocation,
      listedBy: property.listedBy.id,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      squareFootage: property.squareFootage,
      propertyType: property.propertyType,
    });
    router.push(`/properties/add?${params.toString()}`);
    setShowActionMenu(null);
  };

  const handleDeleteProperty = (property: Property) => {
    setCurrentProperty(property);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const confirmDeleteProperty = () => {
    if (currentProperty) {
      setProperties(properties.filter(p => p.id !== currentProperty.id));
      setShowDeleteModal(false);
      setCurrentProperty(null);
    }
  };



  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'Listed':
        return 'bg-green-100 text-green-800';
      case 'Unlisted':
        return 'bg-gray-100 text-gray-800';
      case 'Sold':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Property['status']) => {
    switch (status) {
      case 'Listed':
        return <Eye size={16} className="mr-1" />;
      case 'Unlisted':
        return <EyeOff size={16} className="mr-1" />;
      case 'Sold':
        return <CheckCircle size={16} className="mr-1" />;
      case 'Pending':
        return <Clock size={16} className="mr-1" />;
      default:
        return null;
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle action menu
  const toggleActionMenu = (propertyId: string) => {
    setShowActionMenu(showActionMenu === propertyId ? null : propertyId);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-black">Property Management</h1>
                <p className="text-gray-600 mt-1">Manage all properties, listings, and property details</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <ExportDropdown
                  label="Export"
                  filename="properties"
                  disabled={filteredProperties.length === 0}
                  columns={[
                    { header: 'Title',    key: 'title' },
                    { header: 'Price',    key: 'price' },
                    { header: 'Status',   key: 'status' },
                    { header: 'Type',     key: 'propertyType' },
                    { header: 'Location', key: 'actualLocation' },
                    { header: 'Listed By', key: '_listedByName' },
                    { header: 'Bedrooms', key: 'bedrooms' },
                    { header: 'Bathrooms', key: 'bathrooms' },
                    { header: 'Size',     key: 'squareFootage' },
                    { header: 'Date Added', key: 'dateAdded' },
                  ]}
                  rows={filteredProperties.map((p) => ({ ...p, _listedByName: p.listedBy.name }))}
                />
                <button
                  onClick={handleAddProperty}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Add Property</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {getSummaryData(properties).map((item, index) => (
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
                  placeholder="Search properties, locations, or agents..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8 text-black"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Listed">Listed</option>
                    <option value="Unlisted">Unlisted</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8 text-black"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Office">Office</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    {property.images && property.images.length > 0 && property.images[0] ? (
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {getStatusIcon(property.status)}
                        {property.status}
                      </span>
                      {property.isDraft && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="relative">
                        <button
                          onClick={() => toggleActionMenu(property.id)}
                          className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <MoreHorizontal size={20} className="text-gray-600" />
                        </button>

                        {/* Action Menu */}
                        {showActionMenu === property.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => router.push(`/properties/${property.id}`)}
                                className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100"
                              >
                                <Eye size={16} className="mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleEditProperty(property)}
                                className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit Property
                              </button>
                              <button
                                onClick={() => handleDuplicateProperty(property)}
                                className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100"
                              >
                                <Copy size={16} className="mr-2" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(property)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                <Trash size={16} className="mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-black mb-1">{property.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{property.actualLocation}</span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="text-base font-semibold text-black">{property.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="text-base font-semibold text-black">{property.propertyType}</p>
                      </div>
                    </div>

                    {(property.bedrooms > 0 || property.bathrooms > 0) && (
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        {property.bedrooms > 0 && (
                          <span>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
                        )}
                        {property.bathrooms > 0 && (
                          <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
                        )}
                        <span>{property.squareFootage}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{property.listedBy.type}</p>
                          <p className="text-sm font-medium text-black">{property.listedBy.name}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {property.dateAdded}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">No properties found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters, or add a new property.</p>
                <button
                  onClick={handleAddProperty}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add Property
                </button>
              </div>
            )}




            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {showDeleteModal && currentProperty && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl w-full max-w-md"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                          <AlertCircle size={20} className="text-red-600" />
                        </div>
                        <h2 className="text-lg font-bold text-black">Delete Property</h2>
                      </div>

                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete "{currentProperty.title}"? This action cannot be undone.
                      </p>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDeleteProperty}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
