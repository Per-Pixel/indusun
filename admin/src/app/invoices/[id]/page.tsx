'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Share2,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';

// Types for invoices (same as in the listing page)
interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string | null;
  dueDate: string | null;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  client: {
    name: string;
    type: 'Individual' | 'Company';
    id: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  property?: {
    id: string;
    title: string;
  };
  generatedBy: 'System' | 'Admin' | 'Broker';
  generatorName?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }[];
}

// Mock data for invoices (same as in the listing page)
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    date: '2023-12-15',
    dueDate: '2023-12-30',
    amount: '₹1.5 Cr',
    status: 'Paid',
    client: {
      name: 'Priya Patel',
      type: 'Individual',
      id: 'c1',
      address: '123 Main Street, Whitefield, Bangalore - 560066',
      email: 'priya.patel@example.com',
      phone: '+91 98765 12345'
    },
    property: {
      id: '1',
      title: 'Luxury Villa in Whitefield'
    },
    generatedBy: 'System',
    items: [
      {
        description: 'Property Purchase - Luxury Villa in Whitefield',
        quantity: 1,
        unitPrice: '₹1.5 Cr',
        total: '₹1.5 Cr'
      }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    date: '2023-12-10',
    dueDate: '2023-12-25',
    amount: '₹14 Lakhs',
    status: 'Paid',
    client: {
      name: 'Amit Kumar',
      type: 'Individual',
      id: 'b2',
      address: '456 Broker Street, Koramangala, Bangalore - 560034',
      email: 'amit.kumar@example.com',
      phone: '+91 98765 54321'
    },
    generatedBy: 'Admin',
    generatorName: 'Rajesh Admin',
    items: [
      {
        description: 'Broker Commission - Commercial Space Sale',
        quantity: 1,
        unitPrice: '₹14 Lakhs',
        total: '₹14 Lakhs'
      }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-2023-003',
    date: '2023-12-05',
    dueDate: '2023-12-20',
    amount: '₹25,000',
    status: 'Paid',
    client: {
      name: 'TechSoft Solutions',
      type: 'Company',
      id: 'c3',
      address: '789 Tech Park, Electronic City, Bangalore - 560100',
      email: 'accounts@techsoft.com',
      phone: '+91 80 4567 8901'
    },
    generatedBy: 'Broker',
    generatorName: 'Neha Gupta',
    items: [
      {
        description: 'Property Valuation Service',
        quantity: 1,
        unitPrice: '₹25,000',
        total: '₹25,000'
      }
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-2023-004',
    date: '2023-12-01',
    dueDate: '2023-12-16',
    amount: '₹3.5 Lakhs',
    status: 'Paid',
    client: {
      name: 'Global Systems Ltd',
      type: 'Company',
      id: 'c4',
      address: '101 Business Center, Central Business District, Bangalore - 560001',
      email: 'finance@globalsystems.com',
      phone: '+91 80 2345 6789'
    },
    property: {
      id: '5',
      title: 'Office Space in Central Business District'
    },
    generatedBy: 'System',
    items: [
      {
        description: 'Monthly Rental - Office Space in CBD',
        quantity: 1,
        unitPrice: '₹3.5 Lakhs',
        total: '₹3.5 Lakhs'
      }
    ]
  },
  {
    id: '5',
    invoiceNumber: 'INV-2023-005',
    date: '2023-11-28',
    dueDate: '2023-12-13',
    amount: '₹85 Lakhs',
    status: 'Pending',
    client: {
      name: 'Ananya Reddy',
      type: 'Individual',
      id: 'c5',
      address: '234 Residential Layout, Sarjapur, Bangalore - 560035',
      email: 'ananya.reddy@example.com',
      phone: '+91 98765 67890'
    },
    property: {
      id: '3',
      title: 'Residential Plot in Sarjapur'
    },
    generatedBy: 'Admin',
    generatorName: 'Rajesh Admin',
    items: [
      {
        description: 'Property Purchase - Residential Plot in Sarjapur',
        quantity: 1,
        unitPrice: '₹85 Lakhs',
        total: '₹85 Lakhs'
      }
    ]
  },
  {
    id: '6',
    invoiceNumber: 'INV-2023-006',
    date: '2023-11-25',
    dueDate: '2023-12-10',
    amount: '₹7.5 Lakhs',
    status: 'Overdue',
    client: {
      name: 'Rahul Sharma',
      type: 'Individual',
      id: 'b1',
      address: '567 Broker Colony, Indiranagar, Bangalore - 560038',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 09876'
    },
    generatedBy: 'Broker',
    generatorName: 'Suresh Menon',
    items: [
      {
        description: 'Broker Commission - Villa Sale',
        quantity: 1,
        unitPrice: '₹7.5 Lakhs',
        total: '₹7.5 Lakhs'
      }
    ]
  },
  {
    id: '7',
    invoiceNumber: 'INV-2023-007',
    date: '2023-11-20',
    dueDate: '2023-12-05',
    amount: '₹15,000',
    status: 'Paid',
    client: {
      name: 'Vikram Singh',
      type: 'Individual',
      id: 'c2',
      address: '890 Client Road, HSR Layout, Bangalore - 560102',
      email: 'vikram.singh@example.com',
      phone: '+91 98765 23456'
    },
    generatedBy: 'System',
    items: [
      {
        description: 'Property Documentation Service',
        quantity: 1,
        unitPrice: '₹15,000',
        total: '₹15,000'
      }
    ]
  },
  {
    id: '8',
    invoiceNumber: 'INV-2023-008',
    date: '2023-11-15',
    dueDate: '2023-11-30',
    amount: '₹2.8 Lakhs',
    status: 'Overdue',
    client: {
      name: 'Fashion Trends Ltd',
      type: 'Company',
      id: 'c8',
      address: '321 Shopping Mall, Commercial Complex, Bangalore - 560043',
      email: 'accounts@fashiontrends.com',
      phone: '+91 80 8765 4321'
    },
    property: {
      id: '8',
      title: 'Retail Space in Commercial Complex'
    },
    generatedBy: 'Admin',
    generatorName: 'Rajesh Admin',
    items: [
      {
        description: 'Monthly Rental - Retail Space',
        quantity: 1,
        unitPrice: '₹2.8 Lakhs',
        total: '₹2.8 Lakhs'
      }
    ]
  },
];

const getStatusColor = (status: Invoice['status']) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Invoice['status']) => {
  switch (status) {
    case 'Paid':
      return <CheckCircle size={16} className="mr-1" />;
    case 'Pending':
      return <Clock size={16} className="mr-1" />;
    case 'Overdue':
      return <AlertCircle size={16} className="mr-1" />;
    default:
      return null;
  }
};

