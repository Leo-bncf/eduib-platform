import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backend function to accept user invitation
 * Updates invitation status and creates account state
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitation_id, token } = await req.json();

    // Fetch and validate invitation
    const invitations = await base44.entities.UserInvitation.filter({
      id: invitation_id
    });

    if (!invitations || invitations.length === 0) {
      return Response.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const invitation = invitations[0];

    // Validate token
    if (invitation.invitation_token !== token) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return Response.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check status
    if (invitation.status !== 'pending') {
      return Response.json({ error: `Invitation already ${invitation.status}` }, { status: 400 });
    }

    // Update invitation
    await base44.entities.UserInvitation.update(invitation_id, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      user_id: user.id
    });

    // Get or create account state
    const existingStates = await base44.entities.AccountState.filter({
      user_id: user.id
    });

    if (existingStates.length === 0) {
      // Create new account state
      await base44.entities.AccountState.create({
        user_id: user.id,
        user_email: user.email,
        account_status: 'pending_activation',
        school_id: invitation.school_id,
        role: invitation.role,
        invitation_token: token,
        invitation_accepted_at: new Date().toISOString(),
        onboarding_step: 'set_password',
        profile_completed: false
      });
    } else {
      // Update existing account state
      await base44.entities.AccountState.update(existingStates[0].id, {
        school_id: invitation.school_id,
        role: invitation.role,
        invitation_accepted_at: new Date().toISOString(),
        account_status: 'pending_activation'
      });
    }

    const existingMemberships = await base44.entities.SchoolMembership.filter({
      user_id: user.id,
      school_id: invitation.school_id,
    });

    if (existingMemberships.length > 0) {
      await base44.entities.SchoolMembership.update(existingMemberships[0].id, {
        user_email: user.email,
        user_name: user.full_name,
        role: invitation.role,
        status: 'active',
      });
    } else {
      await base44.entities.SchoolMembership.create({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        school_id: invitation.school_id,
        role: invitation.role,
        status: 'active',
      });
    }

    // Write school_id to user.data so RLS rules ({{user.data.school_id}}) work correctly
    // IMPORTANT: Pass flat fields — SDK puts them into user.data automatically.
    // Do NOT wrap in { data: { ... } } as that causes double-nesting (data.data.school_id).
    await base44.asServiceRole.entities.User.update(user.id, {
      school_id: invitation.school_id,
      active_school_id: invitation.school_id,
      intended_role: invitation.role,
    });

    console.log(`User ${user.id} accepted invitation for school ${invitation.school_id}`);

    return Response.json({
      success: true,
      message: 'Invitation accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});