import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const record = await base44.asServiceRole.entities.SchoolMembership.create({
      user_id: '69a0b0ba22441ff1c8ec569c',
      user_email: 'leo.bancroft@outlook.fr',
      user_name: 'Leo Ban',
      school_id: '69a0a9e9c34ebe4583c4a946',
      role: 'school_admin',
      status: 'active',
    });

    console.log('[INFO] Created membership:', JSON.stringify(record));
    return Response.json({ success: true, record });
  } catch (error) {
    console.error('[ERROR] Full error:', JSON.stringify(error));
    console.error('[ERROR] Message:', error.message);
    console.error('[ERROR] Status:', error.status);
    console.error('[ERROR] Data:', JSON.stringify(error.data));
    return Response.json({ error: error.message, status: error.status, data: error.data }, { status: 500 });
  }
});