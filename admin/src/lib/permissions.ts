// Shared permission catalog for the admin panel.
// Roles store these keys. Super Admin always receives every key.

export const PERMISSIONS = [
  { key: 'user_management', label: 'User Management', group: 'Users', description: 'Create, edit, and remove admin accounts' },
  { key: 'role_management', label: 'Roles & Permissions', group: 'Users', description: 'Create roles and decide what each role can do' },
  { key: 'property_management', label: 'Property Management', group: 'Properties', description: 'Properties, projects, and master data' },
  { key: 'broker_management', label: 'Broker Management', group: 'Brokers', description: 'Broker directory and broker codes' },
  { key: 'financial_reports', label: 'Financial Reports', group: 'Finance', description: 'Sales overview, reports, and exports' },
  { key: 'billing_management', label: 'Billing Management', group: 'Finance', description: 'Bills, invoices, and transactions' },
  { key: 'system_settings', label: 'System Settings', group: 'System', description: 'Workspace settings beyond your own profile' },
  { key: 'audit_logs', label: 'Audit Logs', group: 'System', description: 'Activity log' },
  { key: 'cms_management', label: 'CMS Management', group: 'Content', description: 'Website content and media library' },
  { key: 'messaging', label: 'Messaging', group: 'Communications', description: 'Send SMS, email, and WhatsApp' },
  { key: 'internal_comms', label: 'Internal Communications', group: 'Communications', description: 'Team messages inside the admin panel' },
  { key: 'lead_management', label: 'Lead Management', group: 'CRM', description: 'Leads and customer profiles' },
  { key: 'booking_management', label: 'Booking Management', group: 'CRM', description: 'Bookings and site visits' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export const ALL_PERMISSION_KEYS: string[] = PERMISSIONS.map((p) => p.key);

/** Operational access for the built-in Admin role. No user or role administration. */
export const DEFAULT_ADMIN_PERMISSIONS: string[] = [
  'property_management',
  'broker_management',
  'financial_reports',
  'billing_management',
  'cms_management',
  'messaging',
  'internal_comms',
  'lead_management',
  'booking_management',
];

export interface RoleTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
}

export const BUILTIN_ROLES: RoleTemplate[] = [
  {
    id: 'builtin-super-admin',
    slug: 'super_admin',
    name: 'Super Admin',
    description: 'Full control, including users, roles, and settings.',
    permissions: [...ALL_PERMISSION_KEYS],
    is_system: true,
  },
  {
    id: 'builtin-admin',
    slug: 'admin',
    name: 'Admin',
    description: 'Day-to-day CRM, properties, billing, and messaging.',
    permissions: [...DEFAULT_ADMIN_PERMISSIONS],
    is_system: true,
  },
  {
    id: 'builtin-biller',
    slug: 'biller',
    name: 'Biller',
    description: 'Create, view, and print bills. No sales totals, reports, user management, or settings.',
    permissions: ['billing_management'],
    is_system: true,
  },
];

export function formatRoleLabel(role?: string | null): string {
  if (!role) return 'Admin';
  return role
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function slugifyRole(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export function isRoleSlug(value: string): boolean {
  return /^[a-z][a-z0-9_]{0,39}$/.test(value);
}

/** Effective permission list stored on the session. */
export function resolvePermissions(role: string, stored?: string[] | null): string[] {
  if (role === 'super_admin') return [...ALL_PERMISSION_KEYS];
  const list = Array.isArray(stored) ? stored.filter((key) => typeof key === 'string' && key.length > 0) : [];
  if (list.includes('*')) return [...ALL_PERMISSION_KEYS];
  if (list.length > 0) return list;
  if (role === 'admin') return [...DEFAULT_ADMIN_PERMISSIONS];
  return [];
}

export function userHasPermission(
  role: string | undefined | null,
  permissions: string[] | undefined | null,
  key: string
): boolean {
  if (!role) return false;
  if (role === 'super_admin') return true;
  return resolvePermissions(role, permissions).includes(key);
}

/** Anyone with an admin_users row can sign in, including custom roles. */
export function canAccessAdmin(user: {
  role?: string | null;
  hasProfile?: boolean;
  status?: string | null;
}): boolean {
  if (user.status === 'inactive') return false;
  if (user.hasProfile) return true;
  return user.role === 'admin' || user.role === 'super_admin';
}

export function permissionLabel(key: string): string {
  return PERMISSIONS.find((p) => p.key === key)?.label || formatRoleLabel(key);
}

export function groupPermissions(): { group: string; items: typeof PERMISSIONS[number][] }[] {
  const groups: { group: string; items: typeof PERMISSIONS[number][] }[] = [];
  for (const perm of PERMISSIONS) {
    let bucket = groups.find((g) => g.group === perm.group);
    if (!bucket) {
      bucket = { group: perm.group, items: [] };
      groups.push(bucket);
    }
    bucket.items.push(perm);
  }
  return groups;
}
