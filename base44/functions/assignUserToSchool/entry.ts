import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'super_admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userEmail, schoolName } = body;

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const foundUser = users[0];

    // Find school by name
    const schools = await base44.asServiceRole.entities.School.filter({ name: schoolName });
    if (schools.length === 0) {
      return Response.json({ error: 'School not found' }, { status: 404 });
    }
    const foundSchool = schools[0];

    // Update user with school
    await base44.asServiceRole.entities.User.update(foundUser.id, {
      active_school_id: foundSchool.id
    });

    return Response.json({ 
      success: true, 
      message: `User ${userEmail} assigned to school ${schoolName}`,
      userId: foundUser.id,
      schoolId: foundSchool.id
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});