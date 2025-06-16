'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserList, { User } from '@/components/users/UserList';
import UserForm from '@/components/users/UserForm';
import Pagination from '@/components/common/Pagination';
import { toast } from 'react-hot-toast';

// Initial empty clients array
const initialClients: User[] = [];

export default function ClientsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [clients, setClients] = useState<User[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch clients from the API with pagination and search
  const fetchClients = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      const response = await fetch(`/api/clients?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }
      
      const data = await response.json();
      setClients(data.clients);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch and when page or search changes
  useEffect(() => {
    const loadingToast = toast.loading('Loading clients...');
    fetchClients(currentPage, searchQuery)
      .finally(() => {
        toast.dismiss(loadingToast);
      });
  }, [currentPage, searchQuery]);

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

  const handleDelete = async (client: User) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      try {
        setIsLoading(true);
        const loadingToast = toast.loading(`Deleting ${client.name}...`);
        
        const response = await fetch(`/api/clients/${client.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete client');
        }
        
        toast.dismiss(loadingToast);
        toast.success(`${client.name} has been deleted`);
        // Refresh the client list with current page and search
        fetchClients(currentPage, searchQuery);
      } catch (err) {
        console.error('Error deleting client:', err);
        toast.dismiss();
        toast.error(err instanceof Error ? err.message : 'Failed to delete client');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = async (clientData: Partial<User>) => {
    setIsLoading(true);

    try {
      if (selectedClient) {
        // Update existing client
        const response = await fetch(`/api/clients/${selectedClient.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update client');
        }

        const data = await response.json();
        toast.success(`${clientData.name} has been updated`);
      } else {
        // Add new client
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add client');
        }

        const data = await response.json();
        toast.success(`${data.client.name} has been added`);
      }

      setShowForm(false);
      // Refresh the client list after adding or updating
      fetchClients(currentPage, searchQuery);
    } catch (err) {
      console.error('Error submitting client form:', err);
      toast.error(err instanceof Error ? err.message : 'An error occurred while saving client');
    } finally {
      setIsLoading(false);
    }
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

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {showForm ? (
              <UserForm
                user={selectedClient}
                userType="client"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <>
                <UserList
                  users={clients}
                  title="Clients"
                  userType="client"
                  onAddNew={handleAddNew}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSearch={(query) => {
                    setSearchQuery(query);
                    // Reset to page 1 when searching
                    setCurrentPage(1);
                  }}
                  externalSearchQuery={searchQuery}
                />
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                )}
              </>
            )}

            {isLoading && !showForm && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
