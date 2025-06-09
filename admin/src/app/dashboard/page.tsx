'use client';
// This file is part of the admin dashboard for a real estate management system.
// It includes various charts and statistics related to client engagement, traffic, and notifications.
// The code uses React, Recharts for charting, and Heroicons for icons.
// The dashboard displays data such as total clients, plots, new clients, active brokers,
// website visits, lead conversion, plot enquiries, and top clients.

import { 
  RotateCcw, Calendar, ChevronDown, ArrowUp, ArrowDown, 
  Menu, Bell, Search, Sun, Info, MessageSquare, AlertCircle, User, Star
} from 'lucide-react';

import React, { useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps
} from 'recharts';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/dashboard/Sidebar';

interface ChartDataItem {
  name: string;
  value: number;
}

interface EngagementData {
  websiteVisits: { month: string; thisMonth: number; lastMonth: number; }[];
  leadConversion: { month: string; converted: number; total: number; }[];
  plotEnquiries: { month: string; enquiries: number; responses: number; }[];
}

interface DashboardData {
  stats: {
    totalClients: number;
    totalPlots: number;
    newClients: number;
    activeBrokers: number;
  };
  trafficByDevice: ChartDataItem[];
  trafficByLocation: ChartDataItem[];
  websiteTraffic?: ChartDataItem[];
  marketingData?: ChartDataItem[];
  engagement: EngagementData;
  topClients: {
    name: string;
    phone: string;
    value: number;
    plots: number;
  }[];
  notifications: {
    title: string;
    message: string;
    time: string;
    type: string;
  }[];
}

interface NotificationItem {
  id?: string;
  type: string;
  message: string;
  time: string;
  title?: string;
}

