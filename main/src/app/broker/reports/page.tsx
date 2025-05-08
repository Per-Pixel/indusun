'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Download, Filter, ChevronDown, BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

// Report types
type ReportPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type ReportType = 'sales' | 'revenue' | 'clients' | 'properties';

export default function BrokerReports() {
  const router = useRouter();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  const [reportType, setReportType] = useState<ReportType>('sales');
  
  // Mock data for sales by month
  const salesData = [
    { name: 'Jan', sales: 4, revenue: 1200000 },
    { name: 'Feb', sales: 3, revenue: 900000 },
    { name: 'Mar', sales: 5, revenue: 1500000 },
    { name: 'Apr', sales: 2, revenue: 600000 },
    { name: 'May', sales: 6, revenue: 1800000 },
    { name: 'Jun', sales: 8, revenue: 2400000 },
    { name: 'Jul', sales: 7, revenue: 2100000 },
    { name: 'Aug', sales: 9, revenue: 2700000 },
    { name: 'Sep', sales: 11, revenue: 3300000 },
    { name: 'Oct', sales: 13, revenue: 3900000 },
    { name: 'Nov', sales: 7, revenue: 2100000 },
    { name: 'Dec', sales: 5, revenue: 1500000 },
  ];

  // Mock data for property types
  const propertyTypeData = [
    { name: 'Residential', value: 65 },
    { name: 'Commercial', value: 15 },
    { name: 'Industrial', value: 10 },
    { name: 'Land', value: 10 },
  ];

  // Mock data for client acquisition
  const clientData = [
    { name: 'Jan', newClients: 3, activeClients: 12 },
    { name: 'Feb', newClients: 5, activeClients: 15 },
    { name: 'Mar', newClients: 2, activeClients: 16 },
    { name: 'Apr', newClients: 7, activeClients: 20 },
    { name: 'May', newClients: 4, activeClients: 22 },
    { name: 'Jun', newClients: 6, activeClients: 25 },
    { name: 'Jul', newClients: 3, activeClients: 27 },
    { name: 'Aug', newClients: 8, activeClients: 30 },
    { name: 'Sep', newClients: 5, activeClients: 33 },
    { name: 'Oct', newClients: 4, activeClients: 35 },
    { name: 'Nov', newClients: 6, activeClients: 38 },
    { name: 'Dec', newClients: 3, activeClients: 40 },
  ];

  // Mock data for commission breakdown
  const commissionData = [
    { name: 'Residential Sales', value: 45 },
    { name: 'Commercial Sales', value: 25 },
    { name: 'Rentals', value: 15 },
    { name: 'Referrals', value: 15 },
  ];

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Summary metrics
  const summaryMetrics = {
    totalSales: 80,
    totalRevenue: '$24,000,000',
    averageSalePrice: '$300,000',
    totalCommission: '$720,000',
    conversionRate: '18%',
    activeListings: 45,
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <BrokerDashboardLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Reports & Analytics</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-black">
                <Calendar size={18} className="text-gray-500" />
                <span>Date Range</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
            </div>
            
            <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              reportType === 'sales'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setReportType('sales')}
          >
            Sales Performance
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              reportType === 'revenue'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setReportType('revenue')}
          >
            Revenue Analysis
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              reportType === 'clients'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setReportType('clients')}
          >
            Client Metrics
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              reportType === 'properties'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setReportType('properties')}
          >
            Property Analysis
          </button>
        </div>

        {/* Time Period Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16} />
            <span className="text-sm font-medium">Time Period:</span>
          </div>
          
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              reportPeriod === 'weekly' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => setReportPeriod('weekly')}
          >
            Weekly
          </button>
          
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              reportPeriod === 'monthly' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => setReportPeriod('monthly')}
          >
            Monthly
          </button>
          
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              reportPeriod === 'quarterly' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => setReportPeriod('quarterly')}
          >
            Quarterly
          </button>
          
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              reportPeriod === 'yearly' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => setReportPeriod('yearly')}
          >
            Yearly
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
              <BarChart3 size={20} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-black">{summaryMetrics.totalSales}</p>
            <p className="text-sm text-green-600">+12% from last period</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <DollarSign size={20} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-black">{summaryMetrics.totalRevenue}</p>
            <p className="text-sm text-green-600">+8% from last period</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Commission</h3>
              <TrendingUp size={20} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-black">{summaryMetrics.totalCommission}</p>
            <p className="text-sm text-green-600">+15% from last period</p>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-medium text-black mb-4">
            {reportType === 'sales' && 'Sales Performance'}
            {reportType === 'revenue' && 'Revenue Analysis'}
            {reportType === 'clients' && 'Client Acquisition'}
            {reportType === 'properties' && 'Property Performance'}
          </h2>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {reportType === 'sales' && (
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} sales`]} />
                  <Legend />
                  <Bar dataKey="sales" fill="#4F46E5" name="Number of Sales" />
                </BarChart>
              )}
              
              {reportType === 'revenue' && (
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4F46E5" name="Revenue" />
                </LineChart>
              )}
              
              {reportType === 'clients' && (
                <LineChart data={clientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newClients" stroke="#4F46E5" name="New Clients" />
                  <Line type="monotone" dataKey="activeClients" stroke="#10B981" name="Active Clients" />
                </LineChart>
              )}
              
              {reportType === 'properties' && (
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [name === 'sales' ? `${value} properties` : formatCurrency(value as number)]} />
                  <Legend />
                  <Bar dataKey="sales" fill="#4F46E5" name="Properties Sold" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts - 2 column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart - Property Types or Commission Breakdown */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-black mb-4">
              {reportType === 'properties' ? 'Property Types' : 'Commission Breakdown'}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={reportType === 'properties' ? propertyTypeData : commissionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {(reportType === 'properties' ? propertyTypeData : commissionData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`]} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Metrics Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-black mb-4">Key Performance Metrics</h2>
            <div className="overflow-hidden">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500">Average Sale Price</td>
                    <td className="py-3 text-sm text-black text-right">{summaryMetrics.averageSalePrice}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500">Conversion Rate</td>
                    <td className="py-3 text-sm text-black text-right">{summaryMetrics.conversionRate}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500">Active Listings</td>
                    <td className="py-3 text-sm text-black text-right">{summaryMetrics.activeListings}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500">Days to Close (Avg)</td>
                    <td className="py-3 text-sm text-black text-right">45 days</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500">Client Retention Rate</td>
                    <td className="py-3 text-sm text-black text-right">78%</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500">Referral Rate</td>
                    <td className="py-3 text-sm text-black text-right">22%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-black">Recent Transactions</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
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
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Luxury Condo #1204</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Robert Johnson</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Dec 15, 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Sale</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$750,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$22,500</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Riverside Villa</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Jennifer Lee</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Dec 10, 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Sale</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$1,200,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$36,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Downtown Apartment</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Marcus Williams</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Dec 5, 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Rental</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$2,500/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$2,500</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Commercial Space</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Daniel Kim</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Nov 28, 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Sale</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$950,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">$28,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
}