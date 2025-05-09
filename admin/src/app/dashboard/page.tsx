'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Search, Sun, RotateCcw, Bell, Menu, Star, ChevronDown, 
  ArrowUp, ArrowDown, User, Calendar, MessageSquare, Settings, Info, AlertCircle, CheckCircle
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

// Add proper types for the StatsCard component
interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

// Add proper types for the TopNavigation component
interface TopNavigationProps {
  toggleSidebar: () => void;
  refreshData: () => void;
  sidebarOpen: boolean;
}

// Add proper types for the Sidebar component
interface SidebarProps {
  isOpen: boolean;
}

// Mock data
const userChartData = [
  { name: 'Jan', thisYear: 20, lastYear: 10 },
  { name: 'Feb', thisYear: 15, lastYear: 12 },
  { name: 'Mar', thisYear: 25, lastYear: 18 },
  { name: 'Apr', thisYear: 18, lastYear: 20 },
  { name: 'May', thisYear: 30, lastYear: 15 },
  { name: 'Jun', thisYear: 25, lastYear: 10 },
  { name: 'Jul', thisYear: 28, lastYear: 20 }
];

const deviceTrafficData = [
  { name: 'Linux', value: 15 },
  { name: 'Mac', value: 25 },
  { name: 'iOS', value: 20 },
  { name: 'Windows', value: 30 },
  { name: 'Android', value: 10 },
  { name: 'Other', value: 5 }
];

const locationData = [
  { name: 'United States', value: 38.6, color: 'var(--primary)' },
  { name: 'Canada', value: 22.5, color: 'var(--success)' },
  { name: 'Mexico', value: 30.8, color: 'var(--primary-light)' },
  { name: 'Other', value: 8.1, color: 'var(--gray-medium)' }
];

const websiteTrafficData = [
  { name: 'Google', value: 40 },
  { name: 'YouTube', value: 30 },
  { name: 'Instagram', value: 80 },
  { name: 'Pinterest', value: 35 },
  { name: 'Facebook', value: 45 },
  { name: 'Twitter', value: 20 },
  { name: 'Tumblr', value: 15 }
];

const marketingData = Array(12).fill(0).map((_, i) => ({
  name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  value: Math.floor(Math.random() * 30) + 10
}));

// Add these mock datasets for different tabs
const mockChartData = {
  'Total Users': [
    { name: 'Jan', thisYear: 20, lastYear: 10 },
    { name: 'Feb', thisYear: 15, lastYear: 12 },
    { name: 'Mar', thisYear: 25, lastYear: 18 },
    { name: 'Apr', thisYear: 18, lastYear: 20 },
    { name: 'May', thisYear: 30, lastYear: 15 },
    { name: 'Jun', thisYear: 25, lastYear: 10 },
    { name: 'Jul', thisYear: 28, lastYear: 20 }
  ],
  'Total Projects': [
    { name: 'Jan', thisYear: 35, lastYear: 22 },
    { name: 'Feb', thisYear: 28, lastYear: 25 },
    { name: 'Mar', thisYear: 42, lastYear: 30 },
    { name: 'Apr', thisYear: 37, lastYear: 35 },
    { name: 'May', thisYear: 50, lastYear: 40 },
    { name: 'Jun', thisYear: 45, lastYear: 38 },
    { name: 'Jul', thisYear: 55, lastYear: 45 }
  ],
  'Operation Status': [
    { name: 'Jan', thisYear: 90, lastYear: 85 },
    { name: 'Feb', thisYear: 88, lastYear: 80 },
    { name: 'Mar', thisYear: 95, lastYear: 90 },
    { name: 'Apr', thisYear: 92, lastYear: 88 },
    { name: 'May', thisYear: 97, lastYear: 92 },
    { name: 'Jun', thisYear: 94, lastYear: 90 },
    { name: 'Jul', thisYear: 98, lastYear: 95 }
  ]
};

// Add these axis labels for different tabs
const axisLabels = {
  'Total Users': { yAxis: 'Users (thousands)', tooltip: 'K users' },
  'Total Projects': { yAxis: 'Projects', tooltip: 'projects' },
  'Operation Status': { yAxis: 'Uptime (%)', tooltip: '%' }
};