// Chart components
const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    case 'warning':
      return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
    case 'error':
      return <XCircleIcon className="w-6 h-6 text-red-500" />;
    default:
      return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
  }
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow">
        <p className="text-sm text-gray-600">{`${label}`}</p>
        <div>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const EngagementChart: React.FC<{
  data: EngagementData;
  selectedTab: 'websiteVisits' | 'leadConversion' | 'plotEnquiries';
}> = ({ data, selectedTab }) => {
  const chartData = data[selectedTab];
  let lines: { key: string; color: string }[] = [];

  switch (selectedTab) {
    case 'websiteVisits':
      lines = [
        { key: 'thisMonth', color: '#3b82f6' },
        { key: 'lastMonth', color: '#93c5fd' }
      ];
      break;
    case 'leadConversion':
      lines = [
        { key: 'converted', color: '#10b981' },
        { key: 'total', color: '#6ee7b7' }
      ];
      break;
    case 'plotEnquiries':
      lines = [
        { key: 'enquiries', color: '#f59e0b' },
        { key: 'responses', color: '#fcd34d' }
      ];
      break;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        {lines.map(({ key, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Component props interfaces
interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

interface TopNavigationProps {
  toggleSidebar: () => void;
  refreshData: () => void;
  sidebarOpen: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

interface NotificationItem {
  id?: string;
  type: string;
  message: string;
  time: string;
  title?: string;
}

// Only keep necessary constants
const dateRangeOptions = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'];

const cssAnimations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .dashboard-card {
    animation: fadeIn 0.5s ease-in-out;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .rotate-animation {
    animation: rotate 1s linear;
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeInUp 0.5s ease-out forwards;
  }
`;

// No mock data needed as we're using real data from PostgreSQL

// CSS animations are defined above

// Stats Card Component
const StatsCard = ({ title, value, change, isPositive }: StatsCardProps) => {
  return (
    <div className="dashboard-card p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <div className="flex items-center mt-2">
        {isPositive ? (
          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
};

// Top Navigation Component
const TopNavigation = ({ toggleSidebar, refreshData, sidebarOpen }: TopNavigationProps): JSX.Element => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle refresh with animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200" style={{ backgroundColor: "#ffffff" }}>
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-500" />
        </button>
        <Star className="h-5 w-5 text-gray-500" />
        <span className="text-gray-500">Dashboards</span>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-black">Default</span>
      </div>
      {/* Add other elements of the navigation bar here */}
    </div>
  );
};


interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

interface TopNavigationProps {
  toggleSidebar: () => void;
  refreshData: () => void;
  sidebarOpen: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50';
    case 'warning':
      return 'bg-yellow-50';
    case 'error':
      return 'bg-red-50';
    case 'info':
      return 'bg-blue-50';
    default:
      return 'bg-gray-50';
  }
};

const DashboardPage = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<'websiteVisits' | 'leadConversion' | 'plotEnquiries'>('websiteVisits');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState('Today');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before new fetch
      const response = await fetch(`/api/dashboard?range=${encodeURIComponent(selectedDateRange)}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab: 'websiteVisits' | 'leadConversion' | 'plotEnquiries') => {
    setActiveTab(tab);
  };

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    setShowDateDropdown(false);
    fetchDashboardData();
  };

  const refreshData = () => {
    setLoading(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <style>
        {`
          .dashboard-card {
            animation: fadeIn 0.5s ease-in-out;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rotate-animation {
            animation: rotate 1s linear;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>

      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <TopNavigation toggleSidebar={toggleSidebar} refreshData={refreshData} sidebarOpen={sidebarOpen} />

        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <RotateCcw className="h-10 w-10 text-blue-500 animate-spin mb-2" />
              <p className="text-blue-500 font-medium">Refreshing dashboard data...</p>
            </div>
          </div>
        )}
        
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6 mx-6 mt-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-4 lg:p-6">
            {/* Date Filter */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative" ref={dateDropdownRef}>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md flex items-center space-x-2 hover:bg-gray-50"
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                >
                  <Calendar size={16} className="text-gray-500 mr-2" />
                  <span>{selectedDateRange}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDateDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Date Range Dropdown */}
                {showDateDropdown && (
                  <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
                    {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'].map((range) => (
                      <button
                        key={range}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedDateRange === range
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleDateRangeChange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total Clients"
                value={loading ? "Loading..." : data?.stats.totalClients?.toLocaleString() || "5123"}
                change="+11.02%"
                isPositive={true}
              />
              <StatsCard
                title="Total Plots"
                value={loading ? "Loading..." : data?.stats.totalPlots?.toLocaleString() || "6985"}
                change="+3.87%"
                isPositive={true}
              />
              <StatsCard
                title="New Clients (30d)"
                value={loading ? "Loading..." : data?.stats.newClients?.toLocaleString() || "156"}
                change="+15.03%"
                isPositive={true}
              />
              <StatsCard
                title="Active Brokers"
                value={loading ? "Loading..." : data?.stats.activeBrokers?.toLocaleString() || "327"}
                change="+2.5%"
                isPositive={true}
              />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Website Visits Chart - 2 columns */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Website Traffic</h3>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'websiteVisits' as const, label: 'Website Visits' },
                      { id: 'leadConversion' as const, label: 'Lead Conversion' },
                      { id: 'plotEnquiries' as const, label: 'Plot Enquiries' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={`px-3 py-1 rounded ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                        onClick={() => handleTabChange(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'websiteVisits' && (
                      <LineChart data={data?.engagement.websiteVisits || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#000000" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#000000" }}
                        />
                        <Tooltip
                          formatter={(value) => `${value} visits`}
                          labelFormatter={(label) => `Month: ${label}`}
                          cursor={{ stroke: '#ddd', strokeWidth: 1, strokeDasharray: '5 5' }}
                          contentStyle={{ backgroundColor: "#ffffff", border: '1px solid #e5e7eb', color: "#000000" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="thisMonth"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          name="This Month"
                        />
                        <Line
                          type="monotone"
                          dataKey="lastMonth"
                          stroke="#93c5fd"
                          strokeWidth={2}
                          dot={{ fill: '#93c5fd', r: 4 }}
                          name="Last Month"
                        />
                      </LineChart>
                    )}
                    {activeTab === 'leadConversion' && (
                      <LineChart data={data?.engagement.leadConversion || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#000000" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#000000" }}
                        />
                        <Tooltip
                          formatter={(value, name) => `${value} ${name === 'converted' ? 'converted' : 'total'}`}
                          labelFormatter={(label) => `Month: ${label}`}
                          cursor={{ stroke: '#ddd', strokeWidth: 1, strokeDasharray: '5 5' }}
                          contentStyle={{ backgroundColor: "#ffffff", border: '1px solid #e5e7eb', color: "#000000" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="converted"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 4 }}
                          name="Converted"
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#6ee7b7"
                          strokeWidth={2}
                          dot={{ fill: '#6ee7b7', r: 4 }}
                          name="Total"
                        />
                      </LineChart>
                    )}
                    {activeTab === 'plotEnquiries' && (
                      <LineChart data={data?.engagement.plotEnquiries || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#000000" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#000000" }}
                        />
                        <Tooltip
                          formatter={(value, name) => `${value} ${name}`}
                          labelFormatter={(label) => `Month: ${label}`}
                          cursor={{ stroke: '#ddd', strokeWidth: 1, strokeDasharray: '5 5' }}
                          contentStyle={{ backgroundColor: "#ffffff", border: '1px solid #e5e7eb', color: "#000000" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="enquiries"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', r: 4 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Traffic by Device */}
              <div className="dashboard-card p-4" style={{ backgroundColor: "#ffffff" }}>
                <h2 className="text-lg font-medium mb-4 text-black">Traffic by Device</h2>
                <div style={{ width: '100%', height: '300px' }}>
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading...</p>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : data?.trafficByDevice ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.trafficByDevice || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data?.trafficByDevice?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>No data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Traffic by Location */}
              <div className="dashboard-card p-4" style={{ backgroundColor: "#ffffff" }}>
                <h2 className="text-lg font-medium mb-4 text-black">Traffic by Location</h2>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <p>Loading...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : data?.trafficByLocation ? (
                  <div className="flex flex-col space-y-4">
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {data?.trafficByLocation?.map((entry, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-xs">{entry.name}: {entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p>No data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Clients */}
            <div className="dashboard-card p-4 mb-6" style={{ backgroundColor: "#ffffff" }}>
              <h2 className="text-lg font-medium mb-4 text-black">Top Clients</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plots</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.topClients.map((client, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm">{client.name}</td>
                        <td className="px-4 py-3 text-sm">{client.phone}</td>
                        <td className="px-4 py-3 text-sm">{formatCurrency(client.value)}</td>
                        <td className="px-4 py-3 text-sm">{formatNumber(client.plots)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notifications */}
            <div className="dashboard-card p-4 mb-6" style={{ backgroundColor: "#ffffff" }}>
              <h2 className="text-lg font-medium mb-4 text-black">Notifications</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 mb-2 rounded-md ${getNotificationBgColor(notification.type)}`}
                  >
                    <div className="flex items-start">
                      <NotificationIcon type={notification.type} />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!data?.notifications || data.notifications.length === 0) && (
                  <div>
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