const getGeneratorIcon = (generator: Invoice['generatedBy'], extraClasses = '') => {
  switch (generator) {
    case 'System':
      return <Building size={16} className={`mr-1 ${extraClasses}`} />;
    case 'Admin':
      return <User size={16} className={`mr-1 ${extraClasses}`} />;
    case 'Broker':
      return <Users size={16} className={`mr-1 ${extraClasses}`} />;
    default:
      return null;
  }
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invoices/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 404 ? 'Invoice not found' : `HTTP ${r.status}`)))
      .then(data => {
        if (cancelled) return;
        const inv = data.invoice;
        setInvoice(inv);
      })
      .catch((e: any) => { if (!cancelled) setFetchError(e.message || 'Failed to load invoice'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading invoice…</p>
        </div>
      </CRMLayout>
    );
  }

  if (fetchError || !invoice) {
    return (
      <CRMLayout>
        <div className="page-container">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Invoice Not Found</h1>
            {fetchError && <p className="text-sm text-gray-500 mb-2">{fetchError}</p>}
            <button onClick={() => router.push('/invoices')} className="btn btn-primary btn-sm">Back to Invoices</button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <style>{`
        @media print {
          body > * { visibility: hidden !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; padding: 24px !important; background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="page-container">
        <div className="max-w-7xl mx-auto">
            {/* Back Button and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 no-print">
              <div>
                <button
                  onClick={() => router.push('/invoices')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2 md:mb-0"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span>Back to Invoices</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Printer size={16} />
                  <span>Print</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Mail size={16} />
                  <span>Email</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <div id="invoice-print-area">
            {/* Invoice Content */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Invoice Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <FileText size={20} className="text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium">Invoice Details</h2>
                    </div>
                    <div className="flex items-center mt-4">
                      {/* Status text */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Invoice Date</p>
                      <div className="flex items-center mt-1">
                        <Calendar size={16} className="text-gray-400 mr-1" />
                        {/* Date values */}
                        <p className="text-sm font-medium text-gray-900">{invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <div className="flex items-center mt-1">
                        <Calendar size={16} className="text-gray-400 mr-1" />
                        {/* Date values */}
                        <p className="text-sm font-medium text-gray-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Invoice Number</p>
                      {/* Invoice number */}
                      <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Generated By</p>
                      {/* Generator info */}
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {getGeneratorIcon(invoice.generatedBy, 'text-gray-700')}
                        <span className="ml-1">{invoice.generatedBy} {invoice.generatorName ? `(${invoice.generatorName})` : ''}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client and Property Info */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Info */}
                  <div>
                    <div className="flex items-center mb-3">
                      <User size={18} className="text-gray-500 mr-2" />
                      <h3 className="font-medium">Client Information</h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      {/* Client details */}
                      <p className="font-medium text-gray-900">{invoice.client.name}</p>
                      <p className="text-sm text-gray-800">{invoice.client.type}</p>
                      {invoice.client.address && (
                        <p className="text-sm text-gray-800 mt-2">{invoice.client.address}</p>
                      )}
                      {invoice.client.email && (
                        <p className="text-sm text-gray-800 mt-1">{invoice.client.email}</p>
                      )}
                      {invoice.client.phone && (
                        <p className="text-sm text-gray-800 mt-1">{invoice.client.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Property Info (if exists) */}
                  {invoice.property && (
                    <div>
                      <div className="flex items-center mb-3">
                        <Building size={18} className="text-gray-500 mr-2" />
                        <h3 className="font-medium">Property Information</h3>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        {/* Property details */}
                        <p className="font-medium text-gray-900">{invoice.property.title}</p>
                        <button
                          onClick={() => router.push(`/properties/${invoice.property?.id}`)}
                          className="text-sm text-blue-700 hover:text-blue-900 mt-2"
                        >
                          View Property Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="p-6">
                <h3 className="font-medium mb-4">Invoice Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-center">Quantity</th>
                        <th className="px-6 py-3 text-right">Unit Price</th>
                        <th className="px-6 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.unitPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} className="px-6 py-4"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          Total Amount
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                          {invoice.amount}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <DollarSign size={18} className="text-[#333] mr-2" />
                  <h3 className="font-medium text-[#111]">Payment Information</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-[#333] mb-2">Payment Status</h4>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="text-[#333]">{invoice.status}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#333] mb-2">Payment Method</h4>
                    <p className="text-sm text-[#333]">Bank Transfer</p>
                  </div>
                </div>

                {invoice.status === 'Pending' || invoice.status === 'Overdue' ? (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Mark as Paid
                    </button>
                    <button className="ml-3 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      Send Reminder
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3 text-[#111]">Notes</h3>
                    <p className="text-sm text-[#333]">
                      {(invoice as any).notes || 'Thank you for your business. Please make payment by the due date.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3 text-[#111]">Terms and Conditions</h3>
                    <p className="text-sm text-[#333]">
                      Payment is due within 15 days from the date of invoice. Late payments are subject to a 5% fee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div> {/* end #invoice-print-area */}
        </div>
      </div>
    </CRMLayout>
  );
}
