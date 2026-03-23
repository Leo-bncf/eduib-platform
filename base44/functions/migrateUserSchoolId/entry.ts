/**
 * One-time migration: backfill school_id on all users who have active_school_id
 * but are missing school_id (which is required for RLS {{user.data.school_id}})
 * 
 * Only callable by admin users.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();

    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    let fixed = 0;
    let skipped = 0;
    const errors = [];

    for (const user of users) {
      // Check for nested data.data.school_id (legacy bug) OR missing school_id
      const hasNestedBug = user.data?.data?.school_id && !user.school_id;
      const alreadyCorrect = user.school_id && !hasNestedBug;

      if (alreadyCorrect) {
        skipped++;
        continue;
      }

      // Try to get school_id from various sources
      let schoolId = user.school_id
        || user.data?.data?.school_id
        || user.active_school_id
        || user.data?.active_school_id
        || null;

      if (!schoolId) {
        // Try to get school_id from SchoolMembership
        const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({
          user_id: user.id,
          status: 'active',
        });
        if (memberships.length > 0) {
          schoolId = memberships[0].school_id;
        }
      }

      if (schoolId) {
        try {
          // Flat fields — SDK puts them into user.data.school_id correctly
          await base44.asServiceRole.entities.User.update(user.id, {
            school_id: schoolId,
            active_school_id: schoolId,
          });
          fixed++;
          console.log(`Fixed user ${user.id} (${user.email}) → school_id: ${schoolId}`);
        } catch (e) {
          errors.push({ userId: user.id, email: user.email, error: e.message });
          console.error(`Failed to fix user ${user.id}: ${e.message}`);
        }
      } else {
        skipped++;
        console.log(`Skipped user ${user.id} (${user.email}) — no school found`);
      }
    }

    return Response.json({
      success: true,
      total: users.length,
      fixed,
      skipped,
      errors,
      message: `Migration complete. Fixed ${fixed} users, skipped ${skipped}.`,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});