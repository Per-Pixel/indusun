'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserList, { User } from '@/components/users/UserList';
import UserForm from '@/components/users/UserForm';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '@/context/AdminAuthContext';

// Mock data for admin users
const mockAdminUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@indusun.com',
    phone: '+91 99999 88888',
    role: 'admin',
    status: 'active',
    image: '/auth/Agents/admin-01.jpg',
    lastActive: '2023-12-20',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Super Admin',
    email: 'super.admin@indusun.com',
    phone: '+91 88888 77777',
    role: 'super_admin',
    status: 'active',
    image: '/auth/Agents/admin-02.jpg',
    lastActive: '2023-12-20',
    createdAt: '2023-01-01',
  },
  {
    id: '3',
    name: 'Support Admin',
    email: 'support.admin@indusun.com',
    phone: '+91 77777 66666',
    role: 'admin',
    status: 'active',
    image: '/auth/Agents/admin-03.jpg',
    lastActive: '2023-12-19',
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Finance Admin',
    email: 'finance.admin@indusun.com',
    phone: '+91 66666 55555',
    role: 'admin',
    status: 'inactive',
    image: '/auth/Agents/admin-04.jpg',
    lastActive: '2023-11-30',
    createdAt: '2023-05-22',
  },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminUsers, setAdminUsers] = useState<User[]>(mockAdminUsers);
  const [showForm, setShowForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddNew = () => {
    setSelectedAdmin(undefined);
    setShowForm(true);
  };

  const handleEdit = (admin: User) => {
    // Check if current user is trying to edit themselves
    if (user && admin.id === user.id) {
      toast.error("You cannot edit your own account from this page");
      return;
    }

    // Check if current user is trying to edit a super admin (only super admins can edit other super admins)
    if (admin.role === 'super_admin' && user?.role !== 'super_admin') {
      toast.error("Only super admins can edit other super admin accounts");
      return;
    }

    setSelectedAdmin(admin);
    setShowForm(true);
  };

  const handleDelete = (admin: User) => {
    // Check if current user is trying to delete themselves
    if (user && admin.id === user.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    // Check if current user is trying to delete a super admin (only super admins can delete other super admins)
    if (admin.role === 'super_admin' && user?.role !== 'super_admin') {
      toast.error("Only super admins can delete super admin accounts");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
      // In a real app, you would call an API to delete the admin
      setAdminUsers(prevAdmins => prevAdmins.filter(a => a.id !== admin.id));
      toast.success(`${admin.name} has been deleted`);
    }
  };

  const handleFormSubmit = (adminData: Partial<User>) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (selectedAdmin) {
        // Update existing admin
        setAdminUsers(prevAdmins =>
          prevAdmins.map(admin =>
            admin.id === selectedAdmin.id ? { ...admin, ...adminData } : admin
          )
        );
        toast.success(`${adminData.name} has been updated`);
      } else {
        // Add new admin
        const newAdmin: User = {
          id: Date.now().toString(),
          name: adminData.name || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          role: adminData.role || 'admin',
          status: adminData.status as 'active' | 'inactive' | 'pending',
          image: adminData.image,
          createdAt: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
        };

        setAdminUsers(prevAdmins => [...prevAdmins, newAdmin]);
        toast.success(`${newAdmin.name} has been added`);
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
              <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
              <p className="text-gray-500">Manage admin users and their permissions</p>
            </div>

            {showForm ? (
              <UserForm
                user={selectedAdmin}
                userType="admin"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <UserList
                users={adminUsers}
                title="Admin Users"
                userType="admin"
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                useEditPage={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
