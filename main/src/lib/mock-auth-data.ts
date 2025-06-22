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

  // Communication
  messages: MessageRecord[];

  // Payment Methods
  payment_methods: PaymentMethod[];

  // Receipts
  receipts: ReceiptRecord[];
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
  // Overdue-specific fields
  late_fee?: number;
  penalty_charges?: number;
  days_overdue?: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BrokerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_picture?: string;
  specialization: string[];
  experience_years: number;
  rating: number;
  total_reviews: number;
  office_address: string;
  license_number: string;
  languages: string[];
  areas_covered: string[];
  properties_sold: number;
  total_sales_value: number;
  certifications: string[];
  about: string;
  working_hours: string;
  response_time: string;
  commission_rate: number;
  status: 'active' | 'inactive' | 'on_leave';
  joined_date: string;
  last_active: string;
}

export interface MessageRecord {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'customer' | 'broker' | 'admin';
  receiver_id: string;
  receiver_name: string;
  receiver_type: 'customer' | 'broker' | 'admin';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'document' | 'payment_reminder' | 'property_update' | 'image';
  property_id?: string;
  attachment_url?: string;
  attachment_name?: string;
  is_important?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'debit_card' | 'upi' | 'wallet';
  name: string;
  details: {
    // For bank accounts
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
    account_holder_name?: string;

    // For cards
    card_number?: string;
    card_holder_name?: string;
    expiry_month?: string;
    expiry_year?: string;
    card_type?: 'visa' | 'mastercard' | 'rupay' | 'amex';

    // For UPI
    upi_id?: string;

    // For wallets
    wallet_provider?: string;
    wallet_number?: string;
  };
  is_default: boolean;
  is_verified: boolean;
  added_date: string;
  last_used?: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface ReceiptRecord {
  id: string;
  receipt_number: string;
  transaction_id: string;
  payment_id?: string;
  invoice_id?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  date: string;
  description: string;
  payment_method: string;
  property_id?: string;
  receipt_url: string;
  download_url: string;
  generation_date: string;
  status: 'generated' | 'sent' | 'downloaded';
  customer_id: string;
  customer_name: string;
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
        // Upcoming payments
        {
          id: 'pay_006',
          date: '2025-01-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202501001',
          due_date: '2025-01-01',
          notes: 'Monthly EMI payment - January 2025',
        },
        {
          id: 'pay_007',
          date: '2025-02-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202502001',
          due_date: '2025-02-01',
          notes: 'Monthly EMI payment - February 2025',
        },
        {
          id: 'pay_008',
          date: '2025-03-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202503001',
          due_date: '2025-03-01',
          notes: 'Monthly EMI payment - March 2025',
        },
        {
          id: 'pay_009',
          date: '2025-04-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202504001',
          due_date: '2025-04-01',
          notes: 'Monthly EMI payment - April 2025',
        },
        {
          id: 'pay_010',
          date: '2025-05-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202505001',
          due_date: '2025-05-01',
          notes: 'Monthly EMI payment - May 2025',
        },
        {
          id: 'pay_011',
          date: '2025-06-01',
          amount: 65000,
          property_id: 'prop_001',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202506001',
          due_date: '2025-06-01',
          notes: 'Monthly EMI payment - June 2025',
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
        {
          id: 'inv_003',
          invoice_number: 'INV-2024-003',
          date: '2024-11-01',
          due_date: '2024-11-15',
          amount: 45000,
          tax_amount: 8100,
          total_amount: 53100,
          status: 'overdue',
          property_id: 'prop_001',
          description: 'Monthly EMI Payment - November 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-003.pdf',
          late_fee: 2500,
          penalty_charges: 1000,
          days_overdue: 37,
          items: [
            {
              description: 'Principal Amount',
              quantity: 1,
              rate: 30000,
              amount: 30000,
            },
            {
              description: 'Interest Amount',
              quantity: 1,
              rate: 15000,
              amount: 15000,
            },
          ],
        },
        {
          id: 'inv_004',
          invoice_number: 'INV-2024-004',
          date: '2024-10-01',
          due_date: '2024-10-15',
          amount: 65000,
          tax_amount: 11700,
          total_amount: 76700,
          status: 'overdue',
          property_id: 'prop_001',
          description: 'Monthly EMI Payment - October 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-004.pdf',
          late_fee: 3500,
          penalty_charges: 1500,
          days_overdue: 68,
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
        {
          id: 'inv_005',
          invoice_number: 'INV-2024-005',
          date: '2024-09-01',
          due_date: '2024-09-15',
          amount: 25000,
          tax_amount: 4500,
          total_amount: 29500,
          status: 'overdue',
          property_id: 'prop_001',
          description: 'Maintenance Charges - September 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-005.pdf',
          late_fee: 1500,
          penalty_charges: 750,
          days_overdue: 98,
          items: [
            {
              description: 'Maintenance Fee',
              quantity: 1,
              rate: 25000,
              amount: 25000,
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
      messages: [
        {
          id: 'msg_001',
          sender_id: 'broker_001',
          sender_name: 'Amit Sharma',
          sender_type: 'broker',
          receiver_id: '3',
          receiver_name: 'Hritik',
          receiver_type: 'customer',
          message: 'Hello Hritik! Welcome to Godrej Splendour. I hope you are settling in well. Please let me know if you have any questions about your new home.',
          timestamp: '2024-12-20T09:00:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_001',
        },
        {
          id: 'msg_002',
          sender_id: '3',
          sender_name: 'Hritik',
          sender_type: 'customer',
          receiver_id: 'broker_001',
          receiver_name: 'Amit Sharma',
          receiver_type: 'broker',
          message: 'Hi Amit! Thank you for checking in. The apartment is wonderful. I do have a question about the maintenance charges - when are they typically due?',
          timestamp: '2024-12-20T09:15:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_001',
        },
        {
          id: 'msg_003',
          sender_id: 'broker_001',
          sender_name: 'Amit Sharma',
          sender_type: 'broker',
          receiver_id: '3',
          receiver_name: 'Hritik',
          receiver_type: 'customer',
          message: 'Maintenance charges are due on the 15th of every month. You should receive an invoice 5 days before the due date. I can share the maintenance schedule document with you.',
          timestamp: '2024-12-20T09:30:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_001',
        },
        {
          id: 'msg_004',
          sender_id: 'broker_001',
          sender_name: 'Amit Sharma',
          sender_type: 'broker',
          receiver_id: '3',
          receiver_name: 'Hritik',
          receiver_type: 'customer',
          message: 'Here is the maintenance schedule and amenities guide for Godrej Splendour.',
          timestamp: '2024-12-20T09:32:00Z',
          status: 'read',
          type: 'document',
          property_id: 'prop_001',
          attachment_url: '/documents/godrej_maintenance_guide.pdf',
          attachment_name: 'Godrej Splendour Maintenance Guide.pdf',
        },
        {
          id: 'msg_005',
          sender_id: '3',
          sender_name: 'Hritik',
          sender_type: 'customer',
          receiver_id: 'broker_001',
          receiver_name: 'Amit Sharma',
          receiver_type: 'broker',
          message: 'Perfect! Thank you for the document. One more thing - I noticed there are some overdue EMI payments showing in my account. Can you help me understand this?',
          timestamp: '2024-12-20T10:00:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_001',
        },
        {
          id: 'msg_006',
          sender_id: 'broker_001',
          sender_name: 'Amit Sharma',
          sender_type: 'broker',
          receiver_id: '3',
          receiver_name: 'Hritik',
          receiver_type: 'customer',
          message: 'I can see you have 3 overdue payments totaling ₹1,59,300 including late fees. Let me connect you with our finance team to discuss a payment plan. This is important to resolve quickly.',
          timestamp: '2024-12-20T10:15:00Z',
          status: 'read',
          type: 'payment_reminder',
          property_id: 'prop_001',
          is_important: true,
        },
        {
          id: 'msg_007',
          sender_id: '3',
          sender_name: 'Hritik',
          sender_type: 'customer',
          receiver_id: 'broker_001',
          receiver_name: 'Amit Sharma',
          receiver_type: 'broker',
          message: 'Yes, please connect me with the finance team. I want to clear these dues as soon as possible. Can we set up a meeting this week?',
          timestamp: '2024-12-20T10:30:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_001',
        },
        {
          id: 'msg_008',
          sender_id: 'broker_001',
          sender_name: 'Amit Sharma',
          sender_type: 'broker',
          receiver_id: '3',
          receiver_name: 'Hritik',
          receiver_type: 'customer',
          message: 'Absolutely! I have scheduled a call with our finance manager for tomorrow at 2 PM. You will receive a calendar invite shortly. They can help you with payment options and restructuring if needed.',
          timestamp: '2024-12-20T10:45:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_001',
        },
        {
          id: 'msg_009',
          sender_id: '3',
          sender_name: 'Hritik',
          sender_type: 'customer',
          receiver_id: 'broker_001',
          receiver_name: 'Amit Sharma',
          receiver_type: 'broker',
          message: 'Thank you so much for your help, Amit. You have been incredibly supportive throughout this process.',
          timestamp: '2024-12-20T11:00:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_001',
        },
        {
          id: 'msg_010',
          sender_id: 'broker_001',
          sender_name: 'Amit Sharma',
          sender_type: 'broker',
          receiver_id: '3',
          receiver_name: 'Hritik',
          receiver_type: 'customer',
          message: 'You are very welcome! That is what I am here for. Feel free to reach out anytime if you need assistance. Have a great day!',
          timestamp: '2024-12-20T11:15:00Z',
          status: 'delivered',
          type: 'text',
          property_id: 'prop_001',
        },
      ],
      payment_methods: [
        {
          id: 'pm_001',
          type: 'bank_account',
          name: 'HDFC Savings Account',
          details: {
            account_number: '****1234',
            ifsc_code: 'HDFC0001234',
            bank_name: 'HDFC Bank',
            account_holder_name: 'Hritik',
          },
          is_default: true,
          is_verified: true,
          added_date: '2023-06-15',
          last_used: '2024-12-01',
          status: 'active',
        },
        {
          id: 'pm_002',
          type: 'credit_card',
          name: 'HDFC Regalia Credit Card',
          details: {
            card_number: '****5678',
            card_holder_name: 'Hritik',
            expiry_month: '08',
            expiry_year: '2027',
            card_type: 'visa',
          },
          is_default: false,
          is_verified: true,
          added_date: '2023-08-20',
          last_used: '2024-11-15',
          status: 'active',
        },
        {
          id: 'pm_003',
          type: 'upi',
          name: 'PhonePe UPI',
          details: {
            upi_id: 'hritik@paytm',
          },
          is_default: false,
          is_verified: true,
          added_date: '2023-09-10',
          last_used: '2024-12-18',
          status: 'active',
        },
      ],
      receipts: [
        {
          id: 'rcpt_001',
          receipt_number: 'RCP202412001',
          transaction_id: 'txn_001',
          payment_id: 'pay_001',
          invoice_id: 'inv_001',
          amount: 65000,
          tax_amount: 11700,
          total_amount: 76700,
          date: '2024-12-01',
          description: 'Monthly EMI Payment - December 2024',
          payment_method: 'bank_transfer',
          property_id: 'prop_001',
          receipt_url: '/receipts/receipt_001.pdf',
          download_url: '/api/receipts/download/rcpt_001',
          generation_date: '2024-12-01T10:30:00Z',
          status: 'downloaded',
          customer_id: '3',
          customer_name: 'Hritik',
        },
        {
          id: 'rcpt_002',
          receipt_number: 'RCP202411001',
          transaction_id: 'txn_002',
          payment_id: 'pay_002',
          amount: 65000,
          tax_amount: 11700,
          total_amount: 76700,
          date: '2024-11-01',
          description: 'Monthly EMI Payment - November 2024',
          payment_method: 'bank_transfer',
          property_id: 'prop_001',
          receipt_url: '/receipts/receipt_002.pdf',
          download_url: '/api/receipts/download/rcpt_002',
          generation_date: '2024-11-01T10:30:00Z',
          status: 'downloaded',
          customer_id: '3',
          customer_name: 'Hritik',
        },
      ],
    },
  },
  {
    id: '4',
    name: 'Romit',
    email: 'romit@example.com',
    password: 'Customer@456', // In production, this would be hashed
    role: 'customer',
    created_at: '2023-04-20T00:00:00Z',
    updated_at: '2024-12-20T07:15:00Z',
    email_verified: true,
    phone: '+91 98765 67890',
    status: 'active',
    last_active: '2024-12-20T07:15:00Z',
    customer_data: {
      address: '456, Brigade Road, Bangalore, Karnataka 560025',
      date_of_birth: '1988-08-22',
      occupation: 'Marketing Manager',
      annual_income: 1500000,
      account_balance: 180000,
      credit_score: 780,
      kyc_status: 'verified',
      properties: [
        {
          id: 'prop_002',
          title: 'Prestige Lakeside Habitat',
          type: 'Villa',
          location: 'Whitefield, Bangalore',
          purchase_price: 12500000,
          current_value: 13800000,
          purchase_date: '2023-10-10',
          status: 'owned',
          plot_number: 'V-105',
          size: '2400 sq ft',
          broker_id: 'broker_002',
          broker_name: 'Rajesh Kumar',
        },
        {
          id: 'prop_003',
          title: 'Sobha City Plot',
          type: 'Plot',
          location: 'Thanisandra, Bangalore',
          purchase_price: 4500000,
          current_value: 5200000,
          purchase_date: '2024-02-15',
          status: 'under_construction',
          plot_number: 'P-45',
          size: '1800 sq ft',
          broker_id: 'broker_002',
          broker_name: 'Rajesh Kumar',
        },
      ],
      transactions: [
        {
          id: 'txn_004',
          date: '2024-12-01',
          description: 'EMI Payment - Prestige Lakeside',
          amount: 95000,
          type: 'debit',
          category: 'emi',
          status: 'completed',
          reference_number: 'EMI202412002',
          property_id: 'prop_002',
          payment_method: 'bank_transfer',
          receipt_url: '/receipts/emi_202412002.pdf',
        },
        {
          id: 'txn_005',
          date: '2024-11-15',
          description: 'Plot Development Fee - Sobha City',
          amount: 25000,
          type: 'debit',
          category: 'property_payment',
          status: 'completed',
          reference_number: 'DEV202411001',
          property_id: 'prop_003',
          payment_method: 'online',
          receipt_url: '/receipts/dev_202411001.pdf',
        },
        {
          id: 'txn_006',
          date: '2024-11-01',
          description: 'EMI Payment - Prestige Lakeside',
          amount: 95000,
          type: 'debit',
          category: 'emi',
          status: 'completed',
          reference_number: 'EMI202411002',
          property_id: 'prop_002',
          payment_method: 'bank_transfer',
          receipt_url: '/receipts/emi_202411002.pdf',
        },
        {
          id: 'txn_007',
          date: '2024-10-20',
          description: 'Property Registration Fee',
          amount: 15000,
          type: 'debit',
          category: 'property_payment',
          status: 'completed',
          reference_number: 'REG202410001',
          property_id: 'prop_003',
          payment_method: 'cheque',
        },
      ],
      payments: [
        {
          id: 'pay_003',
          date: '2024-12-01',
          amount: 95000,
          property_id: 'prop_002',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'completed',
          receipt_number: 'RCP202412002',
          receipt_url: '/receipts/payment_202412002.pdf',
          due_date: '2024-12-01',
          notes: 'Monthly EMI payment for villa',
        },
        {
          id: 'pay_004',
          date: '2024-11-15',
          amount: 25000,
          property_id: 'prop_003',
          payment_type: 'installment',
          payment_method: 'online',
          status: 'completed',
          receipt_number: 'RCP202411002',
          receipt_url: '/receipts/payment_202411002.pdf',
          due_date: '2024-11-15',
          notes: 'Plot development fee',
        },
        {
          id: 'pay_005',
          date: '2025-01-01',
          amount: 95000,
          property_id: 'prop_002',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202501001',
          due_date: '2025-01-01',
          notes: 'Upcoming EMI payment',
        },
        // Additional upcoming payments
        {
          id: 'pay_012',
          date: '2025-02-01',
          amount: 95000,
          property_id: 'prop_002',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202502002',
          due_date: '2025-02-01',
          notes: 'Monthly EMI payment - February 2025',
        },
        {
          id: 'pay_013',
          date: '2025-03-01',
          amount: 95000,
          property_id: 'prop_002',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202503002',
          due_date: '2025-03-01',
          notes: 'Monthly EMI payment - March 2025',
        },
        {
          id: 'pay_014',
          date: '2025-04-15',
          amount: 35000,
          property_id: 'prop_003',
          payment_type: 'installment',
          payment_method: 'online',
          status: 'pending',
          receipt_number: 'RCP202504002',
          due_date: '2025-04-15',
          notes: 'Plot development fee - April 2025',
        },
        {
          id: 'pay_015',
          date: '2025-05-01',
          amount: 95000,
          property_id: 'prop_002',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202505002',
          due_date: '2025-05-01',
          notes: 'Monthly EMI payment - May 2025',
        },
        {
          id: 'pay_016',
          date: '2025-06-01',
          amount: 95000,
          property_id: 'prop_002',
          payment_type: 'installment',
          payment_method: 'bank_transfer',
          status: 'pending',
          receipt_number: 'RCP202506002',
          due_date: '2025-06-01',
          notes: 'Monthly EMI payment - June 2025',
        },
      ],
      invoices: [
        {
          id: 'inv_002',
          invoice_number: 'INV-2024-002',
          date: '2024-12-01',
          due_date: '2024-12-15',
          amount: 95000,
          tax_amount: 17100,
          total_amount: 112100,
          status: 'paid',
          property_id: 'prop_002',
          description: 'Monthly EMI Payment - December 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-002.pdf',
          items: [
            {
              description: 'Principal Amount',
              quantity: 1,
              rate: 65000,
              amount: 65000,
            },
            {
              description: 'Interest Amount',
              quantity: 1,
              rate: 30000,
              amount: 30000,
            },
          ],
        },
        {
          id: 'inv_003',
          invoice_number: 'INV-2024-003',
          date: '2024-11-15',
          due_date: '2024-11-30',
          amount: 25000,
          tax_amount: 4500,
          total_amount: 29500,
          status: 'paid',
          property_id: 'prop_003',
          description: 'Plot Development Fee - November 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-003.pdf',
          items: [
            {
              description: 'Development Fee',
              quantity: 1,
              rate: 25000,
              amount: 25000,
            },
          ],
        },
        {
          id: 'inv_006',
          invoice_number: 'INV-2024-006',
          date: '2024-10-01',
          due_date: '2024-10-15',
          amount: 75000,
          tax_amount: 13500,
          total_amount: 88500,
          status: 'overdue',
          property_id: 'prop_002',
          description: 'Monthly EMI Payment - October 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-006.pdf',
          late_fee: 4000,
          penalty_charges: 2000,
          days_overdue: 68,
          items: [
            {
              description: 'Principal Amount',
              quantity: 1,
              rate: 50000,
              amount: 50000,
            },
            {
              description: 'Interest Amount',
              quantity: 1,
              rate: 25000,
              amount: 25000,
            },
          ],
        },
        {
          id: 'inv_007',
          invoice_number: 'INV-2024-007',
          date: '2024-09-01',
          due_date: '2024-09-15',
          amount: 35000,
          tax_amount: 6300,
          total_amount: 41300,
          status: 'overdue',
          property_id: 'prop_003',
          description: 'Plot Development Fee - September 2024',
          payment_terms: 'Net 15 days',
          invoice_url: '/invoices/INV-2024-007.pdf',
          late_fee: 2000,
          penalty_charges: 1000,
          days_overdue: 98,
          items: [
            {
              description: 'Development Fee',
              quantity: 1,
              rate: 35000,
              amount: 35000,
            },
          ],
        },
      ],
      emi_details: [
        {
          id: 'emi_002',
          property_id: 'prop_002',
          loan_amount: 10000000,
          interest_rate: 9.0,
          tenure_months: 240,
          monthly_emi: 95000,
          remaining_amount: 9500000,
          next_due_date: '2025-01-01',
          installments_paid: 3,
          installments_remaining: 237,
          status: 'active',
          bank_name: 'ICICI Bank',
          loan_account_number: 'HL987654321',
          start_date: '2023-10-01',
          end_date: '2043-09-30',
        },
      ],
      documents: [
        {
          id: 'doc_004',
          name: 'Aadhar Card',
          type: 'aadhar',
          url: '/documents/aadhar_romit.pdf',
          upload_date: '2023-04-20',
          verification_status: 'verified',
          file_size: 1024000,
          mime_type: 'application/pdf',
        },
        {
          id: 'doc_005',
          name: 'PAN Card',
          type: 'pan',
          url: '/documents/pan_romit.pdf',
          upload_date: '2023-04-20',
          verification_status: 'verified',
          file_size: 512000,
          mime_type: 'application/pdf',
        },
        {
          id: 'doc_006',
          name: 'Villa Agreement',
          type: 'property_papers',
          url: '/documents/villa_agreement_romit.pdf',
          upload_date: '2023-10-10',
          verification_status: 'verified',
          file_size: 3072000,
          mime_type: 'application/pdf',
        },
        {
          id: 'doc_007',
          name: 'Plot Agreement',
          type: 'property_papers',
          url: '/documents/plot_agreement_romit.pdf',
          upload_date: '2024-02-15',
          verification_status: 'verified',
          file_size: 2048000,
          mime_type: 'application/pdf',
        },
        {
          id: 'doc_008',
          name: 'Income Certificate',
          type: 'income_proof',
          url: '/documents/income_romit.pdf',
          upload_date: '2023-04-20',
          verification_status: 'verified',
          file_size: 1536000,
          mime_type: 'application/pdf',
        },
      ],
      messages: [
        {
          id: 'msg_011',
          sender_id: 'broker_002',
          sender_name: 'Rajesh Kumar',
          sender_type: 'broker',
          receiver_id: '4',
          receiver_name: 'Romit',
          receiver_type: 'customer',
          message: 'Hi Romit! Congratulations on your villa purchase at Prestige Lakeside Habitat. How are you finding the new place?',
          timestamp: '2024-12-21T10:00:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_002',
        },
        {
          id: 'msg_012',
          sender_id: '4',
          sender_name: 'Romit',
          sender_type: 'customer',
          receiver_id: 'broker_002',
          receiver_name: 'Rajesh Kumar',
          receiver_type: 'broker',
          message: 'Hi Rajesh! The villa is absolutely beautiful. We are loving the space and the amenities. Thank you for helping us find this perfect home.',
          timestamp: '2024-12-21T10:30:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_002',
        },
        {
          id: 'msg_013',
          sender_id: 'broker_002',
          sender_name: 'Rajesh Kumar',
          sender_type: 'broker',
          receiver_id: '4',
          receiver_name: 'Romit',
          receiver_type: 'customer',
          message: 'That is wonderful to hear! I also wanted to update you on the Sobha City plot development. The construction is progressing well and should be ready for handover by mid-2025.',
          timestamp: '2024-12-21T11:00:00Z',
          status: 'read',
          type: 'property_update',
          property_id: 'prop_003',
        },
        {
          id: 'msg_014',
          sender_id: '4',
          sender_name: 'Romit',
          sender_type: 'customer',
          receiver_id: 'broker_002',
          receiver_name: 'Rajesh Kumar',
          receiver_type: 'broker',
          message: 'Great news! Can you send me the latest construction photos and timeline? Also, I noticed some overdue payments in my account. Could you help me understand what needs to be cleared?',
          timestamp: '2024-12-21T11:15:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_003',
        },
        {
          id: 'msg_015',
          sender_id: 'broker_002',
          sender_name: 'Rajesh Kumar',
          sender_type: 'broker',
          receiver_id: '4',
          receiver_name: 'Romit',
          receiver_type: 'customer',
          message: 'I will share the construction photos shortly. Regarding the overdue payments, you have 2 pending invoices totaling ₹1,29,800 including late fees. Let me schedule a call with our accounts team.',
          timestamp: '2024-12-21T11:30:00Z',
          status: 'read',
          type: 'payment_reminder',
          property_id: 'prop_002',
          is_important: true,
        },
        {
          id: 'msg_016',
          sender_id: 'broker_002',
          sender_name: 'Rajesh Kumar',
          sender_type: 'broker',
          receiver_id: '4',
          receiver_name: 'Romit',
          receiver_type: 'customer',
          message: 'Here are the latest construction photos from Sobha City. The infrastructure work is nearly complete!',
          timestamp: '2024-12-21T11:45:00Z',
          status: 'read',
          type: 'image',
          property_id: 'prop_003',
          attachment_url: '/images/sobha_city_construction_dec2024.jpg',
          attachment_name: 'Sobha City Construction Progress - December 2024',
        },
        {
          id: 'msg_017',
          sender_id: '4',
          sender_name: 'Romit',
          sender_type: 'customer',
          receiver_id: 'broker_002',
          receiver_name: 'Rajesh Kumar',
          receiver_type: 'broker',
          message: 'Wow! The progress looks amazing. I am excited to see the final result. Please schedule the call with accounts team for this week. I want to clear all pending dues.',
          timestamp: '2024-12-21T12:00:00Z',
          status: 'read',
          type: 'text',
          property_id: 'prop_003',
        },
        {
          id: 'msg_018',
          sender_id: 'broker_002',
          sender_name: 'Rajesh Kumar',
          sender_type: 'broker',
          receiver_id: '4',
          receiver_name: 'Romit',
          receiver_type: 'customer',
          message: 'Perfect! I have scheduled a call for Thursday at 3 PM with our senior accounts manager. They will help you with payment options and any restructuring if needed.',
          timestamp: '2024-12-21T12:15:00Z',
          status: 'delivered',
          type: 'text',
          property_id: 'prop_002',
        },
      ],
      payment_methods: [
        {
          id: 'pm_004',
          type: 'bank_account',
          name: 'ICICI Salary Account',
          details: {
            account_number: '****9876',
            ifsc_code: 'ICIC0009876',
            bank_name: 'ICICI Bank',
            account_holder_name: 'Romit',
          },
          is_default: true,
          is_verified: true,
          added_date: '2023-04-20',
          last_used: '2024-12-01',
          status: 'active',
        },
        {
          id: 'pm_005',
          type: 'credit_card',
          name: 'ICICI Amazon Pay Credit Card',
          details: {
            card_number: '****3456',
            card_holder_name: 'Romit',
            expiry_month: '12',
            expiry_year: '2026',
            card_type: 'visa',
          },
          is_default: false,
          is_verified: true,
          added_date: '2023-06-10',
          last_used: '2024-11-20',
          status: 'active',
        },
        {
          id: 'pm_006',
          type: 'upi',
          name: 'Google Pay UPI',
          details: {
            upi_id: 'romit@oksbi',
          },
          is_default: false,
          is_verified: true,
          added_date: '2023-05-15',
          last_used: '2024-12-19',
          status: 'active',
        },
      ],
      receipts: [
        {
          id: 'rcpt_003',
          receipt_number: 'RCP202412002',
          transaction_id: 'txn_004',
          payment_id: 'pay_003',
          invoice_id: 'inv_002',
          amount: 95000,
          tax_amount: 17100,
          total_amount: 112100,
          date: '2024-12-01',
          description: 'Monthly EMI Payment - December 2024',
          payment_method: 'bank_transfer',
          property_id: 'prop_002',
          receipt_url: '/receipts/receipt_003.pdf',
          download_url: '/api/receipts/download/rcpt_003',
          generation_date: '2024-12-01T11:00:00Z',
          status: 'downloaded',
          customer_id: '4',
          customer_name: 'Romit',
        },
        {
          id: 'rcpt_004',
          receipt_number: 'RCP202411002',
          transaction_id: 'txn_005',
          payment_id: 'pay_004',
          invoice_id: 'inv_003',
          amount: 25000,
          tax_amount: 4500,
          total_amount: 29500,
          date: '2024-11-15',
          description: 'Plot Development Fee - November 2024',
          payment_method: 'online',
          property_id: 'prop_003',
          receipt_url: '/receipts/receipt_004.pdf',
          download_url: '/api/receipts/download/rcpt_004',
          generation_date: '2024-11-15T14:30:00Z',
          status: 'downloaded',
          customer_id: '4',
          customer_name: 'Romit',
        },
      ],
    },
  },
];

// Enhanced Broker Information
export const MOCK_BROKERS: BrokerInfo[] = [
  {
    id: 'broker_001',
    name: 'Amit Sharma',
    email: 'amit.sharma@indusun.com',
    phone: '+91 98765 11111',
    profile_picture: '/brokers/amit_sharma.jpg',
    specialization: ['Residential', 'Luxury Apartments', 'Investment Properties'],
    experience_years: 8,
    rating: 4.7,
    total_reviews: 156,
    office_address: 'Office 301, Brigade Road, Bangalore, Karnataka 560025',
    license_number: 'RERA/KA/2016/001234',
    languages: ['English', 'Hindi', 'Kannada'],
    areas_covered: ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City'],
    properties_sold: 89,
    total_sales_value: 450000000,
    certifications: ['RERA Certified', 'Real Estate Excellence Award 2023'],
    about: 'Experienced real estate professional specializing in premium residential properties in Bangalore. Known for transparent dealings and excellent customer service.',
    working_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    response_time: 'Within 2 hours',
    commission_rate: 2.5,
    status: 'active',
    joined_date: '2016-03-15',
    last_active: '2024-12-22T10:30:00Z',
  },
  {
    id: 'broker_002',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@indusun.com',
    phone: '+91 98765 22222',
    profile_picture: '/brokers/rajesh_kumar.jpg',
    specialization: ['Villas', 'Plots', 'Commercial Properties'],
    experience_years: 12,
    rating: 4.9,
    total_reviews: 203,
    office_address: 'Suite 205, MG Road, Bangalore, Karnataka 560001',
    license_number: 'RERA/KA/2012/005678',
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    areas_covered: ['Whitefield', 'Thanisandra', 'Hebbal', 'Yelahanka'],
    properties_sold: 134,
    total_sales_value: 780000000,
    certifications: ['RERA Certified', 'Top Performer 2022', 'Customer Choice Award 2023'],
    about: 'Senior real estate consultant with over a decade of experience in luxury villas and premium plots. Specializes in North Bangalore properties.',
    working_hours: 'Mon-Sun: 8:00 AM - 8:00 PM',
    response_time: 'Within 1 hour',
    commission_rate: 2.0,
    status: 'active',
    joined_date: '2012-08-20',
    last_active: '2024-12-22T09:15:00Z',
  },
  {
    id: 'broker_003',
    name: 'Priya Reddy',
    email: 'priya.reddy@indusun.com',
    phone: '+91 98765 33333',
    profile_picture: '/brokers/priya_reddy.jpg',
    specialization: ['First-time Buyers', 'Affordable Housing', 'Investment Guidance'],
    experience_years: 5,
    rating: 4.6,
    total_reviews: 98,
    office_address: 'Floor 2, Jayanagar 4th Block, Bangalore, Karnataka 560011',
    license_number: 'RERA/KA/2019/009876',
    languages: ['English', 'Hindi', 'Kannada', 'Telugu'],
    areas_covered: ['Jayanagar', 'BTM Layout', 'Banashankari', 'JP Nagar'],
    properties_sold: 67,
    total_sales_value: 280000000,
    certifications: ['RERA Certified', 'Rising Star Award 2023'],
    about: 'Dedicated to helping first-time home buyers navigate the real estate market. Known for patient guidance and honest advice.',
    working_hours: 'Mon-Sat: 10:00 AM - 6:00 PM',
    response_time: 'Within 3 hours',
    commission_rate: 2.2,
    status: 'active',
    joined_date: '2019-01-10',
    last_active: '2024-12-22T08:45:00Z',
  },
];

// Helper functions
export const findUserByEmail = (email: string): CustomerUser | null => {
  return MOCK_CUSTOMER_USERS.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const findUserByPhone = (phone: string): CustomerUser | null => {
  return MOCK_CUSTOMER_USERS.find(user => user.phone === phone) || null;
};

export const getBrokerById = (brokerId: string): BrokerInfo | null => {
  return MOCK_BROKERS.find(broker => broker.id === brokerId) || null;
};

export const getBrokerByName = (brokerName: string): BrokerInfo | null => {
  return MOCK_BROKERS.find(broker => broker.name === brokerName) || null;
};

export const getCustomerMessages = (customerId: string): MessageRecord[] => {
  const customer = getCustomerById(customerId);
  return customer?.customer_data?.messages || [];
};

export const getCustomerPaymentMethods = (customerId: string): PaymentMethod[] => {
  const customer = getCustomerById(customerId);
  return customer?.customer_data?.payment_methods || [];
};

export const getCustomerReceipts = (customerId: string): ReceiptRecord[] => {
  const customer = getCustomerById(customerId);
  return customer?.customer_data?.receipts || [];
};

export const getOverdueInvoices = (customerId: string): InvoiceRecord[] => {
  const customer = getCustomerById(customerId);
  if (!customer?.customer_data) return [];

  return customer.customer_data.invoices.filter(invoice => invoice.status === 'overdue');
};

export const getUpcomingPayments = (customerId: string, limit: number = 6): PaymentRecord[] => {
  const customer = getCustomerById(customerId);
  if (!customer?.customer_data) return [];

  return customer.customer_data.payments
    .filter(payment => payment.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, limit);
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
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

export interface CustomerAuthResponse {
  success: boolean;
  user?: CustomerUser;
  token?: string;
  message?: string;
}

// Mock authentication function for customer login
export const authenticateCustomer = async (credentials: CustomerLoginCredentials): Promise<CustomerAuthResponse> => {
  const { email, phone, password, otp } = credentials;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let user: CustomerUser | null = null;

  // Determine authentication method
  if (phone && otp) {
    // Phone + OTP authentication
    user = findUserByPhone(phone);
    if (!user) {
      return {
        success: false,
        message: 'No account found with this phone number'
      };
    }

    // In a real implementation, OTP would be verified here
    // For mock purposes, we'll accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return {
        success: false,
        message: 'Invalid OTP format'
      };
    }
  } else if (email && password) {
    // Email + Password authentication
    user = findUserByEmail(email);
    if (!user) {
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
  } else {
    return {
      success: false,
      message: 'Invalid authentication method'
    };
  }

  // Check if user exists and is a customer or broker
  if (!user || (user.role !== 'customer' && user.role !== 'broker')) {
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

  // Calculate overdue amount from overdue invoices
  const overdueAmount = customer_data.invoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => {
      const baseAmount = invoice.total_amount;
      const lateFee = invoice.late_fee || 0;
      const penaltyCharges = invoice.penalty_charges || 0;
      return sum + baseAmount + lateFee + penaltyCharges;
    }, 0);

  // Get upcoming payments (next 6 months)
  const upcomingPayments = customer_data.payments
    .filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 6);

  // Get recent transactions (last 10)
  const recentTransactions = customer_data.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    totalProperties: customer_data.properties.length,
    totalInvestment,
    currentValue,
    monthlyEMI,
    nextPaymentDue: customer_data.emi_details[0]?.next_due_date || '',
    recentTransactions,
    upcomingPayments,
    accountSummary: {
      totalPaid,
      remainingAmount,
      completionPercentage: Math.round(completionPercentage),
      nextEMIDate: customer_data.emi_details[0]?.next_due_date || '',
      nextEMIAmount: customer_data.emi_details[0]?.monthly_emi || 0,
      overdueAmount
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
