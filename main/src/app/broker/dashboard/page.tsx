'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';

// Sample data for charts
const salesData = [
  { name: 'Direct Sale', value: 425.50, color: '#36A2EB' },
  { name: 'Offline Sale', value: 135.6, color: '#FF6384' },
  { name: 'Export Sale', value: 115.0, color: '#4BC0C0' },
  { name: 'Marketing Sale', value: 105.3, color: '#9966FF' },
];

const incomeData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 550 },
  { name: 'Apr', value: 450 },
  { name: 'May', value: 650 },
  { name: 'Jun', value: 400 },
  { name: 'Jul', value: 700 },
];

// Sample data for sales report
const salesReportData = [
  { id: 1, agent: { name: 'Bessie Cooper', avatar: '/auth/Agents/agent-01.jpg' }, location: 'Lafayette, California', type: 'Sale', price: '$447,520', status: 'Paid' },
  { id: 2, agent: { name: 'Courtney Henry', avatar: '/auth/Agents/agent-02.jpg' }, location: 'Lansing, Brower', type: 'Rent', price: '$745.00', status: 'Pending' },
  { id: 3, agent: { name: 'Esther Howard', avatar: '/auth/Agents/agent-03.jpg' }, location: 'Stockton, New Hampshire', type: 'Sale', price: '$761.00', status: 'Paid' },
  { id: 4, agent: { name: 'Eleanor Pena', avatar: '/auth/Agents/agent-04.jpg' }, location: 'Corona, Michigan', type: 'Rent', price: '$430.00', status: 'Pending' },
  { id: 5, agent: { name: 'Bessie Cooper', avatar: '/auth/Agents/agent-01.jpg' }, location: 'Lafayette, California', type: 'Sale', price: '$447.00', status: 'Paid' },
  { id: 6, agent: { name: 'Courtney Henry', avatar: '/auth/Agents/agent-02.jpg' }, location: 'Lansing, Brower', type: 'Rent', price: '$745.00', status: 'Pending' },
  { id: 7, agent: { name: 'Esther Howard', avatar: '/auth/Agents/agent-03.jpg' }, location: 'Stockton, New Hampshire', type: 'Sale', price: '$761.00', status: 'Paid' },
  { id: 8, agent: { name: 'Eleanor Pena', avatar: '/auth/Agents/agent-04.jpg' }, location: 'Corona, Michigan', type: 'Rent', price: '$430.00', status: 'Pending' },
];

// Sample data for property list
const propertyListData = [
  {
    id: 1,
    image: '/auth/properties/property-1.jpg',
    title: 'Ridgewood Street - 15090Q',
    price: '$456,000',
    days: 3,
  },
  {
    id: 2,
    image: '/auth/properties/property-2.jpg',
    title: 'Main Street - 15090Q',
    price: '$243,000',
    days: 4,
  },
];

export default function BrokerDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('Monthly');
  const [selectedYear, setSelectedYear] = useState('December 2021');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'broker')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const totalSalesAmount = salesData.reduce((sum, item) => sum + item.value, 0).toFixed(2);

  return (
    <BrokerDashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center">
              <Image
                src="/auth/Agents/agent-03.jpg"
                alt="User"
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <h1 className="text-lg font-medium text-black">Good Morning Masum <span className="text-yellow-400">👋</span></h1>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Banner */}
        <div className="bg-indigo-700 text-white rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-medium mb-2">Splash yourself in</h2>
            <p className="mb-4">Big Discount on This sale.</p>
            <button className="bg-white text-indigo-700 px-4 py-2 rounded-md text-sm font-medium">
              Explore Now
            </button>
          </div>
          <div className="w-1/3">
            <Image
              src="/auth/house.png"
              alt="House"
              width={200}
              height={120}
              className="object-contain"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-600 text-white rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-purple-500 opacity-50 transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute top-1/2 right-0 w-12 h-12 rounded-full bg-purple-500 opacity-30 transform translate-x-1/3"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-medium mb-1">Total Income</h3>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold">$150k</p>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full text-black">+2.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-cyan-500 text-white rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-cyan-400 opacity-50 transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute top-1/2 right-0 w-12 h-12 rounded-full bg-cyan-400 opacity-30 transform translate-x-1/3"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-medium mb-1">Total Expense</h3>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold">$100k</p>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full text-black">-4.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-500 text-white rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-orange-400 opacity-50 transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute top-1/2 right-0 w-12 h-12 rounded-full bg-orange-400 opacity-30 transform translate-x-1/3"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-medium mb-1">Total Profit</h3>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold">$50k</p>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full text-black">+5.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Sales Analytics */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-black">Sales Analytics</h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm text-black"
              >
                <option>December 2021</option>
                <option>January 2022</option>
                <option>February 2022</option>
              </select>
            </div>

            <div className="flex">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={salesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {salesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-1/2">
                <div className="text-center mb-4">
                  <p className="text-sm text-black">Total</p>
                  <p className="text-2xl font-bold text-black">${totalSalesAmount}</p>
                </div>

                <div className="space-y-2">
                  {salesData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-black">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-black">${item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Income Statistics */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-black">Income Statistics</h2>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm text-black"
              >
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Daily</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Sales Report */}
          <div className="col-span-2 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-black">Sales Report</h2>
              <div className="flex items-center">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-black">
                    <th className="pb-3 font-medium">Sales by</th>
                    <th className="pb-3 font-medium">Property name</th>
                    <th className="pb-3 font-medium">Sales Type</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesReportData.map((sale) => (
                    <tr key={sale.id} className="text-sm text-black">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                            <Image
                              src={sale.agent.avatar}
                              alt={sale.agent.name}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                          <span className="text-black">{sale.agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-black">{sale.location}</td>
                      <td className="py-3 text-black">{sale.type}</td>
                      <td className="py-3 text-black">{sale.price}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sale.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Property List */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-black">Property List</h2>
              <button className="text-xs text-black">See All Listing</button>
            </div>

            <div className="space-y-4">
              {propertyListData.map((property) => (
                <div key={property.id} className="relative rounded-lg overflow-hidden">
                  <Image
                    src={property.image}
                    alt={property.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-md">
                    {property.days} Days ago
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-medium text-black">{property.title}</h3>
                    <p className="text-lg font-bold mt-1 text-black">{property.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
}







