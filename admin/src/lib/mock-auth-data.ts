// Admin-specific mock authentication data
// This file contains admin login credentials and role-based access control

// Base interfaces and types
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  password: string; // In real implementation, this would be hashed
  role: 'customer' | 'broker' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  google_id?: string;
  profile_picture?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_active: string;
}

export interface AdminPermissions {
  // User Management
  can_view_users: boolean;
  can_create_users: boolean;
  can_edit_users: boolean;
  can_delete_users: boolean;

  // Admin Management
  can_view_admins: boolean;
  can_create_admins: boolean;
  can_edit_admins: boolean;
  can_delete_admins: boolean;
  can_view_admin_details: boolean;

  // System Settings
  can_access_system_settings: boolean;
  can_modify_system_config: boolean;

  // Financial Operations
  can_view_all_transactions: boolean;
  can_process_payments: boolean;
  can_generate_reports: boolean;
  can_access_billing: boolean;
  can_manage_invoices: boolean;

  // Dashboard Access
  can_access_full_dashboard: boolean;
  can_view_analytics: boolean;
  can_export_data: boolean;

  // Property Management
  can_manage_properties: boolean;
  can_view_property_details: boolean;

  // Broker Management
  can_manage_brokers: boolean;
  can_view_broker_details: boolean;

  // Message Management
  can_view_messages: boolean;
  can_reply_to_messages: boolean;
  can_delete_messages: boolean;
}

export interface AdminUser extends BaseUser {
  role: 'admin' | 'super_admin';
  permissions: AdminPermissions;
  department?: string;
  employee_id?: string;
}

// Default permissions for different admin roles
export const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  can_view_users: true,
  can_create_users: true,
  can_edit_users: true,
  can_delete_users: true,
  can_view_admins: true,
  can_create_admins: true,
  can_edit_admins: true,
  can_delete_admins: true,
  can_view_admin_details: true,
  can_access_system_settings: true,
  can_modify_system_config: true,
  can_view_all_transactions: true,
  can_process_payments: true,
  can_generate_reports: true,
  can_access_billing: true,
  can_manage_invoices: true,
  can_access_full_dashboard: true,
  can_view_analytics: true,
  can_export_data: true,
  can_manage_properties: true,
  can_view_property_details: true,
  can_manage_brokers: true,
  can_view_broker_details: true,
  can_view_messages: true,
  can_reply_to_messages: true,
  can_delete_messages: true,
};

export const ADMIN_PERMISSIONS: AdminPermissions = {
  can_view_users: true,
  can_create_users: true,
  can_edit_users: true,
  can_delete_users: false, // Limited deletion rights
  can_view_admins: true,
  can_create_admins: false, // Cannot create other admins
  can_edit_admins: false, // Cannot edit other admins
  can_delete_admins: false, // Cannot delete other admins
  can_view_admin_details: false, // Cannot view other admin details
  can_access_system_settings: false, // No system settings access
  can_modify_system_config: false, // No system config access
  can_view_all_transactions: true,
  can_process_payments: true,
  can_generate_reports: true,
  can_access_billing: true,
  can_manage_invoices: true,
  can_access_full_dashboard: true,
  can_view_analytics: true,
  can_export_data: false, // Limited export rights
  can_manage_properties: true,
  can_view_property_details: true,
  can_manage_brokers: true,
  can_view_broker_details: true,
  can_view_messages: true,
  can_reply_to_messages: true,
  can_delete_messages: false, // Cannot delete messages
};

// Mock Admin Users
export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'super.admin@indusun.com',
    password: 'SuperAdmin@123', // In production, this would be hashed
    role: 'super_admin',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-12-20T10:30:00Z',
    email_verified: true,
    phone: '+91 98765 43210',
    status: 'active',
    last_active: '2024-12-20T10:30:00Z',
    permissions: SUPER_ADMIN_PERMISSIONS,
    department: 'Administration',
    employee_id: 'EMP001',
    profile_picture: '/auth/Agents/admin-02.jpg',
  },
  {
    id: '2',
    name: 'Sarika Singh',
    email: 'sarika.singh@indusun.com',
    password: 'Admin@123', // In production, this would be hashed
    role: 'admin',
    created_at: '2023-03-15T00:00:00Z',
    updated_at: '2024-12-20T09:45:00Z',
    email_verified: true,
    phone: '+91 87654 32109',
    status: 'active',
    last_active: '2024-12-20T09:45:00Z',
    permissions: ADMIN_PERMISSIONS,
    department: 'Customer Relations',
    employee_id: 'EMP002',
    profile_picture: '/auth/Agents/admin-01.jpg',
  },
];

// Helper functions
export const findUserByEmail = (email: string): AdminUser | null => {
  return MOCK_ADMIN_USERS.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const validateCredentials = (email: string, password: string): AdminUser | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password && user.status === 'active') {
    return user;
  }
  return null;
};

export const hasPermission = (user: AdminUser, permission: keyof AdminPermissions): boolean => {
  return user.permissions[permission];
};

// Get admin user by ID
export const getAdminById = (id: string): AdminUser | null => {
  const user = MOCK_ADMIN_USERS.find(admin => admin.id === id);
  return user || null;
};

