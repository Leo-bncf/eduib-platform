import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'super_admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.filter({}, '-created_date', 10000);
    console.log(`Total users fetched: ${users.length}`);
    return Response.json({ count: users.length, users: users.map(u => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_date: u.created_date })) });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});