'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserList, { User } from '@/components/users/UserList';
import UserForm from '@/components/users/UserForm';
import Pagination from '@/components/common/Pagination';
import { toast } from 'react-hot-toast';

// Initial empty brokers array
const initialBrokers: User[] = [];

export default function BrokersPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [brokers, setBrokers] = useState<User[]>(initialBrokers);
  const [showForm, setShowForm] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 10; // 10 brokers per page

  // Fetch brokers from API
  const fetchBrokers = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading('Loading brokers...');
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/brokers?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setBrokers(data.brokers);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      } else {
        console.error('Failed to fetch brokers:', data.error);
        toast.dismiss(loadingToast);
        toast.error('Failed to fetch brokers');
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
      toast.dismiss(loadingToast);
      toast.error('An error occurred while fetching brokers');
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  // Fetch brokers when page, limit, or search query changes
  useEffect(() => {
    fetchBrokers();
  }, [currentPage, searchQuery]);

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

  const handleDelete = async (broker: User) => {
    if (window.confirm(`Are you sure you want to delete ${broker.name}?`)) {
      setIsLoading(true);
      const deleteToast = toast.loading(`Deleting ${broker.name}...`);
      try {
        const response = await fetch(`/api/brokers/${broker.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.dismiss(deleteToast);
          toast.success(`${broker.name} has been deleted`);
          // Refresh the broker list
          fetchBrokers();
        } else {
          const data = await response.json();
          toast.dismiss(deleteToast);
          toast.error(`Failed to delete broker: ${data.error}`);
        }
      } catch (error) {
        console.error('Error deleting broker:', error);
        toast.dismiss(deleteToast);
        toast.error('An error occurred while deleting the broker');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = async (brokerData: Partial<User>) => {
    setIsLoading(true);

    try {
      if (selectedBroker) {
        // Update existing broker
        const response = await fetch(`/api/brokers/${selectedBroker.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: brokerData.name,
            phone: brokerData.phone,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(`${data.broker.name} has been updated`);
          // Refresh the broker list
          fetchBrokers();
        } else {
          const data = await response.json();
          toast.error(`Failed to update broker: ${data.error}`);
        }
      } else {
        // Add new broker
        const response = await fetch('/api/brokers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: brokerData.name,
            phone: brokerData.phone,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(`${data.broker.name} has been added`);
          // Refresh the broker list
          fetchBrokers();
        } else {
          const data = await response.json();
          toast.error(`Failed to add broker: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('Error submitting broker form:', error);
      toast.error('An error occurred while saving the broker');
    } finally {
      setIsLoading(false);
      setShowForm(false);
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
              <>
                <UserList
                  users={brokers}
                  title="Brokers"
                  userType="broker"
                  onAddNew={handleAddNew}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  useEditPage={true}
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
          </div>
        </div>
      </div>
    </div>
  );
}
