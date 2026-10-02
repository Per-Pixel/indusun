'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Ruler,
  Save,
  User,
  Users,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
import { toast } from 'react-hot-toast';
import { parseAmount } from '@/utils/dataUtils';

interface FormData {
  client_name: string;
  contact_no: string;
  society_name: string;
  plot_no: string;
  plot_size: string;
  plot_amount: string;
  paid_amount: string;
  emi_amount: string;
  broker_name: string;
  date_of_form: string;
  remarks: string;
}

const emptyForm: FormData = {
  client_name: '',
  contact_no: '',
  society_name: '',
  plot_no: '',
  plot_size: '',
  plot_amount: '',
  paid_amount: '',
  emi_amount: '',
  broker_name: '',
  date_of_form: '',
  remarks: '',
};

const container = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AddCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);

  const update = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const derivePreviewStatus = () => {
    if (!form.client_name.trim()) return null;
    const paid = parseAmount(form.paid_amount);
    const emi = parseAmount(form.emi_amount);
    if (emi > 0) return { label: 'Installment', color: 'bg-blue-100 text-blue-700' };
    if (paid > 0) return { label: 'Active', color: 'bg-green-100 text-green-700' };
    return { label: 'Prospect', color: 'bg-amber-100 text-amber-700' };
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.client_name.trim()) next.client_name = 'Customer name is required';
    if (form.contact_no && !/^\d{10,12}$/.test(form.contact_no.replace(/\s/g, ''))) {
      next.contact_no = 'Enter a valid 10-12 digit phone number';
    }
    if (form.plot_amount && parseAmount(form.plot_amount) < 0) {
      next.plot_amount = 'Plot amount cannot be negative';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const body = {
        client_name: form.client_name.trim(),
        contact_no: form.contact_no.trim() || null,
        society_name: form.society_name.trim() || null,
        plot_no: form.plot_no.trim() || null,
        plot_size: form.plot_size.trim() || null,
        plot_amount: form.plot_amount.trim() || null,
        paid_amount: form.paid_amount.trim() || null,
        emi_amount: form.emi_amount.trim() || null,
        "broker's_name": form.broker_name.trim() || null,
        date_of_form: form.date_of_form || null,
        remarks: form.remarks.trim() || null,
      };

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add customer');

      toast.success(`${form.client_name} added successfully`);
      router.push('/customers');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  const preview = derivePreviewStatus();

  return (
    <CRMLayout>
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href="/customers"
              className="inline-flex items-center text-sm mb-2 hover:text-[var(--gold-dark)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Customers
            </Link>
            <h1 className="page-title flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gold-muted)' }}
              >
                <Plus size={20} style={{ color: 'var(--gold-dark)' }} />
              </span>
              Add New Customer
            </h1>
            <p className="page-subtitle">
              Create a customer record with property and broker details.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-5"
            >
              {/* Customer info */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <User size={18} style={{ color: 'var(--gold)' }} /> Customer Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={(e) => update('client_name', e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className={`input ${errors.client_name ? 'border-red-400' : ''}`}
                    />
                    {errors.client_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        value={form.contact_no}
                        onChange={(e) => update('contact_no', e.target.value)}
                        placeholder="9876543210"
                        className={`input pl-10 ${errors.contact_no ? 'border-red-400' : ''}`}
                      />
                    </div>
                    {errors.contact_no && (
                      <p className="text-xs text-red-500 mt-1">{errors.contact_no}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Property info */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Home size={18} style={{ color: 'var(--gold)' }} /> Property Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Society / Project</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={form.society_name}
                        onChange={(e) => update('society_name', e.target.value)}
                        placeholder="e.g. Gurukrupa Green Valley"
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Plot Number</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={form.plot_no}
                        onChange={(e) => update('plot_no', e.target.value)}
                        placeholder="e.g. 42-A"
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Plot Size</label>
                    <div className="relative">
                      <Ruler size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={form.plot_size}
                        onChange={(e) => update('plot_size', e.target.value)}
                        placeholder="e.g. 1500 sq.ft."
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Plot Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.plot_amount}
                      onChange={(e) => update('plot_amount', e.target.value)}
                      placeholder="e.g. 1500000"
                      className={`input ${errors.plot_amount ? 'border-red-400' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="label">Paid Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.paid_amount}
                      onChange={(e) => update('paid_amount', e.target.value)}
                      placeholder="e.g. 500000"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">EMI Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.emi_amount}
                      onChange={(e) => update('emi_amount', e.target.value)}
                      placeholder="e.g. 25000"
                      className="input"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Broker + dates */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Users size={18} style={{ color: 'var(--gold)' }} /> Broker & Joining Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Broker Name</label>
                    <input
                      type="text"
                      value={form.broker_name}
                      onChange={(e) => update('broker_name', e.target.value)}
                      placeholder="e.g. Sunil Broker"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Form / Joining Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="date"
                        value={form.date_of_form}
                        onChange={(e) => update('date_of_form', e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label flex items-center gap-2">
                      <MessageSquare size={14} /> Remarks
                    </label>
                    <textarea
                      value={form.remarks}
                      onChange={(e) => update('remarks', e.target.value)}
                      rows={3}
                      placeholder="Additional notes about the customer…"
                      className="input resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Preview + actions */}
              <motion.div variants={item} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
                  >
                    {(form.client_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {form.client_name.trim() || 'New Customer'}
                    </p>
                    {preview ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${preview.color}`}>
                        {preview.label}
                      </span>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Status preview will appear here
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/customers"
                    className="btn btn-secondary"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Add Customer
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </form>
        </div>
      </div>
    </CRMLayout>
  );
}
