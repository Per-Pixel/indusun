'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Home,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  Ruler,
  Tag,
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

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function fmtINR(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
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

export default function ProfileContent({ customer, portfolio }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const plotAmt = useMemo(() => parseAmount(customer.plot_amount), [customer.plot_amount]);
  const paidAmt = useMemo(() => parseAmount(customer.paid_amount), [customer.paid_amount]);
  const emiAmt = useMemo(() => parseAmount(customer.emi_amount), [customer.emi_amount]);
  const remaining = Math.max(0, plotAmt - paidAmt);
  const progress = plotAmt > 0 ? Math.round((paidAmt / plotAmt) * 100) : 0;
  const status = deriveStatus(customer);
  const joinDate = customer.date_of_form ?? customer.date ?? customer.emi_paid_date;

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
                </div>
              </div>
            </div>

            <span className={classNames('badge self-start mt-1', `badge-${status.tone}`)}>
              {status.icon}
              {status.label}
            </span>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Plot Amount', value: fmtINR(plotAmt), tone: 'gold' },
            { label: 'Paid Amount', value: fmtINR(paidAmt), tone: 'success' },
            { label: 'Remaining', value: fmtINR(remaining), tone: remaining === 0 ? 'success' : 'warning' },
            { label: 'Progress', value: `${progress}%`, tone: progress >= 80 ? 'success' : progress >= 40 ? 'gold' : 'warning' },
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
                <SectionCard title="Customer Details" icon={<User size={18} style={{ color: 'var(--gold)' }} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" value={customer.client_name} />
                    <Field label="Contact Number" value={customer.contact_no} />
                    <Field label="Society / Project" value={customer.society_name} />
                    <Field label="Plot Number" value={customer.plot_no} />
                    <Field label="Plot Size" value={customer.plot_size} />
                    <Field label="R No" value={customer.r_no} />
                    <Field label="Policy Number" value={customer.policy_number} />
                    <Field label="Month & Year" value={customer.month_and_year} />
                  </div>
                </SectionCard>

                <SectionCard title="Joining & Registration" icon={<Calendar size={18} style={{ color: 'var(--gold)' }} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Form Date" value={fmtDate(customer.date_of_form)} />
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
                      <span className="font-semibold">{fmtINR(plotAmt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Paid Amount</span>
                      <span className="font-semibold" style={{ color: 'var(--success)' }}>
                        {fmtINR(paidAmt)}
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
                      {progress}% paid
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
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {portfolio.length === 0 ? (
                <div className="col-span-full empty-state card py-12">
                  <Home size={24} style={{ color: 'var(--text-muted)' }} />
                  <p className="mt-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    No property records found
                  </p>
                </div>
              ) : (
                portfolio.map((p) => {
                  const pPlot = parseAmount(p.plot_amount);
                  const pPaid = parseAmount(p.paid_amount);
                  const pPct = pPlot > 0 ? Math.round((pPaid / pPlot) * 100) : 0;
                  const pStatus = deriveStatus(p);
                  return (
                    <div key={p.id} className="card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {p.society_name || '—'}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Plot {p.plot_no || '—'} · {p.plot_size || '—'}
                          </p>
                        </div>
                        <span className={classNames('badge', `badge-${pStatus.tone}`)}>
                          {pStatus.icon}
                          {pStatus.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Plot Amount</p>
                          <p className="font-semibold">{fmtINR(pPlot)}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Paid</p>
                          <p className="font-semibold" style={{ color: 'var(--success)' }}>{fmtINR(pPaid)}</p>
                        </div>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pPct}%`,
                            background: pPct >= 80 ? 'var(--success)' : pPct >= 40 ? 'var(--gold)' : 'var(--warning)',
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-muted)' }}>
                        {pPct}% paid
                      </p>
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
                  <Field label="Plot Amount" value={formatIndianNumber(customer.plot_amount)} />
                  <Field label="Paid Amount" value={formatIndianNumber(customer.paid_amount)} />
                  <Field label="Remaining" value={fmtINR(remaining)} />
                  <Field label="Amount in Words" value={customer.amount_in_word} />
                  <Field label="Cheque / Cash" value={customer.cheque_cash} />
                  <Field label="Payment Mode" value={customer.cheque_cash ? 'Recorded' : '—'} />
                </div>
              </SectionCard>

              <SectionCard title="EMI Details" icon={<Receipt size={18} style={{ color: 'var(--gold)' }} />}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="EMI Amount" value={formatIndianNumber(customer.emi_amount)} />
                  <Field label="EMI Term" value={customer.emi_time} />
                  <Field label="EMI Number" value={customer.emi_no} />
                  <Field label="EMI Paid Date" value={fmtDate(customer.emi_paid_date)} />
                  <Field label="Month & Year" value={customer.month_and_year} />
                  <Field label="Date" value={fmtDate(customer.date)} />
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
                        {customer["broker's_name"].charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {customer["broker's_name"]}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Associated broker
                      </p>
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
                  {portfolio.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No properties on record.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {portfolio.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {p.society_name || '—'} — Plot {p.plot_no || '—'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {p.plot_size || '—'} · {fmtDate(p.date_of_form)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: 'var(--gold-dark)' }}>
                            {formatIndianNumber(p.plot_amount)}
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
    </div>
  );
}
