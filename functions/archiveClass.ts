import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, schoolId } = await req.json();

    if (!classId || !schoolId) {
      return Response.json({ error: 'Missing classId or schoolId' }, { status: 400 });
    }

    // Verify user has access to this school
    const memberships = await base44.entities.SchoolMembership.filter({
      user_id: user.id,
      school_id: schoolId,
      role: { $in: ['school_admin', 'admin'] }
    });

    if (memberships.length === 0) {
      return Response.json({ error: 'Unauthorized: Not a school admin' }, { status: 403 });
    }

    // Get the class
    const classes = await base44.entities.Class.filter({ id: classId, school_id: schoolId });
    if (classes.length === 0) {
      return Response.json({ error: 'Class not found' }, { status: 404 });
    }

    const classData = classes[0];

    // Archive the class
    await base44.entities.Class.update(classId, { status: 'archived' });

    console.log(`Class ${classId} (${classData.name}) archived by user ${user.email}`);

    return Response.json({
      success: true,
      message: `Class "${classData.name}" has been archived`,
      classId,
    });
  } catch (error) {
    console.error('Archive class error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});