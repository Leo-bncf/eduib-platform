import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, errorCode, errorMessage, failedAction } = await req.json();

    // Find or create connection record
    const connections = await base44.asServiceRole.entities.GoogleConnection.filter({
      school_id: schoolId,
      user_id: user.id
    });

    const updateData = {
      error_code: errorCode,
      last_error: errorMessage,
      failed_action: failedAction,
      reconnection_required: ['token_expired', 'invalid_grant', 'access_denied', 'revoked'].includes(errorCode)
    };

    if (connections.length > 0) {
      await base44.asServiceRole.entities.GoogleConnection.update(connections[0].id, updateData);
    } else {
      await base44.asServiceRole.entities.GoogleConnection.create({
        school_id: schoolId,
        user_id: user.id,
        user_email: user.email,
        status: 'disconnected',
        ...updateData
      });
    }

    return Response.json({ success: true, message: 'Error recorded' });
  } catch (error) {
    console.error('Error recording Google error:', error);
    return Response.json({
      error: error.message
    }, { status: 500 });
  }
});