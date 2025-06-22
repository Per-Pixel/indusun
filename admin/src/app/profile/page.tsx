'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Shield,
  Clock,
  Edit,
  Save,
  X,
  Camera,
  Key,
  Award,
  Activity,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminProfilePage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    employee_id: user?.employee_id || '',
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would make an API call to update the profile
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      employee_id: user?.employee_id || '',
    });
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield size={16} className="text-blue-600" />;
      case 'admin':
        return <User size={16} className="text-green-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };

  const getPermissionsList = () => {
    if (!user?.permissions) return [];
    
    const permissions = user.permissions;
    const permissionList = [];
    
    if (permissions.can_view_users) permissionList.push('View Users');
    if (permissions.can_create_users) permissionList.push('Create Users');
    if (permissions.can_edit_users) permissionList.push('Edit Users');
    if (permissions.can_delete_users) permissionList.push('Delete Users');
    if (permissions.can_view_admins) permissionList.push('View Admins');
    if (permissions.can_create_admins) permissionList.push('Create Admins');
    if (permissions.can_edit_admins) permissionList.push('Edit Admins');
    if (permissions.can_delete_admins) permissionList.push('Delete Admins');
    if (permissions.can_view_properties) permissionList.push('View Properties');
    if (permissions.can_create_properties) permissionList.push('Create Properties');
    if (permissions.can_edit_properties) permissionList.push('Edit Properties');
    if (permissions.can_delete_properties) permissionList.push('Delete Properties');
    if (permissions.can_view_transactions) permissionList.push('View Transactions');
    if (permissions.can_create_transactions) permissionList.push('Create Transactions');
    if (permissions.can_edit_transactions) permissionList.push('Edit Transactions');
    if (permissions.can_delete_transactions) permissionList.push('Delete Transactions');
    if (permissions.can_view_reports) permissionList.push('View Reports');
    if (permissions.can_generate_reports) permissionList.push('Generate Reports');
    if (permissions.can_view_messages) permissionList.push('View Messages');
    if (permissions.can_send_messages) permissionList.push('Send Messages');
    if (permissions.can_delete_messages) permissionList.push('Delete Messages');
    
    return permissionList;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
                <p className="text-gray-600">Manage your profile information and view your permissions</p>
              </div>
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-gray-600" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <Camera size={14} />
                    </button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role || '')}`}>
                      {getRoleIcon(user?.role || '')}
                      <span>{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} />
                      <span>{user?.email}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone size={16} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user?.department && (
                      <div className="flex items-center space-x-2">
                        <Building size={16} />
                        <span>{user.department}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>Joined {new Date(user?.created_at || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>Last active {new Date(user?.last_active || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Profile Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Profile Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg">{profileData.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg">{profileData.department || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <p className="p-3 bg-gray-50 rounded-lg text-gray-500">{profileData.employee_id || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <p className="p-3 bg-gray-50 rounded-lg text-gray-500">
                    {user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="mr-2" size={20} />
                Permissions & Access
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getPermissionsList().map((permission, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <Award size={16} className="text-green-600" />
                    <span className="text-sm text-green-800">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="mr-2" size={20} />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings size={20} className="text-gray-600" />
                  <span className="font-medium">Account Settings</span>
                </button>
                
                <button
                  onClick={() => router.push('/clients')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users size={20} className="text-gray-600" />
                  <span className="font-medium">Manage Users</span>
                </button>
                
                <button
                  onClick={() => router.push('/sales')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText size={20} className="text-gray-600" />
                  <span className="font-medium">View Reports</span>
                </button>
                
                <button
                  onClick={() => router.push('/messages')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail size={20} className="text-gray-600" />
                  <span className="font-medium">Messages</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
