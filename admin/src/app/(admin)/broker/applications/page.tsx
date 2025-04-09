'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'react-hot-toast';

interface BrokerApplication {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  applicationDate: string;
  status: string;
  documents: {
    experience: string;
    qualifications: string;
    documents?: string[];
  };
  notes: string;
  reviewedBy?: number;
  reviewDate?: string;
}

export default function BrokerApplicationsPage() {
  const { user, isLoading } = useAdminAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<BrokerApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<BrokerApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/auth/login');
    } else if (user) {
      fetchApplications();
    }
  }, [user, isLoading, router, statusFilter]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/admin/api/broker/applications?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error fetching applications');
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/admin/api/broker/applications/${selectedApp.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes }),
      });
      
      if (response.ok) {
        toast.success('Application approved successfully');
        setSelectedApp(null);
        setAdminNotes('');
        fetchApplications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Error approving application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/admin/api/broker/applications/${selectedApp.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes }),
      });
      
      if (response.ok) {
        toast.success('Application rejected successfully');
        setSelectedApp(null);
        setAdminNotes('');
        fetchApplications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Error rejecting application');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Broker Applications</h1>
      </div>

      <div className="mb-6">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No {statusFilter} applications found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{app.userName}</div>
                    <div className="text-sm text-gray-500">{app.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Application Details</h2>
                <button
                  onClick={() => {
                    setSelectedApp(null);
                    setAdminNotes('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Applicant Information</h3>
                <p><span className="font-medium">Name:</span> {selectedApp.userName}</p>
                <p><span className="font-medium">Email:</span> {selectedApp.userEmail}</p>
                <p><span className="font-medium">Application Date:</span> {new Date(selectedApp.applicationDate).toLocaleString()}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Experience</h3>
                <p className="whitespace-pre-line">{selectedApp.documents.experience}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Qualifications</h3>
                <p className="whitespace-pre-line">{selectedApp.documents.qualifications}</p>
              </div>
              
              {selectedApp.documents.documents && selectedApp.documents.documents.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Documents</h3>
                  <ul className="list-disc pl-5">
                    {selectedApp.documents.documents.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Message</h3>
                <p className="whitespace-pre-line">{selectedApp.notes}</p>
              </div>
              
              {selectedApp.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Admin Notes</h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Add notes about this application..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </>
              )}
              
              {selectedApp.status !== 'pending' && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Review Notes</h3>
                  <p className="whitespace-pre-line">{selectedApp.notes || 'No review notes provided.'}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Reviewed on: {selectedApp.reviewDate ? new Date(selectedApp.reviewDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
