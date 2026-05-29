'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Debounce search input before firing API call
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchTerm]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterStatus]);

  // Fetch properties from the API
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: PAGE_SIZE.toString(),
        search: debouncedSearch,
        status: filterStatus === 'All' ? '' : filterStatus,
      });
      const res = await fetch(`/api/properties?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setProperties(json.data ?? []);
      setTotalCount(json.count ?? 0);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterStatus]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Type filter is applied client-side; search + status are handled server-side
  const filteredProperties = filterType === 'All'
    ? properties
    : properties.filter((p) => p.propertyType === filterType);

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

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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

            {/* Loading / Error / Empty states */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && fetchError && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">Failed to load properties</h3>
                <p className="text-gray-500 mb-4">{fetchError}</p>
                <button
                  onClick={fetchProperties}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !fetchError && filteredProperties.length === 0 && (
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

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} properties
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 text-black"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 text-black"
                  >
                    Next
                  </button>
                </div>
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
