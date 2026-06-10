'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Users,
  Phone,
  CheckCircle,
  AlertCircle,
  Clock,
  Home,
  CreditCard,
  FileText,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
import { formatIndianNumber } from '@/utils/format';

interface MasterDataRecord {
  id: number;
  r_no: string | null;
  society_name: string | null;
  client_name: string | null;
  contact_no: string | null;
  plot_no: string | null;
  plot_size: string | null;
  emi_paid_date: string | null;
  plot_amount: string | null;
  emi_amount: string | null;
  paid_amount: string | null;
  amount_in_word: string | null;
  emi_time: string | null;
  "broker's_name": string | null;
  cheque_cash: string | null;
  remarks: string | null;
  emi_no: string | null;
  month_and_year: string | null;
  policy_number: string | null;
  date: string | null;
  cancel_date: string | null;
  date_of_form: string | null;
  created_at?: string;
  updated_at?: string;
}

function deriveStatus(r: MasterDataRecord): { label: string; color: string; icon: React.ReactNode } {
  if (r.cancel_date) return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <AlertCircle size={16} className="mr-1" /> };
  if (r.emi_amount) return { label: 'On Installment', color: 'bg-blue-100 text-blue-800', icon: <Clock size={16} className="mr-1" /> };
  if (r.paid_amount) return { label: 'Sold', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="mr-1" /> };
  return { label: 'Listed', color: 'bg-gray-100 text-gray-800', icon: null };
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#333]">{value}</p>
    </div>
  );
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'payment'>('details');
  const [property, setProperty] = useState<MasterDataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) throw new Error('Property not found');
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setProperty(json.data);
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (fetchError || !property) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-[#333]">Property Not Found</h1>
          <p className="text-gray-500 mb-4">{fetchError ?? 'No data returned for this ID.'}</p>
          <button onClick={() => router.push('/properties')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const title = [property.society_name, property.plot_no].filter(Boolean).join(' – Plot ') || `Record #${property.id}`;
  const status = deriveStatus(property);
  const dateLabel = property.date_of_form ?? property.date ?? property.emi_paid_date ?? '';

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
              <div>
                <button
                  onClick={() => router.push('/properties')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Properties
                </button>
                <h1 className="text-2xl font-bold text-[#333]">{title}</h1>
                {property.society_name && (
                  <div className="flex items-center text-gray-600 mt-1 text-sm">
                    <MapPin size={14} className="mr-1" />
                    {property.society_name}
                  </div>
                )}
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium self-start mt-1 ${status.color}`}>
                {status.icon}{status.label}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('details')}
              >
                Property Details
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'payment' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('payment')}
              >
                Payment Info
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left – property fields */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 text-gray-700">
                      <Home size={18} />
                      <h2 className="font-semibold">Plot Details</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Society / Project" value={property.society_name} />
                      <Field label="Plot No" value={property.plot_no} />
                      <Field label="Plot Size" value={property.plot_size} />
                      <Field label="Plot Amount" value={formatIndianNumber(property.plot_amount)} />
                      <Field label="R No" value={property.r_no} />
                      <Field label="Policy Number" value={property.policy_number} />
                      <Field label="Form Date" value={dateLabel} />
                      <Field label="Cancel Date" value={property.cancel_date} />
                      {property.remarks && (
                        <div className="col-span-2">
                          <Field label="Remarks" value={property.remarks} />
                        </div>
                      )}
                    </div>
                  </div>

                  {property.cheque_cash && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-3 text-gray-700">
                        <FileText size={18} />
                        <h2 className="font-semibold">Additional Info</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Cheque / Cash" value={property.cheque_cash} />
                        <Field label="Month & Year" value={property.month_and_year} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right – client & broker */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-medium text-[#333] flex items-center gap-2">
                        <User size={16} /> Client Information
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="font-medium text-[#333]">{property.client_name ?? '—'}</p>
                      {property.contact_no && (
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                          <Phone size={14} />
                          {property.contact_no}
                        </div>
                      )}
                    </div>
                  </div>

                  {property["broker's_name"] && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-medium text-[#333] flex items-center gap-2">
                          <Users size={16} /> Broker Information
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="font-medium text-[#333]">{property["broker's_name"]}</p>
                      </div>
                    </div>
                  )}

                  {dateLabel && (
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>Date: <span className="text-[#333] font-medium">{dateLabel}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6 text-gray-700">
                  <CreditCard size={18} />
                  <h2 className="font-semibold">EMI & Payment Details</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <Field label="Plot Amount" value={formatIndianNumber(property.plot_amount)} />
                  <Field label="Paid Amount" value={formatIndianNumber(property.paid_amount)} />
                  <Field label="Amount in Words" value={property.amount_in_word} />
                  <Field label="EMI Amount" value={formatIndianNumber(property.emi_amount)} />
                  <Field label="EMI Term" value={property.emi_time} />
                  <Field label="EMI No" value={property.emi_no} />
                  <Field label="EMI Paid Date" value={property.emi_paid_date} />
                  <Field label="Month & Year" value={property.month_and_year} />
                  <Field label="Cheque / Cash" value={property.cheque_cash} />
                </div>
              </div>
            )}
        </div>
      </div>
    </CRMLayout>
  );
}
