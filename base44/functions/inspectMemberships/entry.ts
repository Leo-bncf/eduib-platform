import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const all = await base44.asServiceRole.entities.SchoolMembership.list();
    console.log('Total memberships:', all.length);
    console.log(JSON.stringify(all, null, 2));
    return Response.json({ count: all.length, records: all });
  } catch (error) {
    console.error(error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});