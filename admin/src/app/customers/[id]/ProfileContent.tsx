'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  Home,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { normalizeDate, parseAmount } from '@/utils/dataUtils';
import { formatIndianNumber } from '@/utils/format';

interface Props {
  customer: MasterDataOfGurukrupa;
  portfolio: MasterDataOfGurukrupa[];
}

type TabKey = 'overview' | 'property' | 'payments' | 'broker';

interface GroupedPlot {
  key: string;
  society_name: string;
  block_name: string;
  plot_no: string;
  plot_size: string;
  plotAmount: number;
  totalPaid: number;
  cancelled: boolean;
  receipts: MasterDataOfGurukrupa[];
}

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function fmtINR(n: number) {
  return `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
}

function deriveStatus(row: MasterDataOfGurukrupa) {
  const cancelled = !!row.cancel_date;
  const emi = parseAmount(row.emi_amount);
  const paid = parseAmount(row.paid_amount);

  if (cancelled) return { label: 'Cancelled', tone: 'danger' as const, icon: <X size={14} /> };
  if (emi > 0) return { label: 'Installment', tone: 'info' as const, icon: <Clock size={14} /> };
  if (paid > 0) return { label: 'Active', tone: 'success' as const, icon: <CheckCircle2 size={14} /> };
  return { label: 'Prospect', tone: 'gold' as const, icon: <User size={14} /> };
}

function fmtDate(raw: string | null | undefined): string {
  if (!raw) return '—';
  const iso = normalizeDate(raw);
  if (!iso) return String(raw);
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  const rendered = value === null || value === undefined || value === '' ? '—' : value;
  return (
    <div>
      <p className="text-xs-label mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {rendered}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <h3 className="text-h3 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'property', label: 'Properties' },
  { key: 'payments', label: 'Payments' },
  { key: 'broker', label: 'Broker' },
];

export default function ProfileContent({ customer: initialCustomer, portfolio: initialPortfolio }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [customer, setCustomer] = useState<MasterDataOfGurukrupa>(initialCustomer);
  const [portfolio, setPortfolio] = useState<MasterDataOfGurukrupa[]>(
    initialPortfolio.length > 0 ? initialPortfolio : [initialCustomer]
  );

  // Edit & Delete modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncAllClientRows, setSyncAllClientRows] = useState(true);

  const [editForm, setEditForm] = useState({
    client_name: customer.client_name || '',
    father_or_husband_name: customer.father_or_husband_name || '',
    contact_no: customer.contact_no || '',
    resident_no: customer.resident_no || '',
    address: customer.address || '',
    profession: customer.profession || '',
    age: customer.age || '',
    date_of_birth: customer.date_of_birth || '',
    aadhar_no: customer.aadhar_no || '',
    pan_no: customer.pan_no || '',
    society_name: customer.society_name || '',
    block_name: customer.block_name || '',
    plot_no: customer.plot_no || '',
    plot_size: customer.plot_size || '',
    plot_amount: customer.plot_amount || '',
    paid_amount: customer.paid_amount || '',
    emi_amount: customer.emi_amount || '',
    emi_no: customer.emi_no || '',
    emi_time: customer.emi_time || '',
    emi_date: customer.emi_date || '',
    emi_paid_date: customer.emi_paid_date || '',
    "broker's_name": customer["broker's_name"] || '',
    broker_code: customer.broker_code || '',
    ba_code: customer.ba_code || '',
    registration_no: customer.registration_no || customer.r_no || '',
    nominee_name: customer.nominee_name || '',
    nominee_relation: customer.nominee_relation || '',
    remarks: customer.remarks || '',
  });

  // Group portfolio by unique plot (society_name || plot_no)
  const groupedPlots = useMemo<GroupedPlot[]>(() => {
    const map = new Map<string, GroupedPlot>();
    for (const row of portfolio) {
      const soc = (row.society_name || '').trim();
      const plot = (row.plot_no || '').trim();
      const key = `${soc}||${plot}`;
      const rowPlotAmt = parseAmount(row.plot_amount);
      const rowPaidAmt = parseAmount(row.paid_amount);
      const isCancelled = !!row.cancel_date;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          society_name: soc || '—',
          block_name: row.block_name || '',
          plot_no: plot || '—',
          plot_size: row.plot_size || '',
          plotAmount: rowPlotAmt,
          totalPaid: isCancelled ? 0 : rowPaidAmt,
          cancelled: isCancelled,
          receipts: [row],
        });
      } else {
        existing.receipts.push(row);
        if (rowPlotAmt > existing.plotAmount) {
          existing.plotAmount = rowPlotAmt;
        }
        if (!isCancelled) {
          existing.totalPaid += rowPaidAmt;
          existing.cancelled = false;
        }
        if (!existing.plot_size && row.plot_size) {
          existing.plot_size = row.plot_size;
        }
        if (!existing.block_name && row.block_name) {
          existing.block_name = row.block_name;
        }
      }
    }
    return Array.from(map.values());
  }, [portfolio]);

  const singleReceiptPlotAmt = useMemo(() => parseAmount(customer.plot_amount), [customer.plot_amount]);
  const paidAmt = useMemo(() => parseAmount(customer.paid_amount), [customer.paid_amount]);

  // Same-plot rows for the currently viewed customer record
  const samePlotRows = useMemo(() => {
    const curSoc = (customer.society_name || '').trim().toLowerCase();
    const curPlot = (customer.plot_no || '').trim().toLowerCase();
    const matched = portfolio.filter(
      (r) =>
        (r.society_name || '').trim().toLowerCase() === curSoc &&
        (r.plot_no || '').trim().toLowerCase() === curPlot
    );
    return matched.length > 0 ? matched : [customer];
  }, [portfolio, customer]);

  const totalPlotPaid = useMemo(() => {
    const nonCancelled = samePlotRows.filter((r) => !r.cancel_date);
    if (nonCancelled.length === 0) return paidAmt;
    const sum = nonCancelled.reduce((acc, r) => acc + parseAmount(r.paid_amount), 0);
    return sum > 0 ? sum : paidAmt;
  }, [samePlotRows, paidAmt]);

  const maxPlotAmount = useMemo(() => {
    const max = samePlotRows.reduce((acc, r) => Math.max(acc, parseAmount(r.plot_amount)), 0);
    return max > 0 ? max : singleReceiptPlotAmt;
  }, [samePlotRows, singleReceiptPlotAmt]);

  const remaining = Math.max(0, maxPlotAmount - totalPlotPaid);
  const progress = maxPlotAmount > 0 ? Math.min(100, Math.round((totalPlotPaid / maxPlotAmount) * 100)) : 0;
  const status = deriveStatus(customer);
  const joinDate = customer.date_of_form ?? customer.date ?? customer.emi_paid_date;

  const openEditModal = () => {
    setEditForm({
      client_name: customer.client_name || '',
      father_or_husband_name: customer.father_or_husband_name || '',
      contact_no: customer.contact_no || '',
      resident_no: customer.resident_no || '',
      address: customer.address || '',
      profession: customer.profession || '',
      age: customer.age || '',
      date_of_birth: customer.date_of_birth || '',
      aadhar_no: customer.aadhar_no || '',
      pan_no: customer.pan_no || '',
      society_name: customer.society_name || '',
      block_name: customer.block_name || '',
      plot_no: customer.plot_no || '',
      plot_size: customer.plot_size || '',
      plot_amount: customer.plot_amount || '',
      paid_amount: customer.paid_amount || '',
      emi_amount: customer.emi_amount || '',
      emi_no: customer.emi_no || '',
      emi_time: customer.emi_time || '',
      emi_date: customer.emi_date || '',
      emi_paid_date: customer.emi_paid_date || '',
      "broker's_name": customer["broker's_name"] || '',
      broker_code: customer.broker_code || '',
      ba_code: customer.ba_code || '',
      registration_no: customer.registration_no || customer.r_no || '',
      nominee_name: customer.nominee_name || '',
      nominee_relation: customer.nominee_relation || '',
      remarks: customer.remarks || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          r_no: editForm.registration_no,
          updateAllForClient: syncAllClientRows,
          originalClientName: customer.client_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update customer');
      }
      setCustomer(data.customer);
      setPortfolio((prev) =>
        prev.map((r) => {
          if (r.id === data.customer.id) return data.customer;
          if (syncAllClientRows) {
            return {
              ...r,
              client_name: data.customer.client_name,
              contact_no: data.customer.contact_no,
              address: data.customer.address,
              aadhar_no: data.customer.aadhar_no,
              pan_no: data.customer.pan_no,
            };
          }
          return r;
        })
      );
      toast.success('Customer updated successfully');
      setShowEditModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (scope: 'record' | 'customer') => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/customers/${customer.id}?scope=${scope}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }
      toast.success(
        scope === 'customer'
          ? `Deleted all records for ${customer.client_name}`
          : `Deleted record #${customer.id}`
      );
      setShowDeleteModal(false);
      router.push('/customers');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteReceiptRow = async (receipt: MasterDataOfGurukrupa) => {
    if (!window.confirm(`Delete installment receipt #${receipt.id} (${fmtINR(parseAmount(receipt.paid_amount))})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${receipt.id}?scope=record`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete receipt');
      }
      toast.success(`Deleted receipt #${receipt.id}`);
      if (receipt.id === customer.id && portfolio.length <= 1) {
        router.push('/customers');
        return;
      }
      setPortfolio((prev) => prev.filter((r) => r.id !== receipt.id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete receipt');
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/customers"
            className="inline-flex items-center text-sm mb-2 hover:text-[var(--gold-dark)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Customers
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="avatar avatar-xl font-bold"
                style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
              >
                {(customer.client_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="page-title">{customer.client_name || 'Customer Profile'}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {customer.contact_no && (
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Phone size={14} />
                      {customer.contact_no}
                    </span>
                  )}
                  {customer.society_name && (
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={14} />
                      {customer.society_name}
                    </span>
                  )}
                  {customer.plot_no && (
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Home size={14} />
                      Plot {customer.plot_no}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                    Record #{customer.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start mt-1">
              <span className={classNames('badge', `badge-${status.tone}`)}>
                {status.icon}
                {status.label}
              </span>
              <button
                type="button"
                onClick={openEditModal}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Edit size={14} />
                Edit Customer
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-sm flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Plot Amount',
              value: fmtINR(maxPlotAmount),
              sub: `Plot ${customer.plot_no || '—'}`,
              tone: 'gold',
            },
            {
              label: 'Total Plot Paid',
              value: fmtINR(totalPlotPaid),
              sub:
                samePlotRows.length > 1
                  ? `${samePlotRows.length} receipts (this receipt: ${fmtINR(paidAmt)})`
                  : `1 receipt`,
              tone: 'success',
            },
            {
              label: 'Remaining',
              value: fmtINR(remaining),
              sub: `${groupedPlots.length} plot(s) · ${portfolio.length} total receipts`,
              tone: remaining === 0 ? 'success' : 'warning',
            },
            {
              label: 'Progress',
              value: `${progress}%`,
              sub: '',
              tone: progress >= 80 ? 'success' : progress >= 40 ? 'gold' : 'warning',
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-4"
            >
              <p className="text-xs-label mb-1" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </p>
              <p className="text-h2">{s.value}</p>
              {s.sub && (
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {s.sub}
                </p>
              )}
              {s.label === 'Progress' && (
                <div className="progress-bar mt-2">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                      background:
                        s.tone === 'success'
                          ? 'var(--success)'
                          : s.tone === 'gold'
                          ? 'var(--gold)'
                          : 'var(--warning)',
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={classNames('tab-item', activeTab === t.key && 'active')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              <div className="md:col-span-2 space-y-5">
                <SectionCard title="Customer & Personal Details" icon={<User size={18} style={{ color: 'var(--gold)' }} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Registration No. (R. No.)" value={customer.registration_no || customer.r_no} />
                    <Field label="BA Code / Broker Code" value={customer.ba_code || customer.broker_code || customer["broker's_name"]} />
                    <Field label="Full Name" value={customer.client_name} />
                    <Field label="Father / Husband Name (S/O, D/O, W/O)" value={customer.father_or_husband_name} />
                    <Field label="Date of Birth" value={fmtDate(customer.date_of_birth)} />
                    <Field label="Age" value={customer.age ? `${customer.age} yrs` : null} />
                    <Field label="Profession" value={customer.profession} />
                    <Field label="Mobile Number" value={customer.contact_no} />
                    <Field label="Resident / Alt. Number" value={customer.resident_no} />
                    <Field label="Aadhar Number" value={customer.aadhar_no} />
                    <Field label="PAN Number" value={customer.pan_no} />
                    <Field label="Policy Number" value={customer.policy_number} />
                    <div className="col-span-2">
                      <Field label="Residential Address" value={customer.address} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Plot & Scheme Details" icon={<Home size={18} style={{ color: 'var(--gold)' }} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Society Name" value={customer.society_name} />
                    <Field label="Block" value={customer.block_name} />
                    <Field label="Plot Number(s)" value={customer.plot_no} />
                    <Field label="Plot Size" value={customer.plot_size} />
                    <Field label="EMI Schedule / Window" value={customer.emi_date ? `${customer.emi_date} of month` : null} />
                    <Field label="Month & Year" value={customer.month_and_year} />
                  </div>
                </SectionCard>

                <SectionCard title="Nominee Details" icon={<Users size={18} style={{ color: 'var(--gold)' }} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nominee's Name" value={customer.nominee_name} />
                    <Field label="Relation" value={customer.nominee_relation} />
                    <Field label="Nominee Age" value={customer.nominee_age ? `${customer.nominee_age} yrs` : null} />
                    <Field label="Nominee Date of Birth" value={fmtDate(customer.nominee_dob)} />
                    <Field label="Nominee Profession" value={customer.nominee_profession} />
                  </div>
                </SectionCard>

                <SectionCard title="Joining & Registration" icon={<Calendar size={18} style={{ color: 'var(--gold)' }} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Form / Application Date" value={fmtDate(customer.date_of_form)} />
                    <Field label="Booking Date" value={fmtDate(customer.date)} />
                    <Field label="EMI Paid Date" value={fmtDate(customer.emi_paid_date)} />
                    <Field label="Joining Date" value={fmtDate(joinDate)} />
                  </div>
                </SectionCard>
              </div>

              <div className="space-y-5">
                <SectionCard title="Payment Snapshot" icon={<Banknote size={18} style={{ color: 'var(--gold)' }} />}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Plot Amount</span>
                      <span className="font-semibold">{fmtINR(maxPlotAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>
                        Total Plot Paid ({samePlotRows.length} {samePlotRows.length === 1 ? 'receipt' : 'receipts'})
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--success)' }}>
                        {fmtINR(totalPlotPaid)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>This Receipt (#{customer.id})</span>
                      <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {fmtINR(paidAmt)} {customer.emi_no ? `(EMI #${customer.emi_no})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Remaining</span>
                      <span className="font-semibold" style={{ color: remaining === 0 ? 'var(--success)' : 'var(--warning)' }}>
                        {fmtINR(remaining)}
                      </span>
                    </div>
                    <div className="progress-bar mt-2">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                          background: progress >= 80 ? 'var(--success)' : progress >= 40 ? 'var(--gold)' : 'var(--warning)',
                        }}
                      />
                    </div>
                    <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
                      {progress}% paid across {samePlotRows.length} receipt{samePlotRows.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </SectionCard>

                {customer.remarks && (
                  <SectionCard title="Remarks" icon={<MessageSquare size={18} style={{ color: 'var(--gold)' }} />}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {customer.remarks}
                    </p>
                  </SectionCard>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'property' && (
            <motion.div
              key="property"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {groupedPlots.length === 0 ? (
                <div className="empty-state card py-12">
                  <Home size={24} style={{ color: 'var(--text-muted)' }} />
                  <p className="mt-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    No property records found
                  </p>
                </div>
              ) : (
                groupedPlots.map((group) => {
                  const pPct =
                    group.plotAmount > 0
                      ? Math.min(100, Math.round((group.totalPaid / group.plotAmount) * 100))
                      : 0;
                  const pRem = Math.max(0, group.plotAmount - group.totalPaid);

                  return (
                    <div key={group.key} className="card p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                            {group.society_name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Plot {group.plot_no} {group.block_name ? `· Block ${group.block_name}` : ''} ·{' '}
                            {group.plot_size || '—'} · {group.receipts.length} installment receipt
                            {group.receipts.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <span
                          className={classNames(
                            'badge self-start',
                            group.cancelled
                              ? 'badge-danger'
                              : pPct >= 100
                              ? 'badge-success'
                              : 'badge-info'
                          )}
                        >
                          {group.cancelled
                            ? 'Cancelled'
                            : pPct >= 100
                            ? 'Paid in Full'
                            : `${group.receipts.length} Receipts`}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Plot Amount
                          </p>
                          <p className="font-semibold">{fmtINR(group.plotAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Total Paid ({group.receipts.length} receipts)
                          </p>
                          <p className="font-semibold" style={{ color: 'var(--success)' }}>
                            {fmtINR(group.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Remaining
                          </p>
                          <p className="font-semibold" style={{ color: pRem === 0 ? 'var(--success)' : 'var(--warning)' }}>
                            {fmtINR(pRem)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pPct}%`,
                              background:
                                pPct >= 80
                                  ? 'var(--success)'
                                  : pPct >= 40
                                  ? 'var(--gold)'
                                  : 'var(--warning)',
                            }}
                          />
                        </div>
                        <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-muted)' }}>
                          {pPct}% paid
                        </p>
                      </div>

                      {/* Installment receipts table for this plot */}
                      <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                          Installment / Receipt History ({group.receipts.length})
                        </p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="border-b text-left" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                <th className="py-2 pr-3">Receipt #</th>
                                <th className="py-2 pr-3">Reg / R. No.</th>
                                <th className="py-2 pr-3">EMI #</th>
                                <th className="py-2 pr-3">Date</th>
                                <th className="py-2 pr-3">Mode</th>
                                <th className="py-2 pr-3">Receipt Paid</th>
                                <th className="py-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                              {group.receipts.map((r) => {
                                const rPaid = parseAmount(r.paid_amount);
                                const isCurrent = r.id === customer.id;
                                return (
                                  <tr
                                    key={r.id}
                                    className={classNames(
                                      'hover:bg-gray-50',
                                      isCurrent && 'bg-amber-50/60 font-medium'
                                    )}
                                  >
                                    <td className="py-2 pr-3 font-mono">
                                      <Link
                                        href={`/customers/${r.id}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        #{r.id}
                                      </Link>
                                      {isCurrent && (
                                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">
                                          viewing
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 pr-3 font-mono">{r.registration_no || r.r_no || '—'}</td>
                                    <td className="py-2 pr-3">{r.emi_no ? `EMI #${r.emi_no}` : 'Booking / Lump'}</td>
                                    <td className="py-2 pr-3">
                                      {fmtDate(r.emi_paid_date || r.date || r.date_of_form)}
                                    </td>
                                    <td className="py-2 pr-3">{r.cheque_cash || '—'}</td>
                                    <td className="py-2 pr-3 font-semibold" style={{ color: 'var(--success)' }}>
                                      {fmtINR(rPaid)}
                                    </td>
                                    <td className="py-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReceiptRow(r)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                                        title="Delete this installment receipt"
                                      >
                                        <Trash2 size={12} />
                                        Delete Receipt
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <SectionCard title="Payment Details" icon={<CreditCard size={18} style={{ color: 'var(--gold)' }} />}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Plot Amount" value={fmtINR(maxPlotAmount)} />
                  <Field label={`Total Plot Paid (${samePlotRows.length} receipts)`} value={fmtINR(totalPlotPaid)} />
                  <Field label={`This Receipt Paid (#${customer.id})`} value={formatIndianNumber(customer.paid_amount)} />
                  <Field label="Remaining Balance" value={fmtINR(remaining)} />
                  <Field label="Amount in Words" value={customer.amount_in_word} />
                  <Field label="Cheque / Cash" value={customer.cheque_cash} />
                </div>
              </SectionCard>

              <SectionCard title="EMI Details" icon={<Receipt size={18} style={{ color: 'var(--gold)' }} />}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="EMI Amount" value={formatIndianNumber(customer.emi_amount)} />
                  <Field label="Monthly EMI Date" value={customer.emi_date} />
                  <Field label="EMI Term (Months)" value={customer.emi_time} />
                  <Field label="EMI Number" value={customer.emi_no} />
                  <Field label="EMI Paid Date" value={fmtDate(customer.emi_paid_date)} />
                  <Field label="Month & Year" value={customer.month_and_year} />
                  <Field label="Application Date" value={fmtDate(customer.date_of_form || customer.date)} />
                </div>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'broker' && (
            <motion.div
              key="broker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              <div className="md:col-span-1">
                <SectionCard title="Broker Information" icon={<Users size={18} style={{ color: 'var(--gold)' }} />}>
                  {customer["broker's_name"] ? (
                    <div className="text-center py-4">
                      <div
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-3"
                        style={{ background: 'var(--gold-muted)', color: 'var(--gold-dark)' }}
                      >
                        {(customer.broker_name_clean || customer["broker's_name"]).charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {customer.broker_name_clean || customer["broker's_name"]}
                      </p>
                      {(customer.broker_code || customer.ba_code) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 mt-2">
                          {customer.broker_code || customer.ba_code}
                        </span>
                      )}
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Record: {customer["broker's_name"]}
                      </p>
                      <Link
                        href={`/brokers/${encodeURIComponent(customer.broker_code || customer.ba_code || customer["broker's_name"])}`}
                        className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:underline"
                      >
                        View broker profile &amp; all deals →
                      </Link>
                    </div>
                  ) : (
                    <div className="empty-state py-8">
                      <Users size={24} style={{ color: 'var(--text-muted)' }} />
                      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        No broker assigned
                      </p>
                    </div>
                  )}
                </SectionCard>
              </div>

              <div className="md:col-span-2">
                <SectionCard title="Properties handled for this customer" icon={<Building2 size={18} style={{ color: 'var(--gold)' }} />}>
                  {groupedPlots.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No properties on record.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {groupedPlots.map((g) => (
                        <div
                          key={g.key}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {g.society_name} — Plot {g.plot_no}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {g.plot_size || '—'} · {g.receipts.length} receipt{g.receipts.length === 1 ? '' : 's'} · Paid {fmtINR(g.totalPaid)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: 'var(--gold-dark)' }}>
                            {fmtINR(g.plotAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
            onClick={() => !isSaving && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 max-w-2xl w-full bg-white shadow-xl max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Customer Record #{customer.id}</h3>
                  <p className="text-xs text-gray-500">Update personal, plot, payment, or broker details</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="input input-sm w-full"
                      value={editForm.client_name}
                      onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Father / Husband Name</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.father_or_husband_name}
                      onChange={(e) => setEditForm({ ...editForm, father_or_husband_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Mobile Number</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.contact_no}
                      onChange={(e) => setEditForm({ ...editForm, contact_no: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Registration / R. No.</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.registration_no}
                      onChange={(e) => setEditForm({ ...editForm, registration_no: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Society Name</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.society_name}
                      onChange={(e) => setEditForm({ ...editForm, society_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Plot No.</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.plot_no}
                      onChange={(e) => setEditForm({ ...editForm, plot_no: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Plot Size</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.plot_size}
                      onChange={(e) => setEditForm({ ...editForm, plot_size: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Plot Amount</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.plot_amount}
                      onChange={(e) => setEditForm({ ...editForm, plot_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">This Receipt Paid Amount</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.paid_amount}
                      onChange={(e) => setEditForm({ ...editForm, paid_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">EMI Amount</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.emi_amount}
                      onChange={(e) => setEditForm({ ...editForm, emi_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">EMI No.</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.emi_no}
                      onChange={(e) => setEditForm({ ...editForm, emi_no: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Broker / BA Code</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.broker_code}
                      onChange={(e) => setEditForm({ ...editForm, broker_code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Aadhar No.</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.aadhar_no}
                      onChange={(e) => setEditForm({ ...editForm, aadhar_no: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">PAN No.</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.pan_no}
                      onChange={(e) => setEditForm({ ...editForm, pan_no: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Address</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Remarks</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editForm.remarks}
                      onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    />
                  </div>
                </div>

                {portfolio.length > 1 && (
                  <label className="flex items-center gap-2 text-xs text-gray-700 pt-1">
                    <input
                      type="checkbox"
                      checked={syncAllClientRows}
                      onChange={(e) => setSyncAllClientRows(e.target.checked)}
                    />
                    Sync personal details (name, phone, address, Aadhar, PAN) across all {portfolio.length} records for this customer
                  </label>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setShowEditModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm">
                    {isSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Customer / Record Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 max-w-md w-full space-y-4 bg-white shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Delete Customer / Record</h3>
                    <p className="text-xs text-gray-500">
                      {customer.client_name} · Plot {customer.plot_no || '—'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDeleteCustomer('record')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Delete this record only (#{customer.id})
                    </p>
                    <p className="text-xs text-gray-500">
                      Removes just this installment receipt ({fmtINR(paidAmt)})
                    </p>
                  </div>
                  <Trash2 size={16} className="text-red-500 shrink-0" />
                </button>

                {customer.client_name && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeleteCustomer('customer')}
                    className="w-full text-left p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Delete all {portfolio.length} record{portfolio.length === 1 ? '' : 's'} for {customer.client_name}
                      </p>
                      <p className="text-xs text-red-600">
                        Removes the entire customer profile &amp; all installment receipts
                      </p>
                    </div>
                    <Trash2 size={16} className="text-red-700 shrink-0" />
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
