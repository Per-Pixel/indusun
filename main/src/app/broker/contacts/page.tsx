'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Plus, Mail, Phone, Star, StarOff, Filter, MessageSquare, Heart, MoreHorizontal, X } from 'lucide-react';
import BrokerDashboardLayout from '@/components/broker/BrokerDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';

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

// Contact form data interface
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  type: ContactType;
  status: ContactStatus;
  location: string;
  specialty: string;
}

export default function BrokerContacts() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'partners' | 'favorites'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    type: 'Agent',
    status: 'Active',
    location: '',
    specialty: '',
  });
  
  // Mock contacts data
  const [contacts, setContacts] = useState<Contact[]>([
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
  ]);

  // Filter contacts based on active tab and search query
  const filteredContacts = contacts
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
    setContacts(contacts.map(contact => {
      if (contact.id === id) {
        return { ...contact, isFavorite: !contact.isFavorite };
      }
      return contact;
    }));
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new contact
    const newContact: Contact = {
      id: (contacts.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      image: '/auth/Agents/agent-01.jpg', // Default image
      type: formData.type,
      status: formData.status,
      location: formData.location,
      specialty: formData.specialty,
      lastContact: new Date().toISOString().split('T')[0],
      isFavorite: false,
    };
    
    // Add to contacts list
    setContacts([...contacts, newContact]);
    
    // Close modal and reset form
    setShowAddModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'Agent',
      status: 'Active',
      location: '',
      specialty: '',
    });
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
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
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
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {contact.isFavorite ? (
                        <Star size={20} className="fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff size={20} />
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Mail size={16} className="text-gray-400 mr-2" />
                      <a href={`mailto:${contact.email}`} className="text-gray-600 hover:text-indigo-600">
                        {contact.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone size={16} className="text-gray-400 mr-2" />
                      <a href={`tel:${contact.phone}`} className="text-gray-600 hover:text-indigo-600">
                        {contact.phone}
                      </a>
                    </div>
                    <div className="flex items-start text-sm">
                      <div className="text-gray-400 mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <span className="text-gray-600">{contact.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="text-gray-400 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <span className="text-gray-600">{contact.specialty}</span>
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

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold text-black">Add New Contact</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="Partner Broker">Partner Broker</option>
                      <option value="Agent">Agent</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-white border border-gray-300 rounded-md px-4 py-2 mr-2 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                  >
                    Add Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BrokerDashboardLayout>
  );
}

