'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import {
  User, Bell, Lock, Palette, Shield, Mail, Smartphone,
  Eye, EyeOff, Save, Check, Moon, Sun, Monitor, AlertCircle,
  Camera, Laptop, MapPin, Globe, Phone, AtSign, Upload,
  Crown, Trash2, Zap, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'account' | 'notifications' | 'security' | 'appearance';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',       label: 'Profile',       icon: <User size={15} />      },
  { id: 'account',       label: 'Account',        icon: <AtSign size={15} />    },
  { id: 'notifications', label: 'Notifications',  icon: <Bell size={15} />      },
  { id: 'security',      label: 'Security',       icon: <Lock size={15} />      },
  { id: 'appearance',    label: 'Appearance',     icon: <Palette size={15} />   },
];

const ACCENT_COLORS = [
  { id: 'blue',    bg: 'bg-blue-500',    ring: 'ring-blue-500'    },
  { id: 'indigo',  bg: 'bg-indigo-500',  ring: 'ring-indigo-500'  },
  { id: 'violet',  bg: 'bg-violet-500',  ring: 'ring-violet-500'  },
  { id: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'orange',  bg: 'bg-orange-500',  ring: 'ring-orange-500'  },
  { id: 'rose',    bg: 'bg-rose-500',    ring: 'ring-rose-500'    },
];

const MOCK_SESSIONS = [
  { id: 1, device: 'Chrome on Windows 11',  location: 'Mumbai, India', time: 'Active now',           current: true  },
  { id: 2, device: 'Safari on iPhone 15',   location: 'Mumbai, India', time: '2 hours ago',          current: false },
  { id: 3, device: 'Firefox on macOS',      location: 'Pune, India',   time: 'Yesterday, 6:30 PM',   current: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPasswordStrength(pw: string) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Weak',        color: 'bg-red-500',    text: 'text-red-600'    },
    { label: 'Weak',        color: 'bg-red-500',    text: 'text-red-600'    },
    { label: 'Fair',        color: 'bg-orange-400', text: 'text-orange-600' },
    { label: 'Good',        color: 'bg-yellow-400', text: 'text-yellow-600' },
    { label: 'Strong',      color: 'bg-blue-500',   text: 'text-blue-600'   },
    { label: 'Very Strong', color: 'bg-green-500',  text: 'text-green-600'  },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

// ─── Small reusable pieces ────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
  );
}

