'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Mail, Phone, Shield, Crown, Key, AlertTriangle,
  Check, Loader2, Eye, EyeOff, Calendar, Clock, Save, X,
  MapPin, Globe, Edit,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

// Permissions list (shared with the create form)
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

interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;
  const { user: currentUser } = useAdminAuth();

  const [adminUser, setAdminUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    role: 'admin' as 'admin' | 'super_admin',
    status: 'active' as 'active' | 'inactive' | 'pending',
    permissions: [] as string[],
    bio: '',
    location: '',
    website: '',
  });

  // Password reset
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isSelf = currentUser?.id === adminId;

  // Fetch admin user detail
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/admin-users/${adminId}`);
      const data = await response.json();

      if (data.success && data.user) {
        setAdminUser(data.user);
        setEditData({
          name: data.user.name,
          phone: data.user.phone || '',
          role: data.user.role,
          status: data.user.status,
          permissions: data.user.permissions || [],
          bio: data.user.bio || '',
          location: data.user.location || '',
          website: data.user.website || '',
        });
      } else {
        setFetchError(data.error || 'Admin user not found');
      }
    } catch (err) {
      setFetchError('Network error — could not reach the server');
    } finally {
      setIsLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Save edits
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin-users/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          callerRole: currentUser?.role,
          callerId: currentUser?.id,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Admin user updated');
        setAdminUser(data.user);
        setIsEditing(false);
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Network error — could not save');
    } finally {
      setSaving(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setResettingPassword(true);
    try {
      const response = await fetch(`/api/admin-users/${adminId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          callerRole: currentUser?.role,
          callerId: currentUser?.id,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Password has been reset');
        setShowResetPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setResettingPassword(false);
    }
  };

  // Toggle permission
  const togglePermission = (key: string) => {
    setEditData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  // Loading
  if (isLoading) {
    return (
      <CRMLayout>
        <div className="page-container">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading admin user…</p>
          </div>
        </div>
      </CRMLayout>
    );
  }

  // Error
  if (fetchError || !adminUser) {
    return (
      <CRMLayout>
        <div className="page-container">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-red-800 mb-1">Admin User Not Found</h2>
            <p className="text-sm text-red-600 mb-4">{fetchError || 'The admin user does not exist.'}</p>
            <button
              onClick={() => router.push('/admin-users')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Back to Admin Users
            </button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  const createdDate = new Date(adminUser.created_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const updatedDate = new Date(adminUser.updated_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push('/admin-users')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Admin Users
          </button>

          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
            <div className="px-6 -mt-8 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex items-end gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg border-[3px] border-white overflow-hidden">
                  {adminUser.avatar_url ? (
                    <img src={adminUser.avatar_url} alt={adminUser.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {adminUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{adminUser.name}</h1>
                  <p className="text-sm text-gray-500">{adminUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  adminUser.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {adminUser.role === 'super_admin' ? <Crown size={11} /> : <Shield size={11} />}
                  {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  adminUser.status === 'active' ? 'bg-green-100 text-green-700'
                  : adminUser.status === 'inactive' ? 'bg-gray-100 text-gray-600'
                  : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    adminUser.status === 'active' ? 'bg-green-500'
                    : adminUser.status === 'inactive' ? 'bg-gray-400'
                    : 'bg-yellow-500'
                  }`} />
                  {adminUser.status.charAt(0).toUpperCase() + adminUser.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Profile details / Edit form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {isEditing ? 'Edit Profile' : 'Profile Details'}
              </h2>
              {!isEditing && isSuperAdmin && !isSelf && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={e => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      rows={2}
                      value={editData.bio}
                      onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={e => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editData.role}
                      onChange={e => setEditData(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editData.status}
                      onChange={e => setEditData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                {editData.role === 'admin' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AVAILABLE_PERMISSIONS.map(perm => (
                          <label key={perm.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-md transition-colors">
                            <input
                              type="checkbox"
                              checked={editData.permissions.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? (
                      <><Loader2 size={16} className="animate-spin" />Saving…</>
                    ) : (
                      <><Save size={16} />Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900">{adminUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{adminUser.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-sm font-medium text-gray-900">{adminUser.location || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <p className="text-sm font-medium text-gray-900">{adminUser.website || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Created</p>
                      <p className="text-sm font-medium text-gray-900">{createdDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{updatedDate}</p>
                    </div>
                  </div>
                </div>

                {adminUser.bio && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Bio</p>
                    <p className="text-sm text-gray-700">{adminUser.bio}</p>
                  </div>
                )}

                {/* Current permissions */}
                {adminUser.permissions && adminUser.permissions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {adminUser.permissions.map(p => (
                        <span key={p} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {AVAILABLE_PERMISSIONS.find(ap => ap.key === p)?.label || p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {adminUser.role === 'super_admin' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Crown size={14} />
                      <span className="font-medium">Super Admin — all permissions granted</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password Reset (super_admin only, cannot reset own from here) */}
          {isSuperAdmin && !isSelf && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Security</h2>
              </div>
              <div className="p-6">
                {showResetPassword ? (
                  <div className="max-w-md">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Reset password for {adminUser.name}</h3>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Min. 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Re-enter password"
                        />
                      </div>
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                          <AlertTriangle size={12} /> Passwords do not match
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowResetPassword(false); setNewPassword(''); setConfirmPassword(''); }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={resettingPassword}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetPassword}
                        disabled={resettingPassword || !newPassword || !confirmPassword}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                      >
                        {resettingPassword ? (
                          <><Loader2 size={14} className="animate-spin" />Resetting…</>
                        ) : (
                          <><Key size={14} />Reset Password</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Key size={16} />
                    Reset Password
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </CRMLayout>
  );
}
