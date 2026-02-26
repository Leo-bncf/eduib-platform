import React from 'react';
import { usePlan } from './PlanProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen } from 'lucide-react';

export default function PlanUsageCard({ userCount, classCount }) {
  const plan = usePlan();

  const maxUsers = plan.getLimit('max_users');
  const maxClasses = plan.getLimit('max_classes');

  const userUsagePercent = maxUsers === -1 ? 0 : Math.round((userCount / maxUsers) * 100);
  const classUsagePercent = maxClasses === -1 ? 0 : Math.round((classCount / maxClasses) * 100);

  const isUserLimitClose = userUsagePercent >= 80;
  const isClassLimitClose = classUsagePercent >= 80;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </div>
            <div className="text-sm font-medium text-slate-900">
              {userCount} / {maxUsers === -1 ? '∞' : maxUsers}
              {isUserLimitClose && maxUsers !== -1 && (
                <Badge className="ml-2 bg-amber-100 text-amber-700 border-0 text-xs">
                  Near Limit
                </Badge>
              )}
            </div>
          </div>
          {maxUsers !== -1 && (
            <Progress
              value={userUsagePercent}
              className="h-2"
              indicatorClassName={isUserLimitClose ? 'bg-amber-500' : 'bg-emerald-500'}
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BookOpen className="w-4 h-4" />
              <span>Classes</span>
            </div>
            <div className="text-sm font-medium text-slate-900">
              {classCount} / {maxClasses === -1 ? '∞' : maxClasses}
              {isClassLimitClose && maxClasses !== -1 && (
                <Badge className="ml-2 bg-amber-100 text-amber-700 border-0 text-xs">
                  Near Limit
                </Badge>
              )}
            </div>
          </div>
          {maxClasses !== -1 && (
            <Progress
              value={classUsagePercent}
              className="h-2"
              indicatorClassName={isClassLimitClose ? 'bg-amber-500' : 'bg-emerald-500'}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}