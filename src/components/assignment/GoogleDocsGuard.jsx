import React from 'react';
import GoogleActionGuard from '@/components/google/GoogleActionGuard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * Wraps Google Doc/Slides/Sheets creation with connection checking and error handling.
 * Shows clear messaging if connection is missing or invalid before attempting to create.
 */
export default function GoogleDocsGuard({ 
  schoolId, 
  actionType = 'create_doc',
  docType = 'Document',
  children,
  onSuccess,
  onError
}) {
  const actionMessages = {
    create_doc: {
      buttonText: `Create New ${docType}`,
      confirmText: `Creating your Google ${docType}...`,
      successText: `Google ${docType} created successfully!`
    },
    create_slides: {
      buttonText: 'Create New Presentation',
      confirmText: 'Creating your Google Slides...',
      successText: 'Google Slides created successfully!'
    },
    create_sheet: {
      buttonText: 'Create New Spreadsheet',
      confirmText: 'Creating your Google Sheet...',
      successText: 'Google Sheet created successfully!'
    },
    picker: {
      buttonText: 'Select from Google Drive',
      confirmText: 'Opening Google Drive...',
      successText: 'File selected successfully!'
    }
  };

  const config = actionMessages[actionType] || actionMessages.create_doc;

  const handleConnectionError = (status) => {
    onError?.({
      type: 'connection_error',
      status,
      errorCode: status.errorCode
    });
  };

  return (
    <GoogleActionGuard 
      schoolId={schoolId}
      actionType={config.buttonText}
      onConnectionRequired={handleConnectionError}
      onError={(error) => onError?.({ type: 'guard_error', error })}
      fallbackUI={
        <div className="space-y-3">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 ml-3">
              <p className="font-semibold">Connect Google to Continue</p>
              <p className="text-sm text-blue-700 mt-1">
                Your Google account needs to be connected to {actionType === 'picker' ? 'select files' : 'create documents'}.
              </p>
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={() => window.location.href = '/reconnect-google'}
          >
            Connect Google Account
          </Button>
        </div>
      }
    >
      {children}
    </GoogleActionGuard>
  );
}