import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, email, role, firstName, lastName, gradeLevel, department, customMessage } = await req.json();

    if (!schoolId || !email || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use Base44's native inviteUser — handles account creation + email automatically
    await base44.auth.inviteUser(email, 'user');

    // Also store the school invitation record for role assignment on first login
    const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const invitation = await base44.asServiceRole.entities.UserInvitation.create({
      school_id: schoolId,
      email,
      role,
      invited_by: user.id,
      invited_by_name: user.full_name || user.email,
      status: 'pending',
      invitation_token: invitationToken,
      expires_at: expiresAt.toISOString(),
      metadata: {
        first_name: firstName,
        last_name: lastName,
        grade_level: gradeLevel,
        department,
        custom_message: customMessage,
      },
    });

    return Response.json({ success: true, invitation });
  } catch (error) {
    console.error('sendInvitation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});