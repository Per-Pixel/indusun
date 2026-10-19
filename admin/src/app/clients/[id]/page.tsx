'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import UserForm from '@/components/users/UserForm';
import { User } from '@/components/users/UserList';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { parseAmount } from '@/utils/dataUtils';

interface ClientDetail extends User {
  rawName?: string;
  source?: 'master' | 'custom';
  firstRecordId?: number | null;
  recordsCount?: number;
  totalPaid?: number;
  portfolio?: any[];
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = String(params?.id || '');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchClient = useCallback(async () => {
    if (!clientId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Client not found');
      }
      const data = await res.json();
      setClient(data.client);
    } catch (err: any) {
      toast.error(err.message || 'Client not found');
      setClient(null);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    if (!client) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${client.name}? This will remove all associated customer records.`
      )
    ) {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
          method: 'DELETE',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Failed to delete client');
        }
        toast.success(`${client.name} has been deleted`);
        router.push('/clients');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete client');
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = async (clientData: Partial<User>) => {
    if (!client) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update client');
      }
      setClient((prev) => (prev ? { ...prev, ...clientData, ...(data.client || {}) } : null));
      toast.success(`${clientData.name || client.name} has been updated`);
      setShowEditForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowEditForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-500 mb-4">The client you are looking for does not exist or has been deleted.</p>
          <button
            onClick={() => router.push('/clients')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const portfolio = Array.isArray(client.portfolio) ? client.portfolio : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/clients')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Clients</span>
            </button>

            {showEditForm ? (
              <UserForm
                user={client}
                userType="client"
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
              />
            ) : (
              <>
                {/* Client Profile */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">Client Profile</h2>
                      <div className="flex flex-wrap gap-2">
                        {client.firstRecordId && (
                          <Link
                            href={`/customers/${client.firstRecordId}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md hover:bg-amber-100 text-sm font-medium"
                          >
                            <ExternalLink size={15} />
                            <span>View Full Customer Ledger</span>
                          </Link>
                        )}
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Profile Image */}
                      <div className="flex flex-col items-center">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                          {client.image ? (
                            <Image
                              src={client.image}
                              alt={client.name}
                              width={128}
                              height={128}
                              className="h-32 w-32 object-cover"
                            />
                          ) : (
                            <div className="h-32 w-32 flex items-center justify-center bg-blue-100 text-blue-800 text-4xl font-semibold">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : client.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </div>
                      </div>

                      {/* Client Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{client.name}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start">
                            <Mail className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p className="text-gray-900">{client.email || '—'}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Phone className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="text-gray-900">{client.phone || '—'}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Location / Society</p>
                              <p className="text-gray-900">{client.location || 'Not specified'}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Member Since</p>
                              <p className="text-gray-900">{client.createdAt || '—'}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Clock className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Plot / EMI Records</p>
                              <p className="text-gray-900">
                                {client.recordsCount ?? 1} record{(client.recordsCount ?? 1) === 1 ? '' : 's'}
                                {typeof client.totalPaid === 'number' && client.totalPaid > 0
                                  ? ` · ₹${client.totalPaid.toLocaleString('en-IN')} total paid`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Portfolio / Activity */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Property &amp; Installment Records ({portfolio.length})
                    </h2>
                  </div>

                  <div className="p-6">
                    {portfolio.length === 0 ? (
                      <p className="text-sm text-gray-500">No installment or plot records found for this client.</p>
                    ) : (
                      <div className="space-y-4">
                        {portfolio.map((row: any) => {
                          const paid = parseAmount(row.paid_amount);
                          const plotAmt = parseAmount(row.plot_amount);
                          return (
                            <div
                              key={row.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg border border-gray-100 hover:bg-gray-50"
                            >
                              <div className="flex items-start">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 shrink-0">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-gray-900 font-medium">
                                    {row.society_name || '—'} · Plot {row.plot_no || '—'}{' '}
                                    {row.emi_no ? `(EMI #${row.emi_no})` : ''}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Receipt #{row.id} · Paid: ₹{paid.toLocaleString('en-IN')} / Plot: ₹
                                    {plotAmt.toLocaleString('en-IN')} ·{' '}
                                    {row.emi_paid_date || row.date_of_form || row.date || '—'}
                                  </p>
                                </div>
                              </div>
                              <Link
                                href={`/customers/${row.id}`}
                                className="text-xs font-medium text-blue-600 hover:underline self-end sm:self-center"
                              >
                                Open Receipt →
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
