import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const userId = '69a0b0ba22441ff1c8ec569c';
    const schoolId = '69a0a9e9c34ebe4583c4a946';

    const memberships = await base44.asServiceRole.entities.SchoolMembership.filter({ user_id: userId });
    console.log('[INFO] Memberships by user_id:', JSON.stringify(memberships));

    const bySchool = await base44.asServiceRole.entities.SchoolMembership.filter({ school_id: schoolId });
    console.log('[INFO] All memberships for school count:', bySchool.length);

    const userRecord = await base44.asServiceRole.entities.User.filter({ id: userId });
    console.log('[INFO] User data.school_id:', userRecord[0]?.school_id);
    console.log('[INFO] User full data:', JSON.stringify(userRecord[0]?.data));

    return Response.json({ memberships, userSchoolId: userRecord[0]?.school_id, userData: userRecord[0]?.data });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});