// Activity and contacts data
const activities = [
  { user: { name: 'User 1', avatar: 'https://source.unsplash.com/random/100x100?face=1' }, action: 'Changed the style.', time: 'Just now' },
  { user: { name: 'User 2', avatar: 'https://source.unsplash.com/random/100x100?face=2' }, action: 'Released a new version.', time: '37 minutes ago' },
  { user: { name: 'User 3', avatar: 'https://source.unsplash.com/random/100x100?face=3' }, action: 'Submitted a bug.', time: '12 hours ago' },
  { user: { name: 'User 4', avatar: 'https://source.unsplash.com/random/100x100?face=4' }, action: 'Modified A data in Page X.', time: 'Today, 11:59 AM' },
  { user: { name: 'User 5', avatar: 'https://source.unsplash.com/random/100x100?face=5' }, action: 'Deleted a page in Project X.', time: 'Feb 2, 2024' }
];

const notifications = [
  { title: 'New user registered', message: 'John Doe just signed up', time: '2 min ago', type: 'info' },
  { title: 'Server error', message: 'Mail server not responding', time: '1 hour ago', type: 'error' },
  { title: 'New order received', message: 'You got a new order for $250', time: '3 hours ago', type: 'success' },
  { title: 'Database backup', message: 'Database backup completed', time: 'Yesterday', type: 'info' },
  { title: 'New comment', message: 'Someone commented on your post', time: '2 days ago', type: 'info' }
];

const contacts = [
  { name: 'Natali Craig', avatar: 'https://source.unsplash.com/random/100x100?face=6' },
  { name: 'Drew Cono', avatar: 'https://source.unsplash.com/random/100x100?face=7' },
  { name: 'Andi Lane', avatar: 'https://source.unsplash.com/random/100x100?face=8' },
  { name: 'Koray Okumus', avatar: 'https://source.unsplash.com/random/100x100?face=9' },
  { name: 'Kate Morrison', avatar: 'https://source.unsplash.com/random/100x100?face=10' },
  { name: 'Melody Macy', avatar: 'https://source.unsplash.com/random/100x100?face=11' }
];

// Add CSS animations
const cssAnimations = `
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
`;

// Stats Card Component
const StatsCard = ({ title, value, change, isPositive }: StatsCardProps) => {
  return (
    <div className="dashboard-card p-6" style={{ backgroundColor: "#e3f5ff" }}>
      <h3 className="text-sm text-gray-500 mb-2">{title}</h3>
      <div className="flex justify-between items-center">
        <p className="text-xl font-semibold text-black">{value}</p>
        <div className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>
    </div>
  );
};

