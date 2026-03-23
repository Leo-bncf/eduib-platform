import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const userId = '69a0b0ba22441ff1c8ec569c';
    const schoolId = '69a0a9e9c34ebe4583c4a946';

    // Fix: update with flat fields so SDK puts them at data.school_id (not data.data.school_id)
    await base44.asServiceRole.entities.User.update(userId, {
      school_id: schoolId,
      active_school_id: schoolId,
      intended_role: 'school_admin',
    });
    console.log('[INFO] User data fixed');

    // Ensure SchoolMembership exists
    const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({ user_id: userId });
    if (memberships.length === 0) {
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const user = users[0];
      await base44.asServiceRole.entities.SchoolMembership.create({
        user_id: userId,
        user_email: user.email,
        user_name: user.full_name,
        school_id: schoolId,
        role: 'school_admin',
        status: 'active',
      });
      console.log('[INFO] Created SchoolMembership');
    } else {
      // Ensure role is correct
      await base44.asServiceRole.entities.SchoolMembership.update(memberships[0].id, {
        school_id: schoolId,
        role: 'school_admin',
        status: 'active',
      });
      console.log('[INFO] Updated existing SchoolMembership');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});