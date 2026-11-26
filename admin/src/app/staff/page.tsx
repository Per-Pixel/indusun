'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
import UserList, { User } from '@/components/users/UserList';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  UserPlus, X, Check, Eye, EyeOff, Loader2, AlertTriangle,
} from 'lucide-react';
import { PERMISSIONS, BUILTIN_ROLES } from '@/lib/permissions';

interface RoleOption {
  id: string;
  slug: string;
  name: string;
  permissions: string[];
}

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

function isStaffRole(slug: string) {
  return !ADMIN_ROLES.has(slug);
}

const BILLER_PERMISSIONS = ['billing_management'];

export default function StaffPage() {
  const router = useRouter();
  const { user, hasPermission } = useAdminAuth();
  const canManageUsers = hasPermission('user_management');
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'biller',
    permissions: [...BILLER_PERMISSIONS],
  });
  const [roles, setRoles] = useState<RoleOption[]>(BUILTIN_ROLES);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const staffRoles = roles.filter((role) => isStaffRole(role.slug));

  useEffect(() => {
    fetch('/api/admin-roles')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !Array.isArray(data.roles) || data.roles.length === 0) return;
        setRoles(data.roles);
        const available = data.roles.filter((role: RoleOption) => isStaffRole(role.slug));
        setDraft((prev) => {
          if (available.some((role: RoleOption) => role.slug === prev.role)) return prev;
          const next = available[0];
          if (!next) return prev;
          return { ...prev, role: next.slug, permissions: [...(next.permissions || [])] };
        });
      })
      .catch(() => {});
  }, []);

  const applyRole = (slug: string) => {
    const match = staffRoles.find((role) => role.slug === slug);
    setDraft((prev) => ({
      ...prev,
      role: slug,
      permissions: [...(match?.permissions || [])],
    }));
  };

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('/api/admin-users');
      const data = await response.json();

      if (data.success && data.users) {
        const mapped: User[] = data.users
          .filter((u: { role?: string }) => isStaffRole(u.role || ''))
          .map((u: any) => ({
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
        setStaff(mapped);
      } else {
        setFetchError(data.error || 'Failed to load staff');
      }
    } catch {
      setFetchError('Network error — could not reach the server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const emptyDraft = () => {
    const next = staffRoles.find((role) => role.slug === 'biller') || staffRoles[0];
    return {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: next?.slug || 'biller',
      permissions: [...(next?.permissions || BILLER_PERMISSIONS)],
    };
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!draft.name.trim()) errors.name = 'Name is required';
    if (!draft.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(draft.email)) errors.email = 'Invalid email format';
    if (!draft.password) errors.password = 'Password is required';
    else if (draft.password.length < 8) errors.password = 'Must be at least 8 characters';
    if (!isStaffRole(draft.role)) errors.role = 'Choose a role other than Admin';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      const response = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          accountKind: 'staff',
          callerRole: user?.role,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`${draft.name} can now sign in`);
        setShowCreateForm(false);
        setDraft(emptyDraft());
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to add staff');
      }
    } catch {
      toast.error('Network error — could not add staff');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (person: User) => {
    if (user && person.id === user.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!window.confirm(`Remove ${person.name} from staff? They will no longer be able to sign in.`)) return;

    try {
      const response = await fetch(
        `/api/admin-users/${person.id}?callerRole=${user?.role}&callerId=${user?.id}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      if (data.success) {
        toast.success(`${person.name} has been removed`);
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to remove staff');
      }
    } catch {
      toast.error('Network error — could not remove staff');
    }
  };

  const togglePermission = (key: string) => {
    setDraft((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="mb-6">
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">
            Add people who use the system without an admin role. They sign in with the email and password you set.
          </p>
        </div>

        {showCreateForm && canManageUsers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserPlus size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add staff</h2>
                  <p className="text-sm text-gray-500">This login is not an admin account</p>
                </div>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {staffRoles.length === 0 ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Create a non-admin role first.</p>
                    <p className="text-amber-600 mt-0.5">Staff cannot be given the Admin or Super Admin role.</p>
                    <button
                      type="button"
                      onClick={() => router.push('/roles')}
                      className="mt-3 px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200"
                    >
                      Open Roles
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.name ? 'border-red-400' : 'border-gray-300'
                        }`}
                        placeholder="Enter full name"
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.email ? 'border-red-400' : 'border-gray-300'
                        }`}
                        placeholder="name@indusun.com"
                      />
                      {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={draft.password}
                          onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={draft.phone}
                        onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={draft.role}
                        onChange={(e) => applyRole(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {staffRoles.map((role) => (
                          <option key={role.slug} value={role.slug}>{role.name}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-400">
                        Admin and Super Admin are not available here. Adjust what this person can open below.
                      </p>
                      {formErrors.role && <p className="mt-1 text-xs text-red-500">{formErrors.role}</p>}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {PERMISSIONS.map((perm) => (
                          <label
                            key={perm.key}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-md transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={draft.permissions.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                    <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">They can sign in as soon as you save.</p>
                      <p className="text-amber-600 mt-0.5">This creates a login. It does not make them an admin.</p>
                    </div>
                  </div>

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
                          Adding…
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Add staff
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {fetchError && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Failed to load staff</p>
                <p className="text-sm text-red-600 mt-1">{fetchError}</p>
                <button
                  onClick={fetchStaff}
                  className="mt-3 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 size={32} className="text-blue-500 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Loading staff…</p>
            </div>
          </div>
        )}

        {!isLoading && !fetchError && (
          <UserList
            users={staff}
            title="Staff"
            userType="staff"
            onAddNew={() => {
              if (!canManageUsers) {
                toast.error('You do not have permission to add staff');
                return;
              }
              setShowCreateForm(true);
            }}
            onEdit={(person) => router.push(`/admin-users/${person.id}?from=staff`)}
            onDelete={handleDelete}
          />
        )}
      </div>
    </CRMLayout>
  );
}
