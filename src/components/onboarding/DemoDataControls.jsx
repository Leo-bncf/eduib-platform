import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles, Trash2, AlertTriangle, CheckCircle2,
  Loader2, FlaskConical, Info
} from 'lucide-react';

export default function DemoDataControls({ schoolId, onRefresh }) {
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setResult(null);
    try {
      const response = await base44.functions.invoke('seedSchoolDemoData', { schoolId });
      setResult({ type: 'success', message: `Demo data seeded: ${response.data.stats?.subjects ?? 0} subjects, ${response.data.stats?.classes ?? 0} classes, ${response.data.stats?.memberships ?? 0} memberships created.` });
      onRefresh?.();
    } catch (err) {
      setResult({ type: 'error', message: err?.response?.data?.error || 'Failed to seed demo data.' });
    } finally {
      setSeeding(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setResult(null);
    setConfirmClear(false);
    try {
      const response = await base44.functions.invoke('clearSchoolDemoData', { schoolId });
      setResult({ type: 'success', message: `Demo data cleared: ${response.data.deleted ?? 0} records removed.` });
      onRefresh?.();
    } catch (err) {
      setResult({ type: 'error', message: err?.response?.data?.error || 'Failed to clear demo data.' });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Demo data is isolated and safe</p>
          <p>All seeded records are tagged with <code className="bg-amber-100 px-1 rounded text-xs">is_demo: true</code> and can be removed cleanly without affecting any real school data you have configured.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Seed card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Generate Demo Data</p>
              <Badge className="bg-indigo-50 text-indigo-600 border-0 text-xs mt-0.5">Safe to run</Badge>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Creates a realistic set of sample academic years, terms, subjects, classes, memberships, and assignments for training or demonstration purposes.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 mb-4">
            <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-indigo-400" /> 1 academic year + 2 terms</li>
            <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-indigo-400" /> 6 IB subjects</li>
            <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-indigo-400" /> 3 classes with teachers</li>
            <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-indigo-400" /> Sample assignments & grades</li>
          </ul>
          <Button
            onClick={handleSeed}
            disabled={seeding || clearing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1.5"
            size="sm"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {seeding ? 'Seeding…' : 'Seed Demo Data'}
          </Button>
        </div>

        {/* Clear card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Remove Demo Data</p>
              <Badge className="bg-red-50 text-red-600 border-0 text-xs mt-0.5">Irreversible</Badge>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Permanently removes all records tagged as demo data from this school. Only demo-tagged records are deleted — your real data is untouched.
          </p>
          <div className="flex items-start gap-1.5 text-xs text-slate-400 mb-4">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            <span>This removes: academic years, terms, subjects, classes, memberships, assignments, grades, and attendance records marked as demo.</span>
          </div>

          {!confirmClear ? (
            <Button
              variant="outline"
              onClick={() => setConfirmClear(true)}
              disabled={seeding || clearing}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
              size="sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Demo Data
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-red-700 font-semibold text-center">Are you sure?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-xs gap-1"
                  onClick={handleClear}
                  disabled={clearing}
                >
                  {clearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  {clearing ? 'Clearing…' : 'Yes, Remove'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <Alert className={result.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
          {result.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            : <AlertTriangle className="w-4 h-4 text-red-600" />
          }
          <AlertDescription className={result.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}