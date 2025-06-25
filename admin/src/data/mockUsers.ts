// Mock data for admin users - copied from main app for admin panel use
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  role: 'customer' | 'broker' | 'admin';
  profileImage?: string;
  // Admin specific fields
  permissions?: string[];
  accessLevel?: 'super_admin' | 'admin' | 'limited_admin';
  // Customer specific fields
  agentName?: string;
  agentImage?: string;
  overdueAmount?: string;
  upcomingAmount?: string;
  remainingAmount?: string;
}

// Mock Admin Users
export const mockAdminUsers: User[] = [
  {
    id: 'admin_1',
    name: 'Amit Verma',
    email: 'amit.verma@indusun.com',
    phone: '+91 9123456789',
    address: 'Corporate Office, Mumbai, Maharashtra',
    bio: 'Super Administrator with full system access and management capabilities.',
    role: 'admin',
    profileImage: '/auth/User Profile/Profile Placehlder.png',
    accessLevel: 'super_admin',
    permissions: [
      'user_management',
      'property_management',
      'broker_management',
      'financial_reports',
      'system_settings',
      'audit_logs',
      'backup_restore',
      'security_settings'
    ]
  },
  {
    id: 'admin_2',
    name: 'Sneha Patel',
    email: 'sneha.patel@indusun.com',
    phone: '+91 8912345678',
    address: 'Regional Office, Delhi, India',
    bio: 'Regional Administrator with limited access to user and property management.',
    role: 'admin',
    profileImage: '/auth/User Profile/Profile Placehlder.png',
    accessLevel: 'limited_admin',
    permissions: [
      'user_management',
      'property_management',
      'basic_reports'
    ]
  }
];

// Mock Customer Users (for reference in admin panel)
export const mockCustomerUsers: User[] = [
  {
    id: 'customer_1',
    name: 'Per Pixel',
    email: 'perpixel@email.com',
    phone: '+91 8849180795',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    bio: 'Looking for premium residential properties in Bangalore. Interested in 2-3 BHK apartments with modern amenities.',
    role: 'customer',
    profileImage: '/auth/User Profile/Profile Placehlder.png',
    agentName: 'Arshir Patel',
    agentImage: '/auth/Agents/agent-03.jpg',
    overdueAmount: 'INR 2,450.00',
    upcomingAmount: 'INR 8,750.00',
    remainingAmount: '12,340.00'
  },
  {
    id: 'customer_2',
    name: 'Romit Singh',
    email: 'romitsignh749@email.com',
    phone: '+91 7490825290',
    address: '456 Sector 18, Noida, Uttar Pradesh 201301',
    bio: 'First-time home buyer seeking affordable housing options in NCR region. Preference for ready-to-move properties.',
    role: 'customer',
    profileImage: '/auth/User Profile/Profile Placehlder.png',
    agentName: 'Vikram Singh',
    agentImage: '/auth/Agents/agent-03.jpg',
    overdueAmount: 'INR 1,200.00',
    upcomingAmount: 'INR 5,500.00',
    remainingAmount: '8,750.00'
  }
];

// All users combined for easy access
export const allMockUsers = [...mockCustomerUsers, ...mockAdminUsers];

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return allMockUsers.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return allMockUsers.find(user => user.email === email);
};

export const getUserByPhone = (phone: string): User | undefined => {
  return allMockUsers.find(user => user.phone === phone);
};

// Login credentials for testing
export const mockLoginCredentials = {
  // Customer credentials
  'perpixel@email.com': { password: 'customer123', user: mockCustomerUsers[0] },
  '+91 8849180795': { password: 'customer123', user: mockCustomerUsers[0] },
  'romitsignh749@email.com': { password: 'customer123', user: mockCustomerUsers[1] },
  '+91 7490825290': { password: 'customer123', user: mockCustomerUsers[1] },

  // Admin credentials
  'amit.verma@indusun.com': { password: 'admin123', user: mockAdminUsers[0] },
  '+91 9123456789': { password: 'admin123', user: mockAdminUsers[0] },
  'sneha.patel@indusun.com': { password: 'admin123', user: mockAdminUsers[1] },
  '+91 8912345678': { password: 'admin123', user: mockAdminUsers[1] }
};
