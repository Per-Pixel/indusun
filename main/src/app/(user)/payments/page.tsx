'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CreditCard, Plus, Trash2, Check, AlertCircle, Edit, ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'upi';
  name: string;
  number: string;
  expiry?: string;
  isDefault: boolean;
  icon: string;
}

const PaymentsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit',
      name: 'HDFC Bank Credit Card',
      number: '•••• •••• •••• 4242',
      expiry: '12/25',
      isDefault: true,
      icon: '/transaction-icons/hdfc.png'
    },
    {
      id: '2',
      type: 'debit',
      name: 'SBI Bank Debit Card',
      number: '•••• •••• •••• 8765',
      expiry: '09/24',
      isDefault: false,
      icon: '/transaction-icons/sbi.png'
    },
    {
      id: '3',
      type: 'upi',
      name: 'Google Pay UPI',
      number: 'user@okicici',
      isDefault: false,
      icon: '/transaction-icons/gpay.png'
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'credit',
    name: '',
    number: '',
    expiry: '',
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newPaymentMethod.type as 'credit' | 'debit' | 'upi',
      name: newPaymentMethod.name,
      number: newPaymentMethod.number,
      expiry: newPaymentMethod.type !== 'upi' ? newPaymentMethod.expiry : undefined,
      isDefault: paymentMethods.length === 0,
      icon: getIconForPaymentMethod(newPaymentMethod.type)
    };
    
    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddForm(false);
    setNewPaymentMethod({
      type: 'credit',
      name: '',
      number: '',
      expiry: '',
    });
  };
  
  const getIconForPaymentMethod = (type: string) => {
    switch (type) {
      case 'credit':
        return '/transaction-icons/hdfc.png';
      case 'debit':
        return '/transaction-icons/sbi.png';
      case 'upi':
        return '/transaction-icons/gpay.png';
      default:
        return '/transaction-icons/hdfc.png';
    }
  };
  
  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };
  
  const handleDeletePaymentMethod = (id: string) => {
    const methodToDelete = paymentMethods.find(method => method.id === id);
    
    // If deleting the default method, set a new default
    if (methodToDelete?.isDefault && paymentMethods.length > 1) {
      const newDefault = paymentMethods.find(method => method.id !== id);
      if (newDefault) {
        handleSetDefault(newDefault.id);
      }
    }
    
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    setShowDeleteConfirm(null);
  };
  
  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <CreditCard className="text-blue-500" />;
      case 'debit':
        return <CreditCard className="text-green-500" />;
      case 'upi':
        return <Image src="/transaction-icons/upi.png" alt="UPI" width={24} height={24} />;
      default:
        return <CreditCard />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-black">Payment Methods</h1>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add Payment Method</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Your Payment Methods</h2>
            
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Payment Methods</h3>
                <p className="text-gray-500 mb-4">You haven't added any payment methods yet.</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>Add Payment Method</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {method.icon ? (
                            <Image src={method.icon} alt={method.name} width={24} height={24} />
                          ) : (
                            getCardTypeIcon(method.type)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-black">{method.name}</h3>
                            {method.isDefault && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{method.number}</span>
                            {method.expiry && <span>Expires {method.expiry}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <button 
                            onClick={() => handleSetDefault(method.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Set as Default
                          </button>
                        )}
                        <div className="relative">
                          {showDeleteConfirm === method.id ? (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-64">
                              <p className="text-sm text-gray-700 mb-3">Are you sure you want to remove this payment method?</p>
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleDeletePaymentMethod(method.id)}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : null}
                          <button 
                            onClick={() => setShowDeleteConfirm(method.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Payment History Section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Payment Method</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Apr 10, 2023
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Monthly Subscription
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      HDFC Bank Credit Card
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹2,500.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Successful
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Mar 10, 2023
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Monthly Subscription
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      HDFC Bank Credit Card
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹2,500.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Successful
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Feb 10, 2023
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Monthly Subscription
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      SBI Bank Debit Card
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹2,500.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Failed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Add Payment Method Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add Payment Method</h2>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
                
                <form onSubmit={handleAddPaymentMethod}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <div className="relative">
                      <select
                        value={newPaymentMethod.type}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value})}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="credit">Credit Card</option>
                        <option value="debit">Debit Card</option>
                        <option value="upi">UPI</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {newPaymentMethod.type === 'upi' ? 'UPI ID' : 'Card Number'}
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.number}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, number: e.target.value})}
                      placeholder={newPaymentMethod.type === 'upi' ? 'username@bank' : '1234 5678 9012 3456'}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {newPaymentMethod.type === 'upi' ? 'UPI App Name' : 'Card Name'}
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.name}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                      placeholder={newPaymentMethod.type === 'upi' ? 'Google Pay, PhonePe, etc.' : 'Name on card'}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {newPaymentMethod.type !== 'upi' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={newPaymentMethod.expiry}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, expiry: e.target.value})}
                        placeholder="MM/YY"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Payment Method
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
