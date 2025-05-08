'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Plus, Mail, Phone, Filter, MessageSquare, Calendar, FileText, MoreHorizontal, User } from 'lucide-react';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';

// Client types
type ClientStatus = 'Active' | 'Inactive' | 'Potential' | 'Past';
type PropertyInterest = 'Buying' | 'Selling' | 'Renting' | 'Investing';

// Client interface
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  status: ClientStatus;
  location: string;
  interests: PropertyInterest[];
  budget: string;
  lastContact: string;
  notes: string;
  properties: {
    viewed: number;
    saved: number;
    purchased: number;
  };
}

export default function BrokerClients() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'potential'>('all');
  
  // Mock clients data
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      phone: '+1 (555) 123-7890',
      image: '/auth/Agents/client-01.jpg',
      status: 'Active',
      location: 'New York, NY',
      interests: ['Buying', 'Investing'],
      budget: '$500,000 - $750,000',
      lastContact: '2023-12-18',
      notes: 'Looking for a 3-bedroom house in Brooklyn area.',
      properties: {
        viewed: 12,
        saved: 5,
        purchased: 1,
      },
    },
    {
      id: '2',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@example.com',
      phone: '+1 (555) 987-1234',
      image: '/auth/Agents/client-02.jpg',
      status: 'Potential',
      location: 'Chicago, IL',
      interests: ['Buying'],
      budget: '$300,000 - $450,000',
      lastContact: '2023-12-10',
      notes: 'First-time homebuyer looking for condos.',
      properties: {
        viewed: 8,
        saved: 3,
        purchased: 0,
      },
    },
    {
      id: '3',
      name: 'Marcus Williams',
      email: 'marcus.w@example.com',
      phone: '+1 (555) 456-7890',
      image: '/auth/Agents/client-03.jpg',
      status: 'Active',
      location: 'Los Angeles, CA',
      interests: ['Selling', 'Buying'],
      budget: '$800,000 - $1,200,000',
      lastContact: '2023-12-15',
      notes: 'Selling current home and upgrading to larger property.',
      properties: {
        viewed: 15,
        saved: 7,
        purchased: 0,
      },
    },
    {
      id: '4',
      name: 'Sophia Garcia',
      email: 'sophia.g@example.com',
      phone: '+1 (555) 234-5678',
      image: '/auth/Agents/client-04.jpg',
      status: 'Inactive',
      location: 'Miami, FL',
      interests: ['Renting'],
      budget: '$2,500 - $3,500/month',
      lastContact: '2023-11-05',
      notes: 'Looking for short-term rental, 6-month lease.',
      properties: {
        viewed: 6,
        saved: 2,
        purchased: 0,
      },
    },
    {
      id: '5',
      name: 'Daniel Kim',
      email: 'daniel.k@example.com',
      phone: '+1 (555) 876-5432',
      image: '/auth/Agents/client-05.jpg',
      status: 'Active',
      location: 'San Francisco, CA',
      interests: ['Investing'],
      budget: '$1,000,000 - $2,000,000',
      lastContact: '2023-12-12',
      notes: 'Looking for investment properties with good ROI.',
      properties: {
        viewed: 20,
        saved: 8,
        purchased: 2,
      },
    },
  ];

  // Filter clients based on active tab and search query
  const filteredClients = mockClients
    .filter(client => {
      if (activeTab === 'active') return client.status === 'Active';
      if (activeTab === 'potential') return client.status === 'Potential';
      return true;
    })
    .filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Status badge color mapping
  const getStatusColor = (status: ClientStatus) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Potential': return 'bg-blue-100 text-blue-800';
      case 'Past': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <BrokerDashboardLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Clients</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              <Plus size={18} />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Clients
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active Clients
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'potential'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('potential')}
          >
            Potential Clients
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16} />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Potential</option>
            <option>Past</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Interests</option>
            <option>Buying</option>
            <option>Selling</option>
            <option>Renting</option>
            <option>Investing</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Locations</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>Chicago</option>
            <option>Miami</option>
            <option>San Francisco</option>
          </select>
          
          <button className="ml-auto text-sm text-indigo-600 hover:text-indigo-800">
            Clear All
          </button>
        </div>

        {/* Clients List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interests
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                            {client.image ? (
                              <Image
                                src={client.image}
                                alt={client.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded-full">
                                <User size={20} className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {client.interests.map((interest, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {client.budget}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          <span className="font-medium">{client.properties.viewed}</span> Viewed
                        </div>
                        <div className="text-sm text-black">
                          <span className="font-medium">{client.properties.purchased}</span> Purchased
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {client.lastContact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button className="text-indigo-600 hover:text-indigo-900" title="Message">
                            <MessageSquare size={16} />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900" title="Schedule Meeting">
                            <Calendar size={16} />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900" title="View Notes">
                            <FileText size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600" title="More Options">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Details Section (could be expanded in a modal or separate page) */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-black mb-4">Recent Client Activity</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={mockClients[0].image || '/auth/Agents/client-01.jpg'}
                    alt="Client"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-black">
                    <span className="font-medium">{mockClients[0].name}</span> viewed 3 new properties in Brooklyn
                  </p>
                  <p className="text-xs text-gray-500">Today, 10:45 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={mockClients[2].image || '/auth/Agents/client-03.jpg'}
                    alt="Client"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-black">
                    <span className="font-medium">{mockClients[2].name}</span> scheduled a property viewing for tomorrow
                  </p>
                  <p className="text-xs text-gray-500">Yesterday, 3:20 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={mockClients[4].image || '/auth/Agents/client-05.jpg'}
                    alt="Client"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-black">
                    <span className="font-medium">{mockClients[4].name}</span> made an offer on 123 Investment Property
                  </p>
                  <p className="text-xs text-gray-500">Dec 18, 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
}