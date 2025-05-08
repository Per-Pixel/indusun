'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit, Trash, MoreHorizontal, X } from 'lucide-react';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Mock property data
interface BrokerProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  image: string;
  status: 'Active' | 'Pending' | 'Sold';
  dateAdded: string;
  commission: string;
}

// Mock properties
const mockProperties: BrokerProperty[] = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    address: '123 Main St, New York, NY',
    price: '$450,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: '1,200',
    image: '/properties/property-01.jpg',
    status: 'Active',
    dateAdded: '2023-11-15',
    commission: '$13,500',
  },
  {
    id: '2',
    title: 'Luxury Villa with Pool',
    address: '456 Ocean Ave, Miami, FL',
    price: '$1,250,000',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: '3,500',
    image: '/properties/property-02.jpg',
    status: 'Pending',
    dateAdded: '2023-11-10',
    commission: '$37,500',
  },
  {
    id: '3',
    title: 'Cozy Suburban Home',
    address: '789 Oak St, Chicago, IL',
    price: '$350,000',
    bedrooms: 3,
    bathrooms: 2,
    sqft: '1,800',
    image: '/properties/property-03.jpg',
    status: 'Sold',
    dateAdded: '2023-11-05',
    commission: '$10,500',
  },
  {
    id: '4',
    title: 'Waterfront Condo',
    address: '101 Lake Dr, Seattle, WA',
    price: '$550,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: '1,400',
    image: '/properties/property-04.jpg',
    status: 'Active',
    dateAdded: '2023-11-01',
    commission: '$16,500',
  },
];

// Property form type
interface PropertyFormData {
  title: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  status: 'Active' | 'Pending' | 'Sold';
}

export default function BrokerProperties() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<BrokerProperty[]>(mockProperties);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [currentProperty, setCurrentProperty] = useState<BrokerProperty | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    address: '',
    price: '',
    bedrooms: 0,
    bathrooms: 0,
    sqft: '',
    status: 'Active',
  });

  // Filter properties based on search query
  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle action menu
  const toggleActionMenu = (id: string) => {
    if (showActionMenu === id) {
      setShowActionMenu(null);
    } else {
      setShowActionMenu(id);
    }
  };

  // Handle edit property
  const handleEditProperty = (property: BrokerProperty) => {
    setCurrentProperty(property);
    setFormData({
      title: property.title,
      address: property.address,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.sqft,
      status: property.status,
    });
    setShowEditModal(true);
    setShowActionMenu(null);
  };

  // Handle delete property
  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(property => property.id !== id));
    setShowActionMenu(null);
  };

  // Handle add property
  const handleAddProperty = () => {
    setFormData({
      title: '',
      address: '',
      price: '',
      bedrooms: 0,
      bathrooms: 0,
      sqft: '',
      status: 'Active',
    });
    setShowAddModal(true);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'bedrooms' || name === 'bathrooms' ? parseFloat(value) : value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showAddModal) {
      // Add new property
      const newProperty: BrokerProperty = {
        id: (properties.length + 1).toString(),
        title: formData.title,
        address: formData.address,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft,
        image: '/properties/property-01.jpg', // Default image
        status: formData.status,
        dateAdded: new Date().toISOString().split('T')[0],
        commission: '$' + Math.floor(parseInt(formData.price.replace(/[^0-9]/g, '')) * 0.03).toLocaleString(),
      };
      
      setProperties([...properties, newProperty]);
      setShowAddModal(false);
    } else if (showEditModal && currentProperty) {
      // Update existing property
      const updatedProperties = properties.map(property => {
        if (property.id === currentProperty.id) {
          return {
            ...property,
            title: formData.title,
            address: formData.address,
            price: formData.price,
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            sqft: formData.sqft,
            status: formData.status,
            commission: '$' + Math.floor(parseInt(formData.price.replace(/[^0-9]/g, '')) * 0.03).toLocaleString(),
          };
        }
        return property;
      });
      
      setProperties(updatedProperties);
      setShowEditModal(false);
    }
  };

  return (
    <BrokerDashboardLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">My Properties</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <button 
              onClick={handleAddProperty}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
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
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit size={16} className="mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
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
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    property.status === 'Active' ? 'bg-green-100 text-green-800' :
                    property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-black mb-1">{property.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{property.address}</p>
                <p className="text-indigo-600 font-bold text-xl mb-3">{property.price}</p>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>{property.bedrooms} Beds</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.sqft} sqft</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Commission:</span>
                    <span className="font-medium text-black">{property.commission}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Added:</span>
                    <span className="text-black">{property.dateAdded}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Property Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-black">Add New Property</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="$450,000"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                        <input
                          type="number"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                          step="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                          step="0.5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                        <input
                          type="text"
                          name="sqft"
                          value={formData.sqft}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="1,200"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Add Property
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Property Modal */}
        <AnimatePresence>
          {showEditModal && currentProperty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-black">Edit Property</h2>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="$450,000"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                        <input
                          type="number"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                          step="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                          step="0.5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                        <input
                          type="text"
                          name="sqft"
                          value={formData.sqft}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="1,200"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrokerDashboardLayout>
  );
}

