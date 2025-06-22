'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, FileText, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    phone: '',
    address: '',
    occupation: '',
    annual_income: 0
  });

  React.useEffect(() => {
    if (user?.customer_data) {
      setEditedData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.customer_data.address || '',
        occupation: user.customer_data.occupation || '',
        annual_income: user.customer_data.annual_income || 0
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, this would make an API call to update user data
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    if (user?.customer_data) {
      setEditedData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.customer_data.address || '',
        occupation: user.customer_data.occupation || '',
        annual_income: user.customer_data.annual_income || 0
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Please log in to view your profile</div>
        </div>
      </DashboardLayout>
    );
  }

  const customerData = user.customer_data;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="mr-2" size={20} />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="p-3 bg-gray-50 rounded-lg flex items-center">
                <Mail className="mr-2" size={16} />
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg flex items-center">
                  <Phone className="mr-2" size={16} />
                  {user.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <p className="p-3 bg-gray-50 rounded-lg flex items-center">
                <Calendar className="mr-2" size={16} />
                {customerData?.date_of_birth ? new Date(customerData.date_of_birth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  value={editedData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg flex items-start">
                  <MapPin className="mr-2 mt-1" size={16} />
                  {customerData?.address || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{customerData?.occupation || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.annual_income}
                  onChange={(e) => handleInputChange('annual_income', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">
                  ₹{customerData?.annual_income?.toLocaleString('en-IN') || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="mr-2" size={20} />
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ₹{customerData?.account_balance?.toLocaleString('en-IN') || '0'}
              </div>
              <div className="text-sm text-gray-600">Account Balance</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {customerData?.credit_score || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Credit Score</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 capitalize">
                {customerData?.kyc_status || 'Pending'}
              </div>
              <div className="text-sm text-gray-600">KYC Status</div>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="mr-2" size={20} />
            My Properties
          </h2>

          {customerData?.properties && customerData.properties.length > 0 ? (
            <div className="space-y-4">
              {customerData.properties.map((property) => (
                <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <p className="text-gray-600">{property.location}</p>
                      <p className="text-sm text-gray-500">{property.type} • {property.size}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        ₹{property.current_value.toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-gray-500">Current Value</div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        property.status === 'owned' ? 'bg-green-100 text-green-800' :
                        property.status === 'under_construction' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {property.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No properties found</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="mr-2" size={20} />
            Documents
          </h2>

          {customerData?.documents && customerData.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customerData.documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{doc.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                      doc.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.verification_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{doc.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No documents found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;