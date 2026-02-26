import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileIds } = await req.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return Response.json({ error: 'Missing or invalid fileIds array' }, { status: 400 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // Fetch metadata for selected files
    const documents = [];

    for (const fileId of fileIds) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,mimeType,createdTime,owners&supportsAllDrives=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch file ${fileId}`);
          continue;
        }

        const fileMeta = await response.json();

        // Determine document type from MIME type
        let docType = 'external_link';
        if (fileMeta.mimeType === 'application/vnd.google-apps.document') {
          docType = 'google_doc';
        } else if (fileMeta.mimeType === 'application/vnd.google-apps.presentation') {
          docType = 'google_slides';
        } else if (fileMeta.mimeType === 'application/vnd.google-apps.spreadsheet') {
          docType = 'google_sheet';
        } else if (fileMeta.mimeType.startsWith('application/vnd.google-apps')) {
          docType = 'google_drive_file';
        }

        documents.push({
          id: fileMeta.id,
          name: fileMeta.name,
          type: docType,
          url: fileMeta.webViewLink,
          mime_type: fileMeta.mimeType,
          created_at: fileMeta.createdTime,
          metadata: {
            google_drive_id: fileMeta.id,
            linked_by_user_id: user.id,
            linked_by_user_email: user.email,
            owner_email: fileMeta.owners?.[0]?.emailAddress,
          },
        });
      } catch (error) {
        console.error(`Error fetching file ${fileId}:`, error);
      }
    }

    if (documents.length === 0) {
      return Response.json({ error: 'No valid files found' }, { status: 400 });
    }

    return Response.json({ documents });
  } catch (error) {
    console.error('Error in googleDrivePicker:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});