'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminPermissions } from '@/lib/mock-auth-data';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: keyof AdminPermissions;
  permissions?: (keyof AdminPermissions)[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  role?: 'admin' | 'super_admin';
  roles?: ('admin' | 'super_admin')[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
  showFallback = false
}) => {
  const { user, hasPermission } = useAdminAuth();

  // Check role-based access
  const hasRoleAccess = () => {
    if (!user) return false;
    
    if (role) {
      return user.role === role;
    }
    
    if (roles && roles.length > 0) {
      return roles.includes(user.role);
    }
    
    return true; // No role restriction
  };

  // Check permission-based access
  const hasPermissionAccess = () => {
    if (!user) return false;

    // Single permission check
    if (permission) {
      return hasPermission(permission);
    }

    // Multiple permissions check
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        return permissions.every(perm => hasPermission(perm));
      } else {
        return permissions.some(perm => hasPermission(perm));
      }
    }

    return true; // No permission restriction
  };

  const hasAccess = hasRoleAccess() && hasPermissionAccess();

  if (!hasAccess) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
};

export default PermissionGuard;

// Convenience components for common permission checks
export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard role="super_admin" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard roles={['admin', 'super_admin']} fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanViewUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_view_users" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanEditUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_edit_users" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanDeleteUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_delete_users" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanViewTransactions: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_view_transactions" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanEditTransactions: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_edit_transactions" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanViewProperties: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_view_properties" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanEditProperties: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_edit_properties" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanSendMessages: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_send_messages" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

export const CanViewReports: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard permission="can_view_reports" fallback={fallback} showFallback={!!fallback}>
    {children}
  </PermissionGuard>
);

// Role indicator component
export const RoleIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user } = useAdminAuth();
  
  if (!user) return null;

  const getRoleConfig = () => {
    switch (user.role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: '👑'
        };
      case 'admin':
        return {
          label: 'Admin',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '🛡️'
        };
      default:
        return {
          label: 'User',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '👤'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Permission indicator component
export const PermissionIndicator: React.FC<{ 
  permission: keyof AdminPermissions;
  showLabel?: boolean;
  className?: string;
}> = ({ permission, showLabel = false, className = '' }) => {
  const { hasPermission } = useAdminAuth();
  
  const hasAccess = hasPermission(permission);
  
  if (!hasAccess) return null;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 ${className}`}>
      <span className="mr-1">✓</span>
      {showLabel && permission.replace('can_', '').replace('_', ' ')}
    </span>
  );
};
