import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Plus, Trash2, BookOpen } from 'lucide-react';

const IB_PRESETS = [
  { name: 'English Literature', code: 'EN-A', ib_group: 1 },
  { name: 'Spanish B', code: 'SP-B', ib_group: 2 },
  { name: 'History', code: 'HI', ib_group: 3 },
  { name: 'Biology', code: 'BI', ib_group: 4 },
  { name: 'Mathematics: Analysis', code: 'MA-AA', ib_group: 5 },
  { name: 'Visual Arts', code: 'VA', ib_group: 6 },
  { name: 'Theory of Knowledge', code: 'TOK', ib_group: null },
];

export default function WizardStepSubjects({ schoolId, onDone }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState([{ name: '', code: '' }]);
  const [useIBPresets, setUseIBPresets] = useState(false);
  const [selectedPresets, setSelectedPresets] = useState(new Set());

  const { data: existingSubjects = [], refetch } = useQuery({
    queryKey: ['subjects-wizard', schoolId],
    queryFn: () => base44.entities.Subject.filter({ school_id: schoolId }),
  });

  const togglePreset = (name) => {
    setSelectedPresets(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const addRow = () => setSubjects(s => [...s, { name: '', code: '' }]);
  const removeRow = (i) => setSubjects(s => s.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) => setSubjects(s => s.map((sub, idx) => idx === i ? { ...sub, [field]: value } : sub));

  const handleSave = async () => {
    setSaving(true);
    const toCreate = useIBPresets
      ? IB_PRESETS.filter(p => selectedPresets.has(p.name))
      : subjects.filter(s => s.name.trim());

    await Promise.all(
      toCreate.map(s => base44.entities.Subject.create({ ...s, school_id: schoolId, is_ib: true }))
    );
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['onboarding-status', schoolId] });
    setSaving(false);
    onDone?.();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Subject Catalogue</h3>
        <p className="text-sm text-slate-500">Add the subjects your school teaches. You can use IB standard subjects as a starting point or create your own.</p>
      </div>

      {existingSubjects.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Existing Subjects ({existingSubjects.length})</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {existingSubjects.map(s => (
              <Badge key={s.id} variant="outline" className="gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {s.name}
              </Badge>
            ))}
          </div>
          <Button onClick={onDone} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" size="sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Continue with existing subjects
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setUseIBPresets(false)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${!useIBPresets ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600'}`}
        >
          Custom Subjects
        </button>
        <button
          onClick={() => setUseIBPresets(true)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${useIBPresets ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600'}`}
        >
          IB Presets
        </button>
      </div>

      {useIBPresets ? (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
          <p className="text-xs text-slate-500 mb-3">Select the IB subjects your school offers:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {IB_PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => togglePreset(p.name)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                  selectedPresets.has(p.name)
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedPresets.has(p.name) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                }`}>
                  {selectedPresets.has(p.name) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.code}{p.ib_group ? ` · Group ${p.ib_group}` : ' · Core'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
          {subjects.map((sub, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
              <div>
                <Label className="text-xs text-slate-600 mb-1 block">Subject Name</Label>
                <Input value={sub.name} onChange={e => updateRow(i, 'name', e.target.value)} placeholder="e.g. Mathematics" />
              </div>
              <div className="w-24">
                <Label className="text-xs text-slate-600 mb-1 block">Code</Label>
                <Input value={sub.code} onChange={e => updateRow(i, 'code', e.target.value)} placeholder="MA" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeRow(i)} className="text-slate-400 h-9 w-9">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Subject
          </Button>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || (useIBPresets ? selectedPresets.size === 0 : subjects.every(s => !s.name.trim()))}
        className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1.5"
      >
        {saving ? 'Saving…' : <><BookOpen className="w-4 h-4" /> Save Subjects &amp; Continue</>}
      </Button>
    </div>
  );
}