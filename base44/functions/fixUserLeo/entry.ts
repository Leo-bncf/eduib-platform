import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const userId = '69a0b0ba22441ff1c8ec569c';
    const schoolId = '69a0a9e9c34ebe4583c4a946';

    // Use service role to update the user's data
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    const currentData = user.data || {};

    // Patch school_id into user.data
    await base44.asServiceRole.entities.User.update(userId, {
      data: {
        ...currentData,
        school_id: schoolId,
        active_school_id: schoolId,
      }
    });

    // Create SchoolMembership if it doesn't exist
    const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({ user_id: userId });
    if (memberships.length === 0) {
      await base44.asServiceRole.entities.SchoolMembership.create({
        user_id: userId,
        school_id: schoolId,
        role: currentData.intended_role || 'school_admin',
        status: 'active',
        email: user.email,
        full_name: user.full_name,
      });
      console.log('[INFO] Created SchoolMembership for Leo');
    } else {
      console.log('[INFO] SchoolMembership already exists:', memberships[0].id);
    }

    console.log('[INFO] Successfully fixed Leo user data');
    return Response.json({ success: true, message: 'User fixed successfully', school_id: schoolId });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});