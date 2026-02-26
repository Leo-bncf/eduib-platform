import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Save, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, Presentation, Table, Upload as UploadIcon, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUser } from '@/components/auth/UserContext';
import DocumentCard from './DocumentCard';
import DocumentPicker from './DocumentPicker';
import GoogleDocCreator from './GoogleDocCreator';
import GoogleDrivePicker from './GoogleDrivePicker';
import SubmissionDocumentsView from './SubmissionDocumentsView';
import GoogleConnectionStatus from '@/components/google/GoogleConnectionStatus';

export default function StudentSubmission({ assignment, studentId, studentName, existingSubmission }) {
  const queryClient = useQueryClient();
  const { school } = useUser();
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [documents, setDocuments] = useState(existingSubmission?.documents || []);
  const [documentPickerOpen, setDocumentPickerOpen] = useState(false);
  const [googleDocCreator, setGoogleDocCreator] = useState({ open: false, type: null });
  const [googleDrivePickerOpen, setGoogleDrivePickerOpen] = useState(false);
  const [googleConnectionAlert, setGoogleConnectionAlert] = useState(null);

  const submitMutation = useMutation({
    mutationFn: (data) => {
      if (existingSubmission) {
        return base44.entities.Submission.update(existingSubmission.id, data);
      }
      return base44.entities.Submission.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-detail'] });
      queryClient.invalidateQueries({ queryKey: ['student-submission'] });
    },
  });

  const handleAddDocuments = (newDocs) => {
    setDocuments([...documents, ...newDocs]);
    setDocumentPickerOpen(false);
  };

  const handleCreateGoogleDoc = async (type) => {
    try {
      const response = await base44.functions.invoke('verifyGoogleConnection', {
        schoolId: school?.id,
        userId: studentId
      });
      
      if (response.data.requiresReconnection || response.data.requiresConnection) {
        setGoogleConnectionAlert({
          type: 'connection_error',
          message: response.data.message,
          errorCode: response.data.errorCode
        });
        return;
      }
      
      setGoogleDocCreator({ open: true, type });
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setGoogleConnectionAlert({
        type: 'error',
        message: 'Failed to verify Google connection. Please try again.'
      });
    }
  };

  const handleGoogleDocCreated = (doc) => {
    setDocuments([...documents, doc]);
  };

  const handleGoogleDriveFilesSelected = async (newDocs) => {
    setDocuments([...documents, ...newDocs]);
    setGoogleDrivePickerOpen(false);
  };

  const handleGoogleDrivePickerOpen = async () => {
    try {
      const response = await base44.functions.invoke('verifyGoogleConnection', {
        schoolId: school?.id,
        userId: studentId
      });
      
      if (response.data.requiresReconnection || response.data.requiresConnection) {
        setGoogleConnectionAlert({
          type: 'connection_error',
          message: response.data.message,
          errorCode: response.data.errorCode
        });
        return;
      }
      
      setGoogleDrivePickerOpen(true);
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setGoogleConnectionAlert({
        type: 'error',
        message: 'Failed to verify Google connection. Please try again.'
      });
    }
  };

  const handleRemoveDocument = (docId) => {
    setDocuments(documents.filter(d => d.id !== docId));
  };

  const handleOpenDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  const primaryFormat = assignment.primary_submission_format;
  const allowAlternatives = assignment.allow_alternative_formats;
  const alternativeFormats = assignment.alternative_formats || [];
  const hasFormatGuidance = !!primaryFormat;
  const allowedFormats = primaryFormat ? [primaryFormat, ...(allowAlternatives ? alternativeFormats : [])] : [];

  const formatActions = {
    google_doc: {
      icon: FileText,
      label: 'Create Google Doc',
      shortLabel: 'Google Doc',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleCreateGoogleDoc('google_doc'),
    },
    google_slides: {
      icon: Presentation,
      label: 'Create Google Slides',
      shortLabel: 'Presentation',
      color: 'bg-amber-600 hover:bg-amber-700',
      action: () => handleCreateGoogleDoc('google_slides'),
    },
    google_sheet: {
      icon: Table,
      label: 'Create Google Sheet',
      shortLabel: 'Spreadsheet',
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: () => handleCreateGoogleDoc('google_sheet'),
    },
    file_upload: {
      icon: UploadIcon,
      label: 'Upload File',
      shortLabel: 'File Upload',
      color: 'bg-slate-600 hover:bg-slate-700',
      action: () => setDocumentPickerOpen(true),
    },
    link: {
      icon: LinkIcon,
      label: 'Add Link',
      shortLabel: 'Link',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => setDocumentPickerOpen(true),
    },
  };

  const handleSubmit = (status) => {
    const isLate = new Date() > new Date(assignment.due_date);
    submitMutation.mutate({
      school_id: assignment.school_id,
      assignment_id: assignment.id,
      class_id: assignment.class_id,
      student_id: studentId,
      student_name: studentName,
      content,
      documents,
      status: isLate && status === 'submitted' ? 'late' : status,
      submitted_at: status === 'submitted' ? new Date().toISOString() : existingSubmission?.submitted_at,
    });
  };

  const canSubmit = content.trim() || documents.length > 0;
  const isSubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'late';
  const isReturned = existingSubmission?.status === 'returned';
  const isEditable = !isSubmitted || isReturned;

  return (
    <div className="space-y-6">
      {existingSubmission && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Submission Status</span>
            <Badge className={`${
              existingSubmission.status === 'submitted' ? 'bg-emerald-50 text-emerald-700' :
              existingSubmission.status === 'late' ? 'bg-amber-50 text-amber-700' :
              existingSubmission.status === 'returned' ? 'bg-blue-50 text-blue-700' :
              'bg-slate-100 text-slate-600'
            } border-0`}>
              {existingSubmission.status}
            </Badge>
          </div>
          {existingSubmission.submitted_at && (
            <p className="text-xs text-slate-500">
              Submitted {format(new Date(existingSubmission.submitted_at), 'MMM d, yyyy h:mm a')}
            </p>
          )}
          {existingSubmission.feedback && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-1">Teacher Feedback</p>
              <p className="text-sm text-slate-600">{existingSubmission.feedback}</p>
            </div>
          )}
        </div>
      )}

      <div>
        <Label className="text-sm font-semibold">Your Work</Label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type your response or notes here..."
          rows={8}
          className="mt-1.5"
          disabled={!isEditable}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold">
            {hasFormatGuidance ? 'Your Submission' : 'Documents & Links'}
          </Label>
        </div>

        {hasFormatGuidance && isEditable && documents.length === 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-indigo-900 mb-1">
              {allowAlternatives ? 'Submission Format' : 'Required Format'}
            </p>
            <p className="text-sm text-indigo-700">
              {allowAlternatives
                ? `Your teacher expects a ${formatActions[primaryFormat]?.shortLabel || primaryFormat}, but also accepts: ${alternativeFormats.map(f => formatActions[f]?.shortLabel || f).join(', ')}.`
                : `Your teacher requires this assignment to be submitted as a ${formatActions[primaryFormat]?.shortLabel || primaryFormat}.`}
            </p>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6">
            {isEditable ? (
              hasFormatGuidance ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 text-center mb-4">
                    {allowAlternatives ? 'Start your work (recommended format):' : 'Start your work:'}
                  </p>
                  {/* Primary format - always prominent */}
                  <Button
                    onClick={formatActions[primaryFormat]?.action}
                    className={`${formatActions[primaryFormat]?.color} text-white h-auto py-4 w-full`}
                  >
                    {React.createElement(formatActions[primaryFormat]?.icon, { className: "w-5 h-5 mr-2" })}
                    {formatActions[primaryFormat]?.label}
                  </Button>
                  
                  {allowAlternatives && alternativeFormats.length > 0 && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-white px-2 text-slate-500">or use alternative format</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {alternativeFormats.map(format => {
                          const action = formatActions[format];
                          if (!action) return null;
                          const Icon = action.icon;
                          return (
                            <Button
                              key={format}
                              onClick={action.action}
                              variant="outline"
                              className="h-auto py-3"
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  
                  {!allowAlternatives && (
                    <p className="text-xs text-center text-slate-500 pt-2">
                      Only {formatActions[primaryFormat]?.shortLabel} submissions are accepted for this assignment.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-3">No documents attached yet</p>
                  <Button 
                    onClick={() => setDocumentPickerOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Document
                  </Button>
                </div>
              )
            ) : (
              <p className="text-sm text-slate-400 text-center">No documents attached yet</p>
            )}
          </div>
        ) : (
          <>
            <SubmissionDocumentsView
              documents={documents}
              onRemove={isEditable ? handleRemoveDocument : null}
              onOpen={handleOpenDocument}
            />
            {isEditable && hasFormatGuidance && (
              <>
                <div className="flex gap-2 flex-wrap">
                  {allowedFormats.map((format, idx) => {
                    const action = formatActions[format];
                    if (!action) return null;
                    const Icon = action.icon;
                    const isPrimary = format === primaryFormat;
                    return (
                      <Button
                        key={format}
                        onClick={action.action}
                        variant={isPrimary ? "default" : "outline"}
                        size="sm"
                        className={isPrimary ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-200 text-indigo-700"}
                      >
                        <Icon className="w-4 h-4 mr-1.5" />
                        {action.label}
                        {isPrimary && <span className="ml-1.5 text-xs opacity-75">(recommended)</span>}
                      </Button>
                    );
                  })}
                  {allowedFormats.some(f => ['google_doc', 'google_slides', 'google_sheet'].includes(f)) && (
                    <Button
                      onClick={() => setGoogleDrivePickerOpen(true)}
                      variant="outline"
                      size="sm"
                      className="border-indigo-200 text-indigo-700"
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Link Existing
                    </Button>
                  )}
                  {!allowAlternatives && (
                    <span className="text-xs text-slate-500 self-center">
                      Only {formatActions[primaryFormat]?.shortLabel} allowed
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        {isEditable && (
          <>
            <Button
              onClick={() => handleSubmit('draft')}
              disabled={!canSubmit || submitMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit('submitted')}
              disabled={!canSubmit || submitMutation.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {isReturned ? 'Resubmit' : 'Submit Assignment'}
            </Button>
          </>
        )}
        {isSubmitted && !isReturned && (
          <div className="flex-1 text-center py-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg font-medium">
            ✓ Assignment submitted successfully
          </div>
        )}
      </div>

      <DocumentPicker
        open={documentPickerOpen}
        onClose={() => setDocumentPickerOpen(false)}
        onAddDocuments={handleAddDocuments}
      />

      <GoogleDocCreator
        type={googleDocCreator.type}
        open={googleDocCreator.open}
        onClose={() => setGoogleDocCreator({ open: false, type: null })}
        onDocumentCreated={handleGoogleDocCreated}
        defaultTitle={assignment.title}
      />

      <GoogleDrivePicker
        open={googleDrivePickerOpen}
        onClose={() => setGoogleDrivePickerOpen(false)}
        onFilesSelected={handleGoogleDriveFilesSelected}
      />
    </div>
  );
}