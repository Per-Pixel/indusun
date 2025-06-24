// Mock data for users, payments, and transactions
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

export interface Payment {
  id: string;
  date: string;
  amount: number;
  totalQuestions: number;
  status: 'Success' | 'Pending' | 'Rejected';
  description?: string;
}

export interface Transaction {
  id: string;
  name: string;
  price: string;
  image: string;
  details: string;
  type: 'debit' | 'credit';
  category: string;
}

// Generate monthly transactions for a user
const generateMonthlyTransactions = (userId: string, startMonth: number = 0): Transaction[] => {
  const transactions: Transaction[] = [];
  const transactionTypes = [
    { name: 'Property Maintenance Fee', category: 'Maintenance', type: 'debit' as const },
    { name: 'Monthly Rent Payment', category: 'Rent', type: 'debit' as const },
    { name: 'Security Deposit Refund', category: 'Refund', type: 'credit' as const },
    { name: 'Utility Bill Payment', category: 'Utilities', type: 'debit' as const },
    { name: 'Property Tax Payment', category: 'Tax', type: 'debit' as const },
    { name: 'Insurance Premium', category: 'Insurance', type: 'debit' as const },
    { name: 'Broker Commission', category: 'Commission', type: 'debit' as const },
    { name: 'Late Fee Charge', category: 'Penalty', type: 'debit' as const },
    { name: 'Cashback Reward', category: 'Reward', type: 'credit' as const },
    { name: 'Property Inspection Fee', category: 'Service', type: 'debit' as const }
  ];

  // Generate 10 transactions per month for the last 12 months
  for (let month = startMonth; month < startMonth + 12; month++) {
    for (let day = 1; day <= 10; day++) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      date.setDate(day * 3); // Spread transactions across the month
      
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.floor(Math.random() * 5000) + 500; // Random amount between 500-5500
      
      transactions.push({
        id: `${userId}_${month}_${day}`,
        name: transactionType.name,
        price: amount.toString(),
        image: '/auth/User Profile/Profile Placehlder.png',
        details: date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        type: transactionType.type,
        category: transactionType.category
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.details).getTime() - new Date(a.details).getTime());
};

// Generate payment history for a user
const generatePaymentHistory = (userId: string): Payment[] => {
  const payments: Payment[] = [];
  const statuses: ('Success' | 'Pending' | 'Rejected')[] = ['Success', 'Success', 'Success', 'Success', 'Pending', 'Rejected'];
  
  for (let i = 0; i < 24; i++) { // 2 years of payment history
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    payments.push({
      id: `${userId}_${15000 + i}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: Math.floor(Math.random() * 2000) + 1000, // Random amount between 1000-3000
      totalQuestions: Math.floor(Math.random() * 5) + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `Monthly payment for ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    });
  }

  return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Mock Customer Users
export const mockCustomerUsers: User[] = [
  {
    id: 'customer_1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 9876543210',
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
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 8765432109',
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

// Generate transactions and payments for each customer
export const mockCustomerTransactions: Record<string, Transaction[]> = {
  customer_1: generateMonthlyTransactions('customer_1', 0),
  customer_2: generateMonthlyTransactions('customer_2', 0)
};

export const mockCustomerPayments: Record<string, Payment[]> = {
  customer_1: generatePaymentHistory('customer_1'),
  customer_2: generatePaymentHistory('customer_2')
};

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

export const getCustomerTransactions = (userId: string): Transaction[] => {
  return mockCustomerTransactions[userId] || [];
};

export const getCustomerPayments = (userId: string): Payment[] => {
  return mockCustomerPayments[userId] || [];
};

// Login credentials for testing
export const mockLoginCredentials = {
  // Customer credentials
  'rajesh.kumar@email.com': { password: 'customer123', user: mockCustomerUsers[0] },
  '+91 9876543210': { password: 'customer123', user: mockCustomerUsers[0] },
  'priya.sharma@email.com': { password: 'customer123', user: mockCustomerUsers[1] },
  '+91 8765432109': { password: 'customer123', user: mockCustomerUsers[1] },
  
  // Admin credentials
  'amit.verma@indusun.com': { password: 'admin123', user: mockAdminUsers[0] },
  '+91 9123456789': { password: 'admin123', user: mockAdminUsers[0] },
  'sneha.patel@indusun.com': { password: 'admin123', user: mockAdminUsers[1] },
  '+91 8912345678': { password: 'admin123', user: mockAdminUsers[1] }
};
