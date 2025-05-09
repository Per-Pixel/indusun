'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Search, Info, ChevronDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

// Mock data for the sales chart
const salesData = [
  { name: '01 Apr', value: 80000 },
  { name: '02 Apr', value: 95000, label: '2 Apr, 2025', salesValue: '$79k' },
  { name: '03 Apr', value: 75000 },
  { name: '04 Apr', value: 85000 },
  { name: '05 Apr', value: 95000 },
  { name: '06 Apr', value: 90000 },
  { name: '07 Apr', value: 110000 },
];

// Mock data for the pie chart
const projectsData = [
  { name: 'KFC', value: 25, color: '#FF5252' },
  { name: 'Fiat Chrysler LLC', value: 20, color: '#FF9800' },
  { name: 'KLM', value: 15, color: '#2196F3' },
  { name: 'Accenture', value: 15, color: '#4CAF50' },
  { name: 'Unilever', value: 10, color: '#9C27B0' },
  { name: 'American Express', value: 10, color: '#795548' },
  { name: 'Daimler', value: 5, color: '#607D8B' },
];

// Mock data for latest customers
const latestCustomers = [
  { id: 1, name: 'Neil Sims', email: 'neil@example.com', amount: '$367' },
  { id: 2, name: 'Bonnie Green', email: 'bonnie@example.com', amount: '$67' },
  { id: 3, name: 'Michael Gough', email: 'michael@example.com', amount: '$3467' },
  { id: 4, name: 'Thomas Lean', email: 'thomas@example.com', amount: '$2367' },
  { id: 5, name: 'Lana Byrd', email: 'lana@example.com', amount: '$367' },
  { id: 6, name: 'Lana Byrd', email: 'lana@example.com', amount: '$367' },
];

// Mock data for transactions
const transactions = [
  { id: 1, transaction: 'Payment from Bonnie Green', date: 'Apr 23, 2021', amount: '$2300', status: 'Completed' },
  { id: 2, transaction: 'Payment refund to #00910', date: 'Apr 23, 2021', amount: '-$670', status: 'Completed' },
  { id: 3, transaction: 'Payment failed from #087651', date: 'Apr 18, 2021', amount: '$234', status: 'Cancelled' },
  { id: 4, transaction: 'Payment from Bonnie Green', date: 'Apr 15, 2021', amount: '$5000', status: 'In progress' },
  { id: 5, transaction: 'Payment from Jese Leos', date: 'Apr 15, 2021', amount: '$2300', status: 'In progress' },
  { id: 6, transaction: 'Payment from THEMSBERG LLC', date: 'Apr 11, 2021', amount: '$280', status: 'Completed' },
];

// Stats cards data
const statsCards = [
  { id: 1, title: '120+', description: '120 homes have been deliver to the potential customer' },
  { id: 2, title: '145+', description: '145 homes have been deliver to the potential customer' },
  { id: 3, title: '110+', description: '110 homes have been deliver to the potential customer' },
];

const SalesPage = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('Metric');
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const refreshData = () => {
    console.log('Refreshing data...');
  };

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Check if this is the special data point
      if (payload[0].payload.label) {
        return (
          <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
            <p className="text-sm text-gray-600">{payload[0].payload.label}</p>
            <p className="text-sm font-semibold text-gray-900">
              Sales: {payload[0].payload.salesValue}
            </p>
          </div>
        );
      }

      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            Sales: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
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
            <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
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
        <div className="p-6">
          {/* Sales Header */}
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
            <button className="ml-2 p-1 rounded-full hover:bg-gray-100">
              <Info className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}K`}
                    domain={[0, 'dataMax + 20000']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  />
                  {/* Add a single dot for April 2 */}
                  {salesData.map((entry, index) => {
                    if (entry.name === '02 Apr') {
                      return (
                        <svg key={index} x={0} y={0}>
                          <circle
                            cx={index * (100 / (salesData.length - 1)) + '%'}
                            cy={(1 - (entry.value - 40000) / 200000) * 100 + '%'}
                            r={6}
                            fill="#10b981"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        </svg>
                      );
                    }
                    return null;
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Customers */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Latest Customers</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {latestCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                            <Image
                              src={`https://source.unsplash.com/random/100x100?face=${customer.id}`}
                              alt={customer.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{customer.name}</h3>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">{customer.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <button
                        className="flex items-center space-x-1 bg-white border border-gray-200 rounded px-3 py-1.5 text-sm"
                        onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                      >
                        <span>{selectedMetric}</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                      {showMetricDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10">
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedMetric('Metric');
                              setShowMetricDropdown(false);
                            }}
                          >
                            Metric
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedMetric('Revenue');
                              setShowMetricDropdown(false);
                            }}
                          >
                            Revenue
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedMetric('Customers');
                              setShowMetricDropdown(false);
                            }}
                          >
                            Customers
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        className="flex items-center space-x-1 bg-white border border-gray-200 rounded px-3 py-1.5 text-sm"
                        onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                      >
                        <span>{selectedPeriod}</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                      {showPeriodDropdown && (
                        <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10">
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedPeriod('Today');
                              setShowPeriodDropdown(false);
                            }}
                          >
                            Today
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedPeriod('This Week');
                              setShowPeriodDropdown(false);
                            }}
                          >
                            This Week
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedPeriod('This Month');
                              setShowPeriodDropdown(false);
                            }}
                          >
                            This Month
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {projectsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium">
                          Projects by account
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {projectsData.map((project, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color }}></div>
                        <span>{project.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="space-y-4">
                {statsCards.map((card) => (
                  <div key={card.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                      </div>
                      <div className="text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
                <p className="text-sm text-gray-500 mt-1">This is a list of latest transactions.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 border-b border-gray-100">Transaction</th>
                      <th className="px-6 py-3 border-b border-gray-100">Date & Time</th>
                      <th className="px-6 py-3 border-b border-gray-100">Amount</th>
                      <th className="px-6 py-3 border-b border-gray-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.transaction}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'In progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;