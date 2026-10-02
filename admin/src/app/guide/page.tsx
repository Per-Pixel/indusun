'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import CRMLayout from '@/components/CRMLayout';
import {
  BookOpen, UserPlus, Receipt, Download, FileSpreadsheet, Settings,
  Lock, MessageSquare, Shield, Crown, Search, ExternalLink, ArrowRight,
  CheckCircle2, AlertCircle, Printer, HelpCircle, Layers, FileText,
  Globe, Smartphone, Bell, ChevronRight, Sparkles, Building2, Users,
  BarChart3, Eye, Key, Check
} from 'lucide-react';

interface GuideSection {
  id: string;
  category: 'admin' | 'billing' | 'settings' | 'comms' | 'sitemap';
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  quickAction?: { label: string; url: string };
  steps: {
    number: number;
    title: string;
    description: string;
    tips?: string[];
  }[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'add-admin',
    category: 'admin',
    title: 'How to Add a New Admin',
    badge: 'Super Admin Only',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <UserPlus className="text-purple-600" size={24} />,
    summary: 'Provision real admin team members with custom permissions, roles, and immediate Supabase authentication login credentials.',
    quickAction: { label: 'Go to Admin Users', url: '/admin-users' },
    steps: [
      {
        number: 1,
        title: 'Open the Admin Users Section',
        description: 'From the left sidebar, navigate to the System category and click on "Admin Users" (/admin-users).',
        tips: ['Only accounts with the Super Admin role can view the "+ Add Admin" creation button.']
      },
      {
        number: 2,
        title: 'Click the "+ Add Admin" Button',
        description: 'Click the blue "+ Add Admin" button located at the top right of the page to open the creation modal.',
      },
      {
        number: 3,
        title: 'Fill Out Account Credentials & Role',
        description: 'Enter the new admin\'s Full Name, Email Address (used to sign in), Temporary Password (minimum 8 characters), and Phone Number.',
        tips: [
          'Choose "Admin" for operational team members with limited module access.',
          'Choose "Super Admin" for full ownership and the ability to manage other admins.'
        ]
      },
      {
        number: 4,
        title: 'Select Granular Permissions',
        description: 'Check off specific module access for this administrator (e.g., User Management, Property Management, Billing Management, CMS, Internal Communications).',
      },
      {
        number: 5,
        title: 'Submit & Confirm Creation',
        description: 'Click "Create Admin". The user is automatically created in Supabase Auth and the admin database. They can immediately log in at /auth/login.',
      }
    ]
  },
  {
    id: 'admin-settings',
    category: 'admin',
    title: 'How to Edit an Admin\'s Settings & Permissions',
    badge: 'Super Admin Only',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <Shield className="text-purple-600" size={24} />,
    summary: 'Modify another admin\'s permissions, change their active/inactive status, or reset their password.',
    quickAction: { label: 'Manage Admins', url: '/admin-users' },
    steps: [
      {
        number: 1,
        title: 'Select the Admin from the List',
        description: 'On the /admin-users page, click on the admin\'s row or click "View Profile" to open their detail page (/admin-users/[id]).',
      },
      {
        number: 2,
        title: 'Edit Roles or Permissions',
        description: 'Click the "Edit Profile" button. You can update their contact info, switch between Admin/Super Admin, toggle Active/Inactive/Pending status, or adjust individual permission checkboxes.',
      },
      {
        number: 3,
        title: 'Reset Their Password',
        description: 'Click the "Reset Password" button at the top right. Enter a new secure password (8+ characters) and click "Update Password" to reset their login immediately.',
      }
    ]
  },
  {
    id: 'system-settings',
    category: 'settings',
    title: 'Where System & Personal Settings Are Located',
    badge: 'All Admins',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Settings className="text-blue-600" size={24} />,
    summary: 'Manage your personal profile, notification preferences, security/password, appearance theme, and database health console.',
    quickAction: { label: 'Open Settings Page', url: '/settings' },
    steps: [
      {
        number: 1,
        title: 'Access the Settings Page',
        description: 'Click "Settings" at the bottom of the left sidebar under System, or click your profile avatar in the top-right header and select "Settings" (/settings).',
      },
      {
        number: 2,
        title: 'Profile & Account Tabs',
        description: 'Update your display name, email, phone, location, bio, website, and avatar photo. Review your account role badge.',
      },
      {
        number: 3,
        title: 'Notifications Tab',
        description: 'Configure automated email triggers (new clients, new properties, sales), desktop browser push alerts, and in-app sound notifications.',
      },
      {
        number: 4,
        title: 'Security Tab (Password, 2FA, Active Sessions)',
        description: 'Change your personal login password (with real-time strength validation), enable Two-Factor Authentication (2FA), and view currently signed-in device sessions with one-click revocation.',
        tips: ['The active session card dynamically displays your browser, OS, and current session status.']
      },
      {
        number: 5,
        title: 'Appearance & API Console Tabs',
        description: 'Choose your color theme (Light / Dark / System), select custom accent colors (Blue, Emerald, Violet, Orange), or test live Supabase database response latency in the API Console.',
      }
    ]
  },
  {
    id: 'make-bill',
    category: 'billing',
    title: 'How to Make a Bill / Invoice',
    badge: 'Finance',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <Receipt className="text-emerald-600" size={24} />,
    summary: 'Generate branded, itemized bills with automatic numbering, customer details, payment methods, and database tracking.',
    quickAction: { label: 'Create New Bill', url: '/invoices/create' },
    steps: [
      {
        number: 1,
        title: 'Navigate to Create Invoice',
        description: 'In the sidebar, go to Finance → Invoices (/invoices) and click "+ Create Invoice", or navigate directly to /invoices/create.',
      },
      {
        number: 2,
        title: 'Check the Auto-Generated Bill Number',
        description: 'The system automatically assigns a unique identifier (e.g., BILL-20261002-4821). You can modify it or keep the default.',
      },
      {
        number: 3,
        title: 'Enter Client & Payment Details',
        description: 'Provide the Client\'s Name, Phone Number, and Billing Address. Enter the description (e.g., "Advance Booking for Unit 402") and amount in INR.',
        tips: ['Amounts automatically format as Indian Rupee currency (e.g. Rs. 15,00,000.00).']
      },
      {
        number: 4,
        title: 'Select Payment Method & Status',
        description: 'Choose Payment Method (Cash, Bank Transfer, UPI, Cheque, Credit Card) and Status (Pending or Paid).',
      },
      {
        number: 5,
        title: 'Review Live Preview & Save',
        description: 'Inspect the real-time invoice preview on the right side of the screen. Click "Save & Record Bill" to persist it directly to the database.',
      }
    ]
  },
  {
    id: 'download-bill',
    category: 'billing',
    title: 'How to Download a Bill (Save as PDF)',
    badge: 'Finance',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <Download className="text-emerald-600" size={24} />,
    summary: 'Download any saved bill as a clean, professionally formatted PDF ready for printing or sending to clients.',
    quickAction: { label: 'View Invoices List', url: '/invoices' },
    steps: [
      {
        number: 1,
        title: 'Open Invoices List',
        description: 'Go to Finance → Invoices (/invoices) from the left sidebar.',
      },
      {
        number: 2,
        title: 'Click on the Desired Invoice',
        description: 'Click on any invoice row or invoice number (e.g., INV-2023-001) to open its detail page (/invoices/[id]).',
      },
      {
        number: 3,
        title: 'Click "Download PDF"',
        description: 'At the top right of the invoice detail page, click the "Download PDF" button (or "Print").',
      },
      {
        number: 4,
        title: 'Save as PDF to Your Device',
        description: 'The browser\'s print preview will pop up. Ensure the Destination is set to "Save as PDF" and click Save. The invoice is formatted cleanly with all sidebars and buttons automatically hidden.',
        tips: ['Use Google Chrome or Microsoft Edge for the sharpest vector PDF rendering.']
      }
    ]
  },
  {
    id: 'export-bill',
    category: 'billing',
    title: 'How to Export Bills & Financial Data',
    badge: 'Finance',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <FileSpreadsheet className="text-emerald-600" size={24} />,
    summary: 'Export complete transaction ledgers or invoice registries to CSV or Excel for accounting and audits.',
    quickAction: { label: 'Export Invoices', url: '/invoices/export' },
    steps: [
      {
        number: 1,
        title: 'Choose Invoices or Billing Export',
        description: 'For invoice records, go to /invoices/export. For full financial transactions, go to /billing/export.',
      },
      {
        number: 2,
        title: 'Select Export Format',
        description: 'Choose between CSV (comma-separated values) or Excel (.xls) spreadsheet formats.',
      },
      {
        number: 3,
        title: 'Select Date Range & Filters',
        description: 'Filter by Last 30 Days, Last 90 Days, This Year, or Custom. Filter by status (Paid, Pending, Overdue) or revenue category.',
      },
      {
        number: 4,
        title: 'Click "Export Data"',
        description: 'Click "Export Data". The system instantly compiles the records and triggers an immediate download to your computer.',
      }
    ]
  },
  {
    id: 'internal-comms',
    category: 'comms',
    title: 'How to Share Messages & Files (Internal Comms)',
    badge: 'In-App Hub',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Lock className="text-amber-600" size={24} />,
    summary: 'Securely share confidential notes, property documents, blueprints, and image files between admins without SMS or email.',
    quickAction: { label: 'Open Internal Comms', url: '/internal-comms' },
    steps: [
      {
        number: 1,
        title: 'Open Internal Comms',
        description: 'In the sidebar under Communications, click "Internal Comms" (/internal-comms).',
      },
      {
        number: 2,
        title: 'Click "+ New Message"',
        description: 'Click the "+ New Message" button to open the compose modal.',
      },
      {
        number: 3,
        title: 'Enter Subject, Text & Attach Files',
        description: 'Type your message subject and body. Click the Paperclip button to attach files (PDFs, spreadsheets, images, Word docs). Files are uploaded to secure Supabase storage.',
      },
      {
        number: 4,
        title: 'Configure Visibility Scope',
        description: 'Choose who can see the message: "All Admins", "Super Admins Only", or "Selected Members" to restrict viewing to specific people.',
      },
      {
        number: 5,
        title: 'Send & Track Read Status',
        description: 'Click "Send Message". Unread counters alert recipients. When an admin reads the message, double checkmarks appear on your view.',
      }
    ]
  }
];

