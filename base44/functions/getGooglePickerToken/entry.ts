import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get access token for Google Drive - this token can be used with Google Picker
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    return Response.json({ token: accessToken });
  } catch (error) {
    console.error('Error in getGooglePickerToken:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});