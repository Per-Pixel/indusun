'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserList, { User } from '@/components/users/UserList';
import UserForm from '@/components/users/UserForm';
import { toast } from 'react-hot-toast';

// Mock data for brokers
const mockBrokers: User[] = [
  {
    id: '1',
    name: 'Arshir Patel',
    email: 'arshir.p@indusun.com',
    phone: '+91 98765 43210',
    role: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-03.jpg',
    location: 'Mumbai, India',
    lastActive: '2023-12-20',
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.s@indusun.com',
    phone: '+91 87654 32109',
    role: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-02.jpg',
    location: 'Delhi, India',
    lastActive: '2023-12-19',
    createdAt: '2023-07-22',
  },
  {
    id: '3',
    name: 'Rahul Verma',
    email: 'rahul.v@indusun.com',
    phone: '+91 76543 21098',
    role: 'broker',
    status: 'inactive',
    image: '/auth/Agents/agent-01.jpg',
    location: 'Bangalore, India',
    lastActive: '2023-11-30',
    createdAt: '2023-05-10',
  },
  {
    id: '4',
    name: 'Ananya Desai',
    email: 'ananya.d@indusun.com',
    phone: '+91 65432 10987',
    role: 'broker',
    status: 'pending',
    image: '/auth/Agents/agent-04.jpg',
    location: 'Pune, India',
    lastActive: '2023-12-15',
    createdAt: '2023-11-05',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.s@indusun.com',
    phone: '+91 54321 09876',
    role: 'broker',
    status: 'active',
    image: '/auth/Agents/agent-05.jpg',
    location: 'Chennai, India',
    lastActive: '2023-12-18',
    createdAt: '2023-08-30',
  },
];

export default function BrokersPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [brokers, setBrokers] = useState<User[]>(mockBrokers);
  const [showForm, setShowForm] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddNew = () => {
    setSelectedBroker(undefined);
    setShowForm(true);
  };

  const handleEdit = (broker: User) => {
    setSelectedBroker(broker);
    setShowForm(true);
  };

  const handleDelete = (broker: User) => {
    if (window.confirm(`Are you sure you want to delete ${broker.name}?`)) {
      // In a real app, you would call an API to delete the broker
      setBrokers(prevBrokers => prevBrokers.filter(b => b.id !== broker.id));
      toast.success(`${broker.name} has been deleted`);
    }
  };

  const handleFormSubmit = (brokerData: Partial<User>) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedBroker) {
        // Update existing broker
        setBrokers(prevBrokers =>
          prevBrokers.map(broker =>
            broker.id === selectedBroker.id ? { ...broker, ...brokerData } : broker
          )
        );
        toast.success(`${brokerData.name} has been updated`);
      } else {
        // Add new broker
        const newBroker: User = {
          id: Date.now().toString(),
          name: brokerData.name || '',
          email: brokerData.email || '',
          phone: brokerData.phone || '',
          role: 'broker',
          status: brokerData.status as 'active' | 'inactive' | 'pending',
          image: brokerData.image,
          location: brokerData.location,
          createdAt: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
        };
        
        setBrokers(prevBrokers => [...prevBrokers, newBroker]);
        toast.success(`${newBroker.name} has been added`);
      }
      
      setIsLoading(false);
      setShowForm(false);
    }, 1000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Broker Management</h1>
              <p className="text-gray-500">Manage your brokers and their information</p>
            </div>

            {showForm ? (
              <UserForm
                user={selectedBroker}
                userType="broker"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <UserList
                users={brokers}
                title="Brokers"
                userType="broker"
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
