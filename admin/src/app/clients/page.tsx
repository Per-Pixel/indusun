'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserList, { User } from '@/components/users/UserList';
import UserForm from '@/components/users/UserForm';
import { toast } from 'react-hot-toast';

// Mock data for clients
const mockClients: User[] = [
  {
    id: '1',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 (555) 123-7890',
    role: 'client',
    status: 'active',
    image: '/auth/Agents/client-01.jpg',
    location: 'New York, NY',
    lastActive: '2023-12-18',
    createdAt: '2023-10-15',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '+1 (555) 987-6543',
    role: 'client',
    status: 'active',
    image: '/auth/Agents/client-02.jpg',
    location: 'Los Angeles, CA',
    lastActive: '2023-12-20',
    createdAt: '2023-11-05',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '+1 (555) 456-7890',
    role: 'client',
    status: 'inactive',
    image: '/auth/Agents/client-03.jpg',
    location: 'Chicago, IL',
    lastActive: '2023-11-30',
    createdAt: '2023-09-22',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '+1 (555) 234-5678',
    role: 'client',
    status: 'pending',
    image: '/auth/Agents/client-04.jpg',
    location: 'Houston, TX',
    lastActive: '2023-12-15',
    createdAt: '2023-12-01',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+1 (555) 876-5432',
    role: 'client',
    status: 'active',
    image: '/auth/Agents/client-05.jpg',
    location: 'Miami, FL',
    lastActive: '2023-12-19',
    createdAt: '2023-08-15',
  },
];

export default function ClientsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [clients, setClients] = useState<User[]>(mockClients);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddNew = () => {
    setSelectedClient(undefined);
    setShowForm(true);
  };

  const handleEdit = (client: User) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDelete = (client: User) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      // In a real app, you would call an API to delete the client
      setClients(prevClients => prevClients.filter(c => c.id !== client.id));
      toast.success(`${client.name} has been deleted`);
    }
  };

  const handleFormSubmit = (clientData: Partial<User>) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (selectedClient) {
        // Update existing client
        setClients(prevClients =>
          prevClients.map(client =>
            client.id === selectedClient.id ? { ...client, ...clientData } : client
          )
        );
        toast.success(`${clientData.name} has been updated`);
      } else {
        // Add new client
        const newClient: User = {
          id: Date.now().toString(),
          name: clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          role: 'client',
          status: clientData.status as 'active' | 'inactive' | 'pending',
          image: clientData.image,
          location: clientData.location,
          createdAt: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
        };

        setClients(prevClients => [...prevClients, newClient]);
        toast.success(`${newClient.name} has been added`);
      }

      setIsLoading(false);
      setShowForm(false);
    }, 1000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <p className="text-gray-500">Manage your clients and their information</p>
            </div>

            {showForm ? (
              <UserForm
                user={selectedClient}
                userType="client"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <UserList
                users={clients}
                title="Clients"
                userType="client"
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
