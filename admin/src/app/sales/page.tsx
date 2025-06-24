'use client';

import React, { useState, useRef, useEffect } from 'react';

import Image from 'next/image';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Search, Info, ChevronDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Bell, DollarSign, User,
  Calendar, Filter, SortAsc, SortDesc, Loader, RefreshCw, Users, UserCheck, Building2,
  Briefcase, Home, CheckCircle, Plus
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import RecentTransactions from '@/components/sales/RecentTransactions';
import TransactionForm from '@/components/sales/TransactionForm';

// Types for sales data
interface SaleData {
  date: string;
  total_amount: number;
  transaction_count: number;
  name?: string; // For chart formatting
  value?: number; // For chart formatting
  amount?: number; // For tooltip
  transactions?: number; // For tooltip
}

interface Broker {
  id: number;
  name: string;
}

interface FilterOptions {
  brokers: Broker[];
}

interface SalesSummary {
  totalClients: number;
  activeClients: number;
  totalBrokers: number;
  activeBrokers: number;
  totalProperties: number;
  propertiesSold: number;
  totalTransactions: number;
  totalRevenue: number;
}

// Format amount as Indian currency
const formatAmount = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)} K`;
  return `₹${amount.toLocaleString()}`;
};

// Statistics cards with real data and professional icons
const getStatsCards = (summary: SalesSummary | null) => [
  // Dynamic statistics that update with filters
  {
    id: 1,
    title: 'Total Revenue',
    value: summary?.totalRevenue || 0,
    formattedValue: formatAmount(summary?.totalRevenue || 0),
    description: 'Based on current filters',
    icon: <DollarSign className="h-6 w-6 text-green-600" />,
    bgColor: 'bg-green-50',
    isMonetary: true,
    isDynamic: true
  },
  {
    id: 2,
    title: 'Total Transactions',
    value: summary?.totalTransactions || 0,
    formattedValue: (summary?.totalTransactions || 0).toLocaleString(),
    description: 'Based on current filters',
    icon: <Calendar className="h-6 w-6 text-blue-600" />,
    bgColor: 'bg-blue-50',
    isDynamic: true
  },
  // Static lifetime statistics
  {
    id: 3,
    title: 'Total Clients',
    value: summary?.totalClients || 0,
    formattedValue: (summary?.totalClients || 0).toLocaleString(),
    description: 'All registered clients',
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    bgColor: 'bg-indigo-50'
  },
  {
    id: 4,
    title: 'Active Clients',
    value: summary?.activeClients || 0,
    formattedValue: (summary?.activeClients || 0).toLocaleString(),
    description: 'Clients with recent activity',
    icon: <UserCheck className="h-6 w-6 text-purple-600" />,
    bgColor: 'bg-purple-50'
  },
  {
    id: 5,
    title: 'Total Brokers',
    value: summary?.totalBrokers || 0,
    formattedValue: (summary?.totalBrokers || 0).toLocaleString(),
    description: 'All registered brokers',
    icon: <Building2 className="h-6 w-6 text-orange-600" />,
    bgColor: 'bg-orange-50'
  },
  {
    id: 6,
    title: 'Active Brokers',
    value: summary?.activeBrokers || 0,
    formattedValue: (summary?.activeBrokers || 0).toLocaleString(),
    description: 'Brokers with active deals',
    icon: <Briefcase className="h-6 w-6 text-yellow-600" />,
    bgColor: 'bg-yellow-50'
  },
  {
    id: 7,
    title: 'Total Properties',
    value: summary?.totalProperties || 0,
    formattedValue: (summary?.totalProperties || 0).toLocaleString(),
    description: 'All properties in system',
    icon: <Home className="h-6 w-6 text-cyan-600" />,
    bgColor: 'bg-cyan-50'
  },
  {
    id: 8,
    title: 'Properties Sold',
    value: summary?.propertiesSold || 0,
    formattedValue: (summary?.propertiesSold || 0).toLocaleString(),
    description: 'Fully completed sales',
    icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
    bgColor: 'bg-emerald-50'
  },
];

const SalesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('Metric');
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Sales data state
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ brokers: [] });
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [dateRange, setDateRange] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });
  const [selectedBrokerId, setSelectedBrokerId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const metricDropdownRef = useRef<HTMLDivElement>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const brokerDropdownRef = useRef<HTMLDivElement>(null);
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (metricDropdownRef.current && !metricDropdownRef.current.contains(event.target as HTMLElement)) {
        setShowMetricDropdown(false);
      }
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as HTMLElement)) {
        setShowPeriodDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as HTMLElement)) {
        setShowNotification(false);
      }
      if (brokerDropdownRef.current && !brokerDropdownRef.current.contains(event.target as HTMLElement)) {
        setShowBrokerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as any);
    };
  }, []);

  // Fetch sales data with filters
  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (dateRange.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange.endDate) params.append('endDate', dateRange.endDate);
        if (selectedBrokerId) params.append('brokerId', selectedBrokerId.toString());
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        
        const response = await fetch(`/api/sales?${params.toString()}`, {
          credentials: 'include', // Include cookies with the request
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setSalesData(data.sales);
        setFilterOptions(data.filterOptions);
        setSalesSummary(data.summary);
        console.log('Sales summary data:', data.summary);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch sales data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalesData();
  }, [dateRange.startDate, dateRange.endDate, selectedBrokerId, sortBy, sortOrder, refreshTrigger]);

  // Format sales data for chart
  const formattedSalesData = salesData.map((item) => {
    const date = new Date(item.date);
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number(item.total_amount) || 0,
      transactions: Number(item.transaction_count) || 0,
      // For tooltip display
      date: item.date,
      amount: Number(item.total_amount) || 0,
    };
  }).filter(item => !isNaN(item.value)) as SaleData[];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Format amount with proper currency display
      const formatAmount = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)} K`;
        return `₹${amount.toLocaleString()}`;
      };

      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200 max-w-xs">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {new Date(data.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm font-semibold text-green-600 mb-1">
            Amount: {formatAmount(data.amount)}
          </p>
          <p className="text-sm text-gray-600">
            Transactions: {data.transactions.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Handle date filter changes
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value
    }));
  };

  // Handle period filter changes
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setShowPeriodDropdown(false);

    const now = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;

    switch (period) {
      case '1 Day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case '1 Week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case '1 Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case '6 Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case '1 Year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'All Time':
        startDate = null;
        endDate = null;
        break;
      default:
        // For custom date range, don't change the dates
        return;
    }

    setDateRange({ startDate, endDate });
  };

  // Handle sort changes
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setSelectedBrokerId(null);
    setSelectedPeriod('All Time');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Refresh data manually
  const refreshData = () => {
    // Trigger a re-fetch by updating a dependency
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navigation */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-gray-100">
              {sidebarOpen ? <ChevronLeft className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative" ref={notificationRef}>
              <button
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowNotification(!showNotification)}
              >
                <Bell className="h-5 w-5 text-gray-500" />
              </button>
              {showNotification && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <div className="py-2 px-3 bg-gray-100 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-black">Notifications</h3>
                      <button className="text-xs text-blue-500 hover:text-blue-700">Mark all as read</button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="py-2 px-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black">New sale completed</p>
                          <p className="text-xs text-gray-500">Amount: $2,500</p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2 px-3 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black">New customer registered</p>
                          <p className="text-xs text-gray-500">John Smith</p>
                          <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-2 text-center border-t border-gray-100">
                    <button className="text-sm text-blue-500 hover:text-blue-700">View all notifications</button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <Image
                src="https://source.unsplash.com/random/100x100?face=1"
                alt="User Profile"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 lg:p-6 max-w-full overflow-hidden">
          {/* Sales Header with Filters */}
          <div className="flex flex-col mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
              <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                <button 
                  onClick={() => setIsTransactionFormOpen(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Add Transaction</span>
                </button>
                <button 
                  onClick={refreshData}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Refresh</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Notifications</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <h1 className="text-xl lg:text-2xl font-bold text-black">Sales Overview</h1>
                <button className="ml-2 p-1 rounded-full hover:bg-gray-100">
                  <Info className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 flex items-center space-x-1"
                >
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span>Reset Filters</span>
                </button>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            {/* Filter row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                {/* Time Period Filter */}
                <div className="relative" ref={periodDropdownRef}>
                  <button
                    className="flex items-center space-x-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[120px] justify-between"
                    onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  >
                    <span>{selectedPeriod}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  {showPeriodDropdown && (
                    <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200">
                      <div className="py-1">
                        {['1 Day', '1 Week', '1 Month', '6 Months', '1 Year', 'All Time'].map((period) => (
                          <button
                            key={period}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                            onClick={() => handlePeriodChange(period)}
                          >
                            <span>{period}</span>
                            {selectedPeriod === period && <span className="text-blue-500">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date range filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#374151' }}>From:</span>
                    </div>
                    <input
                      type="date"
                      value={dateRange.startDate || ''}
                      onChange={(e) => {
                        handleDateChange('start', e.target.value);
                        setSelectedPeriod('Custom');
                      }}
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded w-full sm:w-auto"
                      style={{ color: '#374151' }}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#374151' }}>To:</span>
                    <input
                      type="date"
                      value={dateRange.endDate || ''}
                      onChange={(e) => {
                        handleDateChange('end', e.target.value);
                        setSelectedPeriod('Custom');
                      }}
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded w-full sm:w-auto"
                      style={{ color: '#374151' }}
                    />
                  </div>
                </div>

                {/* Broker filter */}
                <div className="relative" ref={brokerDropdownRef}>
                  <button
                    className="flex items-center space-x-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[140px] justify-between"
                    onClick={() => setShowBrokerDropdown(!showBrokerDropdown)}
                  >
                    <span className="truncate">{selectedBrokerId ? filterOptions.brokers.find(b => b.id === selectedBrokerId)?.name || 'Select Broker' : 'All Brokers'}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  </button>
                  {showBrokerDropdown && (
                    <div className="absolute z-10 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                          onClick={() => {
                            setSelectedBrokerId(null);
                            setShowBrokerDropdown(false);
                          }}
                        >
                          <span>All Brokers</span>
                          {selectedBrokerId === null && <span className="text-blue-500">✓</span>}
                        </button>

                        {filterOptions.brokers.map((broker) => (
                          <button
                            key={broker.id}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                            onClick={() => {
                              setSelectedBrokerId(broker.id);
                              setShowBrokerDropdown(false);
                            }}
                          >
                            <span className="truncate">{broker.name}</span>
                            {selectedBrokerId === broker.id && <span className="text-blue-500">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sales Trends</h2>
              <p className="text-sm text-gray-500">Daily sales performance over time</p>
            </div>
            <div className="h-[400px] w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading sales data...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full flex-col">
                  <p className="text-red-500 mb-2">Error loading sales data</p>
                  <p className="text-sm text-gray-500">{error}</p>
                </div>
              ) : formattedSalesData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No sales data available for the selected filters</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formattedSalesData}
                    margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#374151', fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#374151', fontSize: 11 }}
                      tickFormatter={(value) => {
                        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
                        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                        return `₹${value}`;
                      }}
                      domain={[0, 'auto']}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Chart information */}
            {!isLoading && !error && formattedSalesData.length === 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4 text-center">
                <p className="text-gray-500">No data available for the selected filters.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your date range or other filters.</p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {isLoading ? (
              // Loading state for stats cards
              Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm animate-pulse border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))
            ) : error ? (
              // Error state
              <div className="col-span-full bg-white p-6 rounded-lg shadow-sm border border-red-200">
                <p className="text-red-600">Error loading statistics: {error}</p>
              </div>
            ) : (
              // Data loaded successfully
              getStatsCards(salesSummary).map((card) => (
                <div key={card.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      {card.icon}
                    </div>
                    {card.isDynamic ? (
                      <div className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Filtered
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Info className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
                  <p className={`text-3xl font-bold mb-2 ${card.isMonetary ? 'text-green-600' : 'text-gray-900'}`}>
                    {card.formattedValue}
                  </p>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Sales Recommendations (Placeholder for future enhancement) */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-black mb-4">Sales Analytics Insights</h2>
            <div className="border border-blue-100 bg-blue-50 p-4 rounded-md">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Insights based on your sales data</p>
                  <p className="text-sm text-blue-600 mt-1">
                    This area can be enhanced to show AI-generated insights based on your sales patterns, 
                    allowing you to make data-driven decisions about your business.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-6">
            <RecentTransactions className="mb-6" />
          </div>
          
          {/* Transaction Form Modal */}
          <TransactionForm 
            isOpen={isTransactionFormOpen} 
            onClose={() => setIsTransactionFormOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
};

export default SalesPage;