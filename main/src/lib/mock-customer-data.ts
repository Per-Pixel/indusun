// Mock customer data for Hritik and Romit accounts

export interface Property {
  id: string;
  name: string;
  type: 'apartment' | 'villa' | 'plot';
  location: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  purchaseDate: string;
  possessionDate: string;
  status: 'active' | 'completed' | 'pending';
  documents: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'overdue' | 'pending';
  description: string;
  propertyId: string;
  lineItems: {
    description: string;
    amount: number;
    tax?: number;
  }[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'bank_transfer' | 'cheque' | 'cash' | 'online';
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface EMISchedule {
  id: string;
  propertyId: string;
  emiNumber: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: Property[];
  invoices: Invoice[];
  payments: Payment[];
  emiSchedule: EMISchedule[];
  totalPaid: number;
  totalOutstanding: number;
  brokerId: string;
  brokerName: string;
  brokerPhone: string;
  brokerEmail: string;
}

// Mock data for Hritik
export const hritikData: CustomerData = {
  id: '1',
  name: 'Hritik',
  email: 'hritik@example.com',
  phone: '+91 98765 12345',
  totalPaid: 2850000,
  totalOutstanding: 450000,
  brokerId: 'broker_1',
  brokerName: 'Arshir Patel',
  brokerPhone: '+91 98765 43210',
  brokerEmail: 'arshir.p@indusun.com',
  properties: [
    {
      id: 'prop_1',
      name: 'Godrej Splendour Apartment',
      type: 'apartment',
      location: 'Whitefield, Bangalore',
      totalAmount: 3300000,
      paidAmount: 2850000,
      remainingAmount: 450000,
      purchaseDate: '2023-06-15',
      possessionDate: '2025-12-31',
      status: 'active',
      documents: ['Sale Agreement', 'Payment Receipt', 'Property Card', 'Loan Approval']
    }
  ],
  invoices: [
    {
      id: 'inv_1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      amount: 75000,
      status: 'paid',
      description: 'EMI Payment - January 2024',
      propertyId: 'prop_1',
      lineItems: [
        { description: 'Principal Amount', amount: 65000 },
        { description: 'Interest', amount: 8500 },
        { description: 'Processing Fee', amount: 1500 }
      ]
    },
    {
      id: 'inv_2',
      invoiceNumber: 'INV-2024-002',
      date: '2024-02-15',
      dueDate: '2024-03-15',
      amount: 75000,
      status: 'overdue',
      description: 'EMI Payment - February 2024',
      propertyId: 'prop_1',
      lineItems: [
        { description: 'Principal Amount', amount: 65000 },
        { description: 'Interest', amount: 8500 },
        { description: 'Late Fee', amount: 1500 }
      ]
    },
    {
      id: 'inv_3',
      invoiceNumber: 'INV-2024-003',
      date: '2024-03-15',
      dueDate: '2024-04-15',
      amount: 75000,
      status: 'overdue',
      description: 'EMI Payment - March 2024',
      propertyId: 'prop_1',
      lineItems: [
        { description: 'Principal Amount', amount: 65000 },
        { description: 'Interest', amount: 8500 },
        { description: 'Late Fee', amount: 1500 }
      ]
    }
  ],
  payments: [
    {
      id: 'pay_1',
      invoiceId: 'inv_1',
      amount: 75000,
      date: '2024-01-20',
      method: 'bank_transfer',
      transactionId: 'TXN123456789',
      status: 'completed'
    }
  ],
  emiSchedule: [
    {
      id: 'emi_1',
      propertyId: 'prop_1',
      emiNumber: 1,
      dueDate: '2024-01-15',
      amount: 75000,
      principal: 65000,
      interest: 10000,
      status: 'paid',
      paidDate: '2024-01-20'
    },
    {
      id: 'emi_2',
      propertyId: 'prop_1',
      emiNumber: 2,
      dueDate: '2024-02-15',
      amount: 75000,
      principal: 65500,
      interest: 9500,
      status: 'overdue'
    },
    {
      id: 'emi_3',
      propertyId: 'prop_1',
      emiNumber: 3,
      dueDate: '2024-03-15',
      amount: 75000,
      principal: 66000,
      interest: 9000,
      status: 'overdue'
    },
    {
      id: 'emi_4',
      propertyId: 'prop_1',
      emiNumber: 4,
      dueDate: '2024-04-15',
      amount: 75000,
      principal: 66500,
      interest: 8500,
      status: 'pending'
    }
  ]
};

// Mock data for Romit
export const romitData: CustomerData = {
  id: '2',
  name: 'Romit',
  email: 'romit@example.com',
  phone: '+91 87654 32109',
  totalPaid: 4200000,
  totalOutstanding: 800000,
  brokerId: 'broker_2',
  brokerName: 'Priya Sharma',
  brokerPhone: '+91 87654 32109',
  brokerEmail: 'priya.s@indusun.com',
  properties: [
    {
      id: 'prop_2',
      name: 'Prestige Lakeside Villa',
      type: 'villa',
      location: 'Sarjapur Road, Bangalore',
      totalAmount: 4500000,
      paidAmount: 3800000,
      remainingAmount: 700000,
      purchaseDate: '2023-08-20',
      possessionDate: '2026-06-30',
      status: 'active',
      documents: ['Sale Agreement', 'Payment Receipt', 'Approved Plan', 'NOC Certificate']
    },
    {
      id: 'prop_3',
      name: 'Sobha City Plot',
      type: 'plot',
      location: 'Thanisandra, Bangalore',
      totalAmount: 500000,
      paidAmount: 400000,
      remainingAmount: 100000,
      purchaseDate: '2023-10-10',
      possessionDate: '2024-12-31',
      status: 'active',
      documents: ['Sale Agreement', 'Payment Receipt', 'Survey Settlement', 'Khata Certificate']
    }
  ],
  invoices: [
    {
      id: 'inv_4',
      invoiceNumber: 'INV-2024-004',
      date: '2024-01-20',
      dueDate: '2024-02-20',
      amount: 95000,
      status: 'paid',
      description: 'Villa EMI Payment - January 2024',
      propertyId: 'prop_2',
      lineItems: [
        { description: 'Principal Amount', amount: 80000 },
        { description: 'Interest', amount: 12000 },
        { description: 'Insurance Premium', amount: 3000 }
      ]
    },
    {
      id: 'inv_5',
      invoiceNumber: 'INV-2024-005',
      date: '2024-02-20',
      dueDate: '2024-03-20',
      amount: 95000,
      status: 'overdue',
      description: 'Villa EMI Payment - February 2024',
      propertyId: 'prop_2',
      lineItems: [
        { description: 'Principal Amount', amount: 80000 },
        { description: 'Interest', amount: 12000 },
        { description: 'Late Fee', amount: 3000 }
      ]
    }
  ],
  payments: [
    {
      id: 'pay_2',
      invoiceId: 'inv_4',
      amount: 95000,
      date: '2024-01-25',
      method: 'online',
      transactionId: 'TXN987654321',
      status: 'completed'
    }
  ],
  emiSchedule: [
    {
      id: 'emi_5',
      propertyId: 'prop_2',
      emiNumber: 1,
      dueDate: '2024-01-20',
      amount: 95000,
      principal: 80000,
      interest: 15000,
      status: 'paid',
      paidDate: '2024-01-25'
    },
    {
      id: 'emi_6',
      propertyId: 'prop_2',
      emiNumber: 2,
      dueDate: '2024-02-20',
      amount: 95000,
      principal: 81000,
      interest: 14000,
      status: 'overdue'
    }
  ]
};

export function getCustomerData(email: string): CustomerData | null {
  switch (email) {
    case 'hritik@example.com':
      return hritikData;
    case 'romit@example.com':
      return romitData;
    default:
      return null;
  }
}
