import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, userId } = await req.json();
    const targetUserId = userId || user.id;

    // Fetch the connection record
    const connections = await base44.asServiceRole.entities.GoogleConnection.filter({
      school_id: schoolId,
      user_id: targetUserId
    });

    if (connections.length === 0) {
      return Response.json({
        status: 'disconnected',
        message: 'Google account not connected',
        requiresConnection: true,
        actionUrl: null
      });
    }

    const connection = connections[0];
    const now = new Date();
    const expiryTime = new Date(connection.token_expiry);

    // Check if token is expired
    if (connection.status === 'connected' && expiryTime < now) {
      await base44.asServiceRole.entities.GoogleConnection.update(connection.id, {
        status: 'expired',
        error_code: 'token_expired',
        last_error: 'Access token has expired',
        reconnection_required: true
      });

      return Response.json({
        status: 'expired',
        message: 'Your Google connection has expired. Please reconnect.',
        requiresReconnection: true,
        actionUrl: '/reconnect-google'
      });
    }

    // Check if reconnection was previously flagged
    if (connection.reconnection_required) {
      return Response.json({
        status: connection.status,
        message: connection.last_error || 'Your Google connection needs to be refreshed',
        requiresReconnection: true,
        actionUrl: '/reconnect-google',
        errorCode: connection.error_code,
        failedAction: connection.failed_action
      });
    }

    // Connection is healthy
    return Response.json({
      status: 'connected',
      message: 'Google account connected successfully',
      googleEmail: connection.google_email,
      connectedSince: connection.created_date,
      lastVerified: connection.last_verified_at,
      requiresConnection: false,
      requiresReconnection: false
    });
  } catch (error) {
    console.error('Error verifying Google connection:', error);
    return Response.json({
      status: 'error',
      message: 'Failed to verify Google connection',
      error: error.message
    }, { status: 500 });
  }
});