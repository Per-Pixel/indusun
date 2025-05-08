'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Plus, Edit, Trash2, Check, X, Filter } from 'lucide-react';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';
import { mockProperties } from '@/app/(main)/properties/mockData';

// Property status types
type PropertyStatus = 'Active' | 'Pending' | 'Sold' | 'New';

// Extended property type with broker-specific fields
interface BrokerProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  type: string;
  status: PropertyStatus;
  dateAdded: string;
  commission: string;
}

export default function BrokerProperties() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-properties' | 'new-listings'>('my-properties');
  const [searchQuery, setSearchQuery] = useState('');

  // Convert mock properties to broker properties
  const myProperties: BrokerProperty[] = mockProperties.slice(0, 4).map((prop, index) => ({
    ...prop,
    status: index === 0 ? 'Active' : index === 1 ? 'Pending' : index === 2 ? 'Sold' : 'Active',
    dateAdded: '2023-11-15',
    commission: '$' + Math.floor(parseInt(prop.price.replace(/[^0-9]/g, '')) * 0.03).toLocaleString(),
  }));

  const newListings: BrokerProperty[] = mockProperties.slice(4, 8).map((prop) => ({
    ...prop,
    status: 'New',
    dateAdded: '2023-12-01',
    commission: '$' + Math.floor(parseInt(prop.price.replace(/[^0-9]/g, '')) * 0.03).toLocaleString(),
  }));

  // Filter properties based on search query
  const filteredProperties = activeTab === 'my-properties'
    ? myProperties.filter(prop => 
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : newListings.filter(prop => 
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Status badge color mapping
  const getStatusColor = (status: PropertyStatus) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <BrokerDashboardLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Properties</h1>
          
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
            
            <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              <Plus size={18} />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'my-properties'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('my-properties')}
          >
            My Properties
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'new-listings'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('new-listings')}
          >
            New Listings
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16} />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Types</option>
            <option>House</option>
            <option>Apartment</option>
            <option>Villa</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Sold</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>Price Range</option>
            <option>$100k - $200k</option>
            <option>$200k - $500k</option>
            <option>$500k+</option>
          </select>
          
          <button className="ml-auto text-sm text-indigo-600 hover:text-indigo-800">
            Clear All
          </button>
        </div>

        {/* Properties Grid/List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden">
                            <Image
                              src={property.image}
                              alt={property.title}
                              width={40}
                              height={40}
                              className="h-10 w-10 object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">{property.title}</div>
                            <div className="text-sm text-gray-500">{property.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{property.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {property.dateAdded}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {property.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {property.commission}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {activeTab === 'my-properties' ? (
                            <>
                              <button className="text-indigo-600 hover:text-indigo-900">
                                <Edit size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="text-green-600 hover:text-green-900" title="Accept Listing">
                                <Check size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-900" title="Decline Listing">
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
}