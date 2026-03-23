/**
 * Secure query function with RLS enforcement
 * All backend queries should use this to ensure data isolation
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity, filters = {}, sort = '', limit = 50 } = await req.json();

    if (!entity) {
      return Response.json({ error: 'Entity name required' }, { status: 400 });
    }

    // Build RLS filter - add school_id if user is not super_admin
    let rlsFilters = { ...filters };

    if (user.role !== 'super_admin') {
      // Get user's school ID from membership
      const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({
        user_id: user.id,
        status: 'active'
      });

      if (memberships.length === 0) {
        return Response.json(
          { error: 'User has no school access' },
          { status: 403 }
        );
      }

      const schoolId = memberships[0].school_id;
      rlsFilters.school_id = schoolId;
    }

    // Execute the secure query
    const EntityClass = base44.entities[entity];
    if (!EntityClass) {
      return Response.json({ error: 'Invalid entity' }, { status: 400 });
    }

    const data = sort 
      ? await EntityClass.filter(rlsFilters, sort, limit)
      : await EntityClass.filter(rlsFilters, undefined, limit);

    return Response.json({ data, count: data.length });
  } catch (error) {
    // Log the error
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me().catch(() => null);
      
      await base44.asServiceRole.entities.ErrorLog.create({
        message: error.message,
        code: 'SECURE_QUERY_ERROR',
        context: JSON.stringify({ endpoint: 'secureQuery' }),
        severity: 'error',
        user_id: user?.id,
        stack_trace: error.stack,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    console.error('Secure query error:', error);
    return Response.json(
      { error: error.message || 'Query failed' },
      { status: 500 }
    );
  }
});