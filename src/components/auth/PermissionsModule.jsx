/**
 * Granular Role-Based Access Control (RBAC) System
 * Defines permissions, roles, and permission checking logic
 * 
 * This module is exported from here and can be imported in components and functions
 */

/**
 * Resource and Action Definitions
 * Defines all possible resources and the actions that can be performed on them
 */
export const RESOURCES = {
  SCHOOL: 'school',
  CLASS: 'class',
  USER: 'user',
  ASSIGNMENT: 'assignment',
  SUBMISSION: 'submission',
  GRADE: 'grade',
  REPORT: 'report',
  ATTENDANCE: 'attendance',
  MESSAGE: 'message',
  SETTINGS: 'settings',
  BILLING: 'billing',
  AUDIT_LOG: 'audit_log',
};

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  APPROVE: 'approve',
  EXPORT: 'export',
  SHARE: 'share',
};

/**
 * Default Role Permissions
 * Pre-defined permission sets for standard roles
 */
export const DEFAULT_ROLES = {
  school_admin: {
    name: 'School Administrator',
    description: 'Full school management access',
    isCustom: false,
    permissions: [
      { resource: RESOURCES.SCHOOL, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
      {
        resource: RESOURCES.CLASS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
      },
      {
        resource: RESOURCES.USER,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
      },
      {
        resource: RESOURCES.ASSIGNMENT,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.GRADE,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.REPORT,
        actions: [ACTIONS.READ, ACTIONS.EXPORT],
      },
      {
        resource: RESOURCES.ATTENDANCE,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.MESSAGE,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.SETTINGS,
        actions: [ACTIONS.READ, ACTIONS.UPDATE],
      },
      {
        resource: RESOURCES.BILLING,
        actions: [ACTIONS.READ, ACTIONS.UPDATE],
      },
      {
        resource: RESOURCES.AUDIT_LOG,
        actions: [ACTIONS.READ, ACTIONS.EXPORT],
      },
    ],
  },

  ib_coordinator: {
    name: 'IB Coordinator',
    description: 'Manages IB programs and student progress',
    isCustom: false,
    permissions: [
      { resource: RESOURCES.SCHOOL, actions: [ACTIONS.READ] },
      { resource: RESOURCES.CLASS, actions: [ACTIONS.READ] },
      { resource: RESOURCES.USER, actions: [ACTIONS.READ] },
      {
        resource: RESOURCES.ASSIGNMENT,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.GRADE,
        actions: [ACTIONS.READ, ACTIONS.APPROVE],
      },
      {
        resource: RESOURCES.REPORT,
        actions: [ACTIONS.READ, ACTIONS.EXPORT],
      },
      {
        resource: RESOURCES.ATTENDANCE,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.MESSAGE,
        actions: [ACTIONS.READ],
      },
    ],
  },

  teacher: {
    name: 'Teacher',
    description: 'Teach classes and manage student work',
    isCustom: false,
    permissions: [
      { resource: RESOURCES.SCHOOL, actions: [ACTIONS.READ] },
      { resource: RESOURCES.CLASS, actions: [ACTIONS.READ] },
      {
        resource: RESOURCES.ASSIGNMENT,
        actions: [
          ACTIONS.CREATE,
          ACTIONS.READ,
          ACTIONS.UPDATE,
          ACTIONS.PUBLISH,
        ],
      },
      {
        resource: RESOURCES.SUBMISSION,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.GRADE,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
      },
      {
        resource: RESOURCES.ATTENDANCE,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
      },
      {
        resource: RESOURCES.MESSAGE,
        actions: [ACTIONS.CREATE, ACTIONS.READ],
      },
    ],
  },

  student: {
    name: 'Student',
    description: 'View grades and submit work',
    isCustom: false,
    permissions: [
      { resource: RESOURCES.SCHOOL, actions: [ACTIONS.READ] },
      { resource: RESOURCES.CLASS, actions: [ACTIONS.READ] },
      {
        resource: RESOURCES.ASSIGNMENT,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.SUBMISSION,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
      },
      {
        resource: RESOURCES.GRADE,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.MESSAGE,
        actions: [ACTIONS.CREATE, ACTIONS.READ],
      },
    ],
  },

  parent: {
    name: 'Parent',
    description: 'View child progress and reports',
    isCustom: false,
    permissions: [
      { resource: RESOURCES.SCHOOL, actions: [ACTIONS.READ] },
      {
        resource: RESOURCES.GRADE,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.ATTENDANCE,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.REPORT,
        actions: [ACTIONS.READ],
      },
      {
        resource: RESOURCES.MESSAGE,
        actions: [ACTIONS.CREATE, ACTIONS.READ],
      },
    ],
  },
};

/**
 * Check if a user has permission for a specific action on a resource
 * @param {Object} user - User object with role/permissions
 * @param {string} resource - Resource identifier
 * @param {string} action - Action to perform
 * @returns {boolean}
 */
export function hasPermission(user, resource, action) {
  if (!user) return false;

  // Get the user's role permissions
  const rolePermissions =
    user.customPermissions || DEFAULT_ROLES[user.role]?.permissions || [];

  // Check if permission exists
  const permission = rolePermissions.find((p) => p.resource === resource);
  return permission && permission.actions.includes(action);
}

/**
 * Check if user has permission for multiple resources/actions
 * @param {Object} user - User object
 * @param {Array} checks - Array of {resource, action} objects
 * @returns {boolean} - True if user has ALL permissions
 */
export function hasAllPermissions(user, checks) {
  return checks.every((check) =>
    hasPermission(user, check.resource, check.action)
  );
}

/**
 * Check if user has ANY of the given permissions
 * @param {Object} user - User object
 * @param {Array} checks - Array of {resource, action} objects
 * @returns {boolean} - True if user has ANY permission
 */
export function hasAnyPermission(user, checks) {
  return checks.some((check) =>
    hasPermission(user, check.resource, check.action)
  );
}

/**
 * Get all permissions for a role
 * @param {string} roleId - Role identifier
 * @returns {Object} - Role with permissions
 */
export function getRolePermissions(roleId) {
  return DEFAULT_ROLES[roleId];
}

/**
 * Get all available roles
 * @returns {Array} - Array of role definitions
 */
export function getAllRoles() {
  return Object.entries(DEFAULT_ROLES).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}

/**
 * Create a custom role (typically stored in database)
 * @param {string} name - Role name
 * @param {string} description - Role description
 * @param {Array} permissions - Permission set
 * @returns {Object} - Custom role definition
 */
export function createCustomRole(name, description, permissions) {
  return {
    id: `custom_${Date.now()}`,
    name,
    description,
    isCustom: true,
    permissions,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get permission matrix - all resources and actions
 * Useful for UI permission management
 * @returns {Object} - Permission matrix
 */
export function getPermissionMatrix() {
  return {
    resources: Object.values(RESOURCES),
    actions: Object.values(ACTIONS),
    allCombinations: Object.values(RESOURCES).flatMap((resource) =>
      Object.values(ACTIONS).map((action) => ({
        resource,
        action,
      }))
    ),
  };
}

/**
 * Format permission for display
 * @param {string} resource - Resource identifier
 * @param {string} action - Action identifier
 * @returns {string} - Human-readable permission
 */
export function formatPermission(resource, action) {
  const resourceLabels = {
    [RESOURCES.SCHOOL]: 'School',
    [RESOURCES.CLASS]: 'Class',
    [RESOURCES.USER]: 'User',
    [RESOURCES.ASSIGNMENT]: 'Assignment',
    [RESOURCES.SUBMISSION]: 'Submission',
    [RESOURCES.GRADE]: 'Grade',
    [RESOURCES.REPORT]: 'Report',
    [RESOURCES.ATTENDANCE]: 'Attendance',
    [RESOURCES.MESSAGE]: 'Message',
    [RESOURCES.SETTINGS]: 'Settings',
    [RESOURCES.BILLING]: 'Billing',
    [RESOURCES.AUDIT_LOG]: 'Audit Log',
  };

  const actionLabels = {
    [ACTIONS.CREATE]: 'Create',
    [ACTIONS.READ]: 'Read',
    [ACTIONS.UPDATE]: 'Update',
    [ACTIONS.DELETE]: 'Delete',
    [ACTIONS.PUBLISH]: 'Publish',
    [ACTIONS.APPROVE]: 'Approve',
    [ACTIONS.EXPORT]: 'Export',
    [ACTIONS.SHARE]: 'Share',
  };

  return `${actionLabels[action]} ${resourceLabels[resource]}`;
}