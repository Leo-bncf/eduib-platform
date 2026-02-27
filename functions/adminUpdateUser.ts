import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const callerUser = await base44.auth.me();

    if (!callerUser || callerUser.role !== 'super_admin') {
      return Response.json({ error: 'Unauthorized: super_admin required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, schoolId } = body;

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const results = {};

    // Update the User entity - only allow platform-level roles that Base44 supports
    // Base44 only allows 'admin' and 'user' roles on the User entity natively.
    // We map super_admin -> admin, everything else -> user (school role stored separately)
    if (role !== undefined) {
      const platformRole = role === 'super_admin' ? 'admin' : 'user';
      // Store the actual intended role in a custom field too
      await base44.asServiceRole.entities.User.update(userId, {
        role: platformRole,
        intended_role: role,
      });
      results.role = platformRole;
      results.intended_role = role;
      console.log(`Updated user ${userId} platform role to ${platformRole}, intended: ${role}`);
    }

    // Update school assignment via SchoolMembership entity
    if (schoolId !== undefined) {
      // Find existing membership for this user
      const existingMemberships = await base44.asServiceRole.entities.SchoolMembership.filter({ user_id: userId });

      if (schoolId) {
        // Assign to new school
        if (existingMemberships.length > 0) {
          // Update first membership
          await base44.asServiceRole.entities.SchoolMembership.update(existingMemberships[0].id, {
            school_id: schoolId,
            role: role && role !== 'super_admin' ? role : existingMemberships[0].role,
          });
        } else {
          // Create new membership
          await base44.asServiceRole.entities.SchoolMembership.create({
            user_id: userId,
            school_id: schoolId,
            role: role && role !== 'super_admin' ? role : 'teacher',
            status: 'active',
          });
        }
        results.school_assigned = schoolId;
      } else {
        // Remove from all schools
        for (const m of existingMemberships) {
          await base44.asServiceRole.entities.SchoolMembership.delete(m.id);
        }
        results.school_removed = true;
      }
    }

    return Response.json({ success: true, updated: results });
  } catch (error) {
    console.error('Error updating user:', error);
    console.error('Error data:', JSON.stringify(error.data || {}));
    return Response.json({ error: error.message }, { status: 500 });
  }
});