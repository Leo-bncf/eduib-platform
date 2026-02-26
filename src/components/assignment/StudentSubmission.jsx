import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Link2, FileText, X, Send, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function StudentSubmission({ assignment, studentId, studentName, existingSubmission }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [linkUrl, setLinkUrl] = useState(existingSubmission?.link_url || '');
  const [files, setFiles] = useState(existingSubmission?.file_urls || []);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFiles([...files, file_url]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
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
      link_url: linkUrl,
      file_urls: files,
      status: isLate && status === 'submitted' ? 'late' : status,
      submitted_at: status === 'submitted' ? new Date().toISOString() : null,
    });
  };

  const canSubmit = content.trim() || linkUrl.trim() || files.length > 0;
  const isSubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'late';
  const isReturned = existingSubmission?.status === 'returned';

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
          disabled={isSubmitted && !isReturned}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold">Add Link</Label>
        <div className="flex gap-2 mt-1.5">
          <Input
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://..."
            disabled={isSubmitted && !isReturned}
          />
          <Link2 className="w-5 h-5 text-slate-400 mt-2.5" />
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">Attachments</Label>
        <div className="space-y-2">
          {files.map((url, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm flex-1 truncate">File {i + 1}</span>
              {(!isSubmitted || isReturned) && (
                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                  <X className="w-4 h-4 text-slate-400 hover:text-red-600" />
                </button>
              )}
            </div>
          ))}
          {(!isSubmitted || isReturned) && (
            <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                {uploading ? 'Uploading...' : 'Upload file'}
              </span>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {(!isSubmitted || isReturned) && (
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
    </div>
  );
}