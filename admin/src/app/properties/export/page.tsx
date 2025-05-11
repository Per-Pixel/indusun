'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

export default function PropertiesExportPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('last30days');
  const [includeOptions, setIncludeOptions] = useState({
    sold: true,
    onInstallment: true,
    pending: true,
    cancelled: true
  });
  const [propertyTypes, setPropertyTypes] = useState({
    residential: true,
    commercial: true,
    plot: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Handle checkbox change for status
  const handleStatusChange = (option: keyof typeof includeOptions) => {
    setIncludeOptions({
      ...includeOptions,
      [option]: !includeOptions[option]
    });
  };
  
  // Handle checkbox change for property types
  const handleTypeChange = (option: keyof typeof propertyTypes) => {
    setPropertyTypes({
      ...propertyTypes,
      [option]: !propertyTypes[option]
    });
  };
  
  // Handle export
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    }, 2000);
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
          <div className="max-w-3xl mx-auto">
            {/* Back Button and Title */}
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
                Export your property sales data in various formats for reporting and analysis.
              </p>
            </div>
            
            {/* Export Form */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Export Format */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${
                        exportFormat === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setExportFormat('csv')}
                    >
                      <div className="flex items-center">
                        <FileText size={20} className={exportFormat === 'csv' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className={`ml-2 font-medium ${exportFormat === 'csv' ? 'text-blue-700' : 'text-gray-700'}`}>
                          CSV
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Comma-separated values file
                      </p>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${
                        exportFormat === 'excel' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setExportFormat('excel')}
                    >
                      <div className="flex items-center">
                        <FileText size={20} className={exportFormat === 'excel' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className={`ml-2 font-medium ${exportFormat === 'excel' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Excel
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Microsoft Excel spreadsheet
                      </p>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${
                        exportFormat === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setExportFormat('pdf')}
                    >
                      <div className="flex items-center">
                        <FileText size={20} className={exportFormat === 'pdf' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className={`ml-2 font-medium ${exportFormat === 'pdf' ? 'text-blue-700' : 'text-gray-700'}`}>
                          PDF
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Portable Document Format
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Date Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="relative">
                    <select
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-10"
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
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Start Date
                        </label>
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
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          End Date
                        </label>
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
                    </div>
                  )}
                </div>
                
                {/* Include Status Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Property Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sold"
                        checked={includeOptions.sold}
                        onChange={() => handleStatusChange('sold')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sold" className="ml-2 block text-sm text-gray-700">
                        Sold Properties
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="onInstallment"
                        checked={includeOptions.onInstallment}
                        onChange={() => handleStatusChange('onInstallment')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="onInstallment" className="ml-2 block text-sm text-gray-700">
                        On Installment Properties
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="pending"
                        checked={includeOptions.pending}
                        onChange={() => handleStatusChange('pending')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pending" className="ml-2 block text-sm text-gray-700">
                        Pending Properties
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="cancelled"
                        checked={includeOptions.cancelled}
                        onChange={() => handleStatusChange('cancelled')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="cancelled" className="ml-2 block text-sm text-gray-700">
                        Cancelled Properties
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Property Types */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Types
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="residential"
                        checked={propertyTypes.residential}
                        onChange={() => handleTypeChange('residential')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="residential" className="ml-2 block text-sm text-gray-700">
                        Residential
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="commercial"
                        checked={propertyTypes.commercial}
                        onChange={() => handleTypeChange('commercial')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="commercial" className="ml-2 block text-sm text-gray-700">
                        Commercial
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="plot"
                        checked={propertyTypes.plot}
                        onChange={() => handleTypeChange('plot')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="plot" className="ml-2 block text-sm text-gray-700">
                        Plot
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Export Button */}
                <div className="flex items-center">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`flex items-center px-4 py-2 rounded-lg text-white ${
                      isExporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-2" />
                        <span>Export Properties</span>
                      </>
                    )}
                  </button>
                  
                  {exportSuccess && (
                    <div className="ml-4 flex items-center text-green-600">
                      <CheckCircle size={16} className="mr-1" />
                      <span>Export successful!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
