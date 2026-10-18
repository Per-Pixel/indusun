'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CreditCard,
  Eye,
  FileText,
  Hash,
  Home,
  IdCard,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  Ruler,
  Save,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import CRMLayout from '@/components/CRMLayout';
import { toast } from 'react-hot-toast';
import { parseAmount } from '@/utils/dataUtils';
import { numberToIndianWords } from '@/components/invoices/GurukrupaReceipt';

interface FormData {
  registration_no: string;
  date_of_form: string;
  ba_code: string;
  broker_name: string;
  society_name: string;
  block_name: string;
  plot_no: string;
  plot_size: string;
  client_name: string;
  father_or_husband_name: string;
  date_of_birth: string;
  age: string;
  profession: string;
  address: string;
  contact_no: string;
  resident_no: string;
  aadhar_no: string;
  pan_no: string;
  nominee_name: string;
  nominee_relation: string;
  nominee_dob: string;
  nominee_age: string;
  nominee_profession: string;
  emi_amount: string;
  cheque_cash: string;
  emi_date: string;
  plot_amount: string;
  paid_amount: string;
  amount_in_word: string;
  emi_time: string;
  emi_no: string;
  emi_paid_date: string;
  policy_number: string;
  remarks: string;
  applicant_photo: string;
}

const todayIso = new Date().toISOString().split('T')[0];

const emptyForm: FormData = {
  registration_no: '',
  date_of_form: todayIso,
  ba_code: '',
  broker_name: '',
  society_name: '',
  block_name: '',
  plot_no: '',
  plot_size: '',
  client_name: '',
  father_or_husband_name: '',
  date_of_birth: '',
  age: '',
  profession: '',
  address: '',
  contact_no: '',
  resident_no: '',
  aadhar_no: '',
  pan_no: '',
  nominee_name: '',
  nominee_relation: '',
  nominee_dob: '',
  nominee_age: '',
  nominee_profession: '',
  emi_amount: '',
  cheque_cash: 'Transfer',
  emi_date: '15 to 20',
  plot_amount: '',
  paid_amount: '',
  amount_in_word: '',
  emi_time: '',
  emi_no: '1',
  emi_paid_date: todayIso,
  policy_number: '',
  remarks: '',
  applicant_photo: '',
};

const PAYMENT_MODES = ['Transfer', 'Cash', 'Cheque', 'UPI', 'Bank Transfer', 'NEFT / RTGS'];
const EMI_DATE_WINDOWS = ['1 to 5', '5 to 10', '10 to 15', '15 to 20', '20 to 25', '25 to 30'];
const PLOT_SIZE_PRESETS = ['14x36', '18x36', '14x40', '20x40'];
const PROFESSION_OPTIONS = ['Job', 'Business', 'Self-Employed', 'Service', 'Farmer', 'Housewife', 'Retired'];
const RELATION_OPTIONS = ['Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister'];