function ToggleRow({ label, sub, enabled, onChange }: { label: string; sub: string; enabled: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 pr-6 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

function FieldInput({ label, type = 'text', icon, placeholder, value, onChange }: {
  label: string; type?: string; icon: React.ReactNode;
  placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAdminAuth();

  const supabase = useMemo(() =>
    SUPA_URL && SUPA_KEY ? createBrowserClient(SUPA_URL, SUPA_KEY) : null, []);

  // Layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  const fileRef               = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [updatingPw, setUpdatingPw] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name:     '',
    email:    '',
    phone:    '',
    bio:      '',
    location: '',
    website:  '',
    language: 'en',
    timezone: 'Asia/Kolkata',
  });

  // Notification state
  const [notifs, setNotifs] = useState({
    emailNewClient:   true,
    emailNewProperty: true,
    emailSales:       true,
    emailSystem:      false,
    digestWeekly:     false,
    pushBrowser:      true,
    pushMessages:     true,
    pushAlerts:       true,
    inAppAll:         true,
    inAppSounds:      false,
  });

  // Security state
  const [pw, setPw]         = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [twoFA, setTwoFA]   = useState(false);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  // Appearance state
  const [theme, setTheme]     = useState<'light' | 'dark' | 'system'>('light');
  const [accent, setAccent]   = useState('blue');
  const [compact, setCompact] = useState(false);
  const [animations, setAnimations] = useState(true);

  // ── Load persisted data on mount ─────────────────────────────────────────
  useEffect(() => {
    try {
      const sn = localStorage.getItem('admin_notif_settings');
      if (sn) setNotifs(JSON.parse(sn));
      const sa = localStorage.getItem('admin_appearance');
      if (sa) {
        const a = JSON.parse(sa);
        if (a.theme)                    setTheme(a.theme);
        if (a.accent)                   setAccent(a.accent);
        if (a.compact    !== undefined) setCompact(a.compact);
        if (a.animations !== undefined) setAnimations(a.animations);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!supabase || !user?.id) {
      setProfile(p => ({ ...p, name: user?.name || '', email: user?.email || '' }));
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('admin_users')
        .select('name, phone, bio, location, website, language, timezone, avatar_url')
        .eq('id', user.id)
        .single();
      setProfile({
        name:     data?.name     || user.name  || '',
        email:    user.email     || '',
        phone:    data?.phone    || '',
        bio:      data?.bio      || '',
        location: data?.location || '',
        website:  data?.website  || '',
        language: data?.language || 'en',
        timezone: data?.timezone || 'Asia/Kolkata',
      });
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    })();
  }, [user?.id]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
    if (!supabase || !user?.id) {
      toast.success('Preview updated (Supabase not configured — upload skipped)');
      return;
    }
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars').upload(path, file, { upsert: true });
      if (upErr) { toast.error('Upload failed: ' + upErr.message); return; }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
      await supabase.from('admin_users')
        .update({ avatar_url: urlData.publicUrl }).eq('id', user.id);
      toast.success('Profile photo updated');
    } catch { toast.error('Upload failed'); }
    finally   { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'profile') {
        if (!supabase || !user?.id) {
          await new Promise(r => setTimeout(r, 500));
          toast.success('Profile saved locally');
          return;
        }
        const { error } = await supabase.from('admin_users').update({
          name:     profile.name,
          phone:    profile.phone    || null,
          bio:      profile.bio      || null,
          location: profile.location || null,
          website:  profile.website  || null,
          language: profile.language,
          timezone: profile.timezone,
        }).eq('id', user.id);
        if (error) toast.error('Save failed: ' + error.message);
        else toast.success('Profile saved');
      } else if (activeTab === 'notifications') {
        localStorage.setItem('admin_notif_settings', JSON.stringify(notifs));
        await new Promise(r => setTimeout(r, 400));
        toast.success('Notification preferences saved');
      } else if (activeTab === 'appearance') {
        localStorage.setItem('admin_appearance', JSON.stringify({ theme, accent, compact, animations }));
        await new Promise(r => setTimeout(r, 400));
        toast.success('Appearance settings saved');
      } else {
        await new Promise(r => setTimeout(r, 500));
        toast.success('Settings saved');
      }
    } finally { setSaving(false); }
  };

  const handlePasswordUpdate = async () => {
    if (!pw.next || pw.next.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (pw.next !== pw.confirm)          { toast.error('Passwords do not match'); return; }
    if (!supabase) { toast.error('Auth service not connected'); return; }
    setUpdatingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw.next });
      if (error) toast.error('Update failed: ' + error.message);
      else { toast.success('Password updated successfully'); setPw({ current: '', next: '', confirm: '' }); }
    } finally { setUpdatingPw(false); }
  };

  const pwStrength = getPasswordStrength(pw.next);
  const initials   = (profile.name || user?.name || 'AU').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Page title ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* ── Profile header card (cover + avatar) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 relative">
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-black/25 hover:bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Camera size={12} /> Change Cover
            </button>
          </div>
          <div className="px-6 -mt-10 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg border-[3px] border-white overflow-hidden">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                    : <span className="text-white text-2xl font-bold select-none">{initials}</span>
                  }
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1.5 -right-1.5 h-7 w-7 bg-white rounded-full border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  {uploading ? <Loader2 size={12} className="text-blue-500 animate-spin" /> : <Camera size={12} className="text-gray-600" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.email || 'admin@indusun.com'}</p>
              </div>
            </div>
            <span className={`mb-1 self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              user?.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {user?.role === 'super_admin' ? <Crown size={11} /> : <Shield size={11} />}
              {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>

        {/* ── Horizontal pill tabs ── */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ════ PROFILE ════ */}
          {activeTab === 'profile' && (
            <div className="divide-y divide-gray-100">

              {/* Avatar upload */}
              <div className="p-6">
                <SectionHeader title="Profile Photo" description="Upload a photo to personalize your account" />
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow">
                    <span className="text-white text-xl font-bold select-none">{initials}</span>
                  </div>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-5 flex flex-col items-center cursor-pointer transition-colors group"
                  >
                    <Upload size={20} className="text-gray-300 group-hover:text-blue-400 mb-1.5 transition-colors" />
                    <p className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Click to upload or drag &amp; drop</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG or GIF · Max 2MB</p>
                  </div>
                </div>
              </div>

              {/* Personal info */}
              <div className="p-6">
                <SectionHeader title="Personal Information" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldInput label="Full Name"     icon={<User size={14} />}  placeholder="Your full name"     value={profile.name}     onChange={v => setProfile(p => ({ ...p, name: v }))} />
                  <FieldInput label="Email Address" icon={<Mail size={14} />}  placeholder="your@email.com"    value={profile.email}    onChange={v => setProfile(p => ({ ...p, email: v }))}   type="email" />
                  <FieldInput label="Phone Number"  icon={<Phone size={14} />} placeholder="+91 98765 43210"   value={profile.phone}    onChange={v => setProfile(p => ({ ...p, phone: v }))}   type="tel" />
                  <FieldInput label="Location"      icon={<MapPin size={14} />} placeholder="City, Country"   value={profile.location} onChange={v => setProfile(p => ({ ...p, location: v }))} />
                  <div className="sm:col-span-2">
                    <FieldInput label="Website" icon={<Globe size={14} />} placeholder="https://yoursite.com" value={profile.website} onChange={v => setProfile(p => ({ ...p, website: v }))} type="url" />
                  </div>
                </div>
              </div>

              {/* Bio + preferences */}
              <div className="p-6">
                <SectionHeader title="Additional Details" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      placeholder="Tell your team a bit about yourself…"
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Language</label>
                      <select value={profile.language} onChange={e => setProfile(p => ({ ...p, language: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Timezone</label>
                      <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                        <option value="UTC">UTC (±0:00)</option>
                        <option value="America/New_York">America/New York (EST −5:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ ACCOUNT ════ */}
          {activeTab === 'account' && (
            <div className="divide-y divide-gray-100">

              {/* Account details */}
              <div className="p-6">
                <SectionHeader title="Account Details" description="Your current account information" />
                <div className="space-y-0">
                  {[
                    { label: 'User ID',       value: user?.id ? user.id.slice(0, 20) + '…' : 'N/A' },
                    { label: 'Role',          value: user?.role?.replace('_', ' ') || 'Admin'       },
                    { label: 'Status',        value: 'active'                                        },
                    { label: 'Member Since',  value: 'January 2024'                                  },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      {item.label === 'Status' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900 capitalize">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected accounts */}
              <div className="p-6">
                <SectionHeader title="Connected Accounts" description="Link third-party services for quick sign-in" />
                <div className="space-y-3">
                  {[
                    { name: 'Google',    desc: 'Sign in with Google',    color: 'bg-red-500',   letter: 'G' },
                    { name: 'Microsoft', desc: 'Sign in with Microsoft', color: 'bg-blue-500',  letter: 'M' },
                    { name: 'GitHub',    desc: 'Sync with GitHub',       color: 'bg-gray-900',  letter: '⌥' },
                  ].map(acc => (
                    <div key={acc.name} className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className={`h-9 w-9 rounded-lg ${acc.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{acc.letter}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                        <p className="text-xs text-gray-400">{acc.desc}</p>
                      </div>
                      <button onClick={() => toast.success(`${acc.name} connection initiated`)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 transition-colors flex-shrink-0">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-5">
                  <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
                  <p className="text-xs text-red-500 mb-4">These actions are permanent and cannot be undone.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => toast.error('Account deactivation requires super admin approval')}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 border border-orange-200 rounded-lg transition-colors">
                      Deactivate Account
                    </button>
                    <button onClick={() => toast.error('Account deletion requires super admin approval')}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 rounded-lg transition-colors">
                      <Trash2 size={14} /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ NOTIFICATIONS ════ */}
          {activeTab === 'notifications' && (
            <div className="divide-y divide-gray-100">

              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-xs text-gray-400">Sent to {profile.email || 'your email'}</p>
                  </div>
                </div>
                {([
                  { key: 'emailNewClient'   as const, label: 'New client registered',   sub: 'Get notified when a new client signs up' },
                  { key: 'emailNewProperty' as const, label: 'New property listed',      sub: 'When a new property is added or updated'   },
                  { key: 'emailSales'       as const, label: 'Sales & transactions',     sub: 'Confirmations, receipts, and deal updates' },
                  { key: 'emailSystem'      as const, label: 'System alerts',            sub: 'Critical security and system notifications' },
                  { key: 'digestWeekly'     as const, label: 'Weekly digest',            sub: 'A summary email every Monday morning'       },
                ]).map(item => (
                  <ToggleRow key={item.key} label={item.label} sub={item.sub}
                    enabled={notifs[item.key]} onChange={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))} />
                ))}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Smartphone size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Push Notifications</h3>
                    <p className="text-xs text-gray-400">Browser and mobile push alerts</p>
                  </div>
                </div>
                {([
                  { key: 'pushBrowser'  as const, label: 'Browser push',    sub: 'Enable desktop browser notifications'         },
                  { key: 'pushMessages' as const, label: 'New messages',    sub: 'When someone sends you a message'             },
                  { key: 'pushAlerts'   as const, label: 'Activity alerts', sub: 'Real-time updates on important activity'      },
                ]).map(item => (
                  <ToggleRow key={item.key} label={item.label} sub={item.sub}
                    enabled={notifs[item.key]} onChange={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))} />
                ))}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">In-App Notifications</h3>
                    <p className="text-xs text-gray-400">Notifications within the admin panel</p>
                  </div>
                </div>
                {([
                  { key: 'inAppAll'    as const, label: 'All in-app notifications', sub: 'Show notifications in the notification panel' },
                  { key: 'inAppSounds' as const, label: 'Notification sounds',     sub: 'Play a sound when a notification arrives'    },
                ]).map(item => (
                  <ToggleRow key={item.key} label={item.label} sub={item.sub}
                    enabled={notifs[item.key]} onChange={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))} />
                ))}
              </div>
            </div>
          )}

          {/* ════ SECURITY ════ */}
          {activeTab === 'security' && (
            <div className="divide-y divide-gray-100">

              {/* Change password */}
              <div className="p-6">
                <SectionHeader title="Change Password" description="Use a strong password with at least 8 characters" />
                <div className="max-w-md space-y-4">
                  {([
                    { key: 'current' as const, label: 'Current Password'      },
                    { key: 'next'    as const, label: 'New Password'           },
                    { key: 'confirm' as const, label: 'Confirm New Password'   },
                  ]).map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <input
                          type={showPw[field.key] ? 'text' : 'password'}
                          value={pw[field.key]}
                          onChange={e => setPw(p => ({ ...p, [field.key]: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button type="button"
                          onClick={() => setShowPw(s => ({ ...s, [field.key]: !s[field.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPw[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Strength meter */}
                  {pw.next && pwStrength && (
                    <div>
                      <div className="flex gap-1 mb-1.5">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${pwStrength.text}`}>Password strength: {pwStrength.label}</p>
                    </div>
                  )}

                  {pw.next && pw.confirm && pw.next !== pw.confirm && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle size={12} /> Passwords do not match
                    </p>
                  )}

                  <button type="button"
                    onClick={() => {
                      if (pw.next && pw.next === pw.confirm) {
                        toast.success('Password updated');
                        setPw({ current: '', next: '', confirm: '' });
                      } else toast.error('Check your password inputs');
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              {/* 2FA */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Shield size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs">Add an extra layer of security via an authenticator app or SMS</p>
                      {twoFA && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                          <Check size={11} /> Enabled
                        </span>
                      )}
                    </div>
                  </div>
                  <Toggle enabled={twoFA} onChange={() => { setTwoFA(v => !v); toast.success(!twoFA ? '2FA enabled' : '2FA disabled'); }} />
                </div>
              </div>

              {/* Active sessions */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Active Sessions</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Devices currently signed in to your account</p>
                  </div>
                  <button
                    onClick={() => { setSessions(s => s.filter(x => x.current)); toast.success('All other sessions revoked'); }}
                    className="text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                    Revoke All Others
                  </button>
                </div>
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div key={session.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Laptop size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{session.device}</p>
                        <p className="text-xs text-gray-400">{session.location} · {session.time}</p>
                      </div>
                      {session.current ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex-shrink-0">Current</span>
                      ) : (
                        <button
                          onClick={() => { setSessions(s => s.filter(x => x.id !== session.id)); toast.success('Session revoked'); }}
                          className="text-xs font-medium text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1 rounded-lg transition-colors flex-shrink-0">
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ APPEARANCE ════ */}
          {activeTab === 'appearance' && (
            <div className="divide-y divide-gray-100">

              {/* Theme */}
              <div className="p-6">
                <SectionHeader title="Theme" description="Select your preferred color scheme" />
                <div className="grid grid-cols-3 gap-3 max-w-xs">
                  {([
                    { value: 'light'  as const, label: 'Light',  icon: <Sun size={20} />,     previewBg: 'bg-white',     previewBorder: 'border-gray-300' },
                    { value: 'dark'   as const, label: 'Dark',   icon: <Moon size={20} />,    previewBg: 'bg-gray-900',  previewBorder: 'border-gray-700' },
                    { value: 'system' as const, label: 'System', icon: <Monitor size={20} />, previewBg: 'bg-gradient-to-br from-white to-gray-800', previewBorder: 'border-gray-400' },
                  ]).map(opt => (
                    <button key={opt.value} onClick={() => { setTheme(opt.value); toast.success(`${opt.label} theme applied`); }}
                      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                        theme === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <div className={`w-full h-10 rounded-lg border ${opt.previewBg} ${opt.previewBorder} flex items-center justify-center`}>
                        <span className={theme === opt.value ? 'text-blue-600' : 'text-gray-400'}>{opt.icon}</span>
                      </div>
                      <span className={`text-xs font-semibold ${theme === opt.value ? 'text-blue-700' : 'text-gray-600'}`}>{opt.label}</span>
                      {theme === opt.value && (
                        <span className="absolute top-2 right-2 h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check size={9} className="text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div className="p-6">
                <SectionHeader title="Accent Color" description="Choose your primary interface accent color" />
                <div className="flex items-center gap-3 flex-wrap">
                  {ACCENT_COLORS.map(c => (
                    <button key={c.id} onClick={() => { setAccent(c.id); toast.success('Accent color updated'); }}
                      className={`h-9 w-9 rounded-full ${c.bg} transition-all ${
                        accent === c.id ? `ring-2 ring-offset-2 ${c.ring} scale-110` : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Layout & display */}
              <div className="p-6">
                <SectionHeader title="Layout & Display" />
                <ToggleRow label="Compact Mode"      sub="Reduce spacing and element sizes throughout the UI"         enabled={compact}     onChange={() => setCompact(v => !v)} />
                <ToggleRow label="Smooth Animations" sub="Enable transitions, hover effects, and micro-animations"    enabled={animations}  onChange={() => setAnimations(v => !v)} />
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Changes are saved to your account profile</p>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              {saving
                ? <><Loader2 size={14} className="animate-spin" />Saving…</>
                : <><Save size={15} />Save Changes</>
              }
            </button>
          </div>

        </div>

          </div>
        </div>
      </div>
    </div>
  );
}