const SITEMAP_ITEMS = [
  { section: 'Overview', name: 'Dashboard', path: '/dashboard', desc: 'KPI metrics, revenue graphs, quick actions', icon: <BarChart3 size={15} /> },
  { section: 'Properties', name: 'All Properties', path: '/properties', desc: 'Browse, filter, and search Gurukrupa properties', icon: <Building2 size={15} /> },
  { section: 'Properties', name: 'Add Property', path: '/properties/add', desc: 'Publish a new property listing with pricing and specs', icon: <Building2 size={15} /> },
  { section: 'Properties', name: 'Export Properties', path: '/properties/export', desc: 'Download property listings in CSV/Excel', icon: <FileSpreadsheet size={15} /> },
  { section: 'CRM', name: 'Customers', path: '/customers', desc: 'Client database with contact details and lead statuses', icon: <Users size={15} /> },
  { section: 'CRM', name: 'Add Customer', path: '/customers/add', desc: 'Onboard a new buyer or customer inquiry', icon: <UserPlus size={15} /> },
  { section: 'CRM', name: 'Brokers', path: '/brokers', desc: 'Broker directory, deal tracking, and commissions', icon: <Users size={15} /> },
  { section: 'Finance', name: 'Billing Overview', path: '/billing', desc: 'Revenue analytics, payment status, recent ledger', icon: <Receipt size={15} /> },
  { section: 'Finance', name: 'Transactions', path: '/billing/transactions', desc: 'Detailed financial ledger of all transactions', icon: <FileText size={15} /> },
  { section: 'Finance', name: 'Billing Export', path: '/billing/export', desc: 'Download financial transaction reports', icon: <Download size={15} /> },
  { section: 'Finance', name: 'Invoices', path: '/invoices', desc: 'All generated bills with payment status and actions', icon: <Receipt size={15} /> },
  { section: 'Finance', name: 'Create Bill', path: '/invoices/create', desc: 'Make new bills with auto numbering and live preview', icon: <Receipt size={15} /> },
  { section: 'Finance', name: 'Export Invoices', path: '/invoices/export', desc: 'Export filtered invoice data in CSV/Excel', icon: <Download size={15} /> },
  { section: 'Communications', name: 'Internal Comms', path: '/internal-comms', desc: 'End-to-end admin chat, file sharing, and announcements', icon: <Lock size={15} /> },
  { section: 'Communications', name: 'Messages', path: '/messages', desc: 'Outbound SMS, Email, and WhatsApp messaging', icon: <MessageSquare size={15} /> },
  { section: 'Communications', name: 'Notifications', path: '/notifications', desc: 'Live alerts for transactions, logins, and inquiries', icon: <Bell size={15} /> },
  { section: 'Content', name: 'Website CMS', path: '/website-cms', desc: 'Edit homepage banners, announcements, testimonials', icon: <Globe size={15} /> },
  { section: 'System', name: 'Admin Users', path: '/admin-users', desc: 'Create new admins, set roles and module permissions', icon: <Shield size={15} /> },
  { section: 'System', name: 'Settings', path: '/settings', desc: 'Profile, security (2FA/password), active sessions, theme', icon: <Settings size={15} /> },
];

