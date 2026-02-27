import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'super_admin') {
      return Response.json({ error: 'Unauthorized: super_admin required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, schoolId } = body;

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (schoolId !== undefined) updateData.active_school_id = schoolId || null;

    await base44.asServiceRole.entities.User.update(userId, updateData);
    console.log(`Updated user ${userId}:`, updateData);

    return Response.json({ success: true, updated: updateData });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});