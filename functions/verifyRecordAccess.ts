/**
 * Verify user has access to a specific record
 * Called before reading, updating, or deleting a record
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity, recordId, schoolIdField = 'school_id' } = await req.json();

    if (!entity || !recordId) {
      return Response.json(
        { error: 'Entity and recordId required' },
        { status: 400 }
      );
    }

    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return Response.json({ hasAccess: true });
    }

    // Get the record
    const EntityClass = base44.entities[entity];
    if (!EntityClass) {
      return Response.json({ error: 'Invalid entity' }, { status: 400 });
    }

    const record = await EntityClass.filter({ id: recordId }).then(r => r[0]);
    if (!record) {
      return Response.json({ hasAccess: false });
    }

    // Get user's school
    const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({
      user_id: user.id,
      status: 'active'
    });

    if (memberships.length === 0) {
      // Log potential security violation
      await base44.asServiceRole.entities.ErrorLog.create({
        message: 'Access denied: User has no school membership',
        code: 'RLS_NO_SCHOOL',
        context: JSON.stringify({ userId: user.id, entity, recordId }),
        severity: 'warning',
        user_id: user.id,
        timestamp: new Date().toISOString()
      }).catch(e => console.error('Failed to log', e));

      return Response.json({ hasAccess: false });
    }

    const userSchoolId = memberships[0].school_id;
    const recordSchoolId = record[schoolIdField];

    const hasAccess = recordSchoolId === userSchoolId;

    if (!hasAccess) {
      // Log RLS violation
      await base44.asServiceRole.entities.ErrorLog.create({
        message: 'RLS Violation: Unauthorized record access attempt',
        code: 'RLS_VIOLATION',
        context: JSON.stringify({
          userId: user.id,
          userSchool: userSchoolId,
          recordSchool: recordSchoolId,
          entity,
          recordId
        }),
        severity: 'critical',
        user_id: user.id,
        school_id: userSchoolId,
        timestamp: new Date().toISOString()
      }).catch(e => console.error('Failed to log violation', e));
    }

    return Response.json({ hasAccess });
  } catch (error) {
    // Log the error
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me().catch(() => null);

      await base44.asServiceRole.entities.ErrorLog.create({
        message: error.message,
        code: 'VERIFY_ACCESS_ERROR',
        context: JSON.stringify({ endpoint: 'verifyRecordAccess' }),
        severity: 'error',
        user_id: user?.id,
        stack_trace: error.stack,
        timestamp: new Date().toISOString()
      }).catch(e => console.error('Failed to log error', e));
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    console.error('Access verification error:', error);
    return Response.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
});