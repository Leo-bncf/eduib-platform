import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type, assignmentId, schoolId } = await req.json();

    if (!['google_doc', 'google_slides', 'google_sheet'].includes(type)) {
      return Response.json({ error: 'Invalid document type' }, { status: 400 });
    }

    if (!title || !assignmentId || !schoolId) {
      return Response.json({ error: 'Missing required fields: title, assignmentId, schoolId' }, { status: 400 });
    }

    // Get access token for Google Drive
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // Determine MIME type based on document type
    const mimeTypes = {
      google_doc: 'application/vnd.google-apps.document',
      google_slides: 'application/vnd.google-apps.presentation',
      google_sheet: 'application/vnd.google-apps.spreadsheet',
    };

    const mimeType = mimeTypes[type];

    // Create file in Google Drive
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
        mimeType: mimeType,
        description: `Assignment submission for ${assignmentId} | School: ${schoolId}`,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('Google Drive API error:', error);
      return Response.json({ error: 'Failed to create document in Google Drive' }, { status: 500 });
    }

    const driveFile = await createResponse.json();

    // Get file metadata with WebViewLink for sharing
    const metaResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${driveFile.id}?fields=id,name,webViewLink,mimeType,createdTime&supportsAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const fileMeta = await metaResponse.json();

    // Structure the document object
    const document = {
      id: fileMeta.id,
      name: fileMeta.name,
      type: type,
      url: fileMeta.webViewLink,
      mime_type: fileMeta.mimeType,
      created_at: fileMeta.createdTime,
      metadata: {
        google_drive_id: fileMeta.id,
        created_by_user_id: user.id,
        created_by_user_email: user.email,
      },
    };

    return Response.json({ document });
  } catch (error) {
    console.error('Error in googleDocsCreate:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});