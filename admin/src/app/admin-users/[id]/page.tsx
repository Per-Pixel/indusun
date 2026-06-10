'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import CRMLayout from '@/components/CRMLayout';
import UserForm from '@/components/users/UserForm';
import { User } from '@/components/users/UserList';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, Clock, Shield, Key, AlertTriangle, X, Check, Lock, Eye, EyeOff, UserCog, Settings, Database, FileText, Users, LayoutDashboard, UserPlus } from 'lucide-react';
import AgentDetailsForm from '@/components/users/AgentDetailsForm';
import AgentEditForm from '@/components/users/AgentEditForm';
import { useAdminAuth } from '@/context/AdminAuthContext';

// Mock data for admin users (same as in the admin-users page)
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

// Mock admin activity log
const mockActivityLog = [
  {
    id: '1',
    action: 'User updated',
    details: 'Updated client Robert Johnson\'s profile',
    timestamp: '2023-12-20T14:30:00Z',
  },
  {
    id: '2',
    action: 'Property approved',
    details: 'Approved new property listing in Mumbai',
    timestamp: '2023-12-19T10:15:00Z',
  },
  {
    id: '3',
    action: 'Broker application reviewed',
    details: 'Reviewed and approved broker application for Ananya Desai',
    timestamp: '2023-12-18T16:45:00Z',
  },
  {
    id: '4',
    action: 'System settings changed',
    details: 'Updated email notification settings',
    timestamp: '2023-12-15T09:20:00Z',
  },
  {
    id: '5',
    action: 'Login',
    details: 'Logged in from 192.168.1.105',
    timestamp: '2023-12-15T09:00:00Z',
  },
];

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;
  const { user: currentUser } = useAdminAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityLog, setActivityLog] = useState(mockActivityLog);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [showPermissionsTab, setShowPermissionsTab] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      permissions: {
        ...(prev.permissions as Record<string, unknown>),
        [name]: checked
      }
    }));
  };

  useEffect(() => {
    // In a real app, you would fetch the admin user data from an API
    const foundAdmin = mockAdminUsers.find(a => a.id === adminId);

    if (foundAdmin) {
      setAdminUser(foundAdmin);
      // Initialize form data with admin user data
      setFormData({
        name: foundAdmin.name,
        email: foundAdmin.email,
        phone: foundAdmin.phone,
        status: foundAdmin.status,
        role: foundAdmin.role,
        title: 'Administrator',
        login: foundAdmin.id,
        permissions: {
          // Dashboard permissions
          view_dashboard: true,
          view_analytics: foundAdmin.role === 'super_admin',

          // User management permissions
          manage_clients: true,
          view_clients: true,
          add_clients: true,
          edit_clients: true,
          delete_clients: foundAdmin.role === 'super_admin',

          // Broker management permissions
          manage_brokers: true,
          view_brokers: true,
          add_brokers: true,
          edit_brokers: true,
          delete_brokers: foundAdmin.role === 'super_admin',
          approve_broker_applications: true,

          // Admin management permissions
          manage_admins: foundAdmin.role === 'super_admin',
          view_admins: true,
          add_admins: foundAdmin.role === 'super_admin',
          edit_admins: foundAdmin.role === 'super_admin',
          delete_admins: foundAdmin.role === 'super_admin',

          // Property management permissions
          manage_properties: true,
          view_properties: true,
          add_properties: true,
          edit_properties: true,
          delete_properties: foundAdmin.role === 'super_admin',
          approve_properties: true,

          // Financial permissions
          manage_payments: foundAdmin.role === 'super_admin',
          view_payments: true,
          process_payments: foundAdmin.role === 'super_admin',
          manage_invoices: true,
          view_invoices: true,
          create_invoices: true,

          // System permissions
          manage_settings: foundAdmin.role === 'super_admin',
          view_logs: foundAdmin.role === 'super_admin',
          manage_backups: foundAdmin.role === 'super_admin',
        }
      });
    } else {
      toast.error('Admin user not found');
      router.push('/admin-users');
    }

    setIsLoading(false);
  }, [adminId, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleEdit = () => {
    // Check if current user is trying to edit themselves
    if (currentUser && adminUser?.id === currentUser.id) {
      toast.error("You cannot edit your own account from this page");
      return;
    }

    // Check if current user is trying to edit a super admin (only super admins can edit other super admins)
    if (adminUser?.role === 'super_admin' && currentUser?.role !== 'super_admin') {
      toast.error("Only super admins can edit other super admin accounts");
      return;
    }

    setShowEditForm(true);
  };

  const handleDelete = () => {
    // Check if current user is trying to delete themselves
    if (currentUser && adminUser?.id === currentUser.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    // Check if current user is trying to delete a super admin (only super admins can delete other super admins)
    if (adminUser?.role === 'super_admin' && currentUser?.role !== 'super_admin') {
      toast.error("Only super admins can delete super admin accounts");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${adminUser?.name}?`)) {
      // In a real app, you would call an API to delete the admin user
      toast.success(`${adminUser?.name} has been deleted`);
      router.push('/admin-users');
    }
  };

  const handleFormSubmit = (adminData: Partial<User>) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (adminUser) {
        // Update admin user
        setAdminUser({ ...adminUser, ...adminData });
        toast.success(`${adminData.name} has been updated`);
      }

      setIsLoading(false);
      setShowEditForm(false);
    }, 1000);
  };

  const handleFormCancel = () => {
    setShowEditForm(false);
  };

  const handleResetPassword = () => {
    setShowResetPasswordForm(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Password has been reset successfully');
      setShowResetPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin User Not Found</h2>
          <p className="text-gray-500 mb-4">The admin user you are looking for does not exist or has been deleted.</p>
          <button
            onClick={() => router.push('/admin-users')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Admin Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/admin-users')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Admin Users</span>
            </button>

            {showEditForm ? (
              <AgentEditForm
                agent={{
                  id: adminUser?.id || '',
                  name: adminUser?.name || '',
                  title: adminUser?.title || 'Administrator',
                  email: adminUser?.email || '',
                  phone: adminUser?.phone || '',
                  image: adminUser?.image,
                  practice: 'Administration',
                  branch: 'Mumbai',
                  contract: 'Employee',
                  grade: 'Senior',
                  division: 'Admin',
                  division_manager: 'System',
                  login: adminUser?.id,
                  status: 'Activated',
                  status_history: [{ status: 'Activated', date: '13/05/2009' }]
                }}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <>
                <AgentDetailsForm
                  agent={{
                    id: adminUser?.id || '',
                    name: adminUser?.name || '',
                    title: adminUser?.title || 'Administrator',
                    email: adminUser?.email || '',
                    phone: adminUser?.phone || '',
                    image: adminUser?.image,
                    practice: 'Administration',
                    branch: 'Mumbai',
                    contract: 'Employee',
                    grade: 'Senior',
                    division: 'Admin',
                    division_manager: 'System',
                    login: adminUser?.id,
                    status: 'Activated',
                    status_history: [{ status: 'Activated', date: '13/05/2009' }]
                  }}
                  onEdit={handleEdit}
                  readOnly={false}
                />

                {/* Reset Password Button */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 p-6">
                  <button
                    onClick={handleResetPassword}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Key size={16} />
                    <span>Reset Password</span>
                  </button>
                </div>

                {/* Reset Password Form */}
                {showResetPasswordForm && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="p-6">
                      <div className="mb-4">
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {passwordError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                          <p>{passwordError}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowResetPasswordForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            'Reset Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Activity Log */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      {activityLog.map((activity) => (
                        <div key={activity.id} className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-gray-700">{activity.details}</p>
                            <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>
      </div>
    </CRMLayout>
  );
}