function calculateAgeFromDob(dob: string): string {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    years--;
  }
  return years >= 0 && years < 130 ? String(years) : '';
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return iso;
}

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
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [societyOptions, setSocietyOptions] = useState<string[]>([]);
  const [brokerOptions, setBrokerOptions] = useState<{ name: string; code: string }[]>([]);

  useEffect(() => {
    fetch('/api/master-data/societies')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const list = res?.societies || res?.data || [];
        if (Array.isArray(list)) setSocietyOptions(list.filter(Boolean));
      })
      .catch(() => {});

    fetch('/api/brokers?limit=500')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (Array.isArray(res?.brokers)) {
          setBrokerOptions(
            res.brokers
              .map((b: any) => ({
                name: String(b.name || '').trim(),
                code: String(b.broker_code || b.raw_identifier || b.name || '').trim(),
              }))
              .filter((b: { name: string; code: string }) => b.name || b.code)
          );
        }
      })
      .catch(() => {});
  }, []);

  const update = (name: keyof FormData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // Auto-calculate applicant age when DOB changes
      if (name === 'date_of_birth') {
        const computedAge = calculateAgeFromDob(value);
        if (computedAge) next.age = computedAge;
      }

      // Auto-calculate nominee age when Nominee DOB changes
      if (name === 'nominee_dob') {
        const computedNomineeAge = calculateAgeFromDob(value);
        if (computedNomineeAge) next.nominee_age = computedNomineeAge;
      }

      // Auto-extract block if society_name matches "ROYAL CITY ( I/BLOCK )"
      if (name === 'society_name' && !prev.block_name) {
        const blockMatch = value.match(/\(\s*([A-Z0-9]+)\s*\/?\s*BLOCK\s*\)/i);
        if (blockMatch) {
          next.block_name = blockMatch[1].toUpperCase();
        }
      }

      // Sync paid_amount & amount_in_word when emi_amount or paid_amount is updated
      if (name === 'emi_amount' || name === 'paid_amount') {
        const targetAmt = parseAmount(name === 'paid_amount' ? value : next.paid_amount || value);
        if (targetAmt > 0) {
          next.amount_in_word = numberToIndianWords(targetAmt);
        } else {
          next.amount_in_word = '';
        }
      }

      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be smaller than 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        update('applicant_photo', reader.result);
      }
    };
    reader.readAsDataURL(file);
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
    if (!form.client_name.trim()) next.client_name = 'Applicant name is required';
    if (form.contact_no && !/^\d{10,12}$/.test(form.contact_no.replace(/[\s\-+/]/g, ''))) {
      next.contact_no = 'Enter a valid 10-12 digit mobile number';
    }
    if (form.aadhar_no && !/^\d{12}$/.test(form.aadhar_no.replace(/\s/g, ''))) {
      next.aadhar_no = 'Aadhar number must be 12 digits';
    }
    if (form.pan_no && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(form.pan_no.trim())) {
      next.pan_no = 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
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
      const effectivePaid = form.paid_amount.trim() || form.emi_amount.trim() || null;
      const body = {
        registration_no: form.registration_no.trim() || null,
        r_no: form.registration_no.trim() || null,
        date_of_form: form.date_of_form || null,
        date: form.date_of_form || null,
        ba_code: form.ba_code.trim() || null,
        broker_code: form.ba_code.trim() || null,
        "broker's_name": form.broker_name.trim() || form.ba_code.trim() || null,
        society_name: form.society_name.trim() || null,
        block_name: form.block_name.trim() || null,
        plot_no: form.plot_no.trim() || null,
        plot_size: form.plot_size.trim() || null,
        client_name: form.client_name.trim(),
        father_or_husband_name: form.father_or_husband_name.trim() || null,
        date_of_birth: form.date_of_birth || null,
        age: form.age.trim() || null,
        profession: form.profession.trim() || null,
        address: form.address.trim() || null,
        contact_no: form.contact_no.trim() || null,
        resident_no: form.resident_no.trim() || null,
        aadhar_no: form.aadhar_no.replace(/\s/g, '').trim() || null,
        pan_no: form.pan_no.trim().toUpperCase() || null,
        nominee_name: form.nominee_name.trim() || null,
        nominee_relation: form.nominee_relation.trim() || null,
        nominee_dob: form.nominee_dob || null,
        nominee_age: form.nominee_age.trim() || null,
        nominee_profession: form.nominee_profession.trim() || null,
        emi_amount: form.emi_amount.trim() || null,
        cheque_cash: form.cheque_cash.trim() || null,
        emi_date: form.emi_date.trim() || null,
        plot_amount: form.plot_amount.trim() || null,
        paid_amount: effectivePaid,
        amount_in_word: form.amount_in_word.trim() || null,
        emi_time: form.emi_time.trim() || null,
        emi_no: form.emi_no.trim() || null,
        emi_paid_date: form.emi_paid_date || form.date_of_form || null,
        policy_number: form.policy_number.trim() || null,
        remarks: form.remarks.trim() || null,
        applicant_photo: form.applicant_photo || null,
      };

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add customer');

      toast.success(`${form.client_name} added successfully`);
      router.push(data.customer?.id ? `/customers/${data.customer.id}` : '/customers');
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
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
                Add New Customer (Application Form)
              </h1>
              <p className="page-subtitle">
                Complete Gurukrupa Corporation Application Form — registration, plot, applicant KYC, nominee &amp; EMI booking details.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setShowFormPreview((v) => !v)}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <Eye size={15} />
                {showFormPreview ? 'Hide Form Preview' : 'Preview Application Form'}
              </button>
            </div>
          </motion.div>

          {/* Printable Gurukrupa Corporation Application Form Preview */}
          {showFormPreview && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6 border-2"
              style={{ borderColor: 'var(--gold)' }}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <FileText size={18} style={{ color: 'var(--gold-dark)' }} />
                  <span className="font-semibold text-sm">Gurukrupa Corporation — Official Application Form Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Printer size={14} /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFormPreview(false)}
                    className="p-1.5 rounded hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-[#fcfaf7] text-[#1e293b] p-6 rounded-lg border border-[#d6cfc2] font-serif text-sm space-y-3">
                {/* Banner */}
                <div className="flex items-center justify-between border-b-2 border-[#233858] pb-4">
                  <div className="bg-[#233858] text-white px-5 py-3 rounded-r-full">
                    <div className="text-xl font-bold tracking-wider">GURUKRUPA</div>
                    <div className="text-xs tracking-[0.25em] text-amber-200">CORPORATION</div>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-[#7c2d12] border-b-2 border-[#7c2d12] pb-0.5 px-3">
                      = Application Form =
                    </span>
                  </div>
                  <div className="w-24 h-28 border-2 border-[#475569] flex items-center justify-center text-xs text-gray-500 overflow-hidden bg-white">
                    {form.applicant_photo ? (
                      <img src={form.applicant_photo} alt="Applicant" className="w-full h-full object-cover" />
                    ) : (
                      <span className="-rotate-12 font-sans font-medium">Photo</span>
                    )}
                  </div>
                </div>

                {/* Form Lines */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2">
                  <div className="flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">Registration NO. :</span>
                    <span className="font-mono font-bold text-base">{form.registration_no || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">Date :</span>
                    <span className="font-mono">{formatDisplayDate(form.date_of_form) || '—'}</span>
                  </div>

                  <div className="col-span-2 flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">BA Code :</span>
                    <span className="font-mono">{form.ba_code || form.broker_name || '—'}</span>
                  </div>

                  <div className="flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">Plot No. :</span>
                    <span>{form.plot_no || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">Society Name :</span>
                    <span>{form.society_name || '—'}</span>
                  </div>

                  <div className="flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">Block :</span>
                    <span>{form.block_name || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">Size :</span>
                    <span>{form.plot_size || '—'}</span>
                  </div>

                  <div className="col-span-2 flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                    <span className="font-semibold shrink-0">Name :</span>
                    <span className="font-semibold">
                      {form.client_name || '—'}
                      {form.father_or_husband_name && !form.client_name.toLowerCase().includes(form.father_or_husband_name.toLowerCase())
                        ? ` (S/O, W/O - ${form.father_or_husband_name})`
                        : ''}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-b border-dotted border-gray-400 pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Age :</span>
                    <span>{form.age || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Date of Birth :</span>
                    <span>{formatDisplayDate(form.date_of_birth) || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Profession :</span>
                    <span>{form.profession || '—'}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 border-b border-dotted border-gray-400 pb-1">
                  <span className="font-semibold shrink-0">Address :</span>
                  <span>{form.address || '—'}</span>
                </div>

                <div className="grid grid-cols-2 gap-6 border-b border-dotted border-gray-400 pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Mobile No. :</span>
                    <span className="font-mono">{form.contact_no || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Resident No. :</span>
                    <span className="font-mono">{form.resident_no || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 border-b border-dotted border-gray-400 pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Aadhar No. :</span>
                    <span className="font-mono">{form.aadhar_no || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Pan No. :</span>
                    <span className="font-mono">{form.pan_no || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 border-b border-dotted border-gray-400 pb-1">
                  <div className="col-span-2 flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Nominee&apos;s Name :</span>
                    <span>{form.nominee_name || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Relation :</span>
                    <span>{form.nominee_relation || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-b border-dotted border-gray-400 pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Age :</span>
                    <span>{form.nominee_age || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Date Of Birth :</span>
                    <span>{formatDisplayDate(form.nominee_dob) || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold shrink-0">Profession :</span>
                    <span>{form.nominee_profession || '—'}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <span className="font-semibold">Cheque to be Written In The Name Of :</span>
                  <span className="bg-[#7c2d12] text-white px-3 py-0.5 rounded font-bold tracking-wide text-xs">
                    GURUKRUPA CORPORATION
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p>
                    I Enclose Herewith a EMI of Rs.{' '}
                    <strong className="underline px-2">{form.emi_amount ? `${form.emi_amount}/-` : '________'}</strong>{' '}
                    Payment Mode by Cash / Bank{' '}
                    <strong className="underline px-2">{form.cheque_cash || '________'}</strong>
                  </p>
                  <p>
                    EMI Date <strong className="underline px-2">{form.emi_date || '________'}</strong> On Account of Booking The Above Plot.
                  </p>
                </div>

                <div className="text-xs text-gray-600 pt-2 border-t border-gray-300 flex items-end justify-between">
                  <div>
                    <p className="font-bold text-[#7c2d12] mb-1">DECLARATION :</p>
                    <p>1. बहार के एलिवेशन मे किसी भी प्रकार का कोई भी बदलाव नहीं किया जाएगा ।</p>
                    <p>2. दस्तावेज खर्च, कानूनी खर्च, जीएसटी और जी.ई.बी रखरखाव की रकम अलग से देना पड़ेगा ।</p>
                    <p>3. भविष्य मे गुजरात सरकार द्वारा लाए गए, कोई भी नया नियम आए तो उसे हर एक सदस्यो को मानना पड़ेगा ।</p>
                    <p>4. संजोग अनुसार लेआउट में किसी भी प्रकार का कोई भी बदलाव करने का पूरा पूरा हक डेवलपर्स का रहेगा ।</p>
                    <p>5. पेमेंट पूरा होने के बाद दस्तावेज होने के बाद ही पजेशन दिया जाएगा ।</p>
                  </div>
                  <div className="text-center pt-6 shrink-0">
                    <div className="w-36 border-t border-gray-600 pt-1 font-semibold">Signature of Applicant</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-5"
            >
              {/* 1. Registration & BA Code (Top of Application Form) */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Hash size={18} style={{ color: 'var(--gold)' }} /> Application &amp; Registration Header
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Registration No. (R. No.)</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={form.registration_no}
                        onChange={(e) => update('registration_no', e.target.value)}
                        placeholder="e.g. 9003"
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Application Date</label>
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

                  <div>
                    <label className="label">BA Code (Broker Code)</label>
                    <input
                      type="text"
                      list="ba-code-options"
                      value={form.ba_code}
                      onChange={(e) => update('ba_code', e.target.value)}
                      placeholder="e.g. BS or GKC/11/RJS"
                      className="input"
                    />
                    <datalist id="ba-code-options">
                      {brokerOptions.map((b, idx) => (
                        <option key={`${b.code}-${idx}`} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="label">Broker / Associate Name</label>
                    <input
                      type="text"
                      list="broker-name-options"
                      value={form.broker_name}
                      onChange={(e) => update('broker_name', e.target.value)}
                      placeholder="e.g. BS / Sunil Broker"
                      className="input"
                    />
                    <datalist id="broker-name-options">
                      {brokerOptions.map((b, idx) => (
                        <option key={`${b.name}-${idx}`} value={b.name}>
                          {b.code}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>
              </motion.div>

              {/* 2. Plot & Society Details */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Home size={18} style={{ color: 'var(--gold)' }} /> Plot &amp; Society Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="label">Society Name</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        list="customer-society-options"
                        value={form.society_name}
                        onChange={(e) => update('society_name', e.target.value)}
                        placeholder="e.g. ROYAL CITY ( I/BLOCK )"
                        className="input pl-10"
                      />
                      <datalist id="customer-society-options">
                        {societyOptions.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="label">Block</label>
                    <input
                      type="text"
                      value={form.block_name}
                      onChange={(e) => update('block_name', e.target.value)}
                      placeholder="e.g. I or Block I"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Plot No.</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={form.plot_no}
                        onChange={(e) => update('plot_no', e.target.value)}
                        placeholder="e.g. 219, 220"
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="label">Size (Plot Dimensions)</label>
                    <div className="relative">
                      <Ruler size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={form.plot_size}
                        onChange={(e) => update('plot_size', e.target.value)}
                        placeholder="e.g. 14x36"
                        className="input pl-10"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {PLOT_SIZE_PRESETS.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => update('plot_size', sz)}
                          className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                            form.plot_size === sz
                              ? 'bg-amber-100 border-amber-400 text-amber-900 font-medium'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 3. Applicant Personal, Contact & KYC Details */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <User size={18} style={{ color: 'var(--gold)' }} /> Applicant Personal, Contact &amp; KYC Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className="label">
                      Applicant Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={(e) => update('client_name', e.target.value)}
                      placeholder="e.g. Ashok Kumar Varma S/O - Rampal Varma"
                      className={`input ${errors.client_name ? 'border-red-400' : ''}`}
                    />
                    {errors.client_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Father / Husband Name (S/O, D/O, W/O)</label>
                    <input
                      type="text"
                      value={form.father_or_husband_name}
                      onChange={(e) => update('father_or_husband_name', e.target.value)}
                      placeholder="e.g. Rampal Varma"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Date of Birth</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => update('date_of_birth', e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Age (Years)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={(e) => update('age', e.target.value)}
                      placeholder="Auto-calculated or enter age"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Profession</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        list="profession-options"
                        value={form.profession}
                        onChange={(e) => update('profession', e.target.value)}
                        placeholder="e.g. Job / Business"
                        className="input pl-10"
                      />
                      <datalist id="profession-options">
                        {PROFESSION_OPTIONS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="label">Residential Address</label>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      placeholder="e.g. H No. 2198, Pragati Nagar, Gandhiwadi, Umbergam, Valsad, Gujarat - 396170"
                      className="input resize-none"
                    />
                  </div>

                  <div>
                    <label className="label">Mobile No.</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        value={form.contact_no}
                        onChange={(e) => update('contact_no', e.target.value)}
                        placeholder="e.g. 8401348543"
                        className={`input pl-10 ${errors.contact_no ? 'border-red-400' : ''}`}
                      />
                    </div>
                    {errors.contact_no && (
                      <p className="text-xs text-red-500 mt-1">{errors.contact_no}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Resident / Alternate No.</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        value={form.resident_no}
                        onChange={(e) => update('resident_no', e.target.value)}
                        placeholder="Optional landline / alt mobile"
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Applicant Passport Photo</label>
                    <div className="flex items-center gap-3">
                      <label className="btn btn-secondary btn-sm cursor-pointer flex items-center gap-2">
                        <Camera size={14} />
                        {form.applicant_photo ? 'Change Photo' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {form.applicant_photo && (
                        <div className="flex items-center gap-2">
                          <img
                            src={form.applicant_photo}
                            alt="Applicant preview"
                            className="w-9 h-9 rounded object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => update('applicant_photo', '')}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label flex items-center gap-1.5">
                      <IdCard size={14} /> Aadhar No.
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={14}
                      value={form.aadhar_no}
                      onChange={(e) => update('aadhar_no', e.target.value)}
                      placeholder="e.g. 753000774699"
                      className={`input font-mono ${errors.aadhar_no ? 'border-red-400' : ''}`}
                    />
                    {errors.aadhar_no && (
                      <p className="text-xs text-red-500 mt-1">{errors.aadhar_no}</p>
                    )}
                  </div>

                  <div>
                    <label className="label flex items-center gap-1.5">
                      <ShieldCheck size={14} /> PAN No.
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={form.pan_no}
                      onChange={(e) => update('pan_no', e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      className={`input font-mono uppercase ${errors.pan_no ? 'border-red-400' : ''}`}
                    />
                    {errors.pan_no && (
                      <p className="text-xs text-red-500 mt-1">{errors.pan_no}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Policy Number (Optional)</label>
                    <input
                      type="text"
                      value={form.policy_number}
                      onChange={(e) => update('policy_number', e.target.value)}
                      placeholder="Optional policy number"
                      className="input"
                    />
                  </div>
                </div>
              </motion.div>

              {/* 4. Nominee Details */}
              <motion.div variants={item} className="card p-5">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <UserCheck size={18} style={{ color: 'var(--gold)' }} /> Nominee Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className="label">Nominee&apos;s Name</label>
                    <input
                      type="text"
                      value={form.nominee_name}
                      onChange={(e) => update('nominee_name', e.target.value)}
                      placeholder="Full name of nominee"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Relation</label>
                    <input
                      type="text"
                      list="nominee-relation-options"
                      value={form.nominee_relation}
                      onChange={(e) => update('nominee_relation', e.target.value)}
                      placeholder="e.g. Wife / Son / Father"
                      className="input"
                    />
                    <datalist id="nominee-relation-options">
                      {RELATION_OPTIONS.map((rel) => (
                        <option key={rel} value={rel} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="label">Nominee Date of Birth</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="date"
                        value={form.nominee_dob}
                        onChange={(e) => update('nominee_dob', e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Nominee Age</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={form.nominee_age}
                      onChange={(e) => update('nominee_age', e.target.value)}
                      placeholder="Nominee age in years"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Nominee Profession</label>
                    <input
                      type="text"
                      list="profession-options"
                      value={form.nominee_profession}
                      onChange={(e) => update('nominee_profession', e.target.value)}
                      placeholder="e.g. Housewife / Job / Student"
                      className="input"
                    />
                  </div>
                </div>
              </motion.div>

              {/* 5. EMI & Booking Payment Details */}
              <motion.div variants={item} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h2 className="text-h3 flex items-center gap-2">
                    <CreditCard size={18} style={{ color: 'var(--gold)' }} /> EMI &amp; Booking Payment Details
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                    Cheque in the Name of: GURUKRUPA CORPORATION
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Enclosed EMI of Rs. (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.emi_amount}
                      onChange={(e) => update('emi_amount', e.target.value)}
                      placeholder="e.g. 5000"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Payment Mode (by Cash / Bank)</label>
                    <select
                      value={form.cheque_cash}
                      onChange={(e) => update('cheque_cash', e.target.value)}
                      className="input select"
                    >
                      {PAYMENT_MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Monthly EMI Date (Booking Cycle)</label>
                    <input
                      type="text"
                      value={form.emi_date}
                      onChange={(e) => update('emi_date', e.target.value)}
                      placeholder="e.g. 15 to 20"
                      className="input"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {EMI_DATE_WINDOWS.map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => update('emi_date', w)}
                          className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                            form.emi_date === w
                              ? 'bg-amber-100 border-amber-400 text-amber-900 font-medium'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Total Plot Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.plot_amount}
                      onChange={(e) => update('plot_amount', e.target.value)}
                      placeholder="e.g. 325000"
                      className={`input ${errors.plot_amount ? 'border-red-400' : ''}`}
                    />
                    {errors.plot_amount && (
                      <p className="text-xs text-red-500 mt-1">{errors.plot_amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Paid / Booking Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.paid_amount}
                      onChange={(e) => update('paid_amount', e.target.value)}
                      placeholder="Defaults to EMI amount if blank"
                      className="input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Total EMI Months</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.emi_time}
                        onChange={(e) => update('emi_time', e.target.value)}
                        placeholder="e.g. 65"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">EMI No.</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.emi_no}
                        onChange={(e) => update('emi_no', e.target.value)}
                        placeholder="e.g. 1"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="label">Amount in Words</label>
                    <input
                      type="text"
                      value={form.amount_in_word}
                      onChange={(e) => update('amount_in_word', e.target.value)}
                      placeholder="Auto-filled from Paid / EMI Amount (e.g. FIVE THOUSAND RUPEES ONLY.)"
                      className="input"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="label flex items-center gap-2">
                      <MessageSquare size={14} /> Remarks
                    </label>
                    <textarea
                      value={form.remarks}
                      onChange={(e) => update('remarks', e.target.value)}
                      rows={2}
                      placeholder="Additional notes about the booking, payment reference, or plot…"
                      className="input resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Preview + actions */}
              <motion.div variants={item} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {form.applicant_photo ? (
                    <img
                      src={form.applicant_photo}
                      alt={form.client_name || 'Applicant'}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
                    >
                      {(form.client_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {form.client_name.trim() || 'New Customer'}
                      {form.registration_no && (
                        <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          Reg #{form.registration_no}
                        </span>
                      )}
                    </p>
                    {preview ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${preview.color}`}>
                          {preview.label}
                        </span>
                        {form.society_name && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {form.society_name} {form.plot_no ? `· Plot ${form.plot_no}` : ''}
                          </span>
                        )}
                      </div>
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
