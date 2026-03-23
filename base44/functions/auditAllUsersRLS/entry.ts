import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all users via service role
    const users = await base44.asServiceRole.entities.User.list();

    const results = { fixed: [], skipped: [], noSchool: [], errors: [] };

    for (const user of users) {
      // Skip super admins / platform admins with no school
      if (user.role === 'admin' || user.role === 'super_admin') {
        results.skipped.push({ id: user.id, email: user.email, reason: 'platform admin' });
        continue;
      }

      const schoolIdCorrect = user.school_id;
      const schoolIdNested = user.data?.data?.school_id;
      const hasNestedBug = schoolIdNested && !schoolIdCorrect;
      const alreadyCorrect = schoolIdCorrect && !hasNestedBug;

      if (alreadyCorrect) {
        results.skipped.push({ id: user.id, email: user.email, reason: 'already correct', school_id: schoolIdCorrect });
        continue;
      }

      // Resolve school_id from various sources
      let schoolId = schoolIdCorrect
        || schoolIdNested
        || user.active_school_id
        || user.data?.active_school_id
        || null;

      if (!schoolId) {
        const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({
          user_id: user.id,
          status: 'active',
        });
        if (memberships.length > 0) schoolId = memberships[0].school_id;
      }

      if (!schoolId) {
        results.noSchool.push({ id: user.id, email: user.email, full_name: user.full_name });
        continue;
      }

      // Fix the user
      await base44.asServiceRole.entities.User.update(user.id, {
        school_id: schoolId,
        active_school_id: schoolId,
      });

      results.fixed.push({
        id: user.id,
        email: user.email,
        school_id: schoolId,
        hadNestedBug: hasNestedBug,
      });
    }

    console.log('[AUDIT RESULT]', JSON.stringify(results, null, 2));
    return Response.json({
      summary: {
        fixed: results.fixed.length,
        skipped: results.skipped.length,
        noSchool: results.noSchool.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});