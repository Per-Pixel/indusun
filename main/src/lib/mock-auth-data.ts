// Main application mock authentication data
// This file contains customer login credentials and customer-specific data

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

export interface CustomerUser extends BaseUser {
  role: 'customer' | 'broker';
  customer_data?: CustomerData;
}

export interface CustomerData {
  // Personal Information
  address?: string;
  date_of_birth?: string;
  occupation?: string;
  annual_income?: number;

  // Property Information
  properties: PropertyInfo[];

  // Financial Information
  transactions: TransactionRecord[];
  payments: PaymentRecord[];
  invoices: InvoiceRecord[];
  emi_details: EMIDetails[];

  // Account Information
  account_balance: number;
  credit_score?: number;
  kyc_status: 'pending' | 'verified' | 'rejected';
  documents: DocumentRecord[];
}

export interface PropertyInfo {
  id: string;
  title: string;
  type: 'Apartment' | 'Villa' | 'House' | 'Plot' | 'Commercial';
  location: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  status: 'owned' | 'under_construction' | 'booked' | 'sold';
  plot_number?: string;
  size?: string;
  broker_id?: string;
  broker_name?: string;
}

export interface TransactionRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'property_payment' | 'emi' | 'maintenance' | 'commission' | 'refund' | 'penalty';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  reference_number: string;
  property_id?: string;
  payment_method: 'bank_transfer' | 'cheque' | 'cash' | 'online' | 'card';
  receipt_url?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  property_id: string;
  payment_type: 'booking_amount' | 'installment' | 'final_payment' | 'maintenance' | 'penalty';
  payment_method: 'bank_transfer' | 'cheque' | 'cash' | 'online' | 'card';
  status: 'completed' | 'pending' | 'failed';
  receipt_number: string;
  receipt_url?: string;
  due_date?: string;
  late_fee?: number;
  notes?: string;
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  property_id: string;
  description: string;
  payment_terms: string;
  invoice_url: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface EMIDetails {
  id: string;
  property_id: string;
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  remaining_amount: number;
  next_due_date: string;
  installments_paid: number;
  installments_remaining: number;
  status: 'active' | 'completed' | 'defaulted' | 'prepaid';
  bank_name: string;
  loan_account_number: string;
  start_date: string;
  end_date: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'property_papers' | 'income_proof' | 'bank_statement' | 'other';
  url: string;
  upload_date: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  expiry_date?: string;
  file_size: number;
  mime_type: string;
}

