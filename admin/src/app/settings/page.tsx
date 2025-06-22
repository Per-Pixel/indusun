'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  LogOut, 
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Save,
  Database,
  Globe,
  Mail
} from 'lucide-react';

const AdminSettings = () => {
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    backupFrequency: 'daily',
    sessionTimeout: '4' // hours for admin
  });

  // Security settings
  const [securitySettings, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    auditLogging: true,
    passwordExpiry: '90' // days
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Manage your administrative account and system settings</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Account Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                <p className="text-gray-500 text-sm font-mono">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Lock className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Change Password</h2>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </motion.button>
              </div>
            </form>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <SettingsIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">System Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
                </div>
                <button
                  onClick={() => handleSystemSettingChange('maintenanceMode', !systemSettings.maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Allow New Registrations</h3>
                  <p className="text-sm text-gray-500">Allow new users to register</p>
                </div>
                <button
                  onClick={() => handleSystemSettingChange('allowRegistrations', !systemSettings.allowRegistrations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    systemSettings.allowRegistrations ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      systemSettings.allowRegistrations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Frequency
                </label>
                <select
                  id="backupFrequency"
                  value={systemSettings.backupFrequency}
                  onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                  className="w-48 p-2 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Session Timeout (hours)
                </label>
                <select
                  id="sessionTimeout"
                  value={systemSettings.sessionTimeout}
                  onChange={(e) => handleSystemSettingChange('sessionTimeout', e.target.value)}
                  className="w-32 p-2 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="12">12</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Security Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your admin account</p>
                </div>
                <button
                  onClick={() => handleSecurityChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Audit Logging</h3>
                  <p className="text-sm text-gray-500">Log all administrative actions</p>
                </div>
                <button
                  onClick={() => handleSecurityChange('auditLogging', !securitySettings.auditLogging)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.auditLogging ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.auditLogging ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label htmlFor="passwordExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Expiry (days)
                </label>
                <select
                  id="passwordExpiry"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                  className="w-32 p-2 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="30">30</option>
                  <option value="60">60</option>
                  <option value="90">90</option>
                  <option value="180">180</option>
                  <option value="365">365</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save All Settings'}
            </motion.button>

            {/* Sign Out Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
