/**
 * Audit Logging System
 * Tracks all critical operations for compliance and security
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Log important business action
 * POST body: { action, resource, resourceId, schoolId, changes?, notes? }
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json(
        { error: 'POST method required' },
        { status: 405 }
      );
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      action,
      resource,
      resourceId,
      schoolId,
      changes = null,
      notes = null,
    } = body;

    // Validate required fields
    if (!action || !resource || !schoolId) {
      return Response.json(
        {
          error: 'Missing required fields: action, resource, schoolId',
        },
        { status: 400 }
      );
    }

    // Verify user has access to the school
    if (user.role !== 'admin' && user.school_id !== schoolId) {
      return Response.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create audit log entry
    const auditEntry = {
      user_id: user.id,
      user_email: user.email,
      school_id: schoolId,
      action,
      resource,
      resource_id: resourceId,
      changes,
      notes,
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    };

    // Try to create audit log in AuditLog entity
    try {
      await base44.asServiceRole.entities.AuditLog.create(auditEntry);
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to create audit log:', error);
    }

    // Log to console as well
    console.info(
      `[AUDIT] ${user.email} - ${action} on ${resource} ${resourceId || ''} in school ${schoolId}`
    );

    return Response.json({
      success: true,
      message: 'Audit log recorded',
    });
  } catch (error) {
    console.error('Audit log error:', error);
    return Response.json(
      {
        error: 'Failed to create audit log',
        message: error.message,
      },
      { status: 500 }
    );
  }
});