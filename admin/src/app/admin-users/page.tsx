'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
import UserList, { User } from '@/components/users/UserList';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  UserPlus, Shield, Crown, X, Check, Eye, EyeOff, Loader2, AlertTriangle,
} from 'lucide-react';

// All available permissions with labels
const AVAILABLE_PERMISSIONS = [
  { key: 'user_management', label: 'User Management', group: 'Users' },
  { key: 'property_management', label: 'Property Management', group: 'Properties' },
  { key: 'broker_management', label: 'Broker Management', group: 'Brokers' },
  { key: 'financial_reports', label: 'Financial Reports', group: 'Finance' },
  { key: 'billing_management', label: 'Billing Management', group: 'Finance' },
  { key: 'system_settings', label: 'System Settings', group: 'System' },
  { key: 'audit_logs', label: 'Audit Logs', group: 'System' },
  { key: 'cms_management', label: 'CMS Management', group: 'Content' },
  { key: 'messaging', label: 'Messaging', group: 'Communications' },
  { key: 'internal_comms', label: 'Internal Communications', group: 'Communications' },
  { key: 'lead_management', label: 'Lead Management', group: 'CRM' },
  { key: 'booking_management', label: 'Booking Management', group: 'CRM' },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Create-admin form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin' as 'admin' | 'super_admin',
    permissions: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isSuperAdmin = user?.role === 'super_admin';

  // Fetch admin users from API
  const fetchAdminUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('/api/admin-users');
      const data = await response.json();

      if (data.success && data.users) {
        const mapped: User[] = data.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          role: u.role,
          status: u.status || 'active',
          image: u.avatar_url,
          lastActive: u.updated_at ? new Date(u.updated_at).toLocaleDateString() : undefined,
          createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
        }));
        setAdminUsers(mapped);
      } else {
        setFetchError(data.error || 'Failed to load admin users');
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      setFetchError('Network error — could not reach the server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  // Validate the create form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newAdmin.name.trim()) errors.name = 'Name is required';
    if (!newAdmin.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) errors.email = 'Invalid email format';
    if (!newAdmin.password) errors.password = 'Password is required';
    else if (newAdmin.password.length < 8) errors.password = 'Must be at least 8 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new admin
  const handleCreate = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      const response = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAdmin,
          callerRole: user?.role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${newAdmin.name} has been created as an admin`);
        setShowCreateForm(false);
        setNewAdmin({ name: '', email: '', password: '', phone: '', role: 'admin', permissions: [] });
        fetchAdminUsers();
      } else {
        toast.error(data.error || 'Failed to create admin');
      }
    } catch (err) {
      toast.error('Network error — could not create admin');
    } finally {
      setCreating(false);
    }
  };

  // Delete admin
  const handleDelete = async (admin: User) => {
    if (user && admin.id === user.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (admin.role === 'super_admin' && user?.role !== 'super_admin') {
      toast.error("Only super admins can delete super admin accounts");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${admin.name}? This action cannot be undone.`)) return;

    try {
      const response = await fetch(
        `/api/admin-users/${admin.id}?callerRole=${user?.role}&callerId=${user?.id}`,
        { method: 'DELETE' }
      );
      const data = await response.json();

      if (data.success) {
        toast.success(`${admin.name} has been deleted`);
        fetchAdminUsers();
      } else {
        toast.error(data.error || 'Failed to delete admin');
      }
    } catch (err) {
      toast.error('Network error — could not delete admin');
    }
  };

  // Edit admin (navigate to detail page)
  const handleEdit = (admin: User) => {
    if (user && admin.id === user.id) {
      toast.error("You cannot edit your own account from this page. Use Settings instead.");
      return;
    }
    if (admin.role === 'super_admin' && user?.role !== 'super_admin') {
      toast.error("Only super admins can edit other super admin accounts");
      return;
    }
    router.push(`/admin-users/${admin.id}`);
  };

  // Toggle permission in create form
  const togglePermission = (key: string) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="mb-6">
          <h1 className="page-title">Admin User Management</h1>
          <p className="page-subtitle">Manage admin users and their permissions</p>
        </div>

        {/* Create Admin Form (super_admin only) */}
        {showCreateForm && isSuperAdmin && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserPlus size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Create New Admin</h2>
                  <p className="text-sm text-gray-500">Set up a new admin account with Supabase Auth</p>
                </div>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={e => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={e => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="admin@indusun.com"
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newAdmin.password}
                      onChange={e => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.password ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newAdmin.phone}
                    onChange={e => setNewAdmin(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setNewAdmin(prev => ({ ...prev, role: 'admin' }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
                        newAdmin.role === 'admin'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Shield size={16} />
                      Admin
                    </button>
                    <button
                      onClick={() => setNewAdmin(prev => ({ ...prev, role: 'super_admin' }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
                        newAdmin.role === 'super_admin'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Crown size={16} />
                      Super Admin
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              {newAdmin.role === 'admin' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-md transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={newAdmin.permissions.includes(perm.key)}
                            onChange={() => togglePermission(perm.key)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {newAdmin.role === 'admin' && (
                    <p className="mt-2 text-xs text-gray-400">
                      Super admins automatically have all permissions.
                    </p>
                  )}
                </div>
              )}

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">This will create a real Supabase Auth account.</p>
                  <p className="text-amber-600 mt-0.5">The new admin will be able to log in immediately with the email and password you set.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Create Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {fetchError && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Failed to load admin users</p>
                <p className="text-sm text-red-600 mt-1">{fetchError}</p>
                <button
                  onClick={fetchAdminUsers}
                  className="mt-3 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 size={32} className="text-blue-500 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Loading admin users…</p>
            </div>
          </div>
        )}

        {/* User List */}
        {!isLoading && !fetchError && (
          <UserList
            users={adminUsers}
            title="Admin Users"
            userType="admin"
            onAddNew={() => {
              if (!isSuperAdmin) {
                toast.error('Only super admins can create new admin accounts');
                return;
              }
              setShowCreateForm(true);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            useEditPage={true}
          />
        )}
      </div>
    </CRMLayout>
  );
}
