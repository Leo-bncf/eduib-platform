import React from 'react';
import { usePlan } from './PlanProvider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, GraduationCap, AlertTriangle, CheckCircle2 } from 'lucide-react';

function UsageRow({ icon: Icon, label, current, max, unit = '' }) {
  const isUnlimited = max === -1;
  const pct = isUnlimited ? 0 : Math.round((current / max) * 100);
  const isWarning = !isUnlimited && pct >= 80;
  const isCritical = !isUnlimited && pct >= 95;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {current.toLocaleString()}{unit} / {isUnlimited ? '∞' : `${max.toLocaleString()}${unit}`}
          </span>
          {isCritical && (
            <Badge className="bg-red-100 text-red-700 border-0 text-xs gap-1">
              <AlertTriangle className="w-3 h-3" /> At Limit
            </Badge>
          )}
          {isWarning && !isCritical && (
            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Near Limit</Badge>
          )}
          {!isWarning && !isUnlimited && (
            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> OK
            </Badge>
          )}
        </div>
      </div>
      {!isUnlimited && (
        <Progress
          value={pct}
          className="h-2"
          indicatorClassName={isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}
        />
      )}
      {!isUnlimited && (
        <p className="text-xs text-slate-400">
          {isUnlimited ? 'Unlimited' : `${Math.max(0, max - current).toLocaleString()} ${label.toLowerCase()} remaining`}
          {isCritical && <span className="text-red-600 font-medium ml-1">— upgrade to add more</span>}
          {isWarning && !isCritical && <span className="text-amber-600 font-medium ml-1">— consider upgrading soon</span>}
        </p>
      )}
    </div>
  );
}

export default function PlanUsageCard({ userCount, classCount }) {
  const plan = usePlan();

  const maxUsers = plan.getLimit('max_users');
  const maxClasses = plan.getLimit('max_classes');

  const userPct = maxUsers === -1 ? 0 : Math.round((userCount / maxUsers) * 100);
  const classPct = maxClasses === -1 ? 0 : Math.round((classCount / maxClasses) * 100);

  const hasWarning = (maxUsers !== -1 && userPct >= 80) || (maxClasses !== -1 && classPct >= 80);
  const hasCritical = (maxUsers !== -1 && userPct >= 95) || (maxClasses !== -1 && classPct >= 95);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-700">Plan Usage</p>
        {hasCritical && (
          <Badge className="bg-red-100 text-red-700 border-0 text-xs gap-1">
            <AlertTriangle className="w-3 h-3" /> Action Required
          </Badge>
        )}
        {hasWarning && !hasCritical && (
          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs gap-1">
            <AlertTriangle className="w-3 h-3" /> Warning
          </Badge>
        )}
      </div>
      <div className="space-y-5">
        <UsageRow icon={Users} label="Users" current={userCount} max={maxUsers} />
        <UsageRow icon={BookOpen} label="Classes" current={classCount} max={maxClasses} />
        <UsageRow icon={GraduationCap} label="Students per class" current={0} max={plan.getLimit('max_students_per_class')} />
      </div>
      {maxUsers !== -1 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">Overall capacity used</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-800">{Math.max(userPct, classPct)}%</p>
            <p className="text-xs text-slate-400 mb-1">of plan limits</p>
          </div>
        </div>
      )}
    </div>
  );
}