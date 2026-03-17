import React, { useState } from 'react';
import { CheckCircle2, Lock, ArrowUpCircle } from 'lucide-react';
import { PLAN_LIMITS, PLAN_NAMES, getUpgradePlans } from './PlanConfig';
import UpgradePrompt from './UpgradePrompt';

const ALL_MODULES = [
  { key: 'core',        label: 'Core Platform',      description: 'Users, classes, assignments, and basic gradebook' },
  { key: 'gradebook',   label: 'Gradebook',           description: 'Scores, IB grades, rubric grading, and grade visibility' },
  { key: 'assignments', label: 'Assignments',         description: 'Assignment creation, submission management, and feedback' },
  { key: 'attendance',  label: 'Attendance',          description: 'Attendance tracking, correction workflow, and reporting' },
  { key: 'ib_core',     label: 'IB Core',             description: 'CAS, Extended Essay, TOK task tracking, and predicted grades' },
  { key: 'behavior',    label: 'Behaviour & Pastoral',description: 'Incident tracking, pastoral notes, and follow-up workflows' },
  { key: 'messaging',   label: 'Messaging',           description: 'School-wide messaging with policy controls and quiet hours' },
  { key: 'timetable',   label: 'Timetable Integration',description: 'External timetable sync, schedule management, and room allocation' },
];

const ALL_FEATURES = [
  { key: 'parent_portal',          label: 'Parent Portal',           description: 'Parents can view grades, attendance, and behaviour' },
  { key: 'advanced_analytics',     label: 'Advanced Analytics',      description: 'Cohort dashboards, trends, and school-wide reports' },
  { key: 'predicted_grades',       label: 'Predicted Grades',        description: 'IB predicted grade entry and coordinator overview' },
  { key: 'rubric_grading',         label: 'Rubric Grading',          description: 'Criterion-based grading with strand descriptors' },
  { key: 'timetable_integration',  label: 'Timetable Integration',   description: 'Sync from external timetable systems (Untis, iSAMS)' },
  { key: 'custom_reports',         label: 'Custom Reports & PDF',    description: 'PDF report generation and coordinator rollups' },
  { key: 'bulk_operations',        label: 'Bulk Operations',         description: 'Bulk imports, bulk grade releases, and batch actions' },
  { key: 'audit_logs',             label: 'Audit & Governance',      description: 'Compliance audit log, reason enforcement, privacy requests' },
  { key: 'api_access',             label: 'API Access',              description: 'Programmatic access via REST API for custom integrations' },
];

function ItemRow({ label, description, available, lockedOnPlan }) {
  return (
    <div className={`flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0 ${!available ? 'opacity-60' : ''}`}>
      <div className={`shrink-0 mt-0.5 ${available ? 'text-emerald-500' : 'text-slate-300'}`}>
        {available ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${available ? 'text-slate-800' : 'text-slate-500'}`}>{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      {!available && lockedOnPlan && (
        <span className="shrink-0 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          {PLAN_NAMES[lockedOnPlan]}+
        </span>
      )}
    </div>
  );
}

function findUnlockPlan(key, type) {
  const order = ['starter', 'professional', 'enterprise'];
  for (const p of order) {
    const limits = PLAN_LIMITS[p];
    const available = type === 'module' ? limits.modules.includes(key) : limits.features[key] === true;
    if (available) return p;
  }
  return null;
}

export default function ModuleStatusGrid({ currentPlan }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const planLimits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.starter;
  const hasUpgrades = getUpgradePlans(currentPlan).length > 0;

  const lockedModules = ALL_MODULES.filter(m => !planLimits.modules.includes(m.key));
  const lockedFeatures = ALL_FEATURES.filter(f => !planLimits.features[f.key]);

  return (
    <div className="space-y-5">
      {(lockedModules.length > 0 || lockedFeatures.length > 0) && hasUpgrades && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              {lockedModules.length + lockedFeatures.length} item{lockedModules.length + lockedFeatures.length !== 1 ? 's' : ''} locked on your current plan
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">Upgrade to unlock more modules and features for your school.</p>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" /> View Plans
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Modules</p>
          <div>
            {ALL_MODULES.map(m => (
              <ItemRow
                key={m.key}
                label={m.label}
                description={m.description}
                available={planLimits.modules.includes(m.key)}
                lockedOnPlan={!planLimits.modules.includes(m.key) ? findUnlockPlan(m.key, 'module') : null}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Premium Features</p>
          <div>
            {ALL_FEATURES.map(f => (
              <ItemRow
                key={f.key}
                label={f.label}
                description={f.description}
                available={planLimits.features[f.key] === true}
                lockedOnPlan={!planLimits.features[f.key] ? findUnlockPlan(f.key, 'feature') : null}
              />
            ))}
          </div>
        </div>
      </div>

      <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}