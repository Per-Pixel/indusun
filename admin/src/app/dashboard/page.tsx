'use client';

import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Search, Sun, RotateCcw, Bell, Menu, Star, ChevronDown, 
  ArrowUp, ArrowDown, User, Calendar, MessageSquare, Settings, Info, AlertCircle, CheckCircle
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

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

// Activity and contacts data
const activities = [
  { user: { name: 'User 1', avatar: '/avatars/1.png' }, action: 'Changed the style.', time: 'Just now' },
  { user: { name: 'User 2', avatar: '/avatars/2.png' }, action: 'Released a new version.', time: '37 minutes ago' },
  { user: { name: 'User 3', avatar: '/avatars/3.png' }, action: 'Submitted a bug.', time: '12 hours ago' },
  { user: { name: 'User 4', avatar: '/avatars/4.png' }, action: 'Modified A data in Page X.', time: 'Today, 11:59 AM' },
  { user: { name: 'User 5', avatar: '/avatars/5.png' }, action: 'Deleted a page in Project X.', time: 'Feb 2, 2024' }
];

const notifications = [
  { title: 'New user registered', message: 'John Doe just signed up', time: '2 min ago', type: 'info' },
  { title: 'Server error', message: 'Mail server not responding', time: '1 hour ago', type: 'error' },
  { title: 'New order received', message: 'You got a new order for $250', time: '3 hours ago', type: 'success' },
  { title: 'Database backup', message: 'Database backup completed', time: 'Yesterday', type: 'info' },
  { title: 'New comment', message: 'Someone commented on your post', time: '2 days ago', type: 'info' }
];

const contacts = [
  { name: 'Natali Craig', avatar: '/avatars/1.png' },
  { name: 'Drew Cono', avatar: '/avatars/2.png' },
  { name: 'Andi Lane', avatar: '/avatars/3.png' },
  { name: 'Koray Okumus', avatar: '/avatars/4.png' },
  { name: 'Kate Morrison', avatar: '/avatars/5.png' },
  { name: 'Melody Macy', avatar: '/avatars/6.png' }
];

// Stats Card Component
const StatsCard = ({ title, value, change, isPositive }) => {
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Total Users');
  const [activeRightTab, setActiveRightTab] = useState('notifications');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {sidebarOpen && <Sidebar />}
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`} style={{ backgroundColor: "#ffffff" }}>
        {/* Top Navigation */}
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
            <button className="p-1.5 rounded-md hover:bg-gray-100">
              <RotateCcw className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Main Content with Right Sidebar */}
        <div className="flex" style={{ backgroundColor: "#ffffff" }}>
          {/* Main Dashboard Content */}
          <div className="flex-1 p-6" style={{ backgroundColor: "#ffffff" }}>
            {/* Date Filter */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <button className="px-4 py-2 border border-gray-300 rounded-md flex items-center space-x-2" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
                  <span>Today</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                      onClick={() => setActiveTab('Total Users')}
                    >
                      Total Users
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md ${activeTab === 'Total Projects' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('Total Projects')}
                    >
                      Total Projects
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md ${activeTab === 'Operating Status' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('Operating Status')}
                    >
                      Operating Status
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-xs text-gray-500">This year</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-400 mr-1"></div>
                      <span className="text-xs text-gray-500">Last year</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userChartData} style={{ backgroundColor: "#ffffff" }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#000000" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#000000" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: '1px solid #e5e7eb', color: "#000000" }} />
                    <Line 
                      type="monotone" 
                      dataKey="thisYear" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={false} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lastYear" 
                      stroke="#9ca3af" 
                      strokeWidth={3} 
                      dot={false} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
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
          <div className="w-80 border-l border-gray-200" style={{ backgroundColor: "#ffffff" }}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                className={`flex-1 py-4 text-center font-medium ${activeRightTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveRightTab('notifications')}
              >
                Notifications
              </button>
              <button 
                className={`flex-1 py-4 text-center font-medium ${activeRightTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveRightTab('activity')}
              >
                Activity
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-4">
              {activeRightTab === 'notifications' && (
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
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
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeRightTab === 'activity' && (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src={activity.user.avatar} alt={activity.user.name} className="object-cover h-full w-full" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.user.name}</p>
                        <p className="text-xs text-gray-500">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










