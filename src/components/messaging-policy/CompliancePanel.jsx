import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Clock, X, Plus, Info } from 'lucide-react';

export default function CompliancePanel({ form, onChange }) {
  const comp = form.compliance || {};
  const [newKeyword, setNewKeyword] = useState('');

  const set = (key, val) => onChange({ compliance: { ...comp, [key]: val } });

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw) return;
    const current = comp.safeguarding_keywords || [];
    if (!current.includes(kw)) set('safeguarding_keywords', [...current, kw]);
    setNewKeyword('');
  };

  const removeKeyword = (kw) => {
    set('safeguarding_keywords', (comp.safeguarding_keywords || []).filter(k => k !== kw));
  };

  return (
    <div className="space-y-5">
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-violet-900">Communication Compliance</p>
          <p className="text-xs text-violet-700 mt-0.5">
            These controls retain operational metadata and audit events for governance and safeguarding purposes.
            <span className="font-semibold"> Message content is never stored or exposed</span> — only event metadata (sender role, recipient role, timestamp, school ID) is logged.
          </p>
        </div>
      </div>

      {/* Metadata Retention */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-slate-600" />
          <h4 className="font-bold text-slate-900 text-sm">Metadata Retention</h4>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Retain message metadata for</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={30}
              max={3650}
              value={comp.retain_message_metadata_days ?? 365}
              onChange={e => set('retain_message_metadata_days', Number(e.target.value))}
              className="w-28 h-9"
            />
            <span className="text-xs text-slate-500">days (message event logs, not content)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">Minimum recommended: 90 days. GDPR-typical: 1–2 years. Content is never retained beyond the platform's standard message storage.</p>
        </div>
      </div>

      {/* Audit event logging */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-5 h-5 text-blue-500" />
          <h4 className="font-bold text-slate-900 text-sm">Audit Event Logging</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Switch checked={comp.log_broadcast_events ?? true} onCheckedChange={v => set('log_broadcast_events', v)} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Log broadcast / announcement events</p>
              <p className="text-xs text-slate-500 mt-0.5">Records who sent a school-wide or class announcement, to which roles, and when. Strongly recommended for governance.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Switch checked={comp.log_message_events ?? false} onCheckedChange={v => set('log_message_events', v)} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Log direct message events (metadata only)</p>
              <p className="text-xs text-slate-500 mt-0.5">Records sender role, recipient role, and timestamp for every direct message. <span className="font-semibold text-slate-700">No message content is captured.</span></p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Switch checked={comp.flag_student_to_student ?? false} onCheckedChange={v => set('flag_student_to_student', v)} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Flag student-to-student messages for pastoral review</p>
              <p className="text-xs text-slate-500 mt-0.5">When student-to-student messaging is enabled, this flag surfaces metadata events in the pastoral oversight dashboard so staff can monitor for safeguarding concerns.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safeguarding keywords */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Safeguarding Keyword Flags</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Optional: define keywords that, when detected in message subject lines or announcement titles, create a pastoral audit event. Content scanning is not performed.
              </p>
            </div>
          </div>
          <Switch checked={comp.safeguarding_keywords_enabled ?? false} onCheckedChange={v => set('safeguarding_keywords_enabled', v)} />
        </div>

        {comp.safeguarding_keywords_enabled && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                placeholder="Add a keyword…"
                className="h-9 text-sm"
              />
              <button
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(comp.safeguarding_keywords || []).map(kw => (
                <Badge key={kw} variant="outline" className="bg-amber-50 border-amber-200 text-amber-800 pr-1 flex items-center gap-1">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {(comp.safeguarding_keywords || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">No keywords defined yet.</p>
              )}
            </div>
            <p className="text-xs text-slate-400">Subject-line keyword detection only. Matching triggers a pastoral audit log entry — no content is read or stored.</p>
          </div>
        )}
      </div>

      {/* Compliance contact */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Compliance / Safeguarding contact email</label>
        <Input
          type="email"
          value={comp.compliance_contact_email || ''}
          onChange={e => set('compliance_contact_email', e.target.value)}
          placeholder="dpo@school.edu"
          className="max-w-sm h-9"
        />
        <p className="text-xs text-slate-400 mt-1.5">This address is shown in governance audit summaries. Not used for automatic notifications in the current version.</p>
      </div>
    </div>
  );
}