// Mock function to update admin last active time
export const updateAdminLastActive = (adminId: string): void => {
  const admin = MOCK_ADMIN_USERS.find(a => a.id === adminId);
  if (admin) {
    admin.last_active = new Date().toISOString();
    admin.updated_at = new Date().toISOString();
  }
};

// Mock function to simulate logout
export const logoutAdmin = async (token: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // In real implementation, this would invalidate the token
  return {
    success: true,
    message: 'Logout successful'
  };
};

// Admin-specific interfaces
export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  success: boolean;
  user?: AdminUser;
  token?: string;
  message?: string;
  permissions?: AdminPermissions;
}

// Mock authentication function for admin login
export const authenticateAdmin = async (credentials: AdminLoginCredentials): Promise<AdminAuthResponse> => {
  const { email, password } = credentials;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find user by email
  const user = findUserByEmail(email);
  
  // Check if user exists and is an admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return {
      success: false,
      message: 'Invalid credentials or insufficient permissions'
    };
  }
  
  // Validate password
  const validatedUser = validateCredentials(email, password);
  if (!validatedUser) {
    return {
      success: false,
      message: 'Invalid credentials'
    };
  }
  
  // Check if account is active
  if (user.status !== 'active') {
    return {
      success: false,
      message: 'Account is inactive or suspended'
    };
  }
  
  // Generate mock token (in real implementation, this would be a JWT)
  const mockToken = `admin_token_${user.id}_${Date.now()}`;
  
  return {
    success: true,
    user: user as AdminUser,
    token: mockToken,
    message: 'Login successful',
    permissions: (user as AdminUser).permissions
  };
};

// Check if admin has specific permission
export const checkAdminPermission = (adminId: string, permission: keyof AdminPermissions): boolean => {
  const admin = getAdminById(adminId);
  if (!admin) return false;
  return hasPermission(admin, permission);
};

// Get all admin users (for super admin to view)
export const getAllAdminUsers = (): AdminUser[] => {
  return MOCK_ADMIN_USERS;
};

// Role-based access control helpers
export const canManageUsers = (adminId: string): boolean => {
  return checkAdminPermission(adminId, 'can_edit_users');
};

export const canManageAdmins = (adminId: string): boolean => {
  return checkAdminPermission(adminId, 'can_edit_admins');
};

export const canAccessSystemSettings = (adminId: string): boolean => {
  return checkAdminPermission(adminId, 'can_access_system_settings');
};

export const canViewAllTransactions = (adminId: string): boolean => {
  return checkAdminPermission(adminId, 'can_view_all_transactions');
};

export const canExportData = (adminId: string): boolean => {
  return checkAdminPermission(adminId, 'can_export_data');
};

export const canDeleteUsers = (adminId: string): boolean => {
  return checkAdminPermission(adminId, 'can_delete_users');
};

export const canViewAdminDetails = (adminId: string): boolean => {
  return checkAdminPermission(adminId, 'can_view_admin_details');
};

// Mock admin dashboard data
export interface AdminDashboardData {
  totalUsers: number;
  totalAdmins: number;
  totalTransactions: number;
  totalRevenue: number;
  recentActivities: AdminActivity[];
  systemHealth: SystemHealth;
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target: string;
  timestamp: string;
  ip_address?: string;
}

export interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error';
  api_status: 'healthy' | 'warning' | 'error';
  storage_usage: number; // percentage
  memory_usage: number; // percentage
  last_backup: string;
}

// Mock dashboard data
export const getMockAdminDashboardData = (): AdminDashboardData => {
  return {
    totalUsers: 1247,
    totalAdmins: 2,
    totalTransactions: 8934,
    totalRevenue: 125000000, // 12.5 Crores
    recentActivities: [
      {
        id: 'act_001',
        admin_id: '2',
        admin_name: 'Sarika Singh',
        action: 'Updated user profile',
        target: 'User: Hritik',
        timestamp: '2024-12-20T09:45:00Z',
        ip_address: '192.168.1.100'
      },
      {
        id: 'act_002',
        admin_id: '1',
        admin_name: 'Rajesh Kumar',
        action: 'Generated monthly report',
        target: 'Financial Report - November 2024',
        timestamp: '2024-12-20T08:30:00Z',
        ip_address: '192.168.1.101'
      },
      {
        id: 'act_003',
        admin_id: '2',
        admin_name: 'Sarika Singh',
        action: 'Processed payment',
        target: 'Payment ID: pay_001',
        timestamp: '2024-12-19T16:20:00Z',
        ip_address: '192.168.1.100'
      }
    ],
    systemHealth: {
      database_status: 'healthy',
      api_status: 'healthy',
      storage_usage: 68,
      memory_usage: 45,
      last_backup: '2024-12-20T02:00:00Z'
    }
  };
};

// Export the mock admin users for easy access
export { MOCK_ADMIN_USERS };

// Default admin credentials for quick testing
export const DEFAULT_ADMIN_CREDENTIALS = {
  SUPER_ADMIN: {
    email: 'super.admin@indusun.com',
    password: 'SuperAdmin@123'
  },
  ADMIN: {
    email: 'sarika.singh@indusun.com',
    password: 'Admin@123'
  }
};
