'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import ExportDropdown from '@/components/ui/ExportDropdown';

// Matches the mock data in properties/page.tsx — in a real app this would be fetched
const MOCK_PROPERTIES = [
  { title: 'Luxury Villa in Whitefield',        price: '₹1.5 Cr',  status: 'Listed',   propertyType: 'Villa',       actualLocation: '123 Palm Avenue, Whitefield, Bangalore',        listedBy: 'Admin User',   bedrooms: 4, bathrooms: 3, squareFootage: '3500 sq ft', dateAdded: '2023-12-15' },
  { title: 'Commercial Space in Tech Park',     price: '₹2.8 Cr',  status: 'Listed',   propertyType: 'Commercial',  actualLocation: '456 Tech Avenue, Electronic City, Bangalore',   listedBy: 'Amit Kumar',   bedrooms: 0, bathrooms: 4, squareFootage: '5000 sq ft', dateAdded: '2023-11-20' },
  { title: 'Residential Plot in Sarjapur',      price: '₹85 Lakhs',status: 'Listed',   propertyType: 'Plot',        actualLocation: '789 Green Valley, Sarjapur Road, Bangalore',    listedBy: 'Admin User',   bedrooms: 0, bathrooms: 0, squareFootage: '2400 sq ft', dateAdded: '2023-12-05' },
  { title: 'Modern Apartment in Indiranagar',   price: '₹95 Lakhs',status: 'Unlisted', propertyType: 'Apartment',   actualLocation: '456 Metro Heights, Indiranagar, Bangalore',     listedBy: 'Admin User',   bedrooms: 2, bathrooms: 2, squareFootage: '1200 sq ft', dateAdded: '2023-12-10' },
];

const PROPERTY_COLUMNS = [
  { header: 'Title',      key: 'title' },
  { header: 'Price',      key: 'price' },
  { header: 'Status',     key: 'status' },
  { header: 'Type',       key: 'propertyType' },
  { header: 'Location',   key: 'actualLocation' },
  { header: 'Listed By',  key: 'listedBy' },
  { header: 'Bedrooms',   key: 'bedrooms' },
  { header: 'Bathrooms',  key: 'bathrooms' },
  { header: 'Size',       key: 'squareFootage' },
  { header: 'Date Added', key: 'dateAdded' },
];

export default function PropertiesExportPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('last30days');
  const [includeOptions, setIncludeOptions] = useState({
    sold: true,
    onInstallment: true,
    pending: true,
    cancelled: true,
  });
  const [propertyTypes, setPropertyTypes] = useState({
    residential: true,
    commercial: true,
    plot: true,
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleStatusChange = (option: keyof typeof includeOptions) =>
    setIncludeOptions({ ...includeOptions, [option]: !includeOptions[option] });

  const handleTypeChange = (option: keyof typeof propertyTypes) =>
    setPropertyTypes({ ...propertyTypes, [option]: !propertyTypes[option] });

  // Build a filtered label suffix for the filename
  const filenameSuffix = dateRange.replace(/([A-Z])/g, '-$1').toLowerCase();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {/* Back + Title */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/properties')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>Back to Properties</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Export Properties Data</h1>
              <p className="text-gray-500 mt-1">
                Configure your export options and download in CSV, PDF, Word, or Text format.
              </p>
            </div>

            {/* Export Form */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="relative w-full sm:w-72">
                    <select
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-700"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                      <option value="thisMonth">This Month</option>
                      <option value="lastMonth">Last Month</option>
                      <option value="thisYear">This Year</option>
                      <option value="lastYear">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {dateRange === 'custom' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      {['Start Date', 'End Date'].map((label) => (
                        <div key={label}>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar size={16} className="text-gray-400" />
                            </div>
                            <input
                              type="date"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Include Status Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Property Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(includeOptions) as (keyof typeof includeOptions)[]).map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={includeOptions[key]}
                          onChange={() => handleStatusChange(key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {key === 'onInstallment' ? 'On Installment' : key.charAt(0).toUpperCase() + key.slice(1)} Properties
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Property Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Types
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(Object.keys(propertyTypes) as (keyof typeof propertyTypes)[]).map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={propertyTypes[key]}
                          onChange={() => handleTypeChange(key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Export Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-4">
                  <ExportDropdown
                    label="Export Properties"
                    filename={`properties-${filenameSuffix}`}
                    columns={PROPERTY_COLUMNS}
                    rows={MOCK_PROPERTIES}
                    disabled={MOCK_PROPERTIES.length === 0}
                  />
                  <p className="text-xs text-gray-400">
                    {MOCK_PROPERTIES.length} properties · {Object.values(propertyTypes).filter(Boolean).length} type(s) selected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
