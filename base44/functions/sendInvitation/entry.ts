import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, email, role, firstName, lastName, gradeLevel, department, customMessage, schoolName } = await req.json();

    if (!schoolId || !email || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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

    // Send invitation email
    const inviteUrl = `${req.headers.get('origin') || 'https://app.scholr.io'}/AcceptInvitation?token=${invitationToken}`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: schoolName || 'Scholr',
      subject: `You're invited to join ${schoolName || 'your school'} on Scholr`,
      body: `
        <h2>Welcome to ${schoolName || 'Scholr'}!</h2>
        <p>You've been invited to join ${schoolName || 'your school'} on Scholr as a <strong>${role.replace(/_/g, ' ')}</strong>.</p>
        ${customMessage ? `<p><em>"${customMessage}"</em></p>` : ''}
        <p>Click the link below to accept your invitation and set up your account:</p>
        <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Accept Invitation</a></p>
        <p>Or copy this link: ${inviteUrl}</p>
        <p style="color:#666;font-size:14px;">This invitation expires in 7 days.</p>
        <p style="color:#999;font-size:12px;margin-top:24px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      `,
    });

    return Response.json({ success: true, invitation });
  } catch (error) {
    console.error('sendInvitation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});