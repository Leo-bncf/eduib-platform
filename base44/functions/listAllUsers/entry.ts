import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.filter({}, '-created_date', 10000);
    console.log(`Total users fetched: ${users.length}`);
    // Enrich with SchoolMembership data for active_school_id
    const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({ status: 'active' }, '-created_date', 10000);
    const membershipByUser = {};
    for (const m of memberships) {
      if (!membershipByUser[m.user_id]) membershipByUser[m.user_id] = m;
    }

    const enriched = users.map(u => {
      const mem = membershipByUser[u.id];
      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.intended_role || u.role,
        created_date: u.created_date,
        active_school_id: mem?.school_id || u.active_school_id || null,
      };
    });

    console.log(`Total users fetched: ${enriched.length}`);
    return Response.json({ count: enriched.length, users: enriched });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});