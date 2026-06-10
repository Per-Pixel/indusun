'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import ExportDropdown from '@/components/ui/ExportDropdown';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  image?: string;
  title?: string;
  location?: string;
  lastActive?: string;
  createdAt: string;
}

interface UserListProps {
  users: User[];
  title: string;
  userType: 'client' | 'broker' | 'admin';
  onAddNew: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  useEditPage?: boolean;
  onSearch?: (query: string) => void;
  externalSearchQuery?: string;
}

const UserList: React.FC<UserListProps> = ({
  users,
  title,
  userType,
  onAddNew,
  onEdit,
  onDelete,
  useEditPage = false,
  onSearch,
  externalSearchQuery
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(null);

  // Filter users based on search query and status
  const filteredUsers = users.filter(user => {
    // If we're using server-side search (onSearch is provided), only filter by status
    // Otherwise, filter by both search query and status
    const matchesSearch = onSearch
      ? true // Skip client-side search filtering when server-side search is used
      : (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.phone?.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600 mr-1" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-600 mr-1" />;
      case 'pending':
        return <ChevronDown className="w-4 h-4 text-yellow-600 mr-1" />;
      default:
        return null;
    }
  };

  const toggleActionDropdown = (userId: string) => {
    if (showActionDropdown === userId) {
      setShowActionDropdown(null);
    } else {
      setShowActionDropdown(userId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with search and filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${userType}s...`}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 placeholder-dark"
                value={searchQuery}
                onChange={(e) => {
                  const newValue = e.target.value || '';
                  setSearchQuery(newValue);
                  if (onSearch) {
                    // Use a small delay to avoid too many API calls while typing
                    const timeoutId = setTimeout(() => {
                      onSearch(newValue);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <Filter size={16} />
                <span>Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                <ChevronDown size={16} />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setStatusFilter('all');
                        setShowStatusDropdown(false);
                      }}
                    >
                      All
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setStatusFilter('active');
                        setShowStatusDropdown(false);
                      }}
                    >
                      Active
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setStatusFilter('inactive');
                        setShowStatusDropdown(false);
                      }}
                    >
                      Inactive
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setStatusFilter('pending');
                        setShowStatusDropdown(false);
                      }}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add New Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={onAddNew}
            >
              <UserPlus size={16} />
              <span>Add {userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
            </button>

            {/* Export Dropdown */}
            <ExportDropdown
              label="Export"
              filename={`${userType}s`}
              disabled={filteredUsers.length === 0}
              columns={[
                { header: 'Name',    key: 'name' },
                { header: 'Email',   key: 'email' },
                { header: 'Phone',   key: 'phone' },
                { header: 'Role',    key: 'role' },
                { header: 'Status',  key: 'status' },
                { header: 'Created', key: 'createdAt' },
              ]}
              rows={filteredUsers}
            />
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-800 font-semibold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                      {getStatusIcon(user.status)}
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => toggleActionDropdown(user.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {showActionDropdown === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                if (useEditPage) {
                                  const path = userType === 'admin' ? `/admin-users/${user.id}` : `/brokers/${user.id}`;
                                  router.push(path);
                                } else {
                                  onEdit(user);
                                }
                                setShowActionDropdown(null);
                              }}
                            >
                              <Edit size={16} className="mr-2" />
                              Edit
                            </button>
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => {
                                onDelete(user);
                                setShowActionDropdown(null);
                              }}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No {userType}s found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
