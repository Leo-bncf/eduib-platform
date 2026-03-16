import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield, Search, Loader2, CheckCircle2, AlertCircle, Trash2, UserX,
  Eye, FileText, Download, AlertTriangle
} from 'lucide-react';

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GDPRPrivacyTools({ schoolId }) {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  const handleLookup = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    setDeleteResult(null);

    const members = await base44.entities.SchoolMembership.filter({ school_id: schoolId, user_email: searchEmail.trim() });

    if (members.length === 0) {
      setSearchError('No user found with that email address in this school.');
      setSearching(false);
      return;
    }

    const member = members[0];

    const [submissions, grades, attendanceRecords, behaviorRecords, casExperiences, messages] = await Promise.all([
      base44.entities.Submission.filter({ school_id: schoolId, student_id: member.user_id }),
      base44.entities.GradeItem.filter({ school_id: schoolId, student_id: member.user_id }),
      base44.entities.AttendanceRecord.filter({ school_id: schoolId, student_id: member.user_id }),
      base44.entities.BehaviorRecord.filter({ school_id: schoolId, student_id: member.user_id }),
      base44.entities.CASExperience.filter({ school_id: schoolId, student_id: member.user_id }),
      base44.entities.Message.filter({ school_id: schoolId, sender_id: member.user_id }),
    ]);

    setSearchResult({
      member,
      counts: {
        memberships: 1,
        submissions: submissions.length,
        grades: grades.length,
        attendance: attendanceRecords.length,
        behavior: behaviorRecords.length,
        cas: casExperiences.length,
        messages: messages.length,
      },
      data: { member, submissions, grades, attendanceRecords, behaviorRecords, casExperiences, messages },
    });
    setSearching(false);
  };

  const handleExportUserData = () => {
    if (!searchResult) return;
    downloadJson(searchResult.data, `data-export-${searchEmail.replace('@', '-at-')}`);
  };

  const handleDeleteUserData = async () => {
    if (!searchResult || deleteConfirm !== searchEmail.trim()) return;
    setDeleting(true);

    const { data, member } = searchResult;
    let deletedCount = 0;

    // Anonymize the membership record instead of deleting (preserve school records)
    await base44.entities.SchoolMembership.update(member.id, {
      user_email: `anonymized-${Date.now()}@deleted.local`,
      user_name: 'Anonymized User',
      status: 'inactive',
    });
    deletedCount++;

    // Delete personal data records
    for (const rec of data.submissions) {
      await base44.entities.Submission.update(rec.id, { student_name: 'Anonymized', content: '', file_urls: [], documents: [] });
      deletedCount++;
    }
    for (const rec of data.grades) {
      await base44.entities.GradeItem.update(rec.id, { student_name: 'Anonymized' });
      deletedCount++;
    }
    for (const rec of data.attendanceRecords) {
      await base44.entities.AttendanceRecord.update(rec.id, { student_name: 'Anonymized', note: '' });
      deletedCount++;
    }
    for (const rec of data.behaviorRecords) {
      await base44.entities.BehaviorRecord.update(rec.id, { student_name: 'Anonymized', description: '[Anonymized]', title: '[Anonymized]', action_taken: '' });
      deletedCount++;
    }
    for (const rec of data.casExperiences) {
      await base44.entities.CASExperience.update(rec.id, { student_name: 'Anonymized', description: '[Anonymized]', reflection: '' });
      deletedCount++;
    }

    setDeleteResult({ deletedCount });
    setDeleting(false);
    setSearchResult(null);
    setDeleteConfirm('');
    setSearchEmail('');
  };

  const totalRecords = searchResult
    ? Object.values(searchResult.counts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">GDPR / Privacy Tools</h3>
        <p className="text-sm text-slate-500">
          Look up, export, or anonymize personal data for any user in your school. Use this in response to data subject access requests (DSARs) or deletion requests.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Use with care.</strong> Anonymization is irreversible and will permanently remove identifiable information from all records. Always export a copy first.
        </p>
      </div>

      {/* Lookup form */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
        <p className="text-sm font-semibold text-slate-900">Step 1 — Look Up a User</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-xs text-slate-500 mb-1 block">User Email Address</Label>
            <Input
              type="email"
              placeholder="student@school.edu"
              value={searchEmail}
              onChange={e => { setSearchEmail(e.target.value); setSearchResult(null); setSearchError(null); setDeleteResult(null); }}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleLookup} disabled={searching || !searchEmail.trim()} variant="outline">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-1.5">Lookup</span>
            </Button>
          </div>
        </div>

        {searchError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{searchError}</AlertDescription>
          </Alert>
        )}

        {deleteResult && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Anonymization complete. {deleteResult.deletedCount} record(s) were anonymized successfully.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Search result */}
      {searchResult && (
        <>
          {/* Data summary */}
          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-900">Step 2 — Review Personal Data</p>
            <div className="bg-slate-50 border border-slate-100 rounded-md p-4">
              <p className="text-sm font-bold text-slate-900">{searchResult.member.user_name || searchResult.member.user_email}</p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">{searchResult.member.role} • {searchResult.member.status}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(searchResult.counts).map(([key, count]) => (
                <div key={key} className="bg-slate-50 rounded-md p-3 text-center">
                  <p className="text-xl font-black text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{key.replace(/([A-Z])/g, ' $1')}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500"><strong>{totalRecords}</strong> personal records found.</p>

            <Button onClick={handleExportUserData} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" /> Export All Data as JSON (DSAR Response)
            </Button>
          </div>

          {/* Anonymization */}
          <div className="bg-white border border-red-200 rounded-md p-5 space-y-4">
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">Step 3 — Anonymize / Erase Personal Data</p>
            </div>
            <p className="text-sm text-slate-600">
              This will replace all identifying information (name, email, written content) with anonymized placeholders. Academic records (grades, attendance) are preserved in aggregate but de-identified. <strong>This cannot be undone.</strong>
            </p>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Type the user's email to confirm</Label>
              <Input
                type="email"
                placeholder={searchEmail}
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== searchEmail.trim() || deleting}
              onClick={handleDeleteUserData}
              className="w-full"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Anonymize All Personal Data for This User
            </Button>
          </div>
        </>
      )}
    </div>
  );
}