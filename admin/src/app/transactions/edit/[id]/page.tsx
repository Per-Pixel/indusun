'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Home,
  FileText,
  CreditCard,
  Save,
  X
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

const EditTransactionPage = () => {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    clientId: '',
    plotNumber: '',
    brokerId: '',
    brokerName: '',
    amount: '',
    paymentMode: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    notes: ''
  });

  // Load transaction data
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setIsLoadingData(true);
        // Simulate API call to load transaction data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockTransaction = {
          clientName: 'John Doe',
          clientId: 'CL001',
          plotNumber: 'P123',
          brokerId: 'BR001',
          brokerName: 'Jane Smith',
          amount: '50000',
          paymentMode: 'Bank Transfer',
          paymentDate: '2024-01-15',
          receiptNumber: 'RCP001',
          notes: 'Initial payment for plot purchase'
        };
        
        setFormData(mockTransaction);
      } catch (error) {
        console.error('Error loading transaction:', error);
        toast.error('Failed to load transaction data');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Updated transaction data:', formData);
      toast.success('Transaction updated successfully!');
      
      // Navigate back to sales page
      router.push('/sales');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/sales');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoadingData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        <div className={`flex-1 transition-all duration-300 bg-gray-50 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transaction data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${sidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Sales</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold" style={{ color: '#374151' }}>Edit Transaction</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold" style={{ color: '#374151' }}>Transaction Details</h2>
                <p className="text-sm text-gray-600 mt-1">Update the information below to modify this transaction</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-8">
                  {/* Client Information */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center" style={{ color: '#374151' }}>
                      <User className="h-4 w-4 mr-2" />
                      Client Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Client Name *
                        </label>
                        <input
                          type="text"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          style={{ color: '#374151' }}
                          placeholder="Enter client name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Client ID
                        </label>
                        <input
                          type="text"
                          name="clientId"
                          value={formData.clientId}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          style={{ color: '#374151' }}
                          placeholder="Enter client ID"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Information */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center" style={{ color: '#374151' }}>
                      <Home className="h-4 w-4 mr-2" />
                      Property Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Plot Number *
                        </label>
                        <input
                          type="text"
                          name="plotNumber"
                          value={formData.plotNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          style={{ color: '#374151' }}
                          placeholder="Enter plot number"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Broker Name
                        </label>
                        <input
                          type="text"
                          name="brokerName"
                          value={formData.brokerName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          style={{ color: '#374151' }}
                          placeholder="Enter broker name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center" style={{ color: '#374151' }}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Amount Paid *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-medium">₹</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            style={{ color: '#374151' }}
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Payment Mode *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                          </div>
                          <select
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                            style={{ color: '#374151' }}
                            required
                          >
                            <option value="Cash">Cash</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Payment Date *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="paymentDate"
                            value={formData.paymentDate}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            style={{ color: '#374151' }}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                          Receipt Number
                        </label>
                        <input
                          type="text"
                          name="receiptNumber"
                          value={formData.receiptNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          style={{ color: '#374151' }}
                          placeholder="Enter receipt number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: '#374151' }}>
                      <FileText className="h-4 w-4 mr-2" />
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      style={{ color: '#374151' }}
                      placeholder="Enter any additional notes or comments..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    style={{ color: '#374151' }}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Update Transaction</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionPage;