// Mock Customer Users
export const MOCK_CUSTOMER_USERS: CustomerUser[] = [
  {
    id: '3',
    name: 'Hritik',
    email: 'hritik@example.com',
    password: 'Customer@123', // In production, this would be hashed
    role: 'customer',
    created_at: '2023-06-15T00:00:00Z',
    updated_at: '2024-12-20T08:30:00Z',
    email_verified: true,
    phone: '+91 98765 12345',
    status: 'active',
    last_active: '2024-12-20T08:30:00Z',
    customer_data: {
      address: '123, MG Road, Bangalore, Karnataka 560001',
      date_of_birth: '1990-05-15',
      occupation: 'Software Engineer',
      annual_income: 1200000,
      account_balance: 250000,
      credit_score: 750,
      kyc_status: 'verified',
      properties: [
        {
          id: 'prop_001',
          title: 'Harmony Heights Apartment',
          type: 'Apartment',
          location: 'Indiranagar, Bangalore',
          purchase_price: 8500000,
          current_value: 9200000,
          purchase_date: '2023-08-15',
          status: 'owned',
          plot_number: 'A-204',
          size: '1200 sq ft',
          broker_id: 'broker_001',
          broker_name: 'Arshir Patel',
        },
      ],
      transactions: [
        {
          id: 'txn_001',
          date: '2024-12-01',
          description: 'EMI Payment - Harmony Heights',
          amount: 65000,
          type: 'debit',
          category: 'emi',
          status: 'completed',
          reference_number: 'EMI202412001',
          property_id: 'prop_001',
          payment_method: 'bank_transfer',
          receipt_url: '/receipts/emi_202412001.pdf',
        },
        {
          id: 'txn_002',
          date: '2024-11-01',
          description: 'EMI Payment - Harmony Heights',
          amount: 65000,
          type: 'debit',
          category: 'emi',
          status: 'completed',
          reference_number: 'EMI202411001',
          property_id: 'prop_001',
          payment_method: 'bank_transfer',
          receipt_url: '/receipts/emi_202411001.pdf',
        },
        {
          id: 'txn_003',
          date: '2024-10-15',
          description: 'Maintenance Fee - Harmony Heights',
          amount: 3500,
          type: 'debit',
          category: 'maintenance',
          status: 'completed',
          reference_number: 'MAINT202410001',
          property_id: 'prop_001',
          payment_method: 'online',
        },
      ],
      payments: [
        {
          id: 'pay_001',
          date: '2024-12-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'completed',
          receipt_number: 'RCP202412001',
          receipt_url: '/receipts/payment_202412001.pdf',
          due_date: '2024-12-01',
          notes: 'Monthly EMI payment',
        },
        {
          id: 'pay_002',
          date: '2024-11-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'completed',
          receipt_number: 'RCP202411001',
          receipt_url: '/receipts/payment_202411001.pdf',
          due_date: '2024-11-01',
          notes: 'Monthly EMI payment',
        },
      ],
      invoices: [
        {
          id: 'inv_001',
          invoice_number: 'INV-2024-001',
          date: '2024-12-01',
          due_date: '2024-12-15',
          amount: 65000,
          tax_amount: 11700,
          total_amount: 76700,
          status: 'paid',
          property_id: 'prop_001',
          description: 'Monthly EMI Payment - December 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-001.pdf',
          items: [
            {
              description: 'Principal Amount',
              quantity: 1,
              rate: 45000,
              amount: 45000,
            },
            {
              description: 'Interest Amount',
              quantity: 1,
              rate: 20000,
              amount: 20000,
            },
          ],
        },
      ],
      emi_details: [
        {
          id: 'emi_001',
          property_id: 'prop_001',
          loan_amount: 6800000,
          interest_rate: 8.5,
          tenure_months: 240,
          monthly_emi: 65000,
          remaining_amount: 6200000,
          next_due_date: '2025-01-01',
          installments_paid: 4,
          installments_remaining: 236,
          status: 'active',
          bank_name: 'HDFC Bank',
          loan_account_number: 'HL123456789',
          start_date: '2023-09-01',
          end_date: '2043-08-31',
        },
      ],
      documents: [
        {
          id: 'doc_001',
          name: 'Aadhar Card',
          type: 'aadhar',
          url: '/documents/aadhar_hritik.pdf',
          upload_date: '2023-06-15',
          verification_status: 'verified',
          file_size: 1024000,
          mime_type: 'application/pdf',
        },
        {
          id: 'doc_002',
          name: 'PAN Card',
          type: 'pan',
          url: '/documents/pan_hritik.pdf',
          upload_date: '2023-06-15',
          verification_status: 'verified',
          file_size: 512000,
          mime_type: 'application/pdf',
        },
        {
          id: 'doc_003',
          name: 'Property Agreement',
          type: 'property_papers',
          url: '/documents/property_agreement_hritik.pdf',
          upload_date: '2023-08-15',
          verification_status: 'verified',
          file_size: 2048000,
          mime_type: 'application/pdf',
        },
      ],
    },
  },
];

// Helper functions
export const findUserByEmail = (email: string): CustomerUser | null => {
  return MOCK_CUSTOMER_USERS.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const validateCredentials = (email: string, password: string): CustomerUser | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password && user.status === 'active') {
    return user;
  }
  return null;
};

// Customer-specific interfaces
export interface CustomerLoginCredentials {
  email: string;
  password: string;
}

export interface CustomerAuthResponse {
  success: boolean;
  user?: CustomerUser;
  token?: string;
  message?: string;
}

