'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
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
  society_name: string;
  plot_no: string;
  plot_size: string;
  plot_amount: string;
  r_no: string;
  client_name: string;
  contact_no: string;
  paid_amount: string;
  emi_amount: string;
  emi_time: string;
  date_of_form: string;
  cheque_cash: string;
  broker_name: string;
  remarks: string;
}

const emptyForm: FormData = {
  society_name: '',
  plot_no: '',
  plot_size: '',
  plot_amount: '',
  r_no: '',
  client_name: '',
  contact_no: '',
  paid_amount: '',
  emi_amount: '',
  emi_time: '',
  date_of_form: '',
  cheque_cash: '',
  broker_name: '',
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

export default function AddPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [brokerOptions, setBrokerOptions] = useState<string[]>([]);
  const [societyOptions, setSocietyOptions] = useState<string[]>([]);

  const update = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Prefill on duplicate + load broker/society suggestions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sourceId = urlParams.get('sourceId');
    if (urlParams.get('duplicate') === 'true' && sourceId) {
      setIsDuplicate(true);
      fetch(`/api/properties/${sourceId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          const row = res?.data;
          if (!row) return;
          setForm({
            society_name: row.society_name || '',
            plot_no: '',
            plot_size: row.plot_size || '',
            plot_amount: row.plot_amount || '',
            r_no: '',
            client_name: '',
            contact_no: '',
            paid_amount: '',
            emi_amount: row.emi_amount || '',
            emi_time: row.emi_time || '',
            date_of_form: '',
            cheque_cash: row.cheque_cash || '',
            broker_name: row["broker's_name"] || '',
            remarks: row.remarks || '',
          });
        })
        .catch(() => {});
    }

    fetch('/api/brokers?limit=500')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.brokers) {
          setBrokerOptions(res.brokers.map((b: any) => b.name).filter(Boolean));
        }
      })
      .catch(() => {});

    fetch('/api/master-data/societies')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const list = res?.societies || res?.data || [];
        if (Array.isArray(list)) setSocietyOptions(list.filter(Boolean));
      })
      .catch(() => {});
  }, []);

  const derivePreviewStatus = () => {
    if (!form.society_name.trim() && !form.plot_no.trim()) return null;
    const emi = parseAmount(form.emi_amount);
    const paid = parseAmount(form.paid_amount);
    if (emi > 0) return { label: 'Installment Plan', color: 'bg-blue-100 text-blue-700' };
    if (paid > 0) return { label: 'Booked', color: 'bg-green-100 text-green-700' };
    return { label: 'Available', color: 'bg-amber-100 text-amber-700' };
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.society_name.trim()) next.society_name = 'Society / project name is required';
    if (!form.plot_no.trim()) next.plot_no = 'Plot number is required';
    if (form.contact_no && !/^\d{10,12}$/.test(form.contact_no.replace(/\s/g, ''))) {
      next.contact_no = 'Enter a valid 10-12 digit phone number';
    }
    for (const key of ['plot_amount', 'paid_amount', 'emi_amount'] as const) {
      if (form[key] && parseAmount(form[key]) < 0) {
        next[key] = 'Amount cannot be negative';
      }
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
        society_name: form.society_name.trim(),
        plot_no: form.plot_no.trim(),
        plot_size: form.plot_size.trim() || null,
        plot_amount: form.plot_amount.trim() || null,
        r_no: form.r_no.trim() || null,
        client_name: form.client_name.trim() || null,
        contact_no: form.contact_no.trim() || null,
        paid_amount: form.paid_amount.trim() || null,
        emi_amount: form.emi_amount.trim() || null,
        emi_time: form.emi_time.trim() || null,
        date_of_form: form.date_of_form || null,
        cheque_cash: form.cheque_cash.trim() || null,
        "broker's_name": form.broker_name.trim() || null,
        remarks: form.remarks.trim() || null,
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add property');

      toast.success(`Plot ${form.plot_no} added to ${form.society_name}`);
      router.push('/properties');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add property');
    } finally {
      setSaving(false);
    }
  };

  const preview = derivePreviewStatus();
  const previewTitle = [form.society_name, form.plot_no ? `Plot ${form.plot_no}` : '']
    .filter(Boolean)
    .join(' – ') || 'New Property';

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
              href="/properties"
              className="inline-flex items-center text-sm mb-2 hover:text-[var(--gold-dark)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Properties
            </Link>
            <h1 className="page-title flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gold-muted)' }}
              >
                <Plus size={20} style={{ color: 'var(--gold-dark)' }} />
              </span>
              {isDuplicate ? 'Duplicate Property' : 'Add New Property'}
            </h1>
            <p className="page-subtitle">
              {isDuplicate
                ? 'Create a copy — review the pre-filled details and assign a new plot number.'
                : 'Add a plot or unit to the inventory with pricing, buyer, and payment details.'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-5"
            >
              {/* Plot & Society */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Building2 size={18} style={{ color: 'var(--gold)' }} /> Property Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      Society / Project <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        list="society-options"
                        value={form.society_name}
                        onChange={(e) => update('society_name', e.target.value)}
                        placeholder="e.g. Gurukrupa Green Valley"
                        className={`input pl-10 ${errors.society_name ? 'border-red-400' : ''}`}
                      />
                      <datalist id="society-options">
                        {societyOptions.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
                    {errors.society_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.society_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      Plot / Unit No <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={form.plot_no}
                        onChange={(e) => update('plot_no', e.target.value)}
                        placeholder="e.g. A-101"
                        className={`input pl-10 ${errors.plot_no ? 'border-red-400' : ''}`}
                      />
                    </div>
                    {errors.plot_no && (
                      <p className="text-xs text-red-500 mt-1">{errors.plot_no}</p>
                    )}
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
                    {errors.plot_amount && (
                      <p className="text-xs text-red-500 mt-1">{errors.plot_amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Receipt / R. No</label>
                    <input
                      type="text"
                      value={form.r_no}
                      onChange={(e) => update('r_no', e.target.value)}
                      placeholder="e.g. R-1024"
                      className="input"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Buyer */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <User size={18} style={{ color: 'var(--gold)' }} /> Buyer Details
                  <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional — leave blank for unlisted inventory)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Client Name</label>
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={(e) => update('client_name', e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Contact No</label>
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

              {/* Payment */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <CreditCard size={18} style={{ color: 'var(--gold)' }} /> Payment & EMI
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Paid Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.paid_amount}
                      onChange={(e) => update('paid_amount', e.target.value)}
                      placeholder="e.g. 500000"
                      className={`input ${errors.paid_amount ? 'border-red-400' : ''}`}
                    />
                    {errors.paid_amount && (
                      <p className="text-xs text-red-500 mt-1">{errors.paid_amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">EMI Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.emi_amount}
                      onChange={(e) => update('emi_amount', e.target.value)}
                      placeholder="e.g. 25000"
                      className={`input ${errors.emi_amount ? 'border-red-400' : ''}`}
                    />
                    {errors.emi_amount && (
                      <p className="text-xs text-red-500 mt-1">{errors.emi_amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">EMI Term</label>
                    <input
                      type="text"
                      value={form.emi_time}
                      onChange={(e) => update('emi_time', e.target.value)}
                      placeholder="e.g. 36 Months"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Payment Mode</label>
                    <select
                      value={form.cheque_cash}
                      onChange={(e) => update('cheque_cash', e.target.value)}
                      className="input"
                    >
                      <option value="">Select…</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Booking / Form Date</label>
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
                </div>
              </motion.div>

              {/* Broker & notes */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Users size={18} style={{ color: 'var(--gold)' }} /> Broker & Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Broker Name</label>
                    <input
                      type="text"
                      list="broker-options"
                      value={form.broker_name}
                      onChange={(e) => update('broker_name', e.target.value)}
                      placeholder="Start typing to pick a registered broker…"
                      className="input"
                    />
                    <datalist id="broker-options">
                      {brokerOptions.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label flex items-center gap-2">
                      <MessageSquare size={14} /> Remarks
                    </label>
                    <textarea
                      value={form.remarks}
                      onChange={(e) => update('remarks', e.target.value)}
                      rows={3}
                      placeholder="Corner plot, facing, amenities, notes…"
                      className="input resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Preview + actions */}
              <motion.div variants={item} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
                  >
                    <Home size={22} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {previewTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {preview ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${preview.color}`}>
                          {preview.label}
                        </span>
                      ) : (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Status preview will appear here
                        </p>
                      )}
                      {form.plot_amount && (
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          ₹{parseAmount(form.plot_amount).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/properties"
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
                        <Save size={16} /> Add Property
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
