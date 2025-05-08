'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Plus, Mail, Phone, Star, StarOff, Filter, MessageSquare } from 'lucide-react';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';

// Contact types
type ContactStatus = 'Active' | 'Inactive';
type ContactType = 'Partner Broker' | 'Agent' | 'Developer';

// Contact interface
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  type: ContactType;
  status: ContactStatus;
  location: string;
  specialty: string;
  lastContact: string;
  isFavorite: boolean;
}

export default function BrokerContacts() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'partners' | 'favorites'>('all');
  
  // Mock contacts data
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@realestate.com',
      phone: '+1 (555) 123-4567',
      image: '/auth/Agents/agent-01.jpg',
      type: 'Partner Broker',
      status: 'Active',
      location: 'New York, NY',
      specialty: 'Luxury Properties',
      lastContact: '2023-12-15',
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@properties.com',
      phone: '+1 (555) 987-6543',
      image: '/auth/Agents/agent-02.jpg',
      type: 'Agent',
      status: 'Active',
      location: 'Los Angeles, CA',
      specialty: 'Residential',
      lastContact: '2023-12-10',
      isFavorite: false,
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@homes.com',
      phone: '+1 (555) 456-7890',
      image: '/auth/Agents/agent-03.jpg',
      type: 'Partner Broker',
      status: 'Active',
      location: 'San Francisco, CA',
      specialty: 'Commercial Properties',
      lastContact: '2023-12-05',
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily.r@developers.com',
      phone: '+1 (555) 234-5678',
      image: '/auth/Agents/agent-04.jpg',
      type: 'Developer',
      status: 'Inactive',
      location: 'Miami, FL',
      specialty: 'New Developments',
      lastContact: '2023-11-20',
      isFavorite: false,
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.w@realty.com',
      phone: '+1 (555) 876-5432',
      image: '/auth/Agents/agent-05.jpg',
      type: 'Partner Broker',
      status: 'Active',
      location: 'Chicago, IL',
      specialty: 'Urban Properties',
      lastContact: '2023-12-01',
      isFavorite: true,
    },
  ];

  // Filter contacts based on active tab and search query
  const filteredContacts = mockContacts
    .filter(contact => {
      if (activeTab === 'partners') return contact.type === 'Partner Broker';
      if (activeTab === 'favorites') return contact.isFavorite;
      return true;
    })
    .filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    // In a real app, this would update the database
    console.log(`Toggle favorite for contact ${id}`);
  };

  return (
    <BrokerDashboardLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black mb-4 md:mb-0">Contacts</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              <Plus size={18} />
              <span>Add Contact</span>
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
            All Contacts
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'partners'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('partners')}
          >
            Partner Brokers
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'favorites'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16} />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Types</option>
            <option>Partner Broker</option>
            <option>Agent</option>
            <option>Developer</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white">
            <option>All Locations</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>Chicago</option>
            <option>Miami</option>
          </select>
          
          <button className="ml-auto text-sm text-indigo-600 hover:text-indigo-800">
            Clear All
          </button>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                        <Image
                          src={contact.image}
                          alt={contact.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-black">{contact.name}</h3>
                        <p className="text-sm text-gray-500">{contact.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(contact.id)}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      {contact.isFavorite ? (
                        <Star size={20} className="fill-yellow-500 text-yellow-500" />
                      ) : (
                        <StarOff size={20} />
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Mail size={16} className="text-gray-400 mr-2" />
                      <span className="text-black">{contact.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone size={16} className="text-gray-400 mr-2" />
                      <span className="text-black">{contact.phone}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <span className="text-gray-400 mr-2 mt-1">📍</span>
                      <span className="text-black">{contact.location}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Specialty</p>
                        <p className="text-sm text-black">{contact.specialty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Contact</p>
                        <p className="text-sm text-black">{contact.lastContact}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 flex justify-between">
                  <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                    <MessageSquare size={16} className="mr-1" />
                    Message
                  </button>
                  <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                    <Phone size={16} className="mr-1" />
                    Call
                  </button>
                  <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                    <Mail size={16} className="mr-1" />
                    Email
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No contacts found matching your criteria
            </div>
          )}
        </div>
      </div>
    </BrokerDashboardLayout>
  );
}