export default function AdminGuidePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'billing' | 'settings' | 'comms' | 'sitemap'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter sections by search and tab
  const filteredSections = useMemo(() => {
    return GUIDE_SECTIONS.filter((sec) => {
      const matchesTab = activeTab === 'all' || sec.category === activeTab;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesTab;
      const matchesText =
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.steps.some((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
      return matchesTab && matchesText;
    });
  }, [activeTab, searchTerm]);

  const filteredSitemap = useMemo(() => {
    if (!searchTerm.trim()) return SITEMAP_ITEMS;
    const q = searchTerm.toLowerCase().trim();
    return SITEMAP_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.path.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <CRMLayout>
      <div className="min-h-screen bg-slate-50/60 pb-16">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-12 md:py-16 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={16} />
              <span>Admin Portal Documentation</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Docs
            </h1>
            <p className="mt-3 text-base md:text-lg text-blue-100/80 max-w-2xl">
              Complete documentation and step-by-step instructions for managing admins, settings, bills, exports, internal comms, and system navigation.
            </p>

            {/* Quick Search */}
            <div className="mt-8 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search instructions (e.g., 'make bill', 'add admin', 'download', 'settings')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white text-slate-900 rounded-xl shadow-xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-400/40 text-sm font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Action Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-blue-200/80 font-medium mr-1">Quick Jump:</span>
              <a href="#add-admin" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                + Add Admin
              </a>
              <a href="#make-bill" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                Make Bill
              </a>
              <a href="#download-bill" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                Download PDF Bill
              </a>
              <a href="#export-bill" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                Export Data
              </a>
              <a href="#system-settings" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                Settings Location
              </a>
              <a href="#sitemap" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                Where Is Everything
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-6 -mt-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-2 flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All Instructions', icon: <Layers size={15} /> },
              { id: 'admin', label: 'Admin Management', icon: <UserPlus size={15} /> },
              { id: 'billing', label: 'Bills & Invoices', icon: <Receipt size={15} /> },
              { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
              { id: 'comms', label: 'Internal Comms', icon: <Lock size={15} /> },
              { id: 'sitemap', label: 'Where Is Everything?', icon: <Globe size={15} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-6 mt-8 space-y-10">

          {/* Guide Sections */}
          {activeTab !== 'sitemap' && (
            <div className="space-y-8">
              {filteredSections.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <AlertCircle className="mx-auto text-slate-400 mb-3" size={36} />
                  <h3 className="text-lg font-bold text-slate-800">No matching guides found</h3>
                  <p className="text-sm text-slate-500 mt-1">Try another search keyword or clear your filter.</p>
                </div>
              ) : (
                filteredSections.map((sec) => (
                  <div
                    key={sec.id}
                    id={sec.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0">
                            {sec.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sec.badgeColor}`}>
                                {sec.badge}
                              </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                              {sec.title}
                            </h2>
                            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                              {sec.summary}
                            </p>
                          </div>
                        </div>

                        {sec.quickAction && (
                          <Link
                            href={sec.quickAction.url}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all self-start md:self-center flex-shrink-0"
                          >
                            <span>{sec.quickAction.label}</span>
                            <ArrowRight size={15} />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Step by Step Cards */}
                    <div className="p-6 md:p-8">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                        Step-by-Step Instructions
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {sec.steps.map((st) => (
                          <div
                            key={st.number}
                            className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                              {st.number}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm md:text-base font-bold text-slate-900">
                                {st.title}
                              </h5>
                              <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
                                {st.description}
                              </p>
                              {st.tips && st.tips.length > 0 && (
                                <div className="mt-2.5 space-y-1">
                                  {st.tips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-lg">
                                      <CheckCircle2 size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                      <span>{tip}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Where Is Everything? Sitemap */}
          {(activeTab === 'all' || activeTab === 'sitemap') && (
            <div id="sitemap" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Master Map
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                    Where Is Everything? (Complete Navigation Map)
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Click any page link below to open that module immediately.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSitemap.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {item.section}
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 group-hover:text-blue-600">{item.icon}</span>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{item.path}</span>
                      <span className="text-blue-600 font-sans font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Open <ExternalLink size={10} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Support Card */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold">Have Questions or Need Help?</h3>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                The Indusun Admin Portal has real-time Supabase synchronization enabled across all records. Any change made to properties, customers, or bills updates instantly.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/settings"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/10 transition-colors"
              >
                Go to Settings
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>

        </div>
      </div>
    </CRMLayout>
  );
}
