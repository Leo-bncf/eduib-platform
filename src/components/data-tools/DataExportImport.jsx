import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileJson, Users, BookOpen, GraduationCap, Calendar, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const EXPORT_SETS = [
  {
    id: 'users',
    label: 'Users & Memberships',
    desc: 'All students, teachers, and parents with their roles',
    icon: Users,
    accent: 'text-blue-600',
    fetch: (schoolId) => base44.entities.SchoolMembership.filter({ school_id: schoolId }),
    filename: 'users-memberships',
  },
  {
    id: 'classes',
    label: 'Classes & Subjects',
    desc: 'All classes, subjects and teacher assignments',
    icon: BookOpen,
    accent: 'text-violet-600',
    fetch: async (schoolId) => {
      const [classes, subjects] = await Promise.all([
        base44.entities.Class.filter({ school_id: schoolId }),
        base44.entities.Subject.filter({ school_id: schoolId }),
      ]);
      return { classes, subjects };
    },
    filename: 'classes-subjects',
  },
  {
    id: 'academic',
    label: 'Academic Calendar',
    desc: 'Academic years and terms',
    icon: Calendar,
    accent: 'text-emerald-600',
    fetch: async (schoolId) => {
      const [years, terms] = await Promise.all([
        base44.entities.AcademicYear.filter({ school_id: schoolId }),
        base44.entities.Term.filter({ school_id: schoolId }),
      ]);
      return { academicYears: years, terms };
    },
    filename: 'academic-calendar',
  },
  {
    id: 'grades',
    label: 'Grades & Assignments',
    desc: 'All grade items, assignments, and submissions',
    icon: GraduationCap,
    accent: 'text-amber-600',
    fetch: async (schoolId) => {
      const [gradeItems, assignments, submissions] = await Promise.all([
        base44.entities.GradeItem.filter({ school_id: schoolId }),
        base44.entities.Assignment.filter({ school_id: schoolId }),
        base44.entities.Submission.filter({ school_id: schoolId }),
      ]);
      return { gradeItems, assignments, submissions };
    },
    filename: 'grades-assignments',
  },
];

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataExportImport({ schoolId }) {
  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = async (set) => {
    setLoadingId(set.id);
    setError(null);
    const data = await set.fetch(schoolId);
    downloadJson(data, `${set.filename}-school-${schoolId}`);
    setLoadingId(null);
    setSuccessId(set.id);
    setTimeout(() => setSuccessId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Export */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">Export School Data</h3>
        <p className="text-sm text-slate-500 mb-4">Download a full JSON snapshot of any data set for backup or migration.</p>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXPORT_SETS.map(set => {
            const Icon = set.icon;
            const isLoading = loadingId === set.id;
            const isDone = successId === set.id;
            return (
              <div key={set.id} className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-4 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${set.accent}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{set.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{set.desc}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleExport(set)}
                  className="flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                  <span className="ml-1.5">{isDone ? 'Done' : 'Export'}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export All */}
      <div className="border-t border-slate-100 pt-6">
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileJson className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Full School Backup</p>
              <p className="text-xs text-slate-500">Export all data sets in a single JSON file</p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            disabled={loadingId === 'all'}
            onClick={async () => {
              setLoadingId('all');
              setError(null);
              const results = await Promise.all(EXPORT_SETS.map(s => s.fetch(schoolId).then(d => ({ [s.id]: d }))));
              const merged = Object.assign({}, ...results, { exported_at: new Date().toISOString(), school_id: schoolId });
              downloadJson(merged, `full-backup-school-${schoolId}`);
              setLoadingId(null);
              setSuccessId('all');
              setTimeout(() => setSuccessId(null), 2500);
            }}
            className="bg-slate-800 hover:bg-slate-900 flex-shrink-0"
          >
            {loadingId === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
            {successId === 'all' ? 'Downloaded!' : 'Export All'}
          </Button>
        </div>
      </div>

      {/* Import notice */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">Import Data</h3>
        <p className="text-sm text-slate-500 mb-4">Bulk import is available via the Users page (CSV) or contact your platform administrator for large-scale migrations.</p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
          <Upload className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">CSV Import</p>
            <p>Go to <strong>Users → Import CSV</strong> to bulk-add students, teachers, or parents. For class or grade data migration, contact your Super Admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}