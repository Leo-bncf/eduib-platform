/**
 * Permission Management Backend Function
 * Handles custom role creation, permission updates, and permission validation
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Main handler
 * Actions: create-role, get-role, list-roles, update-permissions, validate-permission
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (req.method !== 'POST') {
      return Response.json(
        { error: 'POST method required' },
        { status: 405 }
      );
    }

    const body = await req.json();
    const { action = 'validate-permission' } = body;

    // Only admins can create/modify roles
    if (
      ['create-role', 'update-permissions'].includes(action) &&
      user.role !== 'admin'
    ) {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'create-role':
        return handleCreateRole(body);
      case 'get-role':
        return handleGetRole(body);
      case 'list-roles':
        return handleListRoles();
      case 'update-permissions':
        return handleUpdatePermissions(body);
      case 'validate-permission':
        return handleValidatePermission(user, body);
      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Permission management error:', error);
    return Response.json(
      {
        error: 'Operation failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
});

/**
 * Create a custom role
 */
function handleCreateRole(body) {
  const { name, description, permissions } = body;

  if (!name || !description || !permissions) {
    return Response.json(
      {
        error: 'Missing required fields: name, description, permissions',
      },
      { status: 400 }
    );
  }

  // Validate permissions structure
  const validPermissions = permissions.every(
    (p) =>
      Object.values(RESOURCES).includes(p.resource) &&
      Array.isArray(p.actions) &&
      p.actions.every((a) => Object.values(ACTIONS).includes(a))
  );

  if (!validPermissions) {
    return Response.json(
      {
        error: 'Invalid permission structure',
      },
      { status: 400 }
    );
  }

  const customRole = createCustomRole(name, description, permissions);

  console.info(`[PERMISSIONS] Custom role created: ${customRole.id}`);

  return Response.json(
    {
      status: 'created',
      role: customRole,
    },
    { status: 201 }
  );
}

/**
 * Get specific role details
 */
function handleGetRole(body) {
  const { roleId } = body;

  if (!roleId) {
    return Response.json(
      { error: 'roleId required' },
      { status: 400 }
    );
  }

  const role = DEFAULT_ROLES[roleId];

  if (!role) {
    // In production, would check custom roles database
    return Response.json(
      { error: 'Role not found' },
      { status: 404 }
    );
  }

  return Response.json({
    roleId,
    ...role,
    permissions: role.permissions.map((p) => ({
      resource: p.resource,
      actions: p.actions,
    })),
  });
}

/**
 * List all available roles
 */
function handleListRoles() {
  const roles = Object.entries(DEFAULT_ROLES).map(([id, role]) => ({
    id,
    name: role.name,
    description: role.description,
    isCustom: role.isCustom,
    permissionCount: role.permissions.reduce(
      (sum, p) => sum + p.actions.length,
      0
    ),
  }));

  return Response.json({
    roles,
    total: roles.length,
  });
}

/**
 * Update permissions for a role
 */
function handleUpdatePermissions(body) {
  const { roleId, permissions } = body;

  if (!roleId || !permissions) {
    return Response.json(
      { error: 'roleId and permissions required' },
      { status: 400 }
    );
  }

  // Only custom roles can be updated in this example
  // In production, would store in database
  if (DEFAULT_ROLES[roleId] && !DEFAULT_ROLES[roleId].isCustom) {
    return Response.json(
      { error: 'Cannot modify built-in roles' },
      { status: 403 }
    );
  }

  // Validate permissions
  const validPermissions = permissions.every(
    (p) =>
      Object.values(RESOURCES).includes(p.resource) &&
      Array.isArray(p.actions) &&
      p.actions.every((a) => Object.values(ACTIONS).includes(a))
  );

  if (!validPermissions) {
    return Response.json(
      { error: 'Invalid permission structure' },
      { status: 400 }
    );
  }

  console.info(
    `[PERMISSIONS] Role updated: ${roleId} with ${permissions.length} permissions`
  );

  return Response.json({
    status: 'updated',
    roleId,
    permissionCount: permissions.reduce(
      (sum, p) => sum + p.actions.length,
      0
    ),
  });
}

/**
 * Validate user permission for a specific action
 */
function handleValidatePermission(user, body) {
  const { resource, action } = body;

  if (!resource || !action) {
    return Response.json(
      { error: 'resource and action required' },
      { status: 400 }
    );
  }

  if (!Object.values(RESOURCES).includes(resource)) {
    return Response.json(
      { error: 'Invalid resource' },
      { status: 400 }
    );
  }

  if (!Object.values(ACTIONS).includes(action)) {
    return Response.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  }

  const hasAccess = hasPermission(user, resource, action);

  return Response.json({
    user: {
      id: user.id,
      role: user.role,
    },
    resource,
    action,
    allowed: hasAccess,
    deniedReason: hasAccess
      ? null
      : `Role '${user.role}' does not have permission to ${action} ${resource}`,
  });
}