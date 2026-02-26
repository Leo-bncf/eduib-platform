import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Save, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import DocumentCard from './DocumentCard';
import DocumentPicker from './DocumentPicker';

export default function StudentSubmission({ assignment, studentId, studentName, existingSubmission }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [documents, setDocuments] = useState(existingSubmission?.documents || []);
  const [documentPickerOpen, setDocumentPickerOpen] = useState(false);

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

  const handleRemoveDocument = (doc) => {
    setDocuments(documents.filter(d => d.id !== doc.id));
  };

  const handleOpenDocument = (doc) => {
    window.open(doc.url, '_blank', 'noopener,noreferrer');
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
          <Label className="text-sm font-semibold">Documents & Links</Label>
          {isEditable && (
            <Button 
              onClick={() => setDocumentPickerOpen(true)}
              variant="outline" 
              size="sm"
              className="border-indigo-200 text-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Document
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-400 mb-3">No documents attached yet</p>
            {isEditable && (
              <Button 
                onClick={() => setDocumentPickerOpen(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Your First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onRemove={isEditable ? handleRemoveDocument : null}
                onOpen={handleOpenDocument}
                compact={false}
              />
            ))}
          </div>
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
    </div>
  );
}