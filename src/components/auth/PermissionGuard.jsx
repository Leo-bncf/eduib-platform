/**
 * Permission Guard Component
 * Conditionally renders content based on granular permissions
 * Usage: <PermissionGuard resource="assignment" action="create">...</PermissionGuard>
 */

import React from 'react';
import { useUser } from './UserContext';
import { hasPermission, hasAllPermissions, hasAnyPermission } from './PermissionsModule';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function PermissionGuard({
  resource,
  action,
  fallback = null,
  children,
  requireAll = false,
  permissions = [],
}) {
  const { user } = useUser();

  // Check single permission
  if (resource && action) {
    if (!hasPermission(user, resource, action)) {
      return fallback || <AccessDenied resource={resource} action={action} />;
    }
  }

  // Check multiple permissions (all must pass)
  if (requireAll && permissions.length > 0) {
    if (!hasAllPermissions(user, permissions)) {
      return (
        fallback || <AccessDenied multiple={true} />
      );
    }
  }

  // Check multiple permissions (any can pass)
  if (!requireAll && permissions.length > 0) {
    if (!hasAnyPermission(user, permissions)) {
      return (
        fallback || <AccessDenied multiple={true} />
      );
    }
  }

  return children;
}

/**
 * Default access denied UI
 */
function AccessDenied({ resource, action, multiple }) {
  return (
    <Card className="bg-red-50 border-red-200 p-6">
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-900">
            {multiple ? 'Access Denied' : 'Permission Required'}
          </p>
          <p className="text-sm text-red-800 mt-1">
            {multiple
              ? 'You do not have permission to access this resource.'
              : `You don't have permission to ${action} this ${resource}.`}
          </p>
        </div>
      </div>
    </Card>
  );
}