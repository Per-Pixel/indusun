'use client';

import React, { useCallback, useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'react-hot-toast';
import {
  Shield, Crown, Plus, Pencil, Trash2, Loader2, X, Check, AlertTriangle, Lock, Users,
} from 'lucide-react';
import {
  PERMISSIONS,
  groupPermissions,
  type RoleTemplate,
} from '@/lib/permissions';

interface RoleRow extends RoleTemplate {
  created_at?: string;
  user_count?: number;
}

const EMPTY_FORM = { name: '', description: '', permissions: [] as string[] };

export default function RolesPage() {
  const { hasPermission } = useAdminAuth();
  const canEdit = hasPermission('role_management');

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<null | { mode: 'create' } | { mode: 'edit'; role: RoleRow }>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin-roles');
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Could not load roles');
        setRoles([]);
      } else {
        setRoles(data.roles || []);
        setNeedsMigration(!!data.needsMigration);
      }
    } catch {
      setError('Network error — could not reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditor({ mode: 'create' });
  };

  const openEdit = (role: RoleRow) => {
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: role.slug === 'super_admin' ? PERMISSIONS.map((p) => p.key) : [...role.permissions],
    });
    setEditor({ mode: 'edit', role });
  };

  const togglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Give the role a name');
      return;
    }
    setSaving(true);
    try {
      const isEdit = editor && editor.mode === 'edit';
      const res = await fetch(isEdit ? `/api/admin-roles/${editor.role.id}` : '/api/admin-roles', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          permissions: form.permissions,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Could not save role');
        return;
      }
      toast.success(isEdit ? 'Role updated. People on this role now have these permissions.' : 'Role created');
      setEditor(null);
      load();
    } catch {
      toast.error('Network error — could not save role');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role: RoleRow) => {
    if (!window.confirm(`Delete the ${role.name} role? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin-roles/${role.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Could not delete role');
        return;
      }
      toast.success(`${role.name} deleted`);
      load();
    } catch {
      toast.error('Network error — could not delete role');
    }
  };

  const editingSuper = editor?.mode === 'edit' && editor.role.slug === 'super_admin';
  const groups = groupPermissions();

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="page-title">Roles & permissions</h1>
            <p className="page-subtitle">
              Create roles, choose what each one can do, then assign them when you add an admin.
            </p>
          </div>
          {canEdit && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Create role
            </button>
          )}
        </div>

        {needsMigration && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-900">
              <p className="font-medium">The roles table is not in Supabase yet.</p>
              <p className="mt-1 text-amber-800">
                Run <code className="rounded bg-amber-100 px-1">admin/sql/admin_roles.sql</code> in the Supabase SQL editor.
                Until then you can still assign Admin and Super Admin, but new roles will not save.
              </p>
            </div>
          </div>
        )}

        {editor && (
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editor.mode === 'create' ? 'New role' : `Edit ${editor.role.name}`}
                  </h2>
                  <p className="text-sm text-gray-500">
                    People assigned this role receive these permissions. Saving updates existing users on the role.
                  </p>
                </div>
              </div>
              <button onClick={() => setEditor(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Role name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Sales manager"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="What this role is for"
                  />
                </div>
              </div>

              {editingSuper ? (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
                  <Crown size={16} />
                  Super Admin always has every permission. That cannot be narrowed.
                </div>
              ) : (
                <div className="mb-6 space-y-4">
                  {groups.map((group) => (
                    <div key={group.group} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{group.group}</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((perm) => (
                          <label key={perm.key} className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-white">
                            <input
                              type="checkbox"
                              checked={form.permissions.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>
                              <span className="block text-sm text-gray-800">{perm.label}</span>
                              <span className="block text-xs text-gray-500">{perm.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditor(null)}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !canEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {editor.mode === 'create' ? 'Create role' : 'Save role'}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-800">Could not load roles</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button onClick={load} className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
            <Loader2 size={32} className="mb-3 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Loading roles…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {roles.map((role) => {
              const isSuper = role.slug === 'super_admin';
              return (
                <div key={role.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSuper ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                        {isSuper ? <Crown size={18} /> : <Shield size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-gray-900">{role.name}</h2>
                          {role.is_system && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                              <Lock size={10} /> Built-in
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{role.slug}</p>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(role)}
                          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          aria-label={`Edit ${role.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        {!role.is_system && role.id !== 'builtin-admin' && role.id !== 'builtin-super-admin' && (
                          <button
                            onClick={() => remove(role)}
                            className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${role.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-gray-600">{role.description || 'No description'}</p>
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <Users size={13} />
                    {role.user_count || 0} user{(role.user_count || 0) === 1 ? '' : 's'}
                    <span className="text-gray-300">·</span>
                    {isSuper ? 'All permissions' : `${role.permissions.length} permission${role.permissions.length === 1 ? '' : 's'}`}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(isSuper ? PERMISSIONS.map((p) => p.key) : role.permissions).slice(0, 8).map((key) => (
                      <span key={key} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        {PERMISSIONS.find((p) => p.key === key)?.label || key}
                      </span>
                    ))}
                    {!isSuper && role.permissions.length > 8 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        +{role.permissions.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
