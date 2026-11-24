import { resolvePermissions, userHasPermission } from '@/lib/permissions';

const BROADER_THAN_BILLING = [
  'financial_reports',
  'property_management',
  'lead_management',
  'booking_management',
  'user_management',
  'role_management',
  'cms_management',
  'broker_management',
  'system_settings',
  'audit_logs',
  'messaging',
  'internal_comms',
];

export interface StaffIdentity {
  role?: string | null;
  permissions?: string[] | null;
}

/** A biller, or any account whose only operational permission is billing. */
export function isBillingDesk(user: StaffIdentity | null | undefined): boolean {
  if (!user?.role) return false;
  if (user.role === 'super_admin') return false;
  const permissions = resolvePermissions(user.role, user.permissions);
  if (user.role === 'biller') return !permissions.includes('financial_reports');
  return permissions.includes('billing_management') && !BROADER_THAN_BILLING.some((key) => permissions.includes(key));
}

export function homePath(user: StaffIdentity | null | undefined): string {
  if (!user?.role) return '/auth/login';
  return isBillingDesk(user) ? '/billing' : '/dashboard';
}

const PERMISSION_ROUTES: { prefix: string; permission: string }[] = [
  { prefix: '/billing/export', permission: 'financial_reports' },
  { prefix: '/invoices/export', permission: 'financial_reports' },
  { prefix: '/properties/export', permission: 'property_management' },
  { prefix: '/sales', permission: 'financial_reports' },
  { prefix: '/reports', permission: 'financial_reports' },
  { prefix: '/data-import', permission: 'property_management' },
  { prefix: '/master-data', permission: 'property_management' },
  { prefix: '/properties', permission: 'property_management' },
  { prefix: '/projects', permission: 'property_management' },
  { prefix: '/media-library', permission: 'cms_management' },
  { prefix: '/website-cms', permission: 'cms_management' },
  { prefix: '/leads', permission: 'lead_management' },
  { prefix: '/customers', permission: 'lead_management' },
  { prefix: '/clients', permission: 'lead_management' },
  { prefix: '/site-visits', permission: 'booking_management' },
  { prefix: '/bookings', permission: 'booking_management' },
  { prefix: '/brokers', permission: 'broker_management' },
  { prefix: '/messages', permission: 'messaging' },
  { prefix: '/internal-comms', permission: 'internal_comms' },
  { prefix: '/activity-logs', permission: 'audit_logs' },
  { prefix: '/admin-users', permission: 'user_management' },
  { prefix: '/roles', permission: 'role_management' },
  { prefix: '/billing', permission: 'billing_management' },
  { prefix: '/invoices', permission: 'billing_management' },
  { prefix: '/transactions', permission: 'billing_management' },
];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function pathAllowed(user: StaffIdentity | null | undefined, pathname: string): boolean {
  if (!user?.role) return false;
  if (pathname.startsWith('/auth')) return true;
  if (user.role === 'super_admin') return true;

  if (isBillingDesk(user)) {
    if (matches(pathname, '/billing/export') || matches(pathname, '/invoices/export')) return false;
    if (pathname === '/dashboard') return false;
    const allowed = ['/billing', '/invoices', '/transactions', '/settings', '/notifications', '/guide'];
    return allowed.some((prefix) => matches(pathname, prefix));
  }

  if (pathname === '/dashboard') return true;
  const rule = PERMISSION_ROUTES.find((item) => matches(pathname, item.prefix));
  if (!rule) return true;
  return userHasPermission(user.role, user.permissions, rule.permission);
}

export function canSeeRevenue(user: StaffIdentity | null | undefined): boolean {
  if (!user?.role) return false;
  return userHasPermission(user.role, user.permissions, 'financial_reports');
}

export function canDeleteBills(user: StaffIdentity | null | undefined): boolean {
  if (!user?.role) return false;
  return (
    userHasPermission(user.role, user.permissions, 'financial_reports')
    || userHasPermission(user.role, user.permissions, 'property_management')
    || userHasPermission(user.role, user.permissions, 'user_management')
  );
}