// Top Navigation Component
const TopNavigation = ({ toggleSidebar, refreshData, sidebarOpen }: TopNavigationProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Sample notification data
  const notificationItems = [
    { title: 'Your task is placed', subtitle: 'waiting for processing', time: '25 minutes ago', icon: 'info' },
    { title: 'You have new message', subtitle: '3 unread', time: '1 hour ago', icon: 'message' },
    { title: 'New item created', subtitle: '#XF-2356', time: '2 hours ago', icon: 'item' }
  ];
  
  // Handle refresh with animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    
    // Reset animation after it completes
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
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ backgroundColor: "#ffffff", color: "#000000" }}
          />
        </div>
        <button className="p-1.5 rounded-md hover:bg-gray-100">
          <Sun className="h-5 w-5 text-gray-500" />
        </button>
        <button 
          className="p-1.5 rounded-md hover:bg-gray-100"
          onClick={handleRefresh}
        >
          <RotateCcw className={`h-5 w-5 text-gray-500 ${isRefreshing ? 'rotate-animation' : ''}`} />
        </button>
        <div className="relative" ref={notificationRef}>
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-black">Notification</h3>
                <p className="text-xs text-gray-500">You have 3 unread messages</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notificationItems.map((item, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="mr-3 bg-blue-100 rounded-full p-2">
                        {item.icon === 'info' && <Info size={16} className="text-blue-600" />}
                        {item.icon === 'message' && <MessageSquare size={16} className="text-blue-600" />}
                        {item.icon === 'item' && <AlertCircle size={16} className="text-blue-600" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-black">{item.title}</h4>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-100">
                <button className="text-sm text-blue-600 font-medium">View All Notifications</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'Total Users' | 'Total Projects' | 'Operation Status'>('Total Users');
  const [activeRightTab, setActiveRightTab] = useState('notifications');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    userChartData: mockChartData['Total Users'],
    deviceTrafficData,
    locationData,
    websiteTrafficData,
    marketingData
  });
  const [selectedDateRange, setSelectedDateRange] = useState('Today');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  
  const dateRangeOptions = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last Month',
    'Last 3 Months',
    'Last 365 Days',
    'Last Year'
  ];
  
  // Handle tab change with proper typing
  const handleTabChange = (tab: 'Total Users' | 'Total Projects' | 'Operation Status') => {
    setActiveTab(tab);
    
    // Update chart data based on selected tab
    setDashboardData(prevData => ({
      ...prevData,
      userChartData: mockChartData[tab].map(item => ({
        ...item,
        thisYear: item.thisYear * (0.9 + Math.random() * 0.2), // Add slight randomness
        lastYear: item.lastYear * (0.9 + Math.random() * 0.2)
      }))
    }));
  };
  
  // Close date dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Function to handle date range selection
  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    setShowDateDropdown(false);
    
    // In a real app, you would fetch data for the selected date range here
    console.log(`Date range changed to: ${range}`);
    
    // For demo purposes, let's refresh the data
    refreshData();
  };
  
  // Function to refresh data
  const refreshData = () => {
    // Set loading state
    setIsLoading(true);
    setAnimateContent(false);
    
    // Simulate API call
    setTimeout(() => {
      // Create updated data with random variations
      const updatedData = {
        userChartData: mockChartData[activeTab as keyof typeof mockChartData].map(item => ({
          ...item,
          thisYear: item.thisYear * (0.9 + Math.random() * 0.2),
          lastYear: item.lastYear * (0.9 + Math.random() * 0.2)
        })),
        deviceTrafficData: deviceTrafficData.map(item => ({
          ...item,
          value: item.value * (0.9 + Math.random() * 0.2)
        })),
        locationData,
        websiteTrafficData,
        marketingData
      };
      
      // Update the state with new data
      setDashboardData(updatedData);
      
      // Turn off loading state
      setIsLoading(false);
      
      // Trigger animations after a short delay
      setTimeout(() => {
        setAnimateContent(true);
      }, 100);
    }, 1000); // Simulate network delay
  };
  
  // Format tooltip value based on active tab
  const formatTooltipValue = (value: number) => {
    const label = axisLabels[activeTab as keyof typeof axisLabels].tooltip;
    return `${Math.round(value)} ${label}`;
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <style>{cssAnimations}</style>
      
      <Sidebar 
        isOpen={sidebarOpen} 
        closeSidebar={() => setSidebarOpen(false)} 
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <TopNavigation 
          toggleSidebar={toggleSidebar} 
          refreshData={refreshData}
          sidebarOpen={sidebarOpen}
        />
        
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <RotateCcw className="h-10 w-10 text-blue-500 animate-spin mb-2" />
              <p className="text-blue-500 font-medium">Refreshing dashboard data...</p>
            </div>
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
                    {dateRangeOptions.map((range) => (
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
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard title="Views" value="721K" change="+11.02%" isPositive={true} />
              <StatsCard title="Visits" value="367K" change="-0.03%" isPositive={false} />
              <StatsCard title="New Users" value="1,156" change="+15.03%" isPositive={true} />
              <StatsCard title="Active Users" value="239K" change="+6.08%" isPositive={true} />
            </div>
            
            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* User Growth Chart - 2 columns */}
              <div className="dashboard-card p-4 lg:col-span-2" style={{ backgroundColor: "#ffffff" }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-4">
                    <button 
                      className={`px-3 py-1 rounded-md ${activeTab === 'Total Users' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                      onClick={() => handleTabChange('Total Users')}
                    >
                      Total Users
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md ${activeTab === 'Total Projects' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                      onClick={() => handleTabChange('Total Projects')}
                    >
                      Total Projects
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md ${activeTab === 'Operation Status' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                      onClick={() => handleTabChange('Operation Status')}
                    >
                      Operation Status
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                      <span>This Year</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                      <span>Last Year</span>
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData.userChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis 
                        label={{ 
                          value: axisLabels[activeTab].yAxis, 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }} 
                      />
                      <Tooltip 
                        formatter={(value) => formatTooltipValue(value)}
                        labelFormatter={(label) => `Month: ${label}`}
                        cursor={{ stroke: '#ddd', strokeWidth: 1, strokeDasharray: '5 5' }}
                        isAnimationActive={true}
                        animationDuration={300}
                      />
                      <Line
                        type="monotone"
                        dataKey="thisYear"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1000}
                      />
                      <Line
                        type="monotone"
                        dataKey="lastYear"
                        stroke="#d1d5db"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: '#d1d5db', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Traffic by Website */}
              <div className="dashboard-card p-4" style={{ backgroundColor: "#ffffff" }}>
                <h2 className="text-lg font-medium mb-4 text-black">Traffic by Website</h2>
                <div className="space-y-4">
                  {websiteTrafficData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <span className="w-24 text-sm text-gray-500">{item.name}</span>
                      <div className="flex-1 mx-2">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${item.value}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-black">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Traffic by Device */}
              <div className="dashboard-card p-4" style={{ backgroundColor: "#ffffff" }}>
                <h2 className="text-lg font-medium mb-4 text-black">Traffic by Device</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deviceTrafficData} layout="vertical" barSize={20} style={{ backgroundColor: "#ffffff" }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#000000" }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#000000" }}
                    />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: '1px solid #e5e7eb', color: "#000000" }} />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6" 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Traffic by Location */}
              <div className="dashboard-card p-4" style={{ backgroundColor: "#ffffff" }}>
                <h2 className="text-lg font-medium mb-4 text-black">Traffic by Location</h2>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart style={{ backgroundColor: "#ffffff" }}>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: '1px solid #e5e7eb', color: "#000000" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="ml-4">
                    {locationData.map((item) => (
                      <div key={item.name} className="flex items-center mb-2">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className="ml-2 text-sm font-medium text-black">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Marketing & SEO */}
            <div className="dashboard-card p-4 mb-6" style={{ backgroundColor: "#ffffff" }}>
              <h2 className="text-lg font-medium mb-4 text-black">Marketing & SEO</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketingData} barSize={20} style={{ backgroundColor: "#ffffff" }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#000000" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#000000" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: '1px solid #e5e7eb', color: "#000000" }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Right Sidebar for Notifications and Activity */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200">
            {/* Notifications Section */}
            <div className="border-b border-gray-200">
              <h3 className="p-4 font-medium text-black">Notifications</h3>
              <div className="p-4 pt-0 space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="p-3 border-b border-gray-100 last:border-b-0 shadow-sm">
                    <div className="flex items-start">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        notification.type === 'info' ? 'bg-blue-100 text-blue-600' : 
                        notification.type === 'error' ? 'bg-red-100 text-red-600' : 
                        'bg-green-100 text-green-600'
                      }`}>
                        {notification.type === 'info' ? <Info size={16} /> : 
                         notification.type === 'error' ? <AlertCircle size={16} /> : 
                         <CheckCircle size={16} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-black">{notification.title}</h4>
                        <p className="text-xs text-black mt-1">{notification.message}</p>
                        <p className="text-xs text-black">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Activities Section */}
            <div>
              <h3 className="p-4 font-medium text-black">Activities</h3>
              <div className="p-4 pt-0 space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 border-b border-gray-100 last:border-b-0 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                      <img src={activity.user.avatar} alt={activity.user.name} className="object-cover h-full w-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{activity.user.name}</p>
                      <p className="text-xs text-black">{activity.action}</p>
                      <p className="text-xs text-black">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contacts Section */}
            <div className="border-t border-gray-200">
              <h3 className="p-4 font-medium text-black">Contacts</h3>
              <div className="p-4 pt-0 space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                      <img src={contact.avatar} alt={contact.name} className="object-cover h-full w-full" />
                    </div>
                    <p className="text-sm font-medium text-black">{contact.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