// Mock authentication function for customer login
export const authenticateCustomer = async (credentials: CustomerLoginCredentials): Promise<CustomerAuthResponse> => {
  const { email, password } = credentials;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find user by email
  const user = findUserByEmail(email);

  // Check if user exists and is a customer or broker
  if (!user || (user.role !== 'customer' && user.role !== 'broker')) {
    return {
      success: false,
      message: 'Invalid credentials'
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
  const mockToken = `customer_token_${user.id}_${Date.now()}`;

  return {
    success: true,
    user: user as CustomerUser,
    token: mockToken,
    message: 'Login successful'
  };
};

// Get customer user by ID
export const getCustomerById = (id: string): CustomerUser | null => {
  const user = MOCK_CUSTOMER_USERS.find(customer => customer.id === id);
  return user || null;
};

// Mock function to update customer last active time
export const updateCustomerLastActive = (customerId: string): void => {
  const customer = MOCK_CUSTOMER_USERS.find(c => c.id === customerId);
  if (customer) {
    customer.last_active = new Date().toISOString();
    customer.updated_at = new Date().toISOString();
  }
};

// Customer dashboard data
export interface CustomerDashboardData {
  totalProperties: number;
  totalInvestment: number;
  currentValue: number;
  monthlyEMI: number;
  nextPaymentDue: string;
  recentTransactions: TransactionRecord[];
  upcomingPayments: PaymentRecord[];
  accountSummary: AccountSummary;
}

export interface AccountSummary {
  totalPaid: number;
  remainingAmount: number;
  completionPercentage: number;
  nextEMIDate: string;
  nextEMIAmount: number;
  overdueAmount: number;
}

// Mock customer dashboard data
export const getCustomerDashboardData = (customerId: string): CustomerDashboardData => {
  const customer = getCustomerById(customerId);
  if (!customer || !customer.customer_data) {
    return {
      totalProperties: 0,
      totalInvestment: 0,
      currentValue: 0,
      monthlyEMI: 0,
      nextPaymentDue: '',
      recentTransactions: [],
      upcomingPayments: [],
      accountSummary: {
        totalPaid: 0,
        remainingAmount: 0,
        completionPercentage: 0,
        nextEMIDate: '',
        nextEMIAmount: 0,
        overdueAmount: 0
      }
    };
  }

  const { customer_data } = customer;
  const totalInvestment = customer_data.properties.reduce((sum, prop) => sum + prop.purchase_price, 0);
  const currentValue = customer_data.properties.reduce((sum, prop) => sum + prop.current_value, 0);
  const monthlyEMI = customer_data.emi_details.reduce((sum, emi) => sum + emi.monthly_emi, 0);
  const totalPaid = customer_data.emi_details.reduce((sum, emi) => sum + (emi.installments_paid * emi.monthly_emi), 0);
  const remainingAmount = customer_data.emi_details.reduce((sum, emi) => sum + emi.remaining_amount, 0);
  const completionPercentage = totalInvestment > 0 ? ((totalPaid / totalInvestment) * 100) : 0;

  return {
    totalProperties: customer_data.properties.length,
    totalInvestment,
    currentValue,
    monthlyEMI,
    nextPaymentDue: customer_data.emi_details[0]?.next_due_date || '',
    recentTransactions: customer_data.transactions.slice(0, 5),
    upcomingPayments: customer_data.payments.filter(p => p.status === 'pending').slice(0, 3),
    accountSummary: {
      totalPaid,
      remainingAmount,
      completionPercentage: Math.round(completionPercentage),
      nextEMIDate: customer_data.emi_details[0]?.next_due_date || '',
      nextEMIAmount: customer_data.emi_details[0]?.monthly_emi || 0,
      overdueAmount: 0 // Calculate based on overdue payments
    }
  };
};

// Mock function to simulate logout
export const logoutCustomer = async (token: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // In real implementation, this would invalidate the token
  return {
    success: true,
    message: 'Logout successful'
  };
};
